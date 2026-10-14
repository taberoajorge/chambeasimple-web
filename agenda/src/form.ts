// Reading a booking form safely. Nothing here trusts the browser: every field is checked on the
// server, and two traps catch most bots without any JavaScript or third party.
//   - a honeypot field people never see (bots fill every input);
//   - a signed render time: a form sent in under 3 s is a bot, one older than 2 h is stale.

export const LIMITS = { name: 80, company: 120, email: 254, need: 500, body: 4096 };

export type Valid = { start: number; name: string; company: string; email: string; need: string };
export type Invalid = { error: 'trap' | 'stale' | 'fields'; fields?: string[] };

const enc = new TextEncoder();
const b64url = (buf: ArrayBuffer) =>
  btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

async function hmac(secret: string, text: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  return b64url(await crypto.subtle.sign('HMAC', key, enc.encode(text)));
}

// The token put in the form when the page is rendered: "<time>.<signature>".
export const stamp = async (secret: string, now: number) =>
  `${now}.${await hmac(secret, String(now))}`;

async function stampOk(secret: string, token: string, now: number) {
  const [time, sig] = token.split('.');
  const t = Number(time);
  if (!Number.isFinite(t) || sig !== (await hmac(secret, time))) return 'stale' as const;
  if (now - t < 3_000) return 'trap' as const;
  if (now - t > 2 * 3_600_000) return 'stale' as const;
  return null;
}

const EMAIL = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[a-z]{2,}$/i;
const clean = (v: FormDataEntryValue | null) =>
  typeof v === 'string' ? v.replace(/\s+/g, ' ').trim() : '';

export async function readForm(
  form: FormData,
  secret: string,
  now: number,
  offered: number[],
): Promise<Valid | Invalid> {
  if (clean(form.get('website'))) return { error: 'trap' }; // the honeypot
  const trap = await stampOk(secret, clean(form.get('stamp')), now);
  if (trap) return { error: trap };
  const v = {
    start: Number(clean(form.get('slot'))),
    name: clean(form.get('name')),
    company: clean(form.get('company')),
    email: clean(form.get('email')).toLowerCase(),
    need: clean(form.get('need')),
  };
  const bad = [
    !offered.includes(v.start) && 'slot',
    (!v.name || v.name.length > LIMITS.name) && 'name',
    (!v.company || v.company.length > LIMITS.company) && 'company',
    (!EMAIL.test(v.email) || v.email.length > LIMITS.email) && 'email',
    (!v.need || v.need.length > LIMITS.need) && 'need',
  ].filter((f): f is string => Boolean(f));
  return bad.length ? { error: 'fields', fields: bad } : v;
}

// The key that limits bookings per email, without storing the email itself.
export const emailKey = async (email: string) =>
  `email:${b64url(await crypto.subtle.digest('SHA-256', enc.encode(email.toLowerCase())))}`;
