import assert from 'node:assert/strict';
import { test } from 'node:test';
import { emailKey, readForm, stamp } from './form.ts';

const SECRET = 'test-secret';
const NOW = Date.parse('2026-10-19T15:00:00Z');
const SLOT = Date.parse('2026-10-20T14:00:00Z');

const form = async (over: Record<string, string> = {}, renderedAt = NOW - 60_000) => {
  const f = new FormData();
  const fields = {
    slot: String(SLOT),
    name: '  Ana   Pérez ',
    company: 'Acme SAC',
    email: 'Ana@Acme.pe',
    need: 'Un CRM para el equipo comercial',
    website: '',
    stamp: await stamp(SECRET, renderedAt),
    ...over,
  };
  for (const [k, v] of Object.entries(fields)) f.set(k, v);
  return f;
};

test('a valid booking is read and cleaned', async () => {
  const out = await readForm(await form(), SECRET, NOW, [SLOT]);
  assert.deepEqual(out, {
    start: SLOT,
    name: 'Ana Pérez',
    company: 'Acme SAC',
    email: 'ana@acme.pe',
    need: 'Un CRM para el equipo comercial',
  });
});

test('bots fall in the traps: honeypot, too fast, forged or stale stamp', async () => {
  assert.deepEqual(await readForm(await form({ website: 'http://spam' }), SECRET, NOW, [SLOT]), {
    error: 'trap',
  });
  assert.deepEqual(await readForm(await form({}, NOW - 1_000), SECRET, NOW, [SLOT]), {
    error: 'trap',
  });
  assert.deepEqual(
    await readForm(await form({ stamp: `${NOW - 60_000}.forged` }), SECRET, NOW, [SLOT]),
    { error: 'stale' },
  );
  assert.deepEqual(await readForm(await form({}, NOW - 3 * 3_600_000), SECRET, NOW, [SLOT]), {
    error: 'stale',
  });
});

test('every field is checked on the server, including a slot we never offered', async () => {
  const out = await readForm(
    await form({
      slot: String(SLOT + 15 * 60_000),
      email: 'not-an-email',
      need: 'x'.repeat(501),
      name: '',
    }),
    SECRET,
    NOW,
    [SLOT],
  );
  assert.deepEqual(out, { error: 'fields', fields: ['slot', 'name', 'email', 'need'] });
});

test('the per-email key never contains the email', async () => {
  const key = await emailKey('Ana@Acme.pe');
  assert.equal(key, await emailKey('ana@acme.pe'));
  assert.ok(!key.includes('acme'));
});
