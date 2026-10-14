import assert from 'node:assert/strict';
import { afterEach, beforeEach, test } from 'node:test';
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
let tokenOk = true;
const realFetch = globalThis.fetch;
beforeEach(() => {
  created = [];
  tokenOk = true;
  globalThis.fetch = (async (input: string | URL, init?: RequestInit) => {
    const url = String(input);
    if (url.includes('oauth2'))
      return new Response(JSON.stringify({ access_token: 'a' }), { status: tokenOk ? 200 : 400 });
    if (url.includes('freeBusy'))
      return new Response(
        JSON.stringify({ calendars: { 'alex@x.pe': { busy: [] }, 'sandra@x.pe': { busy: [] } } }),
      );
    if (url.includes('/events')) {
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

test('the page lists free slots in the visitor’s time zone, with no-store and a strict CSP', async () => {
  const res = await handle(new Request('https://agenda.chambasimple.com/en'), env(), NOW);
  const body = await res.text();
  assert.equal(res.headers.get('cache-control'), 'no-store');
  assert.match(res.headers.get('content-security-policy') ?? '', /script-src 'none'/);
  assert.match(body, new RegExp(`value="${SLOT}"`));
  assert.match(body, /lang="en"/);
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
