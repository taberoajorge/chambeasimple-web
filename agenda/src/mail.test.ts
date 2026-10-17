import assert from 'node:assert/strict';
import { test } from 'node:test';
import { type Booked, invitation, ownersEmail, send, visitorEmail } from './mail.ts';

const M = {
  apiKey: 'k',
  from: 'Chamba Simple <agenda@chambasimple.com>',
  replyTo: 'hola@chambasimple.com',
  notify: ['agenda@chambasimple.com'],
};
const B: Booked = {
  id: 'ev1',
  start: Date.parse('2026-10-20T15:00:00Z'),
  minutes: 30,
  meet: 'https://meet.google.com/abc-defg-hij',
  name: 'Ana <b>Pérez</b>',
  company: 'Acme, SAC; Lima',
  email: 'ana@acme.pe',
  need: 'Un CRM\npara ventas',
  lang: 'es',
  timeZone: 'America/Lima',
};
const NOW = Date.parse('2026-10-19T15:00:00Z');

test('the invitation is a calendar REQUEST with organizer, attendee and escaped text', () => {
  const ics = invitation(B, NOW);
  assert.match(ics, /^BEGIN:VCALENDAR\r\n/);
  assert.match(ics, /METHOD:REQUEST/);
  assert.match(ics, /DTSTART:20261020T150000Z\r\nDTEND:20261020T153000Z/);
  assert.match(ics, /ORGANIZER;CN=Chamba Simple:mailto:hola@chambasimple\.com/);
  assert.match(ics, /RSVP=TRUE:mailto:ana@acme\.pe/);
  assert.match(ics, /SUMMARY:Chamba Simple × Acme\\, SAC\\; Lima/);
  assert.match(ics, /para ventas/);
  assert.ok(!ics.includes('Un CRM\npara'), 'newlines inside text are escaped');
});

test('the visitor email comes from our domain, replies to hola@, escapes what the visitor typed', () => {
  const e = visitorEmail(B, M, NOW);
  assert.equal(e.from, M.from);
  assert.equal(e.reply_to, 'hola@chambasimple.com');
  assert.deepEqual(e.to, ['ana@acme.pe']);
  assert.match(e.subject, /Tu conversación con Chamba Simple/);
  assert.ok(!e.html.includes('<b>Pérez</b>'));
  assert.match(e.html, /&lt;b&gt;/);
  assert.equal(e.attachments[0].content_type, 'text/calendar; charset=utf-8; method=REQUEST');
  const decoded = new TextDecoder().decode(
    Uint8Array.from(atob(e.attachments[0].content), (c) => c.charCodeAt(0)),
  );
  assert.match(decoded, /UID:ev1@chambasimple\.com/);
  assert.match(decoded, /Pérez/, 'UTF-8 survives the base64 attachment');
});

test('the owners get the details in Spanish, Lima time, and reply goes to the visitor', () => {
  const e = ownersEmail({ ...B, lang: 'en', timeZone: 'America/New_York' }, M);
  assert.deepEqual(e.to, ['agenda@chambasimple.com']);
  assert.equal(e.reply_to, 'ana@acme.pe');
  assert.match(e.subject, /Nueva conversación agendada: Acme/);
  assert.match(e.text, /Zona del visitante: America\/New_York/);
});

test('a Resend error is an error, without echoing the response', async () => {
  const get = (async () => new Response('{"to":"ana@acme.pe"}', { status: 422 })) as typeof fetch;
  await assert.rejects(send(M, {}, get), (e: Error) => e.message === 'resend 422');
});
