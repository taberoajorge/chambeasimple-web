// Booking emails, sent by the agenda itself through Resend so they leave signed as
// chambasimple.com (DKIM aligned) and pass the domain's strict DMARC. Google creates the event and
// the Meet link but sends nothing: its emails would come from hola@ signed as google.com and fail
// DMARC (flagged as phishing, or spam at the client).
import { AGENDA } from '../../src/content/agenda.ts';

export type Mail = { apiKey: string; from: string; replyTo: string; notify: string[] };

export type Booked = {
  id: string; // the Google event id, reused as the invitation UID
  start: number;
  minutes: number;
  meet: string;
  name: string;
  company: string;
  email: string;
  need: string;
  lang: 'es' | 'en';
  timeZone: string;
  from?: string;
};

const ORGANIZER = 'hola@chambasimple.com';

const icsDate = (ms: number) =>
  new Date(ms)
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');
// RFC 5545 text: escape \ ; , and newlines.
const icsText = (s: string) =>
  s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');

// The invitation: METHOD:REQUEST makes Gmail and Outlook show it as an invite with Yes/No.
export function invitation(b: Booked, now: number) {
  const t = AGENDA[b.lang];
  return [
    'BEGIN:VCALENDAR',
    'PRODID:-//Chamba Simple//Agenda//ES',
    'VERSION:2.0',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${b.id}@chambasimple.com`,
    `DTSTAMP:${icsDate(now)}`,
    `DTSTART:${icsDate(b.start)}`,
    `DTEND:${icsDate(b.start + b.minutes * 60_000)}`,
    `SUMMARY:${icsText(`Chamba Simple × ${b.company}`)}`,
    `DESCRIPTION:${icsText(`${t.mail.meet}: ${b.meet}\n\n${b.need}`)}`,
    `LOCATION:${icsText(b.meet)}`,
    `ORGANIZER;CN=Chamba Simple:mailto:${ORGANIZER}`,
    `ATTENDEE;CN=${icsText(b.name)};ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE:mailto:${b.email}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

const esc = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c,
  );

const whenText = (b: Pick<Booked, 'start' | 'lang' | 'timeZone'>) =>
  new Date(b.start).toLocaleString(AGENDA[b.lang].lang, {
    timeZone: b.timeZone,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });

// Email clients ignore CSS variables, so the brand colors are written out here (ink and mint).
export function visitorEmail(b: Booked, m: Mail, now: number) {
  const t = AGENDA[b.lang];
  const when = whenText(b);
  const lines = [
    t.mail.hello(b.name),
    t.mail.body(when),
    `${t.mail.meet}: ${b.meet}`,
    t.mail.change,
    t.mail.signature,
  ];
  const html = `<div style="font-family:system-ui,sans-serif;font-size:16px;line-height:1.5;color:#02130f">
<p>${esc(lines[0])}</p><p>${esc(lines[1])}</p>
<p><a href="${esc(b.meet)}" style="display:inline-block;background:#62f0bb;color:#02130f;font-weight:700;padding:12px 20px;border-radius:999px;text-decoration:none">${esc(t.mail.meet)}</a></p>
<p>${esc(lines[3])}</p><p>${esc(lines[4])}</p></div>`;
  return {
    from: m.from,
    to: [b.email],
    reply_to: m.replyTo,
    subject: t.mail.subject(when),
    html,
    text: lines.join('\n\n'),
    attachments: [
      {
        filename: 'invitacion.ics',
        content: btoa(String.fromCharCode(...new TextEncoder().encode(invitation(b, now)))),
        content_type: 'text/calendar; charset=utf-8; method=REQUEST',
      },
    ],
  };
}

// The owners always read Spanish; reply goes straight to the visitor.
export function ownersEmail(b: Booked, m: Mail) {
  const when = whenText({ ...b, lang: 'es', timeZone: 'America/Lima' });
  const text = [
    `${b.name} · ${b.company} · ${b.email}`,
    `${when}`,
    `Meet: ${b.meet}`,
    `Idioma: ${b.lang} · Zona del visitante: ${b.timeZone} · Origen: ${b.from || 'directo'}`,
    '',
    b.need,
  ].join('\n');
  return {
    from: m.from,
    to: m.notify,
    reply_to: b.email,
    subject: AGENDA.es.mail.owners(b.company),
    text,
  };
}

export async function send(m: Mail, email: object, get: typeof fetch = fetch) {
  const res = await get('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${m.apiKey}`, 'content-type': 'application/json' },
    body: JSON.stringify(email),
  });
  if (!res.ok) throw new Error(`resend ${res.status}`); // never log the body: it may echo addresses
}
