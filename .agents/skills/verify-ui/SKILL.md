---
name: verify-ui
description: Check a visual or content change on the Chambea Simple site before calling it done — Chrome DevTools MCP audits and traces in both themes and widths, no JavaScript, keyboard, Markdown twins and the pnpm perf gate.
---

# Verify the UI

Work against the production build: `pnpm build && pnpm preview` (the URL is printed; the main
checkout uses its own port, `node scripts/port.ts`). `preview` runs the Worker, so the CSP and
headers are the real ones. Dev mode shows unpublished cases, has no CSP and is slower.

## With the Chrome DevTools MCP (every visual change)

The project configures `chrome-devtools` for each agent client (`.mcp.json` and friends). For `/`,
`/en` and any case page you touched:

1. `navigate_page` to the page, then `emulate` with `viewport: "390x844x3,mobile,touch"` and
   later `"1440x900x1"`, each with `colorScheme: "light"` and then `"dark"`.
2. `take_screenshot` in each of the four combinations and look at it: the promise, the lema and
   the contact button are visible without scrolling; no horizontal scroll; on phones the contact
   bar does not cover text. Also check 320, 768 and 1920 px once per change.
3. `lighthouse_audit` (mobile and desktop): Accessibility, Best Practices and SEO at 100.
4. `performance_start_trace` with reload, then `performance_analyze_insight` for LCP and CLS:
   CLS 0, LCP within budget (2.0 s mobile, 0.8 s desktop, simulated).
5. `list_console_messages`: empty.
6. **Cards line up.** With `evaluate_script`, for each `CardGrid` read the `top` of every child
   of each `li.row-span-4`: cards in the same visual row must report the same four numbers. A
   card that differs was hand-rolled or broke the `Card` structure.

## Without the MCP

7. **No JavaScript.** Every section reads in full; the FAQ opens; the email links work.
8. **Keyboard.** Tab from the top: "skip to content" first, every link reachable, focus visible in
   both themes, and nothing hidden behind the phone's contact bar.
9. **Agents.** `dist/index.md`, `dist/en.md` and `dist/llms.txt` say the same as the pages.
   `pnpm parity compare` checks the head, the visible text and the JSON-LD of `/` and `/en`
   against the saved baseline; if the change is meant to alter them, read the diff, then
   `pnpm parity save`.
10. **The gate.** `pnpm perf`: 100 in all four categories, mobile and desktop, on every page in the
   sitemap, within the HTML, JS, LCP, TBT and CLS budgets. A green run writes the perf
   certificate the stop hook asks for.

Look at every screenshot you take before you describe it. Report what you checked and what you
could not check; never claim a visual result you did not see.
