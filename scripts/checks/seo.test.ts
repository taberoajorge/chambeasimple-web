import assert from 'node:assert/strict';
import { test } from 'node:test';
import { THEME_SCRIPT } from '../../src/layouts/theme.ts';
import { blockedScripts, problems } from './seo.ts';

const page = (
  over: Partial<Record<'title' | 'description' | 'h1', string>> = {},
) => `<html lang="es-PE"><head>
<title>${over.title ?? 'Software a la medida para empresas · Chambea Simple'}</title>
<meta name="description" content="${over.description ?? 'x'.repeat(120)}">
<link rel="canonical" href="https://chambasimple.com/">
<link rel="alternate" hreflang="es" href="/"><link rel="alternate" hreflang="en" href="/en">
<link rel="alternate" hreflang="x-default" href="/">
<link rel="alternate" type="text/markdown" href="/index.md">
<meta property="og:title" content="t">
<script type="application/ld+json">{"@context":"https://schema.org"}</script>
</head><body>${over.h1 ?? '<h1>Hola</h1>'}</body></html>`;

const all = () => true;

test('a complete page passes', () => {
  assert.deepEqual(problems([{ path: '/index.html', html: page() }], all), []);
});

test('long titles, short descriptions and missing h1 are named', () => {
  const found = problems(
    [{ path: '/a.html', html: page({ title: 'x'.repeat(61), description: 'corta', h1: '' }) }],
    all,
  );
  assert.equal(found.length, 3);
  assert.match(found.join('\n'), /title.*61/);
  assert.match(found.join('\n'), /description.*5/);
  assert.match(found.join('\n'), /h1/);
});

test('duplicates and a missing Markdown twin fail', () => {
  const found = problems(
    [
      { path: '/a.html', html: page() },
      { path: '/b.html', html: page() },
    ],
    () => false,
  );
  assert.match(found.join('\n'), /\/b\.html: same title as \/a\.html/);
  assert.match(found.join('\n'), /Markdown twin \/index\.md not built/);
});

test('only scripts the CSP allows pass: the theme script, never a new inline one', () => {
  const json = '<script type="application/ld+json">{"@context":"https://schema.org"}</script>';
  assert.deepEqual(blockedScripts(`<head><script>${THEME_SCRIPT}</script>${json}</head>`), []);
  const [inline] = blockedScripts('<script>document.body.dataset.x=""</script>');
  assert.match(inline, /inline script is blocked by the CSP: allow 'sha256-[A-Za-z0-9+/]+=*'/);
  assert.match(blockedScripts('<script type="module" src="/_astro/a.js"></script>')[0], /a\.js/);
  assert.deepEqual(
    blockedScripts('<script src="/a.js"></script>', "default-src 'self'"),
    [],
    'without script-src, default-src applies',
  );
});
