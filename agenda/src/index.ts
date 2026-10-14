// agenda.chambasimple.com: book a 30-minute call (spec agenda-propia). Only four routes exist:
// GET and POST on / (Spanish) and /en (English), and /health. No route ever returns bookings,
// names or emails. Nothing personal is logged.
import { AGENDA, type AgendaText } from '../../src/content/agenda.ts';
import { emailKey, LIMITS, readForm, stamp } from './form.ts';
import { accessToken, book, busy, type Google } from './google.ts';
import { bookingPage, closedPage, donePage, type Values } from './page.ts';
import { freeSlots, HOURS, type Interval } from './slots.ts';

type KV = {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
  delete(key: string): Promise<void>;
};

export type Env = {
  KV: KV;
  LIMIT?: { limit(options: { key: string }): Promise<{ success: boolean }> };
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  GOOGLE_REFRESH_TOKEN?: string;
  AGENDA_CALENDAR?: string;
  PEOPLE?: string; // calendars checked for busy time, comma-separated (hola@)
  NOTIFY?: string; // aliases invited to every booking so the owners get an email, comma-separated
  FORM_SECRET?: string;
  TURNSTILE_SITE_KEY?: string;
  TURNSTILE_SECRET?: string;
};

const EMAIL = 'hola@chambasimple.com';
const SITE = 'https://chambasimple.com';
const PER_EMAIL = 2; // bookings per email per 7 days

const google = (env: Env): Google | null =>
  env.GOOGLE_CLIENT_ID &&
  env.GOOGLE_CLIENT_SECRET &&
  env.GOOGLE_REFRESH_TOKEN &&
  env.AGENDA_CALENDAR &&
  env.PEOPLE &&
  env.FORM_SECRET
    ? {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        refreshToken: env.GOOGLE_REFRESH_TOKEN,
        agendaCalendar: env.AGENDA_CALENDAR,
        people: env.PEOPLE.split(',').map((p) => p.trim()),
        notify: (env.NOTIFY ?? '')
          .split(',')
          .map((p) => p.trim())
          .filter(Boolean),
      }
    : null;

const csp = (turnstile: boolean) =>
  [
    "default-src 'self'",
    turnstile ? 'script-src https://challenges.cloudflare.com' : "script-src 'none'",
    turnstile ? 'frame-src https://challenges.cloudflare.com' : '',
    "style-src 'unsafe-inline'",
    `img-src 'self' ${SITE}`,
    "form-action 'self'",
    "base-uri 'none'",
    "frame-ancestors 'none'",
  ]
    .filter(Boolean)
    .join('; ');

const html = (body: string, status: number, env: Env) =>
  new Response(body, {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'Content-Security-Policy': csp(Boolean(env.TURNSTILE_SITE_KEY)),
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'X-Robots-Tag': 'noindex',
    },
  });

// Busy blocks for the next weeks: cached 5 minutes for the page, fresh before booking.
async function busyBlocks(g: Google, env: Env, now: number, fresh: boolean): Promise<Interval[]> {
  if (!fresh) {
    const cached = await env.KV.get('busy');
    if (cached) return JSON.parse(cached);
  }
  const blocks = await busy(
    g,
    await accessToken(g),
    now,
    now + (HOURS.horizonDays + 2) * 86_400_000,
  );
  await env.KV.put('busy', JSON.stringify(blocks), { expirationTtl: 300 });
  return blocks;
}

async function turnstileOk(env: Env, token: string, ip: string) {
  if (!env.TURNSTILE_SECRET) return true;
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: new URLSearchParams({ secret: env.TURNSTILE_SECRET, response: token, remoteip: ip }),
  });
  return ((await res.json()) as { success: boolean }).success;
}

type Extra = { error?: string; invalid?: string[]; values?: Values; chosen?: number };
type Ctx = {
  request: Request;
  env: Env;
  now: number;
  g: Google;
  t: AgendaText;
  lang: 'es' | 'en';
  timeZone: string;
  page: (status: number, extra?: Extra) => Promise<Response>;
};

// Cheap checks first (rate limit, origin, size, Turnstile); null means "go on".
async function guard({ request, env, t, page }: Ctx): Promise<Response | null> {
  const ip = request.headers.get('cf-connecting-ip') ?? 'unknown';
  if (env.LIMIT && !(await env.LIMIT.limit({ key: ip })).success)
    return page(429, { error: t.errors.busy });
  // Only a real other site is refused. Some browsers send "Origin: null" for privacy (Safari, Brave,
  // private modes); those are people, and the signed stamp plus Turnstile still guard the form.
  const origin = request.headers.get('origin');
  const foreign = origin && origin !== 'null' && origin !== new URL(request.url).origin;
  if (foreign || request.headers.get('sec-fetch-site') === 'cross-site')
    return new Response('Forbidden', { status: 403 });
  if (Number(request.headers.get('content-length') ?? 0) > LIMITS.body)
    return new Response('Too large', { status: 413 });
  return null;
}

async function submit(ctx: Ctx): Promise<Response> {
  const { request, env, now, g, t, lang, timeZone, page } = ctx;
  const blocked = await guard(ctx);
  if (blocked) return blocked;
  const form = await request.formData();
  const ip = request.headers.get('cf-connecting-ip') ?? 'unknown';
  if (!(await turnstileOk(env, String(form.get('cf-turnstile-response') ?? ''), ip)))
    return page(400, { error: t.errors.trap });

  const offered = freeSlots(now, await busyBlocks(g, env, now, true));
  const read = await readForm(form, env.FORM_SECRET as string, now, offered);
  const values = Object.fromEntries(
    ['name', 'company', 'email', 'need'].map((k) => [k, String(form.get(k) ?? '')]),
  );
  if ('error' in read) {
    const slotGone = Boolean(read.fields?.includes('slot') && form.get('slot'));
    const error = slotGone ? t.errors.slot : t.errors[read.error];
    return page(slotGone ? 409 : 400, { error, invalid: read.fields, values });
  }
  const key = await emailKey(read.email);
  const count = Number((await env.KV.get(key)) ?? 0);
  if (count >= PER_EMAIL) return page(429, { error: t.errors.limit, values });
  // ponytail: KV is eventually consistent, so this lock is best effort; the fresh freeBusy above
  // (which includes the agenda calendar) catches nearly every double booking. Durable Objects if not.
  if (await env.KV.get(`lock:${read.start}`)) return page(409, { error: t.errors.slot, values });
  await env.KV.put(`lock:${read.start}`, '1', { expirationTtl: 60 });

  try {
    const event = await book(g, await accessToken(g), { ...read, minutes: HOURS.minutes, lang });
    await env.KV.put(key, String(count + 1), { expirationTtl: 7 * 86_400 });
    await env.KV.delete('busy');
    const home = lang === 'es' ? SITE : `${SITE}/en`;
    return html(donePage(t, read.start, timeZone, event.meet, home), 200, env);
  } catch {
    return page(502, { error: t.errors.google, values, chosen: read.start });
  }
}

async function handle(request: Request, env: Env, now: number): Promise<Response> {
  const url = new URL(request.url);
  const healthy = (await env.KV.get('health')) !== 'token';
  if (url.pathname === '/health')
    return healthy ? new Response('ok') : new Response('google token invalid', { status: 503 });
  const lang = url.pathname === '/' ? 'es' : url.pathname === '/en' ? 'en' : null;
  if (!lang || !['GET', 'POST'].includes(request.method))
    return new Response('Not found', { status: 404 });
  const t: AgendaText = AGENDA[lang];
  const g = google(env);
  if (!g || !healthy) return html(closedPage(t, EMAIL), 200, env);

  const timeZone =
    (request as Request & { cf?: { timezone?: string } }).cf?.timezone ?? HOURS.timeZone;
  const privacy = `${SITE}${lang === 'es' ? '/privacidad' : '/en/privacy'}`;
  const page = async (status: number, extra: Extra = {}) =>
    html(
      bookingPage({
        t,
        slots: freeSlots(now, await busyBlocks(g, env, now, false)),
        timeZone,
        stamp: await stamp(env.FORM_SECRET as string, now),
        email: EMAIL,
        privacy,
        turnstile: env.TURNSTILE_SITE_KEY,
        ...extra,
      }),
      status,
      env,
    );
  return request.method === 'GET'
    ? page(200)
    : submit({ request, env, now, g, t, lang, timeZone, page });
}

export default {
  fetch: (request: Request, env: Env) => handle(request, env, Date.now()),
  // Daily: is the Google token still alive? If not, the page offers email and /health says 503,
  // which the monitor workflow turns into a GitHub issue.
  async scheduled(_event: unknown, env: Env) {
    const g = google(env);
    if (!g) return;
    try {
      await accessToken(g);
      await env.KV.delete('health');
    } catch {
      await env.KV.put('health', 'token');
    }
  },
};

export { handle };
