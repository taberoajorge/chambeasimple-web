import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

// Reads the theme tokens straight from global.css, so the test checks what ships.
const css = readFileSync(new URL('./global.css', import.meta.url), 'utf8');
const block = (selector: RegExp) => selector.exec(css)?.[1] ?? '';
const tokens = (text: string) =>
  Object.fromEntries(
    [...text.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})/gi)].map(([, k, v]) => [k, v]),
  );

const light = tokens(block(/:root \{([\s\S]*?)\}/));
const dark = {
  ...light,
  ...tokens(block(/prefers-color-scheme: dark\) \{\s*:root \{([\s\S]*?)\}/)),
};

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
    for (const fg of ['text', 'muted', 'accent'])
      for (const bg of ['bg', 'surface'])
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
