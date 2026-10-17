// `pnpm dev`: Astro's dev server, plus the booking agenda (`agenda/`) on the fixed port 8788, because
// while developing the site's buttons point there (`content/site.ts`). `pnpm preview`: the build
// behind the Worker (`wrangler dev`), with the CSP and headers Cloudflare sends, so what pnpm perf
// measures here is what visitors get. All on this checkout's own port (8788 for the agenda).
import { spawn } from 'node:child_process';
import { port } from './port.ts';

const AGENDA_PORT = '8788';

const [mode] = process.argv.slice(2);
if (mode !== 'dev' && mode !== 'preview') throw new Error('Use: node scripts/run.ts dev|preview');
const p = String(port());
process.stdout.write(`http://localhost:${p}\n`);

const runs: [string, string[]][] =
  mode === 'dev'
    ? [
        ['astro', ['dev', '--port', p]],
        // SITE: the agenda's header, favicon and privacy link return to this checkout's site.
        [
          'wrangler',
          [
            'dev',
            '--config',
            'agenda/wrangler.jsonc',
            '--port',
            AGENDA_PORT,
            '--var',
            `SITE:http://localhost:${p}`,
          ],
        ],
      ]
    : [['wrangler', ['dev', '--port', p]]];

// Astro's dev server detaches itself in agent sessions, so a child exiting does not mean the
// checkout stopped serving. Leave the others alone and exit once every child has ended.
let alive = runs.length;
for (const [command, args] of runs) {
  const child = spawn(command, args, { stdio: 'inherit' });
  child.on('error', (error) => {
    process.stderr.write(`Could not start ${command}: ${error.message}\n`);
    if (--alive === 0) process.exit(1);
  });
  child.on('exit', (code) => {
    if (--alive === 0) process.exit(code ?? 0);
  });
}
