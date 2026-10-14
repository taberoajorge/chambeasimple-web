---
name: add-client
description: Add a client (and optionally its case study) to the Chambea Simple site — the one registry in src/content/clients.ts, the approval it needs, and the checks that prove it shows up everywhere.
---

# Add a client

A client is one entry in `src/content/clients.ts`. Nothing else changes for it to appear on `/`,
`/en`, `index.md`, `en.md` and `llms.txt`.

1. **Approval first.** Ask the owners who at the client agreed to be named, and when. Without that,
   leave `approval: null`: the client shows in `pnpm dev` only, never in the build.
2. **The entry.** `id` (kebab-case, stable: cases point at it), the public `name`, the `https` site,
   `country` (`PE` or `MX`; add a code to `Country` and its name to `clients.country` in `es.ts`
   and `en.ts` when a client from a new country arrives) and `since` (`YYYY-MM`, when work started).
3. **A case, if there is one.** Add it to `src/content/cases.ts` with `client: '<id>'`, both
   languages, and only facts the owners or the client's repository can back. Never publish prices,
   contract terms, production URLs, other clients' names or personal data. A number needs its
   baseline and source.
4. **Check.** `pnpm check` (the tests fail if a case points at a missing client or a client lacks
   a valid date or site), then `pnpm build`, `pnpm preview` and `pnpm perf`, and look at the new
   strip and case with the `verify-ui` skill.
