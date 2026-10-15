import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { certify, repository, runHook } from './agent-hooks.ts';

const denied = (out: Record<string, unknown>) => JSON.stringify(out).includes('"deny"');

// One payload per client for the same intent: write a credential into a tracked file.
const SECRET = `TOKEN=ghp_${'a'.repeat(36)}`;
const NOTES = `${repository}/notes.md`;
const secretWrites = [
  [
    'claude',
    {
      hook_event_name: 'PreToolUse',
      tool_name: 'Write',
      tool_input: { file_path: NOTES, content: SECRET },
    },
  ],
  [
    'codex',
    {
      hook_event_name: 'PreToolUse',
      tool_name: 'apply_patch',
      tool_input: { command: `*** Begin Patch\n*** Add File: notes.md\n+${SECRET}\n*** End Patch` },
    },
  ],
  [
    'gemini',
    {
      hook_event_name: 'BeforeTool',
      tool_name: 'write_file',
      tool_input: { file_path: NOTES, content: SECRET },
    },
  ],
  [
    'antigravity',
    { toolCall: { name: 'write_to_file', args: { TargetFile: NOTES, CodeContent: SECRET } } },
    'PreToolUse',
  ],
  [
    'opencode',
    { tool: 'write', tool_input: { filePath: NOTES, content: SECRET } },
    'tool.execute.before',
  ],
] as const;

for (const [client, payload, name] of secretWrites)
  test(`${client}: writing a credential is blocked`, () => {
    assert.ok(denied(runHook(client, payload, name)));
  });

test('editing the site itself is allowed', () => {
  const out = runHook('claude', {
    hook_event_name: 'PreToolUse',
    tool_name: 'Edit',
    tool_input: { file_path: `${repository}/src/sections/Hero.astro`, content: '<h1>Hola</h1>' },
  });
  assert.deepEqual(out, {});
});

const bash = (command: string) =>
  runHook('claude', { hook_event_name: 'PreToolUse', tool_name: 'Bash', tool_input: { command } });

test('force-pushing main is blocked; a normal push and a branch force push are not', () => {
  assert.ok(denied(bash('git push --force origin main')));
  assert.ok(denied(bash('git fetch && git push -f origin main')));
  assert.ok(denied(bash('git push -uf origin main')));
  assert.ok(denied(bash('git push origin +main')));
  assert.ok(denied(bash('git push -f origin HEAD:refs/heads/main')));
  assert.ok(!denied(bash('git push origin main')));
  assert.ok(!denied(bash('git push --force-with-lease origin fix/camera')));
  assert.ok(!denied(bash('git push -f origin feat/main')));
  assert.ok(!denied(bash('echo "never run git push --force origin main"')));
});

test('commits with AI attribution and skipped hooks are blocked', () => {
  assert.ok(
    denied(bash('git commit -m "feat: x\n\nCo-Authored-By: Claude <noreply@anthropic.com>"')),
  );
  assert.ok(denied(bash('git commit --no-verify -m "feat: x"')));
  assert.ok(denied(bash('git commit -n -m "feat: x"')));
  assert.ok(denied(bash('git commit -anm "feat: x"')));
  assert.ok(denied(bash('git -c core.hooksPath=/dev/null commit -m "feat: x"')));
  assert.ok(!denied(bash('git commit -m "feat(site): serve llms.txt"')));
  assert.ok(!denied(bash('git commit --amend -m "feat(site): serve llms.txt"')));
});

const token = `ghp_${'a'.repeat(36)}`;
const write = (file_path: string) =>
  runHook('gemini', {
    hook_event_name: 'BeforeTool',
    tool_name: 'write_file',
    tool_input: { file_path, content: `TOKEN=${token}` },
  });

test('writing a credential into a tracked file is blocked; into an ignored env file it is not', () => {
  assert.ok(denied(write('notes.md')));
  assert.deepEqual(write('.env.local'), {});
});

test('session start adds branch, port and active changes for each client', () => {
  const claude = JSON.stringify(runHook('claude', { hook_event_name: 'SessionStart' }));
  assert.match(claude, /additionalContext.*branch .* active OpenSpec changes/);
  assert.match(
    JSON.stringify(runHook('gemini', { hook_event_name: 'SessionStart' })),
    /additionalContext/,
  );
  const first = runHook('antigravity', { invocationNum: 0 }, 'PreInvocation') as {
    injectSteps: unknown[];
  };
  assert.equal(first.injectSteps.length, 1);
  assert.deepEqual(runHook('antigravity', { invocationNum: 3 }, 'PreInvocation'), {
    injectSteps: [],
  });
});

function repo() {
  const root = mkdtempSync(join(tmpdir(), 'agent-hooks-'));
  const git = (...args: string[]) => {
    // Clean GIT_* env vars to avoid worktree side effects when running in pre-push hook
    const env = Object.fromEntries(
      Object.entries(process.env).filter(([k]) => !k.startsWith('GIT_')),
    );
    return execFileSync('git', args, { cwd: root, env });
  };
  git('init', '-q');
  git('-c', 'user.name=t', '-c', 'user.email=t@t', 'commit', '-q', '--allow-empty', '-m', 'init');
  const stop = (client: 'claude' | 'codex' | 'gemini', extra = {}) =>
    runHook(
      client,
      { hook_event_name: client === 'gemini' ? 'AfterAgent' : 'Stop', ...extra },
      undefined,
      root,
    ) as {
      decision?: string;
      reason?: string;
    };
  return { root, stop };
}

test('stop asks for pnpm check until the current tree is certified', () => {
  const { root, stop } = repo();
  assert.deepEqual(stop('claude'), {}, 'a clean tree needs nothing');
  writeFileSync(join(root, 'notes.md'), 'hola\n');
  assert.equal(stop('claude').decision, 'block');
  assert.equal(stop('codex').decision, 'block');
  assert.equal(stop('gemini').decision, 'deny');
  assert.equal(
    (runHook('antigravity', {}, 'Stop', root) as { decision: string }).decision,
    'continue',
  );
  assert.deepEqual(stop('claude', { stop_hook_active: true }), {}, 'never loops');
  certify(root);
  assert.deepEqual(stop('claude'), {}, 'certified tree');
  writeFileSync(join(root, 'notes.md'), 'adiós\n');
  assert.equal(stop('claude').decision, 'block', 'changed after check');
});

test('a visible change also needs a green pnpm perf', () => {
  const { root, stop } = repo();
  execFileSync('mkdir', ['-p', join(root, 'src')]);
  writeFileSync(join(root, 'src/Hero.astro'), '<h1>Hola</h1>\n');
  certify(root); // pnpm check passed, perf not run
  assert.match(stop('claude').reason ?? '', /pnpm perf/);
  certify(root, 'perf', '/ mobile 100/100/100/100');
  assert.deepEqual(stop('claude'), {}, 'both certificates match');
  writeFileSync(join(root, 'src/Hero.astro'), '<h1>Hola de nuevo</h1>\n');
  assert.match(
    stop('claude').reason ?? '',
    /pnpm perf/,
    'perf is stale after another visible edit',
  );
});

test('session start shows the last perf result', () => {
  const { root } = repo();
  certify(root, 'perf', '/ mobile 100/100/100/100');
  const out = JSON.stringify(
    runHook('claude', { hook_event_name: 'SessionStart' }, undefined, root),
  );
  assert.match(out, /last pnpm perf .*100\/100\/100\/100/);
});

// Every command the client configs declare, run for real through the shell with a sample payload.
test('each client config runs the script and gets a usable answer', () => {
  const read = (path: string) => JSON.parse(readFileSync(join(repository, path), 'utf8'));
  const commands = (hooks: Record<string, unknown[]>) =>
    Object.entries(hooks).flatMap(([event, entries]) =>
      (entries as { command?: string; hooks?: { command: string }[] }[]).flatMap((e) =>
        e.hooks ? e.hooks.map((h) => [event, h.command]) : [[event, e.command as string]],
      ),
    );
  const configs = [
    ...commands(read('.claude/settings.json').hooks),
    ...commands(read('.codex/hooks.json').hooks),
    ...commands(read('.gemini/settings.json').hooks),
    ...commands(read('.agents/hooks.json')['chambeasimple-web']),
  ];
  assert.ok(configs.length >= 12);
  for (const [event, command] of configs) {
    const pre = /PreToolUse|BeforeTool/.test(event);
    const payload = pre
      ? {
          hook_event_name: event,
          tool_name: 'Write',
          tool_input: { file_path: 'notes.md', content: SECRET },
          toolCall: {
            name: 'write_to_file',
            args: { TargetFile: 'notes.md', CodeContent: SECRET },
          },
        }
      : { hook_event_name: event, stop_hook_active: true, invocationNum: 0 };
    const out = execFileSync('sh', ['-c', command], {
      cwd: repository,
      input: JSON.stringify(payload),
      env: { ...process.env, CLAUDE_PROJECT_DIR: repository },
    }).toString();
    const answer = JSON.parse(out);
    if (pre) assert.ok(denied(answer), `${command} should deny`);
  }
});
