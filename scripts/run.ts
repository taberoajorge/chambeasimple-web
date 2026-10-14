// `pnpm dev` and `pnpm preview`: Astro on this checkout's own port.
import { spawn } from 'node:child_process';
import { port } from './port.ts';

const [mode] = process.argv.slice(2);
if (mode !== 'dev' && mode !== 'preview') throw new Error('Use: node scripts/run.ts dev|preview');
const p = port();
process.stdout.write(`http://localhost:${p}\n`);
spawn('astro', [mode, '--port', String(p)], { stdio: 'inherit' }).on('exit', (code) =>
  process.exit(code ?? 1),
);
