// Which 30-minute slots to offer: inside working hours (in the owners' time zone), with notice
// and a horizon, and free in every calendar. Pure: time and busy blocks come in as arguments.

export type Interval = { start: number; end: number }; // epoch ms

export type Hours = {
  timeZone: string; // the owners' working time zone, e.g. America/Lima
  days: number[]; // ISO weekdays, 1 = Monday
  from: number; // first slot, hour of day
  to: number; // working day ends, hour of day
  minutes: number; // slot length
  noticeHours: number; // earliest slot from now
  horizonDays: number; // latest day offered
};

export const HOURS: Hours = {
  timeZone: 'America/Lima',
  days: [1, 2, 3, 4, 5],
  from: 9,
  to: 18,
  minutes: 30,
  noticeHours: 24,
  horizonDays: 21,
};

// The UTC offset (ms) of a time zone at an instant, from Intl: no tz database to ship.
export function offsetOf(timeZone: string, at: number) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(at);
  const n = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  const local = Date.UTC(n('year'), n('month') - 1, n('day'), n('hour'), n('minute'), n('second'));
  return local - Math.floor(at / 1000) * 1000;
}

// Epoch ms of a wall-clock time in a time zone (two passes settle DST edges).
export function zoned(timeZone: string, y: number, m: number, d: number, h: number, min = 0) {
  const guess = Date.UTC(y, m - 1, d, h, min);
  const first = guess - offsetOf(timeZone, guess);
  return guess - offsetOf(timeZone, first);
}

const overlaps = (a: Interval, b: Interval) => a.start < b.end && b.start < a.end;

export function freeSlots(now: number, busy: Interval[], hours: Hours = HOURS): number[] {
  const out: number[] = [];
  const earliest = now + hours.noticeHours * 3_600_000;
  const step = hours.minutes * 60_000;
  for (let day = 0; day <= hours.horizonDays; day++) {
    // The calendar date `day` days from now, in the owners' zone.
    const at = new Date(now + offsetOf(hours.timeZone, now) + day * 86_400_000);
    const [y, m, d] = [at.getUTCFullYear(), at.getUTCMonth() + 1, at.getUTCDate()];
    const weekday = ((at.getUTCDay() + 6) % 7) + 1;
    if (!hours.days.includes(weekday)) continue;
    const open = zoned(hours.timeZone, y, m, d, hours.from);
    const close = zoned(hours.timeZone, y, m, d, hours.to);
    for (let start = open; start + step <= close; start += step) {
      const slot = { start, end: start + step };
      if (start >= earliest && !busy.some((b) => overlaps(b, slot))) out.push(start);
    }
  }
  return out;
}
