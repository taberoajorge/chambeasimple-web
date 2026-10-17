// Google Calendar, with the least access that works (design.md, agenda-propia):
// calendar.freebusy reads only busy blocks of the hola@ calendar (no titles, no guests);
// calendar.app.created writes only to the agenda's own secondary calendar.
import type { Interval } from './slots.ts';

export type Google = {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  agendaCalendar: string; // id of the secondary calendar the app created
  people: string[]; // calendars checked for busy blocks (hola@chambasimple.com)
  // Who gets the invitation besides the visitor. Not the organizer itself: Google never emails an
  // event's own organizer, so the owners are notified through another alias that forwards to them.
  notify: string[];
};

type Fetch = typeof fetch;

export async function accessToken(g: Google, get: Fetch = fetch): Promise<string> {
  const res = await get('https://oauth2.googleapis.com/token', {
    method: 'POST',
    body: new URLSearchParams({
      client_id: g.clientId,
      client_secret: g.clientSecret,
      refresh_token: g.refreshToken,
      grant_type: 'refresh_token',
    }),
  });
  if (!res.ok) throw new Error(`google token ${res.status}`); // never log the body: it may echo secrets
  return ((await res.json()) as { access_token: string }).access_token;
}

export async function busy(g: Google, token: string, from: number, to: number, get: Fetch = fetch) {
  const res = await get('https://www.googleapis.com/calendar/v3/freeBusy', {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      timeMin: new Date(from).toISOString(),
      timeMax: new Date(to).toISOString(),
      items: [...g.people, g.agendaCalendar].map((id) => ({ id })),
    }),
  });
  if (!res.ok) throw new Error(`google freeBusy ${res.status}`);
  const body = (await res.json()) as {
    calendars: Record<string, { busy?: { start: string; end: string }[]; errors?: unknown[] }>;
  };
  // A calendar we cannot read means we cannot promise a free slot: fail closed.
  for (const [id, c] of Object.entries(body.calendars))
    if (c.errors?.length) throw new Error(`google freeBusy cannot read ${id}`);
  return Object.values(body.calendars).flatMap((c) =>
    (c.busy ?? []).map((b): Interval => ({ start: Date.parse(b.start), end: Date.parse(b.end) })),
  );
}

export type Booking = {
  start: number;
  minutes: number;
  name: string;
  company: string;
  email: string;
  need: string;
  lang: 'es' | 'en';
};

// quiet: Google creates the event and Meet link but emails no one (the agenda sends its own mail).
export async function book(
  g: Google,
  token: string,
  b: Booking,
  get: Fetch = fetch,
  quiet = false,
) {
  const url = new URL(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(g.agendaCalendar)}/events`,
  );
  url.searchParams.set('conferenceDataVersion', '1');
  url.searchParams.set('sendUpdates', quiet ? 'none' : 'all');
  const title = `Chamba Simple × ${b.company}`;
  const res = await get(url, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      summary: title,
      description: `${b.name} · ${b.company}\n\n${b.need}`,
      start: { dateTime: new Date(b.start).toISOString() },
      end: { dateTime: new Date(b.start + b.minutes * 60_000).toISOString() },
      ...(!quiet && {
        attendees: [
          ...g.notify.map((email) => ({ email })),
          { email: b.email, displayName: b.name },
        ],
      }),
      conferenceData: {
        createRequest: {
          requestId: crypto.randomUUID(),
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
      guestsCanSeeOtherGuests: true,
      reminders: { useDefault: true },
    }),
  });
  if (!res.ok) throw new Error(`google events.insert ${res.status}`);
  const event = (await res.json()) as { id: string; hangoutLink?: string };
  return { id: event.id, meet: event.hangoutLink ?? '' };
}
