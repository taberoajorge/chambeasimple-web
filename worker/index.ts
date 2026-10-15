// The Worker in front of the page routes (run_worker_first in wrangler.jsonc). It decides:
// Markdown or HTML for the same URL (agents ask with `Accept: text/markdown`), security headers,
// `noindex` on any host that is not the real domain, and one cookieless data point per page view.

import { CSP } from './csp.ts';

type Env = {
  ASSETS: { fetch(request: Request): Promise<Response> };
  // Workers Analytics Engine. Optional so tests and `wrangler dev` work without it.
  VISITS?: {
    writeDataPoint(point: { indexes: string[]; blobs: string[]; doubles: number[] }): void;
  };
};

const DOMAIN = 'chambasimple.com';

const HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  'X-Frame-Options': 'DENY',
  'Content-Security-Policy': CSP,
};

// A page URL (no extension) maps to its Markdown twin: / → /index.md, /en → /en.md.
export const twinOf = (pathname: string) =>
  /\.[a-z0-9]+$/i.test(pathname)
    ? null
    : pathname === '/'
      ? '/index.md'
      : `${pathname.replace(/\/$/, '')}.md`;

const wantsMarkdown = (request: Request) =>
  /\btext\/markdown\b/.test(request.headers.get('accept') ?? '');

const BOTS = /bot|crawl|spider|slurp|lighthouse|headless|curl|wget|python|node-fetch|go-http/i;
const AGENTS =
  /gptbot|chatgpt|oai-searchbot|claude|anthropic|perplexity|google-extended|ccbot|bytespider|meta-externalagent/i;

// Who is visiting, without identifying anyone: an AI agent, another bot, or a person.
export const visitorOf = (request: Request) => {
  const ua = request.headers.get('user-agent') ?? '';
  if (AGENTS.test(ua) || wantsMarkdown(request)) return 'agent';
  return BOTS.test(ua) ? 'bot' : 'person';
};

// One data point per page view: page, where it came from, campaign, country and kind of visitor.
// No IP, no cookie, no user agent string: nothing that identifies a person, so no consent banner.
export function pointOf(request: Request, url: URL, status: number) {
  const from = URL.parse(request.headers.get('referer') ?? '')?.hostname ?? '';
  const utm = (k: string) => url.searchParams.get(`utm_${k}`) ?? '';
  const country = (request as Request & { cf?: { country?: string } }).cf?.country ?? '';
  return {
    indexes: [url.pathname],
    blobs: [
      url.pathname,
      from === url.hostname ? '' : from,
      utm('source'),
      utm('medium'),
      utm('campaign'),
      country,
      visitorOf(request),
      String(status),
    ],
    doubles: [1],
  };
}

function finish(response: Response, url: URL) {
  const out = new Response(response.body, response);
  for (const [k, v] of Object.entries(HEADERS)) out.headers.set(k, v);
  out.headers.append('Vary', 'Accept');
  // no-transform: Cloudflare must not rewrite our pages (its zone features inject scripts, like the
  // RUM beacon, that break the zero-JS budget and trip the CSP).
  const cache = out.headers.get('Cache-Control');
  out.headers.set('Cache-Control', cache ? `${cache}, no-transform` : 'no-transform');
  if (url.hostname !== DOMAIN) out.headers.set('X-Robots-Tag', 'noindex');
  else out.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  return out;
}

async function respond(request: Request, env: Env, url: URL): Promise<Response> {
  const twin = twinOf(url.pathname);
  if (twin && wantsMarkdown(request)) {
    const md = await env.ASSETS.fetch(new Request(new URL(twin, url), request));
    if (md.ok) {
      const out = finish(md, url);
      out.headers.set('Content-Type', 'text/markdown; charset=utf-8');
      return out;
    }
  }
  const res = await env.ASSETS.fetch(request);
  // Cloudflare drops `.html` and trailing slashes with a 307; search engines want it permanent.
  const location = res.headers.get('location');
  if (res.status === 307 && location) return Response.redirect(new URL(location, url).href, 308);
  return finish(res, url);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    // One host: www.chambasimple.com redirects for good to the apex, path and query kept.
    if (url.hostname === `www.${DOMAIN}`) {
      url.hostname = DOMAIN;
      return Response.redirect(url.href, 308);
    }
    const response = await respond(request, env, url);
    // Only the real domain counts: PR previews share this dataset. Our own checks (Lighthouse and
    // smoke in CI) mark themselves with x-chambea-check, since Lighthouse's user agent looks human.
    if (
      request.method === 'GET' &&
      url.hostname === DOMAIN &&
      !request.headers.has('x-chambea-check')
    )
      env.VISITS?.writeDataPoint(pointOf(request, url, response.status));
    return response;
  },
};
