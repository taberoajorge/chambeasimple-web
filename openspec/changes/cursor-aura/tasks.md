# Tasks

## 1. Script del aura

- [x] 1.1 Crear `src/layouts/cursor.ts` exportando `CURSOR_SCRIPT`: string inline, sin `<` ni `&`, con guardas de puntero fino, ≥768 px y movimiento reducido; `pointermove` + `requestAnimationFrame` con interpolación, bucle auto-terminante, solo `transform`. Se verifica: `node -e` imprime el sha256 del string y `pnpm typecheck` pasa.
- [x] 1.2 Calcular el hash `sha256` del string y añadirlo al CSP en `worker/csp.ts` como segundo script permitido. Se verifica: el string del CSP contiene los dos hashes.

## 2. Markup y estilos

- [x] 2.1 Añadir `<div id="aura" aria-hidden="true">` y `<script is:inline set:html={CURSOR_SCRIPT} />` en `src/layouts/Base.astro`. Se verifica: el HTML construido contiene el div y el script verbatim.
- [x] 2.2 Añadir el token `--aura` y la capa `#aura` en `src/styles/global.css`, mostrada solo bajo `(hover: hover) and (pointer: fine) and (min-width: 768px)` con `:root[data-js]`, oculta con `prefers-reduced-motion`, y con `z-index: 31` (sobre el header `z-30` y los títulos pegajosos `z-20`, bajo el skip-link `z-50`) para que no se corte. Se verifica: `pnpm build` compila y el CSS contiene la regla.

## 3. Pruebas

- [x] 3.1 Actualizar `worker/index.test.ts` para exigir que el CSP permita el hash de `CURSOR_SCRIPT` (además del del tema). Se verifica: `pnpm test` pasa y falla si el hash se cambia.
- [x] 3.2 Correr `pnpm check` (Biome, tipos, tests, límites, Knip, OpenSpec). Se verifica: `pnpm check` en verde.

## 4. Verificación visual y de rendimiento

- [x] 4.1 Con el build de producción (`pnpm build && pnpm preview`), comprobar a 1440 y 390 px, en tema claro y oscuro, que el aura sigue al puntero suave en escritorio y no aparece en móvil. Se verifica: capturas y trazas (verify-ui).
- [x] 4.2 Comprobar sin JS y con `prefers-reduced-motion`: el aura no aparece y el resto es idéntico. Se verifica: desactivando JS y con la emulación de movimiento reducido en DevTools.
- [x] 4.3 Correr `pnpm perf` sobre el build de producción. Se verifica: Lighthouse 100/100/100/100 en todas las páginas, móvil y escritorio.

(2026-10-17: `sha256-o/tESdse/Hhw1gQp316CExfyB1PqDjdzfcf9fIA8fd4=` en el CSP, junto al del tema; `pnpm build` confirma "every script allowed on 11".
En DevTools: a 1440 px, puntero fino y `hover: hover` (combo `true`), el aura pasa a `display:block`, `opacity:1` y `transform` interpolado (lerp 0.12); a 390 px táctil, `hover`/`pointer:fine`/`min-width` en `false` y el script no arranca (`display:none`, sin `data-on`), sin scroll horizontal.
Tema claro y oscuro: glow de menta suave bajo el titular (`--aura` = menta 0.30 en claro, 0.26 en oscuro; el verde oscuro se leía como mancha y se cambió a menta). Sin `data-js` el aura es `display:none` (caso sin JavaScript). Movimiento reducido verificado por inspección: la regla `@media (prefers-reduced-motion: reduce){#aura{display:none}}` y la guarda del script; no emulable con el MCP de DevTools.
`pnpm check` en verde (Biome, tipos, 100 tests, límites, Knip, OpenSpec). `pnpm perf`: 10 páginas × 2 dispositivos en 100/100/100/100.
Nota aparte, preexistente: el panel Issues de DevTools avisa de una imagen `loading="lazy"` sin dimensiones explícitas; no la introduce este cambio (no añade imágenes) y Lighthouse Best Practices y CLS quedan en 100 y 0.
(2026-10-17, revisión: con la capa por debajo del header y los títulos pegajosos el aura se veía cortada ahí. Se subió a `z-index: 31`; verificado en DevTools que `#aura` (31) pinta sobre `header` (30) con el puntero sobre el header y sobre el titular "Qué resolvemos". `pnpm check` y `pnpm perf` siguen en verde.))
