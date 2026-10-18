# Proposal

## Why

La vista de agenda (`agenda.chambasimple.com`) es la siguiente parada del visitante que ya decidió
hablar, y hoy se ve como una página aparte. El sitio ya sumó dos detalles de marca —el texto
seleccionado en menta y el aura de menta que sigue al puntero— y la agenda, que comparte la misma
cabecera y la misma paleta, todavía no los tiene. El cambio de la página a la agenda se nota.

## What Changes

- La agenda aplica el **color de selección** de la marca (fondo menta, tinta encima), el mismo par
  que ya usa el sitio.
- La agenda suma el **aura de menta** que sigue al puntero, reutilizando el mismo script del sitio
  (`src/layouts/cursor.ts`) y su mismo hash, con las mismas guardas (puntero fino, ≥ 768 px, sin
  movimiento reducido).
- El CSP de la agenda, que hoy es `script-src 'none'`, pasa a permitir **solo** ese script por su
  hash (más Turnstile cuando está configurado). Nada más corre.

## Capabilities

### New Capabilities

- `agenda-marca`: la vista de agenda con el color de selección y el aura de la marca, sin ningún
  script distinto a los ya previstos.

## Impact

- `agenda/src/page.ts` (CSS de selección y aura, `<div id="aura">`, `<script>`),
  `agenda/src/index.ts` (hash del aura en el CSP), `agenda/src/index.test.ts` (CSP y markup).
- Reutiliza `src/layouts/cursor.ts` (del cambio `cursor-aura`) y el token `--aura` que ya está en
  `agenda/src/tokens.ts`.
- `openspec/specs/agenda-marca/spec.md` queda como spec vigente al archivar.
