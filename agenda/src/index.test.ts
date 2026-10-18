import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { afterEach, beforeEach, test } from 'node:test';
import { CURSOR_SCRIPT } from '../../src/layouts/cursor.ts';
import { stamp } from './form.ts';
import { type Env, handle } from './index.ts';

// Monday 2026-10-19 10:00 Lima. The first offered slot is Tuesday 10:00 Lima (15:00 UTC).
const NOW = Date.parse('2026-10-19T15:00:00Z');
const SLOT = Date.parse('2026-10-20T15:00:00Z');

const kv = () => {
  const m = new Map<string, string>();
  return {
    m,
    get: async (k: string) => m.get(k) ?? null,
    put: async (k: string, v: string) => void m.set(k, v),
    delete: async (k: string) => void m.delete(k),
  };
};

let created: unknown[] = [];
let googleUrls: string[] = [];
let mails: { to: string[] }[] = [];
let resendOk = true;
let tokenOk = true;
let busy: { start: string; end: string }[] = [];
let busyOk = true;
const realFetch = globalThis.fetch;
beforeEach(() => {
  created = [];
  googleUrls = [];
  mails = [];
  resendOk = true;
  tokenOk = true;
  busy = [];
  busyOk = true;
  globalThis.fetch = (async (input: string | URL, init?: RequestInit) => {
    const url = String(input);
    if (url.includes('oauth2'))
      return new Response(JSON.stringify({ access_token: 'a' }), { status: tokenOk ? 200 : 400 });
    if (url.includes('freeBusy'))
      return new Response(
        JSON.stringify(
          busyOk
            ? { calendars: { 'alex@x.pe': { busy }, 'sandra@x.pe': { busy: [] } } }
            : { calendars: { 'taberoa@pm.me': { errors: [{ reason: 'notFound' }] } } },
        ),
      );
    if (url.includes('api.resend.com')) {
      mails.push(JSON.parse(String(init?.body)));
      return new Response('{}', { status: resendOk ? 200 : 500 });
    }
    if (url.includes('/events')) {
      googleUrls.push(url);
      created.push(JSON.parse(String(init?.body)));
      return new Response(JSON.stringify({ id: 'e', hangoutLink: 'https://meet.google.com/abc' }));
    }
    throw new Error(`unexpected fetch ${url}`);
  }) as typeof fetch;
});
afterEach(() => {
  globalThis.fetch = realFetch;
});

const env = (over: Omit<Partial<Env>, 'KV'> = {}): Env & { KV: ReturnType<typeof kv> } => ({
  KV: kv(),
  GOOGLE_CLIENT_ID: 'id',
  GOOGLE_CLIENT_SECRET: 's',
  GOOGLE_REFRESH_TOKEN: 'r',
  AGENDA_CALENDAR: 'agenda@group.calendar.google.com',
  PEOPLE: 'alex@x.pe, sandra@x.pe',
  FORM_SECRET: 'secret',
  ...over,
});

const post = async (
  e: Env,
  fields: Record<string, string> = {},
  headers: Record<string, string> = {},
) => {
  const body = new URLSearchParams({
    slot: String(SLOT),
    name: 'Ana',
    company: 'Acme',
    email: 'ana@acme.pe',
    need: 'Un CRM',
    website: '',
    stamp: await stamp('secret', NOW - 60_000),
    ...fields,
  });
  return handle(
    new Request('https://agenda.chambasimple.com/', {
      method: 'POST',
      body,
      headers: {
        origin: 'https://agenda.chambasimple.com',
        'cf-connecting-ip': '1.2.3.4',
        ...headers,
      },
    }),
    e,
    NOW,
  );
};

test('without Google configured, the page offers email instead of slots', async () => {
  const res = await handle(new Request('https://agenda.chambasimple.com/'), { KV: kv() }, NOW);
  assert.equal(res.status, 200);
  assert.match(await res.text(), /hola@chambasimple\.com/);
});

const scriptSrcOf = (res: Response) =>
  (res.headers.get('content-security-policy') ?? '')
    .split('; ')
    .find((d) => d.startsWith('script-src')) ?? '';

test('the page lists free slots in the visitor’s time zone, with no-store and a strict CSP', async () => {
  const res = await handle(new Request('https://agenda.chambasimple.com/en'), env(), NOW);
  const body = await res.text();
  assert.equal(res.headers.get('cache-control'), 'no-store');
  assert.match(scriptSrcOf(res), /^script-src 'sha256-[^']+'$/, 'only the aura, and by hash');
  assert.match(body, new RegExp(`value="${SLOT}"`));
  assert.match(body, /lang="en"/);
});

test('a busy block in any configured calendar removes the slot', async () => {
  busy = [{ start: '2026-10-20T15:00:00Z', end: '2026-10-20T15:30:00Z' }];
  const body = await (
    await handle(new Request('https://agenda.chambasimple.com/'), env(), NOW)
  ).text();
  assert.ok(!body.includes(`value="${SLOT}"`), 'the busy slot is gone');
  assert.ok(body.includes(`value="${SLOT + 30 * 60_000}"`), 'the next one stays');
});

test('a calendar that cannot be read offers email, and never books on a guess', async () => {
  busyOk = false;
  const get = await handle(new Request('https://agenda.chambasimple.com/'), env(), NOW);
  assert.equal(get.status, 200);
  assert.match(await get.text(), /hola@chambasimple\.com/);
  const posted = await post(env());
  assert.equal(posted.status, 200);
  assert.match(await posted.text(), /hola@chambasimple\.com/);
  assert.equal(created.length, 0);
});

test('the CSP allows the shared aura script by hash, with Turnstile as the only addition', async () => {
  const hash = createHash('sha256').update(CURSOR_SCRIPT).digest('base64');
  const off = await handle(new Request('https://agenda.chambasimple.com/'), env(), NOW);
  assert.equal(scriptSrcOf(off), `script-src 'sha256-${hash}'`);
  const on = await handle(
    new Request('https://agenda.chambasimple.com/'),
    env({ TURNSTILE_SITE_KEY: 'k' }),
    NOW,
  );
  assert.equal(scriptSrcOf(on), `script-src 'sha256-${hash}' https://challenges.cloudflare.com`);
});

test('the booking page carries the aura layer, its script and the mint selection', async () => {
  const body = await (
    await handle(new Request('https://agenda.chambasimple.com/'), env(), NOW)
  ).text();
  assert.match(body, /<div id="aura" aria-hidden="true"><\/div>/);
  assert.ok(body.includes(`<script>${CURSOR_SCRIPT}</script>`), 'the aura script is inline');
  assert.match(body, /::selection\{background:var\(--mint\);color:var\(--ink\)\}/);
});

test('a valid booking creates one event with Meet and shows the confirmation', async () => {
  const e = env();
  const res = await post(e);
  assert.equal(res.status, 200);
  assert.match(await res.text(), /meet\.google\.com\/abc/);
  assert.equal(created.length, 1);
  assert.equal(e.KV.m.has('busy'), false, 'the busy cache is dropped after a booking');
});

test('bots and abuse never reach Google', async () => {
  assert.equal((await post(env(), { website: 'spam' })).status, 400);
  assert.equal((await post(env(), {}, { origin: 'https://evil.example' })).status, 403);
  assert.equal((await post(env(), {}, { 'content-length': '99999' })).status, 413);
  const limited = env({ LIMIT: { limit: async () => ({ success: false }) } });
  assert.equal((await post(limited)).status, 429);
  assert.equal(created.length, 0);
});

test('two bookings per email per week, then a friendly no', async () => {
  const e = env();
  assert.equal((await post(e)).status, 200);
  assert.equal((await post(e, { slot: String(SLOT + 30 * 60_000) })).status, 200);
  assert.equal((await post(e, { slot: String(SLOT + 60 * 60_000) })).status, 429);
  assert.equal(created.length, 2);
  assert.ok(![...e.KV.m.keys()].some((k) => k.includes('acme')), 'emails are never stored');
});

test('a taken slot is refused and the form keeps what the visitor typed, escaped', async () => {
  const e = env();
  e.KV.m.set(`lock:${SLOT}`, '1');
  const res = await post(e, { name: '<script>alert(1)</script>' });
  assert.equal(res.status, 409);
  const body = await res.text();
  assert.ok(!body.includes('<script>alert(1)</script>'));
  assert.match(body, /&lt;script&gt;/);
});

test('no route returns bookings; only the four exist', async () => {
  for (const path of ['/api/reservas', '/api/events', '/admin', '/busy'])
    assert.equal(
      (await handle(new Request(`https://agenda.chambasimple.com${path}`), env(), NOW)).status,
      404,
    );
});

test('a dead token turns the page into email and /health into 503', async () => {
  const { default: worker } = await import('./index.ts');
  const e = env();
  tokenOk = false;
  await worker.scheduled({}, e);
  assert.equal(
    (await handle(new Request('https://agenda.chambasimple.com/health'), e, NOW)).status,
    503,
  );
  assert.match(
    await (await handle(new Request('https://agenda.chambasimple.com/'), e, NOW)).text(),
    /abre pronto/,
  );
});

test('a privacy browser sending Origin: null can still book; a cross-site post cannot', async () => {
  assert.equal((await post(env(), {}, { origin: 'null' })).status, 200);
  const crossSite = { 'sec-fetch-site': 'cross-site' };
  assert.equal((await post(env(), { slot: String(SLOT + 30 * 60_000) }, crossSite)).status, 403);
});

test('with Resend, Google stays silent and the agenda sends both emails itself', async () => {
  const res = await post(env({ RESEND_API_KEY: 're_test', NOTIFY: 'agenda@chambasimple.com' }));
  assert.equal(res.status, 200);
  assert.match(googleUrls[0], /sendUpdates=none/);
  assert.equal(
    (created[0] as { attendees?: unknown }).attendees,
    undefined,
    'no Google attendees, so no Google email',
  );
  assert.deepEqual(
    mails.map((m) => m.to),
    [['ana@acme.pe'], ['agenda@chambasimple.com']],
  );
});

test('if Resend fails, the booking still stands', async () => {
  resendOk = false;
  const res = await post(env({ RESEND_API_KEY: 're_test' }));
  assert.equal(res.status, 200);
  assert.equal(created.length, 1);
});

test('the site button a visitor came from reaches the owners, sanitized', async () => {
  const page = await (
    await handle(new Request('https://agenda.chambasimple.com/?from=hero'), env(), NOW)
  ).text();
  assert.match(page, /name="from" value="hero"/);
  const bad = await (
    await handle(new Request('https://agenda.chambasimple.com/?from=<x>'), env(), NOW)
  ).text();
  assert.match(bad, /name="from" value=""/);
  await post(env({ RESEND_API_KEY: 're_test', NOTIFY: 'agenda@chambasimple.com' }), {
    from: 'contact',
  });
  assert.match((mails[1] as unknown as { text: string }).text, /Origen: contact/);
});
