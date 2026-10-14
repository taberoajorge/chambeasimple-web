import assert from 'node:assert/strict';
import { test } from 'node:test';
import { violations } from './boundaries.ts';

const one = (path: string, text: string) => violations([{ path, text }]);

test('content is data only', () => {
  assert.equal(one('src/content/es.ts', "import Hero from '../sections/Hero.astro';").length, 1);
  assert.deepEqual(one('src/content/en.ts', "import type { Content } from './es';"), []);
});

test('sections use content and styles, never pages or layouts', () => {
  assert.equal(
    one('src/sections/Hero.astro', "import Base from '../layouts/Base.astro';").length,
    1,
  );
  assert.equal(
    one('src/sections/Hero.astro', "import Page from '../pages/index.astro';").length,
    1,
  );
  assert.deepEqual(
    one(
      'src/sections/Hero.astro',
      "import { es } from '../content/es';\nimport Cta from './Cta.astro';",
    ),
    [],
  );
});

test('layouts do not reach into sections or pages', () => {
  assert.equal(
    one('src/layouts/Base.astro', "import Hero from '../sections/Hero.astro';").length,
    1,
  );
  assert.deepEqual(one('src/layouts/Base.astro', "import '../styles/global.css';"), []);
});

test('pages may compose everything', () => {
  assert.deepEqual(
    one(
      'src/pages/index.astro',
      "import Base from '../layouts/Base.astro';\nimport Hero from '../sections/Hero.astro';",
    ),
    [],
  );
});

test('no grab-bag files', () => {
  assert.equal(one('src/sections/utils.ts', '').length, 1);
  assert.equal(one('src/helpers/x.ts', '').length, 1);
  assert.deepEqual(one('src/sections/Hero.astro', ''), []);
});
