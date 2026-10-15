// The site's color tokens, copied from src/styles/global.css (tokens.test.ts fails if they drift).
export const TOKENS = `:root {
  /* Every color in the site is one of these tokens (src/styles/contrast.test.ts measures them and
     fails on any hex color written elsewhere). Surfaces go up in levels, so components stay
     distinct in both themes: page (bg) < alternate section (surface) < card (card).
     light-dark(light, dark): the system decides unless the visitor picks a theme in the header. */
  color-scheme: light dark;
  --ink: #02130f;
  --mint: #62f0bb;
  --bg: light-dark(#f7fbf9, #02130f);
  --surface: light-dark(#eaf3ee, #071d17);
  --card: light-dark(#ffffff, #11302a);
  --text: light-dark(#02130f, #effbf6);
  --muted: light-dark(#4a5e57, #a3b8b0);
  --accent: light-dark(#0a6b4b, #62f0bb);
  /* Text on an accent fill: the light accent is a dark green, the dark accent is mint. */
  --accent-ink: light-dark(#ffffff, #02130f);
  --line: light-dark(#c2d6cc, #33594c);
  --danger: light-dark(#b42318, #ff8a80);
  /* The closing contact band is ink in both themes; logos sit on a white plate in both. */
  --band: #02130f;
  --band-text: #effbf6;
  --band-muted: #a3b8b0;
  --plate: #ffffff;
}

:root[data-theme="light"] {
  color-scheme: light;
}

:root[data-theme="dark"] {
  color-scheme: dark;
}`;
