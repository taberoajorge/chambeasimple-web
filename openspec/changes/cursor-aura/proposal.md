# Proposal

## Why

La homepage se ve bien en reposo, pero al interactuar no responde al puntero: el visitante no siente
que la página esté "viva" mientras la lee. Las webs de estudio que sirven de referencia tienen un
detalle ligero que sigue al cursor y da esa sensación de producto interactivo sin distraer.

Chamba Simple ya tiene ese ingrediente en su identidad: el verde menta con glow (el wordmark ya
ilumina su marca al pasar el puntero). Extender eso a un aura de menta que acompaña al puntero es la
versión de la marca, no un cursor ajeno. Debe sentirse suave (nada brusco) y no puede costar
rendimiento, accesibilidad ni un byte de contenido.

## What Changes

- Un **aura de menta** decorativa (capa fija, difuminada) que sigue al puntero con un retardo suave,
  por encima del contenido y con `pointer-events: none`. El cursor nativo **no** se oculta.
- El aura **solo** existe con puntero fino, pantalla ≥ 768 px y sin `prefers-reduced-motion`; en
  táctil y móvil no se pinta ni se escucha nada.
- Un **segundo script inline** (`src/layouts/cursor.ts`), hermano del del tema: el único otro que el
  CSP del Worker permite, por su hash. Usa `requestAnimationFrame` con interpolación y se duerme
  cuando el aura alcanza al puntero (coste cero en reposo). Solo mueve `transform`.
- Sin dependencias nuevas. Sin cambios de contenido, layout, SEO ni accesibilidad.

## Capabilities

### New Capabilities

- `cursor-aura`: aura de menta que sigue al puntero, acotada a escritorio con puntero fino y sin
  movimiento reducido, con el mínimo JavaScript permitido por el CSP.

## Impact

- Nuevo: `src/layouts/cursor.ts`.
- `src/layouts/Base.astro` (el `<div>` decorativo y el `<script is:inline>`),
  `src/styles/global.css` (token `--aura` y la capa), `worker/csp.ts` y `worker/index.test.ts`
  (el hash del segundo script).
- `openspec/specs/cursor-aura/spec.md` queda como spec vigente al archivar.
