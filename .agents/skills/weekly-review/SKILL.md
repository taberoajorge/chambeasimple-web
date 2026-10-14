---
name: weekly-review
description: Weekly look at how chambasimple.com is doing — traffic and where it comes from, AI agents and bots, search queries, bookings, Lighthouse and production errors — ending in three concrete suggestions. Read-only.
---

# Weekly review

Read only. Never change DNS, Workers, campaigns or content from this skill; propose, and let the
owners decide. Servers and their limits: `docs/mcp.md`.

1. **Traffic.** With `cloudflare-graphql`: requests and visits for the last 7 days against the 7
   before, by country and status code. From Analytics Engine (`chambeasimple_visits`): page views
   by page, referrer host, `utm_source`/`utm_campaign`, and the split person / bot / agent. Note
   which AI agents read the site and which pages they ask for in Markdown.
2. **Search.** If Search Console is connected: top queries and pages, impressions, clicks, CTR and
   position, and queries with many impressions but few clicks (a title or description to fix).
3. **Conversions.** Bookings from the agenda, by source, when it exists. Contact clicks are not
   measured (no JavaScript); say so instead of guessing.
4. **Health.** The last `monitor` workflow runs (`gh run list --workflow monitor`), open issues,
   and Worker errors with `cloudflare-observability`.
5. **Ads**, only if a campaign runs: spend, clicks, cost per booking, from the read-only MCPs.

Write the result in Spanish, short: what changed, what it likely means, and three suggestions with
the file or setting each one touches. Numbers always with their period and source; never invent
a trend from fewer than 50 visits.
