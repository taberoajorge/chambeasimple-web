# chambeasimple-web

The website of Chambea Simple, the custom-software studio of Sandra Arroyo and Alex Taberoa:
`/` in Spanish, `/en` in English, and one page per case study. Astro 7 (static), Tailwind 4, Biome,
pnpm 10, Node 24. Served by a Cloudflare Worker with static assets (`wrangler.jsonc`, `worker/`),
free plan, at https://chambasimple.com.

## Setup and commands

- Prepare a checkout or worktree: `sh scripts/bootstrap.sh` (Node from `.node-version`, Corepack).
  Orca runs it on its own (`orca.yaml`); outside Orca see `docs/worktrees.md`.
- `corepack pnpm dev` / `pnpm preview`: this checkout's own port (`node scripts/port.ts` prints it).
  `dev` is Astro and also shows cases that are not approved yet, and serves the booking agenda
  (`agenda/`) on port 8788, because the site's buttons point there while developing; `preview`
  serves the build behind the Worker (`wrangler dev`), with the CSP and headers Cloudflare sends.
- `pnpm check`: Biome, types, tests, import boundaries, dead code (Knip) and OpenSpec. Run it before
  saying work is done; it writes the check certificate the agent hooks look for.
- `pnpm build`: the site, then `scripts/checks/seo.ts` on every page (SEO, and no script the
  Worker's CSP would block).
- `pnpm build`, then `pnpm preview` and `pnpm perf`: Lighthouse (four categories, mobile and
  desktop, every page in the sitemap) and load budgets. It refuses a server without the Worker's
  CSP. A green run writes the perf certificate. `--url <base>` and `--path /en` narrow it.
- `pnpm parity save|compare`: snapshot of head, text and JSON-LD of `/` and `/en`.
- `node scripts/checks/smoke.ts <url>`: checks a deployed site in seconds.
- Pipeline (`.github/workflows/`): every PR runs `check`, then gets its own Cloudflare preview URL,
  smoke-tested and audited by Lighthouse one job per page in parallel; the `lighthouse` job gathers
  them, comments the results on the PR and fails unless every page passed. `main` requires `check`
  and `lighthouse`. On `main`, the deploy waits only for `check`, smoke-tests production and rolls
  back on failure, then Lighthouse runs on production in its own job; `monitor.yml` smoke-tests
  production daily and runs Lighthouse on Mondays, opening an issue when something breaks.
  Dependabot PRs need the Cloudflare secrets as Dependabot secrets to get a preview.
- Pushes run `pnpm check` and `pnpm build` under the pinned Node: `fnm use` first.

## Map

| Folder | What lives there |
|---|---|
| `src/pages` | Routes only: `index`, `en/`, `casos/[slug]`, `en/case-studies/[slug]`, the Markdown twins (`[...path].md.ts`) and `llms.txt`. |
| `src/layouts` | `Base.astro` (head, hreflang, header, footer, phone contact bar) and `schema.ts` (JSON-LD). |
| `src/sections` | The building blocks `Section`, `CardGrid` and `Card`, and the pages built from them: `Home.astro` (both languages) and `CaseStudy.astro`. |
| `src/content` | All text and facts: `es.ts` (its shape is the `Content` type), `en.ts` (typed against it), `cases.ts`, `site.ts` (email, company data, team, paths). |
| `src/styles` | `global.css` (theme tokens, buttons) and the contrast test. |
| `worker/` | The Worker in front of the pages: Markdown for agents, security headers, `noindex` on previews, cookieless page views. |
| `scripts/` | Repo tooling: bootstrap, ports, checks (SEO at build, smoke, perf, parity), commit and delivery rules, agent hooks. |
| `openspec/` | Specs (`specs/`) and changes (`changes/`). |

## Architecture rules (checked by `pnpm check`)

- `content` imports only `content`; `styles` only `styles`.
- `sections` import only `sections`, `content` and `styles`; `layouts` only `layouts`, `content` and `styles`.
- `pages` compose everything.
- No `utils`, `helpers` or `misc` files: name a module for what it does.
- Text never lives in components: add it to `es.ts` and `en.ts`.

## Writing content

- Only real facts from the owners. A number needs its baseline, period and source; without one,
  describe what changed. Never publish a client's prices or contract terms.
- A case shows on the built site only with `approval` filled in `cases.ts`.
- Empty fields in `site.ts` switch things off: no WhatsApp without a number, no RUC or invoice
  mention without the company, no price range until the owners set one, no LinkedIn links until
  `showLinkedIn` is true.

## Writing code here

- Keep it simple: no client-side framework, no state, no barrels or one-implementation abstractions.
- Build sections from `Section`, `CardGrid` and `Card`; never hand-roll a card. A Card always has
  the same four rows (eyebrow, title, body, footer) on a CSS subgrid, so cards in a row line up
  whatever their text. A new kind of card is a new prop or slot on `Card`, not new markup.
- No JavaScript by default. Anything interactive is native HTML (`<details>`, links) or fits the
  10 KB budget with a reason.
- No dead code: Knip fails on unused exports and files.
- Comments say why, not what. Mark deliberate shortcuts with `ponytail:` and name their limit.
- Accessibility and speed are requirements: Lighthouse 100 in all four categories, mobile and
  desktop, light and dark. Check visual changes with the `verify-ui` skill (Chrome DevTools MCP).
- Every text color pair must pass `src/styles/contrast.test.ts`; mint is a fill, never text on
  the light background.

## Changes and delivery

- Spec first for features and anything touching several files: an OpenSpec change
  (`openspec/changes/<name>`), validated with `openspec validate --strict`, then implemented and
  archived. Typos and small fixes can go straight in.
- Commits follow Conventional Commits (`type(scope): subject`); the `commit-msg` hook enforces it.
- One PR to `main`: `corepack pnpm delivery:pr-create "type(scope): subject" body.md`. Stacked PRs:
  `git-spice` (`git-spice bc`, `git-spice ss --fill`). GitHub: `gh`.
- Mark a task done only after its check has run and passed. Report failures as they are.
- DNS, the domain and anything public happen only with the owners' explicit go-ahead. The email
  records for `hola@chambasimple.com` (SimpleLogin) must exist in Cloudflare DNS before the
  nameservers move.

## Never

- No AI attribution anywhere: no `Co-Authored-By` for assistants, no "Generated with" footers.
- No secrets in the repo; `.env*` and client `*.local.*` files stay local.
- No force pushes to `main`, no `--no-verify`.

## Agent clients

Instructions live here; `CLAUDE.md` imports this file and `.gemini/settings.json` points Gemini at
it. Skills live in `.agents/skills/` (Claude Code reads adapters in `.claude/skills/`). One hook
script, `scripts/agent-hooks.ts`, serves every client: at session start it adds the branch, port,
active OpenSpec changes and the last `pnpm perf` result; it blocks secrets, force pushes to `main`
and attributed commits; at the end it asks for `pnpm perf` if visible files changed since the last
green run, or for `pnpm check` if anything else did. Every client also gets the Chrome DevTools MCP
(`chrome-devtools-mcp`, pinned, isolated profile, no CrUX lookups): `.mcp.json`, `.cursor/`,
`.vscode/`, `.codex/config.toml`, `.gemini/settings.json`, `opencode.json` and
`.agents/mcp_config.json`. Review `.codex/` and `.claude/settings.json` before trusting the hooks.
