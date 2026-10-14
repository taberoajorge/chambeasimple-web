import assert from 'node:assert/strict';
import { test } from 'node:test';
import { accessToken, book, busy, type Google } from './google.ts';

const G: Google = {
  clientId: 'id',
  clientSecret: 'secret',
  refreshToken: 'refresh',
  agendaCalendar: 'agenda@group.calendar.google.com',
  people: ['alex@example.com', 'sandra@example.com'],
};

type Call = { url: string; init?: RequestInit };
const fake = (answer: (url: string, init?: RequestInit) => unknown, status = 200) => {
  const calls: Call[] = [];
  const get = (async (url: string | URL, init?: RequestInit) => {
    calls.push({ url: String(url), init });
    return new Response(JSON.stringify(answer(String(url), init)), { status });
  }) as typeof fetch;
  return { calls, get };
};

test('the refresh token becomes an access token', async () => {
  const { calls, get } = fake(() => ({ access_token: 'abc' }));
  assert.equal(await accessToken(G, get), 'abc');
  assert.match(String(calls[0].init?.body), /grant_type=refresh_token/);
});

test('a dead token fails without echoing anything', async () => {
  const { get } = fake(() => ({ error: 'invalid_grant', secret: 'refresh' }), 400);
  await assert.rejects(accessToken(G, get), (e: Error) => e.message === 'google token 400');
});

test('busy blocks from every calendar are merged, and an unreadable calendar fails closed', async () => {
  const ok = fake(() => ({
    calendars: {
      'alex@example.com': {
        busy: [{ start: '2026-10-20T15:00:00Z', end: '2026-10-20T16:00:00Z' }],
      },
      'sandra@example.com': {
        busy: [{ start: '2026-10-20T17:00:00Z', end: '2026-10-20T17:30:00Z' }],
      },
      'agenda@group.calendar.google.com': { busy: [] },
    },
  }));
  const blocks = await busy(G, 't', 0, 1, ok.get);
  assert.equal(blocks.length, 2);
  const asked = JSON.parse(String(ok.calls[0].init?.body)).items.map((i: { id: string }) => i.id);
  assert.deepEqual(asked, [...G.people, G.agendaCalendar]);

  const hidden = fake(() => ({
    calendars: { 'sandra@example.com': { errors: [{ reason: 'notFound' }] } },
  }));
  await assert.rejects(busy(G, 't', 0, 1, hidden.get), /cannot read sandra/);
});

test('a booking goes to the agenda calendar with Meet and invites for everyone', async () => {
  const { calls, get } = fake(() => ({ id: 'e1', hangoutLink: 'https://meet.google.com/x' }));
  const out = await book(
    G,
    't',
    {
      start: Date.parse('2026-10-20T14:00:00Z'),
      minutes: 30,
      name: 'Ana',
      company: 'Acme',
      email: 'ana@acme.pe',
      need: 'CRM',
      lang: 'es',
    },
    get,
  );
  assert.equal(out.meet, 'https://meet.google.com/x');
  const url = new URL(calls[0].url);
  assert.ok(url.pathname.includes(encodeURIComponent(G.agendaCalendar)));
  assert.equal(url.searchParams.get('sendUpdates'), 'all');
  assert.equal(url.searchParams.get('conferenceDataVersion'), '1');
  const body = JSON.parse(String(calls[0].init?.body));
  assert.deepEqual(
    body.attendees.map((a: { email: string }) => a.email),
    [...G.people, 'ana@acme.pe'],
  );
  assert.equal(body.end.dateTime, '2026-10-20T14:30:00.000Z');
});
