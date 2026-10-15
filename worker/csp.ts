// The Content-Security-Policy the Worker sends. The only script allowed is the theme switch, by its
// hash (src/layouts/theme.ts): any other script, injected or not, does not run. Styles are inlined
// by the build; JSON-LD is data, not script, and is not affected. scripts/checks/seo.ts checks every
// built page against it. Its own module because workerd refuses an entry that exports a string.
export const CSP =
  "default-src 'self'; script-src 'sha256-p3mhDqiwtgsUvR6GI+J8dYJW1WTgh7mgc8elhjs+BgE='; style-src 'unsafe-inline'; img-src 'self' data:; base-uri 'none'; form-action 'self' https://agenda.chambasimple.com; frame-ancestors 'none'; upgrade-insecure-requests";
