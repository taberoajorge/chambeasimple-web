import assert from 'node:assert/strict';
import { test } from 'node:test';
import { freeSlots, HOURS, offsetOf, zoned } from './slots.ts';

const iso = (ms: number) => new Date(ms).toISOString();
// Monday 2026-10-19, 08:00 in Lima (13:00 UTC).
const monday8 = Date.parse('2026-10-19T13:00:00Z');

test('Lima is UTC-5 and Mexico City is UTC-6, all year', () => {
  for (const at of [Date.parse('2026-01-15T12:00:00Z'), Date.parse('2026-07-15T12:00:00Z')]) {
    assert.equal(offsetOf('America/Lima', at), -5 * 3_600_000);
    assert.equal(offsetOf('America/Mexico_City', at), -6 * 3_600_000);
  }
  assert.equal(iso(zoned('America/Lima', 2026, 10, 20, 9)), '2026-10-20T14:00:00.000Z');
});

test('slots start 24 h ahead, inside 9:00–18:00 Lima, weekdays only', () => {
  const slots = freeSlots(monday8, []);
  assert.equal(iso(slots[0]), '2026-10-20T14:00:00.000Z'); // Tuesday 9:00 Lima
  assert.equal(iso(slots[17]), '2026-10-20T22:30:00.000Z'); // Tuesday 17:30, the last one
  const weekdays = new Set(slots.map((s) => new Date(s - 5 * 3_600_000).getUTCDay()));
  assert.ok(!weekdays.has(0) && !weekdays.has(6), 'no weekend slots');
  assert.ok((slots.at(-1) ?? 0) <= monday8 + (HOURS.horizonDays + 1) * 86_400_000);
});

test('a slot is offered only if both calendars are free', () => {
  const tuesday10 = Date.parse('2026-10-20T15:00:00Z');
  const busy = [{ start: tuesday10, end: tuesday10 + 3_600_000 }]; // Sandra 10:00–11:00 Lima
  const slots = freeSlots(monday8, busy).map(iso);
  assert.ok(!slots.includes('2026-10-20T15:00:00.000Z'));
  assert.ok(!slots.includes('2026-10-20T15:30:00.000Z'));
  assert.ok(slots.includes('2026-10-20T16:00:00.000Z'));
  assert.ok(slots.includes('2026-10-20T14:30:00.000Z'));
});

test('Friday evening offers Monday next, not the weekend', () => {
  const friday17 = Date.parse('2026-10-23T22:00:00Z');
  assert.equal(iso(freeSlots(friday17, [])[0]), '2026-10-26T14:00:00.000Z');
});
