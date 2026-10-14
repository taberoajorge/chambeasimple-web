// `node scripts/checks/smoke.ts <url>`: what must hold on a deployed site, in seconds. CI runs it
// right after every production deploy (and rolls back if it fails) and every day.
type Fetch = (url: string, init?: RequestInit) => Promise<Response>;

type Check = { name: string; run: (base: string, get: Fetch) => Promise<string | null> };

// x-chambea-check keeps these requests out of the visit analytics (worker/index.ts).
const html = {
  headers: { accept: 'text/html', 'x-chambea-check': '1' },
  redirect: 'manual' as const,
};
const markdown = {
  headers: { accept: 'text/markdown', 'x-chambea-check': '1' },
  redirect: 'manual' as const,
};

const CHECKS: Check[] = [
  {
    name: 'home in Spanish and English',
    run: async (base, get) => {
      for (const path of ['/', '/en']) {
        const res = await get(base + path, html);
        if (res.status !== 200) return `${path} answered ${res.status}`;
        if (!(await res.text()).includes('<h1')) return `${path} has no h1`;
      }
      return null;
    },
  },
  {
    name: 'agents get Markdown on the same URL',
    run: async (base, get) => {
      const res = await get(`${base}/en`, markdown);
      const type = res.headers.get('content-type') ?? '';
      if (!type.includes('text/markdown')) return `content-type ${type}`;
      return (res.headers.get('vary') ?? '').includes('Accept') ? null : 'no Vary: Accept';
    },
  },
  {
    name: 'llms.txt, sitemap and robots',
    run: async (base, get) => {
      for (const path of ['/llms.txt', '/sitemap-index.xml', '/robots.txt']) {
        const res = await get(base + path, html);
        if (res.status !== 200) return `${path} answered ${res.status}`;
      }
      return null;
    },
  },
  {
    name: 'clean URLs redirect for good',
    run: async (base, get) => {
      const res = await get(`${base}/en/`, html);
      return res.status === 308 ? null : `/en/ answered ${res.status}, not 308`;
    },
  },
  {
    name: 'unknown pages are 404',
    run: async (base, get) => {
      const res = await get(`${base}/no-existe-${Date.now()}`, html);
      return res.status === 404 ? null : `answered ${res.status}`;
    },
  },
];

export async function smoke(base: string, get: Fetch = fetch): Promise<string[]> {
  const root = base.replace(/\/$/, '');
  const results = await Promise.all(
    CHECKS.map(async ({ name, run }) => {
      const problem = await run(root, get).catch((e: Error) => e.message);
      return problem ? `${name}: ${problem}` : null;
    }),
  );
  return results.filter((r): r is string => r !== null);
}

if (import.meta.main) {
  const base = process.argv[2];
  if (!base) {
    process.stderr.write('usage: node scripts/checks/smoke.ts <url>\n');
    process.exit(2);
  }
  const found = await smoke(base);
  process.stdout.write(found.length ? `smoke: ${found.join('\n')}\n` : `smoke: ${base} ok\n`);
  process.exit(found.length ? 1 : 0);
}
