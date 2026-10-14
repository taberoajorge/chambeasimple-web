import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { test } from 'node:test';

// Reads the theme tokens straight from global.css, so the test checks what ships.
const css = readFileSync(new URL('./global.css', import.meta.url), 'utf8');
// Tokens are a plain color (same in both themes) or light-dark(light, dark).
const root = /:root \{([\s\S]*?)\n\}/.exec(css)?.[1] ?? '';
const TOKEN = /--([\w-]+):\s*(?:light-dark\((#[0-9a-f]{6}),\s*(#[0-9a-f]{6})\)|(#[0-9a-f]{6}))/gi;
const theme = (side: 'light' | 'dark') =>
  Object.fromEntries(
    [...root.matchAll(TOKEN)].map(([, k, l, d, both]) => [k, both ?? (side === 'light' ? l : d)]),
  );
const light = theme('light');
const dark = theme('dark');

const luminance = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = Number.parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

for (const [name, theme] of [
  ['light', light],
  ['dark', dark],
] as const)
  test(`${name} theme: every text pair is at least 4.5:1`, () => {
    for (const fg of ['text', 'muted', 'accent', 'danger'])
      for (const bg of ['bg', 'surface', 'card'])
        assert.ok(
          ratio(theme[fg], theme[bg]) >= 4.5,
          `${fg} on ${bg}: ${ratio(theme[fg], theme[bg]).toFixed(2)}`,
        );
    assert.ok(ratio(theme.ink, theme.mint) >= 4.5, 'ink on the mint button');
  });

test('mint is never text on the light background', () => {
  assert.ok(
    ratio(light.mint, light.bg) < 3,
    'if this fails, the rule in global.css can be relaxed',
  );
  assert.notEqual(light.accent, light.mint);
});

test('every color token is read in both themes', () => {
  for (const k of ['bg', 'surface', 'text', 'muted', 'accent', 'line', 'ink', 'mint'])
    assert.ok(light[k] && dark[k], `--${k} missing`);
  assert.notEqual(light.bg, dark.bg);
});

// Components must stay distinct: a card stands out from either section, and its border from it.
for (const [name, t] of [
  ['light', light],
  ['dark', dark],
] as const)
  test(`${name} theme: cards and borders are distinguishable`, () => {
    assert.ok(ratio(t.line, t.card) >= 1.4, `line on card: ${ratio(t.line, t.card).toFixed(2)}`);
    assert.ok(ratio(t.line, t.bg) >= 1.3, `line on bg: ${ratio(t.line, t.bg).toFixed(2)}`);
    if (name === 'dark')
      for (const section of ['bg', 'surface'])
        assert.ok(
          ratio(t.card, t[section]) >= 1.2,
          `card on ${section}: ${ratio(t.card, t[section]).toFixed(2)}`,
        );
  });

test('the band and the logo plate are readable', () => {
  assert.ok(ratio(light['band-text'], light.band) >= 4.5);
  assert.ok(ratio(light['band-muted'], light.band) >= 4.5);
  assert.ok(ratio(light.mint, light.band) >= 4.5, 'mint links on the band');
});

// One palette: no component may write its own color.
test('no hex colors outside global.css', () => {
  const files = (dir: URL): URL[] =>
    readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
      e.isDirectory() ? files(new URL(`${e.name}/`, dir)) : [new URL(e.name, dir)],
    );
  const offenders = files(new URL('../', import.meta.url))
    .filter((f) => /\.(astro|ts)$/.test(f.pathname) && !f.pathname.endsWith('.test.ts'))
    .filter((f) =>
      /#[0-9a-f]{6}\b/i.test(
        readFileSync(f, 'utf8').replace(/<meta name="theme-color"[^>]*>/g, ''),
      ),
    )
    .map((f) => f.pathname.split('/src/')[1]);
  assert.deepEqual(offenders, []);
});
