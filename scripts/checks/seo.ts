// Runs after `astro build` on every page in dist/: what a search engine or an agent needs from each
// one, and no script the Worker's CSP would block. Fails the build with one line per problem.
// ponytail: regex over our own generated HTML, not a parser; Astro's output is regular enough.
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { CSP } from '../../worker/csp.ts';

const SITE = 'https://chambasimple.com';

type Page = { path: string; html: string };

const decode = (s: string) =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
const one = (html: string, re: RegExp) => decode(re.exec(html)?.[1] ?? '');

const parses = (json: string) => {
  try {
    JSON.parse(json);
    return true;
  } catch {
    return false;
  }
};

// One rule per line: given a page, a problem or null.
const RULES: ((html: string, exists: (file: string) => boolean) => string | null)[] = [
  (h) => {
    const n = one(h, /<title>([^<]*)<\/title>/).length;
    return n > 0 && n <= 60 ? null : `title must be 1–60 characters (${n})`;
  },
  (h) => {
    const n = one(h, /<meta name="description" content="([^"]*)"/).length;
    return n >= 70 && n <= 160 ? null : `description must be 70–160 characters (${n})`;
  },
  (h) => (/<html lang="[a-z]{2}(-[A-Z]{2})?"/.test(h) ? null : 'html lang missing'),
  (h) => ((h.match(/<h1[\s>]/g) ?? []).length === 1 ? null : 'needs exactly one h1'),
  (h) =>
    one(h, /<link rel="canonical" href="([^"]*)"/).startsWith(SITE) ? null : 'canonical missing',
  (h) => {
    const missing = ['es', 'en', 'x-default'].filter((l) => !h.includes(`hreflang="${l}"`));
    return missing.length ? `hreflang ${missing.join(', ')} missing` : null;
  },
  (h) => (/<meta property="og:title"/.test(h) ? null : 'og:title missing'),
  (h, exists) => {
    const md = one(h, /<link rel="alternate" type="text\/markdown" href="([^"]*)"/);
    return md && exists(md) ? null : `Markdown twin ${md || '(none)'} not built`;
  },
  (h) =>
    [...h.matchAll(/<script type="application\/ld\+json">([^<]*)<\/script>/g)].every(([, j]) =>
      parses(j),
    )
      ? null
      : 'JSON-LD does not parse',
];

// Titles and descriptions must also be unique across pages.
const duplicates = (pages: Page[]) =>
  (['title', 'description'] as const).flatMap((kind) => {
    const re =
      kind === 'title' ? /<title>([^<]*)<\/title>/ : /<meta name="description" content="([^"]*)"/;
    const first = new Map<string, string>();
    return pages.flatMap(({ path, html }) => {
      const value = one(html, re);
      const other = first.get(value);
      if (!other) first.set(value, path);
      return other ? [`${path}: same ${kind} as ${other}`] : [];
    });
  });

export const problems = (pages: Page[], exists: (file: string) => boolean): string[] => [
  ...pages.flatMap(({ path, html }) =>
    RULES.map((rule) => rule(html, exists))
      .filter((p): p is string => p !== null)
      .map((p) => `${path}: ${p}`),
  ),
  ...duplicates(pages),
];

// What the browser would refuse to run under the CSP the Worker sends: an inline script whose hash is
// not in script-src, or a script file without 'self'. Caught here, at build time, instead of by
// Lighthouse on the Cloudflare preview. JSON-LD is data, never run, so it is left out.
export const blockedScripts = (html: string, csp = CSP): string[] => {
  const directive = (name: string) => new RegExp(`(?:^|;)\\s*${name}\\s([^;]*)`).exec(csp)?.[1];
  const allowed = (directive('script-src') ?? directive('default-src') ?? '').trim().split(/\s+/);
  return [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)].flatMap(([, attrs, body]) => {
    if (/type="application\/ld\+json"/.test(attrs)) return [];
    const src = /\ssrc="([^"]*)"/.exec(` ${attrs}`)?.[1];
    if (src !== undefined)
      return allowed.includes("'self'") ? [] : [`script ${src} is blocked by the CSP (no 'self')`];
    const hash = `'sha256-${createHash('sha256').update(body).digest('base64')}'`;
    return allowed.includes(hash)
      ? []
      : [`inline script is blocked by the CSP: allow ${hash} in worker/csp.ts or remove it`];
  });
};

const htmlFiles = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory()
      ? htmlFiles(join(dir, e.name))
      : e.name.endsWith('.html')
        ? [join(dir, e.name)]
        : [],
  );

if (import.meta.main) {
  const dist = new URL('../../dist/', import.meta.url).pathname;
  const all = htmlFiles(dist).map((f) => ({
    path: `/${relative(dist, f)}`,
    html: readFileSync(f, 'utf8'),
  }));
  // The 404 page is not indexed, but it runs under the same CSP.
  const pages = all.filter(({ path }) => !path.endsWith('404.html'));
  const found = [
    ...problems(pages, (file) => existsSync(join(dist, file))),
    ...all.flatMap(({ path, html }) => blockedScripts(html).map((p) => `${path}: ${p}`)),
  ];
  if (found.length) {
    process.stderr.write(`seo: ${found.length} problem(s)\n${found.join('\n')}\n`);
    process.exit(1);
  }
  process.stdout.write(
    `seo: ${pages.length} pages ok; csp: every script allowed on ${all.length}\n`,
  );
}
