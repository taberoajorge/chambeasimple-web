// `pnpm dev`: Astro's dev server. `pnpm preview`: the build behind the Worker (`wrangler dev`), with
// the CSP and headers Cloudflare sends, so what pnpm perf measures here is what visitors get.
// Both on this checkout's own port.
import { spawn } from 'node:child_process';
import { port } from './port.ts';

const [mode] = process.argv.slice(2);
if (mode !== 'dev' && mode !== 'preview') throw new Error('Use: node scripts/run.ts dev|preview');
const p = String(port());
process.stdout.write(`http://localhost:${p}\n`);
const [command, ...args] =
  mode === 'dev' ? ['astro', 'dev', '--port', p] : ['wrangler', 'dev', '--port', p];
spawn(command, args, { stdio: 'inherit' }).on('exit', (code) => process.exit(code ?? 1));
