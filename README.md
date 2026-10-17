# Chambea Simple

The website of [Chambea Simple](https://chambasimple.com): custom software for companies, by Sandra
Arroyo and Alex Taberoa. *Hacemos software para la buena chamba.*

Static Astro site in Spanish (`/`) and English (`/en`), with a Markdown twin of every page and
`/llms.txt` for agents.

```sh
sh scripts/bootstrap.sh   # Node 24, pnpm via Corepack, Git hooks
corepack pnpm dev         # site on this checkout's port, the booking agenda on 8788
corepack pnpm check       # lint, types, tests, boundaries, dead code, specs
corepack pnpm build && corepack pnpm preview   # then, in another shell: corepack pnpm perf
```

How the repo works, for people and agents: [AGENTS.md](AGENTS.md).
