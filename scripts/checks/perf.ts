// Lighthouse on every page of the sitemap, mobile and desktop, against the four scores and the load
// budgets. `pnpm perf` measures this checkout's `pnpm preview` (the build behind the Worker);
// `--url https://chambasimple.com` measures production; `--path /en` one page (CI runs one job per
// page); `--ci` accepts Performance >= 95 (shared runners are noisy); the other categories must be 100.
import { gzipSync } from 'node:zlib';
import { launch } from 'chrome-launcher';
import lighthouse, { desktopConfig } from 'lighthouse';
import { certify, repository } from '../agent-hooks.ts';
import { port } from '../port.ts';

// Not a visitor: the Worker leaves requests with this header out of the analytics.
const CHECK = { 'x-chambea-check': '1' };

// Every page in the target's own sitemap (home pages, cases, privacy).
async function pages(base: string) {
  const res = await fetch(new URL('/sitemap-0.xml', base), { headers: CHECK });
  if (!res.ok) throw new Error(`No sitemap at ${base} (${res.status}). Build first.`);
  return [...(await res.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    ([, loc]) => new URL(loc).pathname,
  );
}
const DEVICES = ['mobile', 'desktop'] as const;
const CATEGORIES = ['performance', 'accessibility', 'best-practices', 'seo'];
// firstLoadJsKB is compressed transfer, what the browser downloads.
const BUDGET = {
  htmlGzipKB: 40,
  firstLoadJsKB: 10, // Astro ships no JS by default; this only allows small islands
  lcpMs: { mobile: 2000, desktop: 800 }, // Lighthouse's simulated LCP
  tbtMs: 50,
  cls: 0,
};

type Audit = {
  score: number | null;
  numericValue?: number;
  details?: {
    items?: {
      resourceType?: string;
      transferSize?: number;
      networkRequestTime?: number;
      observedLoad?: number;
    }[];
  };
};
type Report = {
  categories: Record<string, { score: number; auditRefs?: { id: string }[] }>;
  audits: Record<string, Audit>;
};

type Device = (typeof DEVICES)[number];

const floor = (id: string, ci: boolean) => (ci && id === 'performance' ? 95 : 100);
const score = (report: Report, id: string) => Math.round(report.categories[id].score * 100);

// One Lighthouse run in a fresh Chrome, so no cache or state carries over between runs.
async function audit(url: string, device: Device, onlyCategories: string[]): Promise<Report> {
  const chrome = await launch({ chromeFlags: ['--headless=new'] });
  try {
    const run = await lighthouse(
      url,
      { port: chrome.port, logLevel: 'error', onlyCategories, extraHeaders: CHECK },
      device === 'desktop' ? desktopConfig : undefined,
    );
    if (!run) throw new Error(`Lighthouse returned no result for ${url}`);
    // Only the fields read below; Lighthouse's own types make every audit detail a union.
    return run.lhr as unknown as Report;
  } finally {
    chrome.kill();
  }
}

// One full run. Only when Performance is under the floor, Performance alone runs up to twice more and
// the best run counts: a noisy runner only ever makes a page slower, and Lighthouse's guidance is to
// run it "up to 5 times until it passes". Accessibility, best practices and SEO do not vary by run.
async function measure(url: string, device: Device, ci: boolean): Promise<Report> {
  let report = await audit(url, device, CATEGORIES);
  for (let retry = 0; retry < 2; retry++) {
    if (score(report, 'performance') >= floor('performance', ci)) break;
    const again = await audit(url, device, ['performance']);
    if (score(again, 'performance') > score(report, 'performance'))
      report = {
        categories: { ...report.categories, performance: again.categories.performance },
        audits: { ...report.audits, ...again.audits },
      };
  }
  return report;
}

// The elements Lighthouse saw move, to say what to fix.
const shifted = (report: Report) =>
  (report.audits['layout-shifts']?.details?.items ?? [])
    .map((item) => (item as { node?: { selector?: string } }).node?.selector)
    .filter(Boolean)
    .join(' | ');

// Previews send `X-Robots-Tag: noindex` on purpose (worker/index.ts); that alone is not a failure.
const onlyNoindex = (report: Report) =>
  (report.categories.seo.auditRefs ?? [])
    .filter(({ id }) => (report.audits[id]?.score ?? 1) < 1)
    .every(({ id }) => id === 'is-crawlable');

// Everything that fails for one page on one device.
function problems(report: Report, device: string, ci: boolean, preview = false): string[] {
  const found: string[] = [];
  for (const id of CATEGORIES) {
    if (score(report, id) < floor(id, ci) && !(preview && id === 'seo' && onlyNoindex(report))) {
      const failing = Object.entries(report.audits)
        .filter(([, a]) => a.score !== null && a.score < 1 && a.details?.items?.length)
        .map(([name]) => name);
      found.push(
        `${id} ${score(report, id)} (< ${floor(id, ci)}); audits not passing: ${failing.join(', ')}`,
      );
    }
  }
  const metric = (id: string) => report.audits[id]?.numericValue ?? 0;
  // Shared CI runners have noisy CPUs: timing budgets are checked locally and against production.
  const lcpBudget = ci ? Infinity : BUDGET.lcpMs[device as keyof typeof BUDGET.lcpMs];
  if (metric('largest-contentful-paint') > lcpBudget)
    found.push(`LCP ${Math.round(metric('largest-contentful-paint'))} ms > ${lcpBudget} ms`);
  if (!ci && device === 'mobile' && metric('total-blocking-time') > BUDGET.tbtMs)
    found.push(`TBT ${Math.round(metric('total-blocking-time'))} ms > ${BUDGET.tbtMs} ms`);
  if (Number(metric('cumulative-layout-shift').toFixed(3)) > BUDGET.cls)
    found.push(
      `CLS ${metric('cumulative-layout-shift').toFixed(3)} > ${BUDGET.cls}; shifted: ${shifted(report)}`,
    );
  const blocking =
    report.audits['render-blocking-insight'] ?? report.audits['render-blocking-resources'];
  if (blocking?.details?.items?.length)
    found.push(`${blocking.details.items.length} render-blocking resource(s)`);
  // First load: scripts requested before the load event.
  const loaded = report.audits.metrics?.details?.items?.[0]?.observedLoad ?? Infinity;
  const js = (report.audits['network-requests']?.details?.items ?? [])
    .filter((item) => item.resourceType === 'Script' && (item.networkRequestTime ?? 0) < loaded)
    .reduce((sum, item) => sum + (item.transferSize ?? 0), 0);
  if (js / 1024 > BUDGET.firstLoadJsKB)
    found.push(`first-load JS ${(js / 1024).toFixed(0)} KB > ${BUDGET.firstLoadJsKB} KB`);
  return found;
}

async function htmlProblems(url: string) {
  const get = () => fetch(url, { headers: { 'accept-language': 'en', ...CHECK } });
  const html = await (await get().catch(get)).text(); // one retry: a keep-alive reset after Lighthouse
  const kb = gzipSync(html).length / 1024;
  const found =
    kb > BUDGET.htmlGzipKB ? [`HTML ${kb.toFixed(1)} KB gzip > ${BUDGET.htmlGzipKB} KB`] : [];
  return { kb, found };
}

// The Worker sends the CSP; `astro preview` does not. Measuring without it let an inline script the
// CSP blocks pass here and fail only on the Cloudflare preview.
async function assertWorker(base: string) {
  const home = await fetch(base, { headers: CHECK });
  if (!home.headers.has('content-security-policy'))
    throw new Error(
      `${base} sends no Content-Security-Policy, so it is not the Worker: serve the build with pnpm preview.`,
    );
}

// One page on both devices: a line each, then what fails. Returns the scores, or null on a failure.
async function checkPage(base: string, path: string, ci: boolean) {
  const preview = new URL(base).hostname.endsWith('.workers.dev');
  const page = new URL(path, base).href;
  const html = await htmlProblems(page);
  const summary: string[] = [];
  let failed = false;
  for (const device of DEVICES) {
    const report = await measure(page, device, ci);
    const scores = CATEGORIES.map((id) => score(report, id)).join('/');
    const lcp = Math.round(report.audits['largest-contentful-paint'].numericValue ?? 0);
    const found = [
      ...(device === 'mobile' ? html.found : []),
      ...problems(report, device, ci, preview),
    ];
    process.stdout.write(
      `${found.length ? '✖' : '✔'} ${path} ${device}: ${scores} · LCP ${lcp} ms · HTML ${html.kb.toFixed(1)} KB gzip\n`,
    );
    for (const line of found) process.stdout.write(`    ${line}\n`);
    failed ||= found.length > 0;
    summary.push(`${path} ${device} ${scores}`);
  }
  return failed ? null : summary;
}

async function main() {
  const args = process.argv.slice(2);
  const option = (name: string) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);
  const ci = args.includes('--ci');
  const url = option('--url');
  const only = option('--path');
  const base = url ?? `http://localhost:${port()}`;
  await assertWorker(base);
  const results = [];
  for (const path of only ? [only] : await pages(base))
    results.push(await checkPage(base, path, ci));
  if (results.includes(null)) process.exitCode = 1;
  // A green local run of every page is what the agent hooks ask for before work on visible files is done.
  else if (!url && !only) certify(repository, 'perf', results.flat().join(', '));
}

if (import.meta.main) await main();
