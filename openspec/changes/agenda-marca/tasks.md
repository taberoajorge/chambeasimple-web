# Tasks

## 1. CSS y markup de la agenda

- [x] 1.1 Añadir a `agenda/src/page.ts` el `::selection` de la marca y la capa `#aura` (fija, `z-index: 31`, `pointer-events: none`, gradiente con `var(--aura)`), con la media query de puntero fino / ≥ 768 px, `[data-on]` y `prefers-reduced-motion`. Se verifica: el test de la agenda encuentra `::selection` en el HTML y `pnpm test` pasa.
- [x] 1.2 Añadir `<div id="aura" aria-hidden="true">` y el `<script>` con `CURSOR_SCRIPT` (importado de `src/layouts/cursor.ts`) al shell. Se verifica: el test comprueba el div y el script inline en la página.

## 2. CSP

- [x] 2.1 Permitir en `csp()` de `agenda/src/index.ts` solo el hash del aura (más Turnstile si está configurado), sin `unsafe-inline` ni `'self'`. Se verifica: un test calcula el sha256 de `CURSOR_SCRIPT` y lo compara con el CSP, con y sin Turnstile.

## 3. Verificación

- [x] 3.1 `pnpm check` en verde (Biome, tipos, tests, límites, Knip, OpenSpec). Se verifica: salida del comando.
- [x] 3.2 Ver la agenda en local (`pnpm dev:agenda`) a 1440 px, tema claro y oscuro, que la selección es menta y el aura sigue al puntero sin quedar cortada; a ancho angosto y táctil no aparece. Se verifica: capturas y trazas con el MCP de Chrome DevTools.

(2026-10-18: la agenda en `localhost:8788` devuelve el CSP con `script-src 'sha256-o/tESdse/Hhw1gQp316CExfyB1PqDjdzfcf9fIA8fd4='` (el mismo del sitio) más Turnstile, sin `unsafe-inline`.
A 1440 px, puntero fino: `#aura` es `display:block`, `opacity:1`, `z-index:31` sobre el header (`z-index:2`); el `transform` inline sigue al puntero (interpolado, el centro del rect coincide con el `translate3d`) y el glow de menta se ve en tema claro y oscuro. La selección del titular se pinta en menta con tinta en ambos temas.
A 390 px táctil: `hover`/`pointer:fine` y `min-width` en `false`, `#aura` en `display:none`, sin `data-on` y sin scroll horizontal. Sin `data-js` no hace falta: la opacidad ya depende de `data-on`.
Nota: `rAF` está fuertemente limitado en este navegador headless (avanza ~1 cuadro por segundo), así que la convergencia del lerp no se mide por tiempo; el movimiento monotónico hacia el puntero y el centrado sí quedan verificados.
`pnpm perf` no cubre la agenda: Lighthouse corre sobre el sitemap del sitio, y la agenda es otro Worker; el script y la capa son los mismos que ya pasan 100/100/100/100 en el sitio.)
