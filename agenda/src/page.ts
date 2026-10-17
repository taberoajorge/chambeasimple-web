// The booking page, rendered on the server. Works without JavaScript: slots are radio buttons
// grouped by day, in the visitor's time zone (Cloudflare tells us which). Everything that came
// from a visitor is escaped before it is written into HTML.
import type { AgendaText } from '../../src/content/agenda.ts';
import { TOKENS } from './tokens.ts';

const esc = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c,
  );

const CSS = `${TOKENS}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font:16px/1.5 ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
header{position:sticky;top:0;z-index:2;border-bottom:1px solid var(--line);background:var(--bg)}.topbar{max-width:72rem;margin:0 auto;padding:.75rem 1.25rem;display:flex;align-items:center;justify-content:space-between;gap:1rem}.brand{display:inline-flex;align-items:center;gap:.5rem;font-weight:800;font-size:1.25rem;color:var(--text);text-decoration:none}.brand>span>span{color:var(--accent)}.brand-mark{width:1.75rem;height:1.75rem;transition:transform .35s ease,filter .35s ease}.brand:hover .brand-mark,.brand:focus-visible .brand-mark{transform:rotate(-8deg) scale(1.08);filter:drop-shadow(0 0 .45rem var(--mint))}.lang{min-height:44px;width:44px;display:inline-flex;align-items:center;justify-content:center;color:var(--text);font-size:.875rem;font-weight:600;text-decoration:none}
.nav{display:flex;align-items:center;gap:.25rem}
.nav ul{display:none;list-style:none;margin:0;padding:0;align-items:center;gap:1.5rem}
.nav ul a{display:inline-flex;min-height:44px;align-items:center;color:var(--muted);text-decoration:none}
.nav ul a:hover,.nav ul a:focus-visible{color:var(--text)}
.here{display:none;align-items:center;min-height:48px;border-radius:999px;background:var(--mint);color:var(--ink);font-weight:700;padding:0 1.5rem}
@media(min-width:768px){.nav{gap:1.5rem}.here{display:inline-flex}}
@media(min-width:1024px){.nav ul{display:flex}}
main{max-width:46rem;margin:0 auto;padding:2.5rem 1.25rem 4rem}a{color:var(--accent)}
h1{font-size:clamp(1.9rem,5vw,2.6rem);line-height:1.1;margin:1.5rem 0 .75rem}p.muted,.hint{color:var(--muted)}
.card{background:var(--card);border:1px solid var(--line);border-radius:1rem;padding:1.25rem;margin-top:1.5rem}
fieldset{border:0;margin:0;padding:0}legend{font-weight:700;margin-bottom:.5rem}
.day{border-top:1px solid var(--line)}.day summary{display:flex;justify-content:space-between;align-items:center;min-height:48px;cursor:pointer;font-weight:600}.d{display:inline-block}.d::first-letter{text-transform:uppercase}.day summary small{color:var(--muted);font-weight:400}.day[open] summary{color:var(--accent)}.day fieldset{padding-bottom:1rem}.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
.slots{display:grid;grid-template-columns:repeat(auto-fill,minmax(6.5rem,1fr));gap:.5rem}.slots label{position:relative}
.slots input{position:absolute;opacity:0;inset:0}
.slots span{display:flex;min-height:44px;align-items:center;justify-content:center;border:1px solid var(--line);border-radius:999px;padding:0 1rem;background:var(--bg)}
.slots input:checked+span{background:var(--mint);color:var(--ink);border-color:var(--mint);font-weight:700}
.slots input:focus-visible+span{outline:3px solid var(--accent);outline-offset:2px}
label.field{display:block;font-weight:600;margin-top:1rem}
input[type=text],input[type=email],textarea{display:block;width:100%;margin-top:.35rem;font:inherit;color:var(--text);background:var(--bg);border:1px solid var(--muted);border-radius:.6rem;padding:.7rem .8rem;min-height:44px}
textarea{min-height:7rem}input[aria-invalid=true],textarea[aria-invalid=true]{border-color:var(--danger);border-width:2px}
.trap{position:absolute;left:-10000px;width:1px;height:1px;overflow:hidden}
button,.btn{display:inline-flex;min-height:48px;align-items:center;justify-content:center;border:0;border-radius:999px;background:var(--mint);color:var(--ink);font:inherit;font-weight:700;padding:0 1.75rem;margin-top:1.5rem;cursor:pointer;text-decoration:none}
.alert{border-left:4px solid var(--accent);padding:.75rem 1rem;background:var(--card);margin-top:1.5rem}
:focus-visible{outline:3px solid var(--accent);outline-offset:3px}`;

type Shell = { t: AgendaText; title: string; body: string; site: string; turnstile?: string };

// The header mirrors the site's: the same wordmark, the three section links and the language
// switch, plus "Agenda una conversación" marked as the current page (we are already here). The
// theme button is the site's only script and the agenda ships none, so it is left out. `site` is
// the main site's origin (prod by default, the local site in dev), so the brand and favicon return
// where the visitor came from. The language switch is relative, so local dev and previews never
// jump to the published agenda.
const shell = ({ t, title, body, site, turnstile }: Shell) => {
  // The wordmark is one flex child: as bare text + span, the topbar gap would split the word in two.
  const base = t.lang === 'en' ? '/en' : '/';
  const home = `${site}${base}`;
  const es = t.lang !== 'en';
  const links = t.nav.links
    .map((l) => `<li><a href="${home}#${esc(l.id)}">${esc(l.title)}</a></li>`)
    .join('');
  return `<!doctype html>
<html lang="${t.lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title><meta name="description" content="${esc(t.description)}">
<meta name="robots" content="noindex"><link rel="icon" href="${esc(site)}/favicon.svg" type="image/svg+xml">
<style>${CSS}</style>${turnstile ? '<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>' : ''}</head>
<body><header><div class="topbar"><a class="brand" href="${home}"><svg aria-hidden="true" class="brand-mark" viewBox="0 0 74 74" fill="var(--mint)"><rect x="0" y="46" width="12" height="12" rx="2.4"/><rect x="14" y="60" width="14" height="14" rx="2.8"/><rect x="26" y="42" width="16" height="16" rx="3.2"/><rect x="39" y="22" width="18" height="18" rx="3.6"/><rect x="53" y="0" width="20" height="20" rx="4"/></svg><span>chamba<span>simple</span></span></a><nav class="nav" aria-label="${esc(t.nav.label)}"><ul>${links}</ul><span class="here" aria-current="page">${esc(t.nav.current)}</span><a class="lang" href="${es ? '/en' : '/'}" hreflang="${es ? 'en' : 'es'}" lang="${es ? 'en' : 'es'}"><span aria-hidden="true">${es ? 'EN' : 'ES'}</span><span class="sr">${esc(t.nav.switchTo)}</span></a></nav></div></header><main>${body}</main></body></html>`;
};

export type Values = Partial<Record<'name' | 'company' | 'email' | 'need', string>>;

export type BookingPage = {
  t: AgendaText;
  slots: number[];
  timeZone: string;
  stamp: string;
  email: string;
  site: string;
  privacy: string;
  error?: string;
  invalid?: string[];
  values?: Values;
  chosen?: number;
  turnstile?: string;
  from?: string; // which site button brought the visitor
};

// "hora estándar central (GMT-6)": a readable zone name plus its offset, so it is never ambiguous.
const zoneName = (timeZone: string, locale: string) => {
  const part = (style: 'longGeneric' | 'shortOffset') =>
    new Intl.DateTimeFormat(locale, { timeZone, timeZoneName: style })
      .formatToParts(Date.now())
      .find((p) => p.type === 'timeZoneName')?.value;
  return `${part('longGeneric') ?? timeZone} (${part('shortOffset') ?? ''})`;
};

const dayKey = (ms: number, timeZone: string) =>
  new Date(ms).toLocaleDateString('en-CA', { timeZone });

export function bookingPage(p: BookingPage) {
  const { t, timeZone } = p;
  const locale = t.lang;
  const days = new Map<string, number[]>();
  for (const s of p.slots)
    days.set(dayKey(s, timeZone), [...(days.get(dayKey(s, timeZone)) ?? []), s]);
  const dayName = (ms: number) =>
    new Date(ms).toLocaleDateString(locale, {
      timeZone,
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  const time = (ms: number) =>
    new Date(ms).toLocaleTimeString(locale, { timeZone, hour: '2-digit', minute: '2-digit' });
  const bad = (f: string) => (p.invalid?.includes(f) ? ' aria-invalid="true"' : '');
  const v = (f: keyof Values) => esc(p.values?.[f] ?? '');
  const field = (name: keyof Values, label: string, type: string, extra: string) =>
    `<label class="field" for="${name}">${esc(label)}</label><input id="${name}" name="${name}" type="${type}" required ${extra} value="${v(name)}"${bad(name)}>`;

  // One collapsible block per day (native <details>, no JavaScript): the first day, or the one
  // holding the visitor's chosen slot, starts open. Seven working days are enough to choose.
  const list = [...days.values()].slice(0, 7);
  const openAt = Math.max(
    0,
    list.findIndex((d) => p.chosen !== undefined && d.includes(p.chosen)),
  );
  const slots = p.slots.length
    ? list
        .map(
          (day, i) =>
            `<details class="day"${i === openAt ? ' open' : ''}><summary><span class="d">${esc(dayName(day[0]))}</span> <small>${day.length}</small></summary><fieldset><legend class="sr">${esc(dayName(day[0]))}</legend><div class="slots">${day
              .map(
                (s) =>
                  `<label><input type="radio" name="slot" value="${s}" required${s === p.chosen ? ' checked' : ''}><span>${esc(time(s))}</span></label>`,
              )
              .join('')}</div></fieldset></details>`,
        )
        .join('')
    : `<p>${esc(t.none)}</p>`;

  const body = `<h1>${esc(t.title)}</h1><p class="muted">${esc(t.lead)}</p>
${p.error ? `<p class="alert" role="alert">${esc(p.error)}</p>` : ''}
<form method="post" novalidate>
<div class="card"><fieldset><legend>${esc(t.pick)}</legend><p class="hint">${esc(t.timeZone(zoneName(timeZone, locale)))}</p>${slots}</fieldset></div>
<div class="card">
${field('name', t.name, 'text', 'maxlength="80" autocomplete="name"')}
${field('company', t.company, 'text', 'maxlength="120" autocomplete="organization"')}
${field('email', t.email, 'email', 'maxlength="254" autocomplete="email"')}
<label class="field" for="need">${esc(t.need)}</label><textarea id="need" name="need" required maxlength="500" aria-describedby="need-hint"${bad('need')}>${v('need')}</textarea><p class="hint" id="need-hint">${esc(t.needHint)}</p>
<div class="trap" aria-hidden="true"><label for="website">Website</label><input id="website" name="website" tabindex="-1" autocomplete="off"></div>
<input type="hidden" name="stamp" value="${esc(p.stamp)}">
<input type="hidden" name="from" value="${esc(p.from ?? '')}">
${p.turnstile ? `<div class="cf-turnstile" data-sitekey="${esc(p.turnstile)}" data-language="${t.lang === 'en' ? 'en' : 'es'}"></div>` : ''}
<p class="hint">${esc(t.privacy)} <a href="${esc(p.privacy)}">${esc(t.privacyLink)}</a></p>
<button type="submit">${esc(t.submit)}</button>
</div></form>
<p class="hint">${esc(t.fallback)} <a href="mailto:${esc(p.email)}">${esc(p.email)}</a></p>`;
  return shell({ t, title: t.title, body, site: p.site, turnstile: p.turnstile });
}

export function donePage(
  t: AgendaText,
  start: number,
  timeZone: string,
  meet: string,
  site: string,
) {
  const home = `${site}${t.lang === 'en' ? '/en' : ''}`;
  const when = new Date(start).toLocaleString(t.lang, {
    timeZone,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });
  const body = `<h1>${esc(t.done.title)}</h1><p>${esc(t.done.body(when))}</p>
${meet ? `<p><a class="btn" href="${esc(meet)}">${esc(t.done.meet)}</a></p>` : ''}<p><a href="${esc(home)}">${esc(t.done.back)}</a></p>`;
  return shell({ t, title: t.done.title, body, site });
}

export function closedPage(t: AgendaText, email: string, site: string) {
  const body = `<h1>${esc(t.title)}</h1><p>${esc(t.closed)}</p><p><a class="btn" href="mailto:${esc(email)}">${esc(email)}</a></p>`;
  return shell({ t, title: t.title, body, site });
}
