# Design

## Contexto

La agenda es un Worker aparte (`agenda.chambasimple.com`) con su propia página renderizada en el
servidor, su propio CSP y su propio `wrangler.jsonc`. Comparte con el sitio la cabecera, la paleta
(`TOKENS`) y las reglas de contenido. No usa Astro ni Tailwind: compone el HTML y el CSS como strings.

## Decisiones

### Reutilizar el script del aura, no copiarlo

El aura es el mismo efecto que en el sitio, así que la agenda importa `CURSOR_SCRIPT` de
`src/layouts/cursor.ts` (el `agenda/` ya importa `src/content/agenda.ts`): un solo script, un solo
hash y ninguna copia que se desincronice.

### Sin `data-js`: la opacidad ya depende del script

El sitio oculta el aura con `:root[data-js]` porque su script del tema marca `data-js`. La agenda no
tiene script de tema y su único script es el aura: si no corre (JavaScript apagado), `data-on` nunca
se pone y la capa queda en `opacity: 0`. Por eso la agenda se limita a la media query (`hover`,
`pointer: fine`, ≥ 768 px) y a `[data-on]`; no necesita `data-js`.

### El CSP, por hash, y solo el aura

El CSP de la agenda pasa de `script-src 'none'` a `script-src 'sha256-…'` con el hash del aura
(compartido con el sitio); con Turnstile configurado añade su origen. Sin `unsafe-inline` y sin
`'self'`. Un test de la agenda calcula el sha256 de `CURSOR_SCRIPT` y falla si el hash del CSP
diverge, simétrico al test del Worker del sitio.

### El color de selección, el mismo par de la marca

`::selection{background:var(--mint);color:var(--ink)}`, el mismo par menta/tinta que el botón
(13.3:1), en tema claro y oscuro. Va en el bloque de CSS de la página, junto al resto.

## Alternativas descartadas

- **Copiar el script y el CSS del aura a la agenda**: dos fuentes que se desincronizan y un hash
  duplicado.
- **Servir el script como archivo estático**: la agenda no tiene assets propios y el aura es una
  línea; inline con hash es lo que ya hace el sitio.
- **Dejar la agenda sin aura**: es la pantalla donde el visitante ya está en conversación; la marca
  se nota más, no menos.

## Riesgos

- **CSP y deriva del hash**: si el hash no coincide, el aura no corre y la página se ve igual. El
  test de la agenda cubre la deriva.
- **Rendimiento**: la agenda no entra en el Lighthouse del sitio (es otro Worker); el aura solo mueve
  `transform` y se duerme en reposo, igual que en el sitio.
