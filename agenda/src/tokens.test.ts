import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { TOKENS } from './tokens.ts';

test('the agenda uses exactly the color tokens of the site', () => {
  const css = readFileSync(new URL('../../src/styles/global.css', import.meta.url), 'utf8');
  assert.ok(css.includes(TOKENS), 'copy the :root blocks of global.css into agenda/src/tokens.ts');
});
