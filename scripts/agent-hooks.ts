// One hook script for every agent client. Each client's config calls
// `node scripts/agent-hooks.ts hook <client> [event]` with its own JSON on stdin; this turns it into
// one event, decides, and answers in that client's format. `certify` runs at the end of `pnpm check`.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { attributed } from './commit-msg.ts';
import { port } from './port.ts';

export const repository = resolve(fileURLToPath(new URL('..', import.meta.url)));
const CLIENTS = ['claude', 'codex', 'antigravity', 'opencode', 'gemini'] as const;
type Client = (typeof CLIENTS)[number];
type Row = Record<string, unknown>;

export type HookEvent = {
  client: Client;
  kind: 'start' | 'pre' | 'stop' | 'other';
  tool: string;
  input: Row;
  again: boolean; // the client is already re-running after a stop hook asked it to continue
};
export type Decision = { action: 'allow' | 'deny' | 'continue'; reason: string };

const KINDS: Record<string, HookEvent['kind']> = {
  SessionStart: 'start',
  PreInvocation: 'start',
  'session.created': 'start',
  PreToolUse: 'pre',
  BeforeTool: 'pre',
  'tool.execute.before': 'pre',
  Stop: 'stop',
  AfterAgent: 'stop',
  'session.idle': 'stop',
};

const row = (value: unknown): Row =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as Row) : {};

export function normalize(client: Client, raw: unknown, name?: string): HookEvent {
  const data = row(raw);
  const call = row(data.toolCall); // Antigravity
  const event = name ?? String(data.hook_event_name ?? '');
  return {
    client,
    kind: KINDS[event] ?? 'other',
    tool: String(data.tool_name ?? data.tool ?? call.name ?? ''),
    input: row(data.tool_input ?? call.args ?? data.arguments ?? data.input),
    again: data.stop_hook_active === true || Number(data.loop_count ?? 0) > 0,
  };
}

/* ── What the event touches ───────────────────────────────────────── */

const EDIT_TOOLS =
  /^(Edit|Write|MultiEdit|NotebookEdit|apply_patch|edit|write|patch|write_file|replace|write_to_file|replace_file_content|multi_replace_file_content)$/;

function command(input: Row): string {
  const value = input.command ?? input.CommandLine ?? input.cmd ?? '';
  return Array.isArray(value) ? value.join(' ') : String(value);
}

function editedPaths({ tool, input }: HookEvent): string[] {
  const direct = EDIT_TOOLS.test(tool)
    ? [input.file_path, input.filePath, input.path, input.TargetFile, input.notebook_path]
    : [];
  // apply_patch (Codex) names its files inside the patch text
  const patched = [input.patch, input.patchText, input.input, command(input)].flatMap((text) =>
    typeof text === 'string'
      ? [...text.matchAll(/^\*\*\* (?:(?:Add|Update|Delete) File|Move to): (.+)$/gm)].map(
          (m) => m[1],
        )
      : [],
  );
  return [...direct, ...patched].filter((p): p is string => typeof p === 'string' && p.length > 0);
}

const written = (input: Row) =>
  [
    input.content,
    input.new_string,
    input.newString,
    input.CodeContent,
    input.ReplacementContent,
    input.patch,
    input.input,
    ...(Array.isArray(input.edits) ? input.edits.map((e) => row(e).new_string) : []),
  ]
    .filter((v): v is string => typeof v === 'string')
    .join('\n');

// Simple commands of a shell line, without leading VAR=value. Guards match programs in command
// position, so a search or a message that only mentions `git push -f` is not blocked.
// ponytail: not a shell parser; quoted separators split too. The Git hooks are the real boundary.
const segments = (text: string) =>
  text
    .split(/\$\(|[;&|\n()`]/)
    .map((part) => part.trim().replace(/^(?:[A-Za-z_][A-Za-z0-9_]*=\S*\s+)+/, ''));

/* ── Guards ───────────────────────────────────────────────────────── */

const SECRETS = [
  /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/,
  /\bAKIA[0-9A-Z]{16}\b/,
  /\bgh[pousr]_[A-Za-z0-9]{36,}\b/,
  /\bgithub_pat_[A-Za-z0-9_]{60,}\b/,
  /\bsk-(?:ant-|proj-)?[A-Za-z0-9_-]{32,}\b/,
  /\bxox[abprs]-[A-Za-z0-9-]{10,}\b/,
];

function onMain(root: string) {
  try {
    return (
      execFileSync('git', ['branch', '--show-current'], { cwd: root }).toString().trim() === 'main'
    );
  } catch {
    return false;
  }
}

const MAIN_REF = /^\+?(?:[^:]*:)?(?:refs\/heads\/)?main$/;
// A forced push that lands on main: named explicitly, or implied by pushing the current branch.
function forcesMain(root: string, part: string) {
  const args = part.split(/\s+/).slice(part.split(/\s+/).indexOf('push') + 1);
  const forced = args.some(
    (a) =>
      /^--force(-with-lease)?(=.*)?$/.test(a) || /^-[a-z]*f[a-z]*$/.test(a) || a.startsWith('+'),
  );
  if (!forced) return false;
  const positional = args.filter((a) => !a.startsWith('-'));
  if (positional.length >= 2) return positional.slice(1).some((ref) => MAIN_REF.test(ref));
  return onMain(root);
}

// What a single git command must never do, or null. `text` is the whole tool input, since a
// multi-line commit message spans several shell segments.
function gitProblem(root: string, part: string, text: string) {
  const commit = /^git\s+(.*\s)?commit\b/.test(part);
  if (/\s--no-verify\b/.test(part) || (commit && /\s-[a-zA-Z]*n[a-zA-Z]*(\s|$)/.test(part)))
    return 'Keep the Git hooks on: no --no-verify (or -n).';
  if (/\s-c\s*core\.hooksPath=/.test(part))
    return 'Keep the Git hooks on: no core.hooksPath override.';
  if (/^git\s+(.*\s)?push\b/.test(part) && forcesMain(root, part))
    return 'Never force-push main. Rebase onto origin/main and push without force.';
  if (commit && attributed(text))
    return 'Commits name people only: remove the AI attribution from the message.';
  return null;
}

// Paths Git ignores (env files, local settings) are where secrets belong.
function ignored(root: string, paths: string[]) {
  if (!paths.length) return false;
  try {
    execFileSync('git', ['check-ignore', '-q', '--', ...paths], { cwd: root });
    return true;
  } catch {
    return false;
  }
}

// Each rule returns why the tool call must not run, or null.
const RULES: ((root: string, event: HookEvent, shell: string[]) => string | null)[] = [
  (root, event) =>
    SECRETS.some(
      (pattern) =>
        (pattern.test(written(event.input)) && !ignored(root, editedPaths(event))) ||
        pattern.test(command(event.input)),
    )
      ? 'That looks like a credential. Keep secrets in ignored env files, never in the repo.'
      : null,
  (root, { input }, shell) =>
    shell
      .filter((part) => /^git\b/.test(part))
      .map((part) => gitProblem(root, part, command(input)))
      .find(Boolean) ?? null,
];

function guard(root: string, event: HookEvent): Decision {
  const shell = segments(command(event.input));
  for (const rule of RULES) {
    const reason = rule(root, event, shell);
    if (reason) return { action: 'deny', reason };
  }
  return { action: 'allow', reason: '' };
}

/* ── Session start and the certificates ───────────────────────────── */

function gitDir(root: string) {
  const dir = execFileSync('git', ['rev-parse', '--git-dir'], { cwd: root }).toString().trim();
  return resolve(root, dir);
}
// Two certificates: `check` (the whole tree passed pnpm check) and `perf` (what the visitor
// gets passed pnpm perf). Both live in the checkout's own git dir, so worktrees never share them.
type Kind = 'check' | 'perf';
const certificatePath = (root: string, kind: Kind) =>
  join(gitDir(root), 'agent-hooks', `${kind}.json`);

// The files that change what a visitor gets; a change outside them never needs pnpm perf.
const VISIBLE = ['src', 'public', 'astro.config.mjs', 'worker', 'wrangler.jsonc'];

// The state of the given paths (or the whole tree): HEAD, the uncommitted diff, untracked files.
function fingerprint(root: string, paths: string[] = []) {
  const git = (...args: string[]) => execFileSync('git', args, { cwd: root, maxBuffer: 1 << 26 });
  const scope = paths.length ? ['--', ...paths] : [];
  const hash = createHash('sha256')
    // committed state of just those paths (or the whole commit)
    .update(paths.length ? git('ls-tree', '-r', 'HEAD', ...scope) : git('rev-parse', 'HEAD'))
    .update(git('diff', 'HEAD', '--binary', ...scope));
  const untracked = git('ls-files', '--others', '--exclude-standard', '-z', ...scope)
    .toString()
    .split('\0');
  for (const file of untracked.filter(Boolean).sort())
    hash.update(`${file}\0`).update(readFileSync(join(root, file)));
  return hash.digest('hex');
}

const scopeOf = (kind: Kind) => (kind === 'perf' ? VISIBLE : []);

export function certify(root: string, kind: Kind = 'check', summary = '') {
  const path = certificatePath(root, kind);
  mkdirSync(join(path, '..'), { recursive: true });
  writeFileSync(
    path,
    JSON.stringify({
      fingerprint: fingerprint(root, scopeOf(kind)),
      at: new Date().toISOString(),
      summary,
    }),
  );
}

function certificate(root: string, kind: Kind) {
  const path = certificatePath(root, kind);
  return existsSync(path)
    ? (JSON.parse(readFileSync(path, 'utf8')) as {
        fingerprint: string;
        at: string;
        summary: string;
      })
    : null;
}

const certified = (root: string, kind: Kind) =>
  certificate(root, kind)?.fingerprint === fingerprint(root, scopeOf(kind));

const changed = (root: string, paths: string[] = []) =>
  execFileSync('git', ['status', '--porcelain', '--', ...paths], { cwd: root })
    .toString()
    .trim().length > 0;

function context(root: string) {
  const branch = execFileSync('git', ['branch', '--show-current'], { cwd: root }).toString().trim();
  let where: string;
  try {
    where = `port ${port(root)}`;
  } catch (error) {
    where = (error as Error).message;
  }
  const dir = join(root, 'openspec', 'changes');
  const changes = existsSync(dir)
    ? readdirSync(dir, { withFileTypes: true })
        .filter((d) => d.isDirectory() && d.name !== 'archive')
        .map((d) => d.name)
    : [];
  const perf = certificate(root, 'perf');
  const last = perf
    ? `last pnpm perf ${perf.at.slice(0, 10)}: ${perf.summary}`
    : 'pnpm perf not run yet';
  return `chambeasimple-web · branch ${branch || '(detached)'} · ${where} · active OpenSpec changes: ${changes.join(', ') || 'none'} · ${last}. Read AGENTS.md; run pnpm check (and pnpm perf after visible changes) before you say the work is done.`;
}

// What still has to run before the work can be called done, if anything.
function pending(root: string) {
  if (changed(root, VISIBLE) && !certified(root, 'perf'))
    return 'What the visitor gets changed since the last green `pnpm perf`. Build, run `pnpm preview` and `pnpm perf`, and verify with the Chrome DevTools MCP (verify-ui skill); fix anything below 100.';
  if (changed(root) && !certified(root, 'check'))
    return 'The working tree changed since the last green `pnpm check`. Run it and fix what fails, or say plainly what is left unchecked.';
  return '';
}

export function handle(root: string, event: HookEvent): Decision {
  if (event.kind === 'start') return { action: 'allow', reason: context(root) };
  if (event.kind === 'pre') return guard(root, event);
  const reason = event.kind === 'stop' && !event.again ? pending(root) : '';
  return reason ? { action: 'continue', reason } : { action: 'allow', reason: '' };
}

/* ── Each client's answer format ──────────────────────────────────── */

type Encoder = (kind: HookEvent['kind'], result: Decision) => Row;

// "ask" keeps Antigravity's own permission prompt; "allow" would approve the tool outright.
const antigravity: Encoder = (kind, { action, reason }) =>
  ({
    pre: { decision: action === 'deny' ? 'deny' : 'ask', reason },
    stop: { decision: action === 'continue' ? 'continue' : 'stop', reason },
    start: { injectSteps: reason ? [{ ephemeralMessage: reason }] : [] },
    other: {},
  })[kind];

const started = (reason: string) => ({
  hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: reason },
});

// BeforeTool: deny blocks the tool. AfterAgent: deny sends the reason back as a retry prompt.
const gemini: Encoder = (kind, { action, reason }) =>
  kind === 'start' ? started(reason) : action === 'allow' ? {} : { decision: 'deny', reason };

// Claude Code and Codex share a format.
const claude: Encoder = (kind, { action, reason }) => {
  if (kind === 'start') return started(reason);
  if (kind === 'pre' && action === 'deny')
    return {
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason: reason,
      },
    };
  return kind === 'stop' && action === 'continue' ? { decision: 'block', reason } : {};
};

const ENCODERS: Record<Client, Encoder> = {
  claude,
  codex: claude,
  gemini,
  antigravity,
  opencode: (_kind, result) => ({ ...result }),
};

const encode = (event: HookEvent, result: Decision): Row =>
  ENCODERS[event.client](event.kind, result);

export function runHook(client: Client, raw: unknown, name?: string, root = repository): Row {
  // Antigravity fires PreInvocation before every model call; the context belongs to the first.
  if (client === 'antigravity' && name === 'PreInvocation' && Number(row(raw).invocationNum) > 0)
    return { injectSteps: [] };
  const event = normalize(client, raw, name);
  return encode(event, handle(root, event));
}

if (import.meta.main) {
  const [command, client, name] = process.argv.slice(2);
  try {
    if (command === 'certify') certify(repository, (client as Kind) || 'check', name);
    else if (command === 'hook' && CLIENTS.includes(client as Client)) {
      const raw = JSON.parse(readFileSync(0, 'utf8') || '{}');
      process.stdout.write(`${JSON.stringify(runHook(client as Client, raw, name))}\n`);
    } else
      throw new Error(
        `Use: agent-hooks hook <${CLIENTS.join('|')}> [event] | certify [check|perf] [summary]`,
      );
  } catch (error) {
    // Hook payloads can carry private content: name the failure, never echo the input.
    process.stderr.write(`agent-hooks: ${(error as Error).message.split('\n')[0]}\n`);
    process.exitCode = 1;
  }
}
