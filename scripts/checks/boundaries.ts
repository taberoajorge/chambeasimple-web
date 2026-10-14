// Who may import whom inside src/, and no grab-bag files. See AGENTS.md for the map.
// ponytail: regex over import specifiers, not a parser; this codebase only uses static ESM imports.
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, normalize, relative } from 'node:path';

type Source = { path: string; text: string }; // path relative to the repo root, e.g. src/sections/Hero.astro

const SPEC = /(?:import|export)\s[^'"]*?from\s*['"]([^'"]+)['"]|import\s*\(?\s*['"]([^'"]+)['"]/g;
const GRAB_BAG = /^(utils|helpers|misc)(\.[jt]sx?|\.astro)?$/;

const area = (path: string) => path.split('/')[1]; // src/<area>/...
const inside = (to: string | null, ...areas: string[]) => !to || areas.includes(area(to));

// One rule per area: given the resolved target of a relative import, a message if it is not allowed.
const RULES: Record<string, (to: string | null) => string | null> = {
  content: (to) =>
    inside(to, 'content') ? null : 'content is data: it imports nothing else from src/',
  styles: (to) => (inside(to, 'styles') ? null : 'styles import only styles'),
  sections: (to) =>
    inside(to, 'sections', 'content', 'styles')
      ? null
      : 'sections import only sections, content and styles',
  layouts: (to) =>
    inside(to, 'layouts', 'content', 'styles')
      ? null
      : 'layouts import only layouts, content and styles',
};

function importProblems({ path, text }: Source): string[] {
  const rule = RULES[area(path)];
  if (!rule) return []; // pages may import any of the above
  return [...text.matchAll(SPEC)].flatMap((match) => {
    const spec = match[1] ?? match[2];
    const to = spec.startsWith('.') ? normalize(join(dirname(path), spec)) : null;
    const problem = rule(to);
    return problem ? [`${path}: imports '${spec}' (${problem})`] : [];
  });
}

export function violations(sources: Source[]): string[] {
  return sources.flatMap((source) => [
    ...(source.path.split('/').some((part) => GRAB_BAG.test(part))
      ? [`${source.path}: no utils, helpers or misc files; name it for what it does`]
      : []),
    ...importProblems(source),
  ]);
}

function sourcesUnder(root: string): Source[] {
  return readdirSync(root, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && /\.(tsx?|astro|css)$/.test(entry.name))
    .map((entry) => {
      const path = relative(process.cwd(), join(entry.parentPath, entry.name));
      return { path, text: readFileSync(path, 'utf8') };
    });
}

if (import.meta.main) {
  const found = violations(sourcesUnder('src'));
  for (const line of found) process.stderr.write(`${line}\n`);
  if (found.length) process.exitCode = 1;
  else process.stdout.write(`boundaries: ok\n`);
}
