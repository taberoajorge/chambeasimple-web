import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { PATHS } from '../src/content/site.ts';
import { THEME_SCRIPT } from '../src/layouts/theme.ts';
import worker, { pointOf, twinOf, visitorOf } from './index.ts';

// A fake assets binding: serves a few files by path.
const FILES: Record<string, [string, string]> = {
  '/': ['<h1>Hola</h1>', 'text/html'],
  '/index.md': ['# Hola', 'text/markdown'],
  '/en': ['<h1>Hi</h1>', 'text/html'],
  '/en.md': ['# Hi', 'text/markdown'],
  '/favicon.svg': ['<svg/>', 'image/svg+xml'],
};
const REDIRECTS: Record<string, string> = { '/en.html': '/en', '/en/': '/en' };
const env = {
  ASSETS: {
    fetch: async (r: Request) => {
      const path = new URL(r.url).pathname;
      if (REDIRECTS[path])
        return new Response(null, { status: 307, headers: { location: REDIRECTS[path] } });
      const f = FILES[path];
      return f
        ? new Response(f[0], { headers: { 'Content-Type': f[1] } })
        : new Response('no', { status: 404 });
    },
  },
};
const get = (url: string, accept = 'text/html') =>
  worker.fetch(new Request(url, { headers: { accept } }), env);

test('page paths map to their Markdown twin; files do not', () => {
  assert.equal(twinOf('/'), '/index.md');
  assert.equal(twinOf('/en'), '/en.md');
  assert.equal(twinOf('/casos/x/'), '/casos/x.md');
  assert.equal(twinOf('/favicon.svg'), null);
});

test('agents asking for Markdown get it on the same URL, with Vary: Accept', async () => {
  const res = await get('https://chambasimple.com/en', 'text/markdown, text/html;q=0.8');
  assert.equal(await res.text(), '# Hi');
  assert.match(res.headers.get('content-type') ?? '', /text\/markdown/);
  assert.match(res.headers.get('vary') ?? '', /Accept/);
});

test('browsers get HTML, with security headers and Vary: Accept', async () => {
  const res = await get('https://chambasimple.com/');
  assert.equal(await res.text(), '<h1>Hola</h1>');
  assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
  assert.match(res.headers.get('vary') ?? '', /Accept/);
  assert.equal(res.headers.get('x-robots-tag'), null);
});

test('previews are never indexed', async () => {
  const res = await get('https://chambeasimple-web.example.workers.dev/');
  assert.equal(res.headers.get('x-robots-tag'), 'noindex');
});

test('a page without a twin still serves HTML when Markdown is asked', async () => {
  const res = await get('https://chambasimple.com/missing', 'text/markdown');
  assert.equal(res.status, 404);
});

test('clean-URL redirects are permanent (308)', async () => {
  for (const path of ['/en.html', '/en/']) {
    const res = await get(`https://chambasimple.com${path}`);
    assert.equal(res.status, 308);
    assert.equal(res.headers.get('location'), 'https://chambasimple.com/en');
  }
});

test('each page view writes one data point, with nothing that identifies a person', async () => {
  const points: { blobs: string[] }[] = [];
  const request = new Request(
    'https://chambasimple.com/en?utm_source=google&utm_medium=cpc&utm_campaign=pe',
    {
      headers: { referer: 'https://www.google.com/search?q=x', 'user-agent': 'Mozilla/5.0 Safari' },
    },
  );
  await worker.fetch(request, { ...env, VISITS: { writeDataPoint: (p) => points.push(p) } });
  assert.equal(points.length, 1);
  assert.deepEqual(points[0].blobs, [
    '/en',
    'www.google.com',
    'google',
    'cpc',
    'pe',
    '',
    'person',
    '200',
  ]);
  assert.ok(!JSON.stringify(points).includes('Safari'), 'no user agent string is stored');
});

test('visitors are people, bots or AI agents; own-site referrers and bad referers are blank', () => {
  const as = (ua: string, accept = 'text/html') =>
    new Request('https://chambasimple.com/', { headers: { 'user-agent': ua, accept } });
  assert.equal(visitorOf(as('Mozilla/5.0 (iPhone) Safari')), 'person');
  assert.equal(visitorOf(as('Googlebot/2.1')), 'bot');
  assert.equal(visitorOf(as('Mozilla/5.0 GPTBot/1.2')), 'agent');
  assert.equal(visitorOf(as('anything', 'text/markdown')), 'agent');
  const own = new Request('https://chambasimple.com/en', {
    headers: { referer: 'https://chambasimple.com/' },
  });
  assert.equal(pointOf(own, new URL(own.url), 200).blobs[1], '');
  const bad = new Request('https://chambasimple.com/en', { headers: { referer: 'not a url' } });
  assert.equal(pointOf(bad, new URL(bad.url), 200).blobs[1], '');
});

// The Worker runs only on page routes (free plan: every run counts against 100k a day).
// If a new kind of page is added, it must be listed in wrangler.jsonc or it loses Markdown,
// headers and measurement.
test('every kind of page is a run_worker_first route', () => {
  const config = JSON.parse(
    readFileSync(new URL('../wrangler.jsonc', import.meta.url), 'utf8').replace(
      /^\s*\/\/.*$/gm,
      '',
    ),
  );
  const routes: string[] = config.assets.run_worker_first;
  const covered = (path: string) =>
    routes.some((r) => (r.endsWith('/*') ? path.startsWith(r.slice(0, -1)) : path === r));
  for (const path of [
    PATHS.es.home,
    PATHS.en.home,
    PATHS.es.privacy,
    PATHS.en.privacy,
    PATHS.es.case('x'),
    PATHS.en.case('x'),
  ])
    assert.ok(covered(path), `${path} is not in run_worker_first`);
  assert.ok(
    !covered('/favicon.svg') && !covered('/llms.txt'),
    'files are served without the Worker',
  );
});

test('only the theme script may run, and the real domain is HTTPS-only', async () => {
  const res = await get('https://chambasimple.com/');
  const hash = createHash('sha256').update(THEME_SCRIPT).digest('base64');
  assert.ok(
    (res.headers.get('content-security-policy') ?? '').includes(`script-src 'sha256-${hash}'`),
    `the CSP must allow exactly the theme script: sha256-${hash}`,
  );
  assert.match(res.headers.get('strict-transport-security') ?? '', /max-age=31536000/);
});

test('www redirects for good to the apex, keeping path and query', async () => {
  const res = await get('https://www.chambasimple.com/en?utm_source=x');
  assert.equal(res.status, 308);
  assert.equal(res.headers.get('location'), 'https://chambasimple.com/en?utm_source=x');
});

test('pages tell Cloudflare not to transform them (no injected scripts)', async () => {
  const res = await get('https://chambasimple.com/');
  assert.match(res.headers.get('cache-control') ?? '', /no-transform/);
});
