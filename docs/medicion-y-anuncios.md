# Measurement and ads for Chambea Simple on Cloudflare (research as of 2026-10-14)

You can measure traffic and bookings at no tool cost without adding a consent banner, using cookieless analytics plus server-side conversion calls from the booking Worker. The one thing you cannot get that way is retargeting of people who visited but didn't book: that needs a pixel or a Zaraz pageview, and in Peru that means prior opt-in. I didn't run Lighthouse against chambasimple.com, so the Lighthouse impact of each option is inferred from audit weights and code, not measured.

## 1. Cloudflare Zaraz

- **Cost.** Every account gets 1,000,000 events a month free. After that it's $5 per million on Zaraz Paid. Without Paid, Zaraz switches off until the next cycle (developers.cloudflare.com/zaraz/pricing-info, updated 2026-04-16).
- **Tools.** Facebook Pixel, Google Ads, GA4, LinkedIn Insight, TikTok and others are supported (zaraz/reference/supported-tools). I read each tool's source on GitHub (github.com/managed-components) to see whether it runs on the server or in the visitor's browser:

| Tool | Where it runs |
|---|---|
| Facebook Pixel | Server. It is really the Conversions API (`graph.facebook.com/v21.0/{id}/events`) and needs an access token. It sets `fb-pixel`/`fb-click` cookies on your own domain. |
| TikTok | Server (Events API v2) |
| GA4 | Server. With audiences or signals turned on, it also makes browser requests to `stats.g.doubleclick.net` and `google.com`. |
| Google Ads | Browser. Credentialed requests to googleadservices.com, googleads.g.doubleclick.net and google.com/pagead. |
| LinkedIn Insight | Browser. Requests to `px.ads.linkedin.com/collect`. |

- **Script left in the browser.** The loader on cloudflare.com measured 1,986 bytes (about 1.1 KB gzipped) today. It then loads a second script whose size depends on the config: about 4 KB in one report (BlogPros, 2026-05-09) and "under 10 KB" in another (Veldhuizen, 2025-01-12). Veldhuizen measured PageSpeed 100 with GA4 through Zaraz, against 94 with the normal gtag.
- **Consent tool (CMP).** Zaraz has a built-in opt-in modal organised by purpose, stores the choice in a first-party cookie, and supports IAB TCF and Google Consent Mode v2. Any tool not assigned to a purpose skips consent by default, so every tool has to be assigned (zaraz/consent-management).
- **Lighthouse.** Lighthouse 13.5.0 (2026-09-18) scores `third-party-cookies` at weight 5 and `errors-in-console` at weight 1 in Best Practices (default-config.js). The Google Ads and LinkedIn tools make credentialed third-party requests from the browser, so they are likely to fail that audit. Using Zaraz at all also ends "zero JS".
- **Workers static assets.** Automatic injection is documented only for proxied zones. A community thread (2024-11) reports it not injecting on Pages. Add the script tag by hand (`/cdn-cgi/zaraz/i.js`) and check that it loads.

## 2. Server-side conversion APIs, called from the agenda Worker

All three are free to call.

- **Meta Conversions API.** POST to `/{pixel_or_dataset_id}/events` with an access token. Required: `event_name`, `event_time` (no more than 7 days old) and `action_source=website`. Website events also need `event_source_url` and `client_user_agent`. Email and phone must be SHA-256 hashed. `fbc` is sent unhashed and you can build it on the server from `fbclid` as `fb.1.{ms}.{fbclid}` (Context7: Meta Marketing API docs; github.com/facebook/capi-param-builder).
  - It works without a pixel. Meta recommends running both, and server-only events lose `fbp`, so match quality is lower (several 2026 guides).
  - Server-only events give you an audience of people who booked, not of everyone who visited.
- **Google Ads.** Use the **Data Manager API**. It needs no developer token, only OAuth with the Data Manager scope, and has project-based quotas. It handles offline conversions and enhanced conversions for leads (gclid/gbraid/wbraid plus hashed email).
  - Uploading click conversions through the Google Ads API is deprecated. Tokens with no uploads between 2025-12-17 and 2026-06-15 are now blocked (developers.google.com/data-manager/.../upgrade; Google Ads deprecations page; Ads Developer Blog 2026-05).
- **LinkedIn Conversions API.** Generate the token in Campaign Manager: no developer app, and the token doesn't expire. POST to `/rest/conversionEvents` with a conversion rule. Each event needs at least one of: SHA256_EMAIL, `li_fat_id`, IP, first and last name, externalIds, or lead. Events can be up to 90 days old.
  - `li_fat_id` is added to landing URLs when enhanced conversion tracking is on. LinkedIn keeps its mapping for 365 days (learn.microsoft.com, li-lms-2026-09).
- **Capturing click IDs and UTMs.** A static, zero-JS page can't pass query parameters along to the agenda link. Two ways around that:
  - Point ad final URLs straight at `agenda.chambasimple.com/?utm_*…`.
  - Or put landing pages under something like `/lp/*` and have the Worker run first there (`run_worker_first` plus HTMLRewriter) to copy the parameters into the agenda links on the server.

  The Worker then keeps `gclid`/`gbraid`/`wbraid`, `fbclid`, `li_fat_id` and the UTMs in hidden form fields. Store them with the booking only if the person consents.

## 3. Cookieless free traffic analytics

- **Cloudflare Web Analytics.**
  - Free.
  - The beacon (`beacon.min.js`) is 31.7 KB raw, about 10 KB gzipped (measured today).
  - It uses no cookies or localStorage and does no fingerprinting.
  - It reports page views, visits, referrer host (paths through GraphQL), countries, paths, devices and Core Web Vitals.
  - **It does not report UTMs** ("Not yet", web-analytics/faq).
  - It keeps unsampled data for 7 days, then about 10%.
  - Ad blockers block it. Proxied zones get it injected automatically; otherwise add the snippet by hand.
- **Strict zero-JS alternative.** A Worker on HTML routes writes referrer, UTMs and country to Workers Analytics Engine. The free tier is 100k data points and 10k read queries a day (not billed yet). Caveat: `run_worker_first` uses up free requests, and once you're over the limit visitors get 429 errors.
- **GA4 through Zaraz instead.** GA4 adds UTMs, conversions and the link to Google Ads, but it sets a client-ID cookie, which means opt-in in Peru.

## 4. MCP servers

GitHub figures pulled today.

| Server | Official? | License, stars, last push | Reads or writes |
|---|---|---|---|
| cloudflare/mcp (Cloudflare API, `mcp.cloudflare.com/mcp`) | Official | Apache-2.0, 950, 2026-10-13 | The whole API, read and write (including Zaraz and DNS). Use a read-only token. |
| cloudflare/mcp-server-cloudflare (docs, bindings, builds, observability, radar, **graphql**, **dns-analytics**, logpush and others; **no Zaraz server**) | Official | Apache-2.0, 4,378, 2026-10-09 | Mostly read. OAuth. |
| googleads/google-ads-mcp | Official | Apache-2.0, 1,040, 2026-10-09 | Read only (`search` with GAQL). Self-hosted. Google Cloud project, OAuth, developer token at Explorer level. |
| googleanalytics/google-analytics-mcp | Official | Apache-2.0, 3,461, 2026-10-02 | Read only (`analytics.readonly`). |
| Meta Ads, hosted at `mcp.facebook.com/ads` | Official, open beta since 2026-04-29 | Not on GitHub | 29 tools, read and write. Three OAuth tiers; new campaigns start paused; admin rules since 2026-07-16; rollout is gradual. |
| pipeboard-co/meta-ads-mcp | Community | Custom license, 1,305, 2026-09-23 | Read and write |
| LinkedIn Ads | **No official server.** Community: mharnett/mcp-linkedin-ads (MIT, read-only by default), danielpopamd/linkedin-ads-mcp (writes). Stars not checked. | | |
| Search Console | **No official server** as of Oct 2026 (several vendor checks). AminForou/mcp-gsc | MIT, 1,927, 2026-09-15 | Use the read-only scope. |

**Minimal set:** Cloudflare graphql and docs (read-only token), Google Ads MCP, GA4 MCP (only if you adopt GA4), mcp-gsc, and Meta at the read-only tier. Meta and the Cloudflare API server can make changes, so connect them read-only.

## 5. Consent rules in Peru and Mexico

- **Peru.** The new regulation, DS 016-2024-JUS, was published 2024-11-30 and took effect 2025-03-30.
  - Art. 2.4 counts "identificadores en línea" as personal data.
  - Art. 4 requires consent before collection.
  - Art. 5.1.3 accepts a click as express consent.
  - Art. 26.1 makes processing for advertising lawful only with consent obtained directly from the person. Art. 26.5 says opting out must be as easy as opting in.
  - DLA Piper: necessary cookies need no consent; **marketing cookies do**. Fines run 0.5–100 UIT (EY, 2025-01-28).
  - It applies to anyone offering services to people in Peru (Thelema, 2025-01-07).
- **Mexico.** The new LFPDPPP (DOF 2025-03-20, last reformed 2025-11-14).
  - Art. 7: tacit consent through a privacy notice is the general rule. Express consent is needed for financial or property data; Art. 8 requires express written consent for sensitive data.
  - Art. 16.II requires a simplified notice when data is collected electronically.
  - Cookies: the duty is to inform people about tracking technologies and how to turn them off (Ecija, 2025-10-31). So in Mexico a notice plus an opt-out is enough.
- **One site serves both countries, so Peru's opt-in rule sets the bar.**
- **No banner is possible** if you use only cookieless analytics, put no pixels or Zaraz ad tools on the site, and send server-side conversions only for people who tick an **unticked, separate** checkbox. That checkbox should name Meta, Google and LinkedIn and the purpose (ad measurement), next to the simplified notice.
- **If you later want visitor retargeting,** use the minimum compliant banner: the Zaraz CMP with Accept and Reject equally prominent and everything denied by default.
- None of this is legal advice. Have Peruvian counsel confirm, including any registration of the personal-data bank.

## 6. Ads strategy

Most figures below are agency or vendor estimates.

- **Google Search.**
  - Peru, Software/SaaS: about US$0.93 average CPC (41 keywords, Semrush data, anafernandezseo 2026). Lima agency estimate: S/8–20 per click, with S/3,000 a month as the minimum (BCP Consulting, 2026-06-09).
  - Mexico, B2B/software: MXN 10–28 per click, minimum spend MXN 5,000–10,000 a month (Nebugrama, checked Aug 2026). Market average MXN 18–22 (Weblindrome, 2026-05).
- **LinkedIn.** The official minimum is $10 a day per campaign (business.linkedin.com). Peru CPC runs US$4–18, with about US$1,500 a month as the realistic floor (Funnel.pe, 2026-05-26).
- **Meta.** CPC is US$0.30–2 in Peru (Funnel.pe) and MXN 3–15 in Mexico (Weblindrome), but buying intent is low.
- **Recommendation:** start with Google Search on long-tail, high-intent keywords in separate Peru and Mexico campaigns, with bookings as the conversion. Leave retargeting for later: a small B2B site will take a long time to build a useful audience, and it would bring the banner with it.

## Recommended setup

**Now, before any ads**
1. Web Analytics, with the snippet added by hand. Or Worker plus Analytics Engine if you want to stay strictly zero-JS.
2. Search Console.
3. In the agenda Worker: capture UTMs and click IDs, add the unticked consent checkbox, and publish the Spanish privacy notice.
4. Connect the read-only MCPs listed above.

**At the first campaign**
1. Google Search with auto-tagging, ad URLs carrying UTMs, and conversions sent from the Worker through the Data Manager API (gclid plus hashed email, only with consent).
2. Meta Conversions API (`fbc` built from `fbclid`) or LinkedIn Conversions API (`li_fat_id` plus hashed email) only when you run those channels.

**Never**
- GTM, gtag or the Meta Pixel JavaScript directly on the site.
- The Zaraz Google Ads or LinkedIn Insight tools, because they make third-party cookie requests from the browser.
- Zaraz tools without a consent purpose assigned.
- Uploading conversions through the old Google Ads API path.
- Sending hashed emails without the checkbox ticked.
- MCPs connected with write scopes by default.
