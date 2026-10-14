import assert from 'node:assert/strict';
import { test } from 'node:test';
import { smoke } from './smoke.ts';

// A fake site: what a healthy deploy answers.
const healthy = async (url: string, init?: RequestInit) => {
  const { pathname } = new URL(url);
  const accept = new Headers(init?.headers).get('accept') ?? '';
  if (pathname === '/en/') return new Response(null, { status: 308, headers: { location: '/en' } });
  if (pathname === '/en' && accept.includes('markdown'))
    return new Response('# Hi', { headers: { 'content-type': 'text/markdown', vary: 'Accept' } });
  if (['/', '/en'].includes(pathname)) return new Response('<h1>Hola</h1>');
  if (['/llms.txt', '/sitemap-index.xml', '/robots.txt'].includes(pathname))
    return new Response('ok');
  return new Response('no', { status: 404 });
};

test('a healthy site passes', async () => {
  assert.deepEqual(await smoke('https://chambasimple.com/', healthy), []);
});

test('a broken deploy names what broke', async () => {
  const broken = async (url: string, init?: RequestInit) =>
    new URL(url).pathname === '/llms.txt'
      ? new Response('gone', { status: 500 })
      : healthy(url, init);
  const found = await smoke('https://chambasimple.com', broken);
  assert.equal(found.length, 1);
  assert.match(found[0], /llms\.txt answered 500/);
});

test('a network error is a problem, not a crash', async () => {
  const down = async () => {
    throw new Error('connection refused');
  };
  const found = await smoke('https://chambasimple.com', down);
  assert.equal(found.length, 5);
});
