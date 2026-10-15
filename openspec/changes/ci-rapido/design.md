# Diseño: CI rápido

## Contexto

Medido en las corridas de `check.yml` (2026-10-14):
- PR #3: `check` 28 s; `perf` 11 min 51 s; `preview` 12 min 33 s. Total: 13 min 4 s.
- `main` tras fusionar #3: `perf` 11 min 56 s, luego `deploy` 12 min 19 s (casi todo Lighthouse de producción). Total: 24 min 20 s.

Fuentes: `docs/variability.md` de Lighthouse ("correr Lighthouse hasta 5 veces hasta que pase"), la API de Node de Lighthouse 13.5.0, la documentación de `actions/setup-node` (pnpm debe estar en el PATH antes, para `cache: pnpm`) y el patrón de un único job final obligatorio que reúne a los demás (Jake Wharton).

## Decisiones

### 1. La CSP se revisa al construir, no al desplegar
- La CSP vive en `worker/csp.ts`; la importan `worker/index.ts`, que la envía, y `scripts/checks/seo.ts`. Una sola fuente. No se exporta desde `worker/index.ts`: workerd no arranca si la entrada exporta algo que no es un handler.
- Para cada `<script>` de cada página de `dist/`, excepto `type="application/ld+json"` (datos, no código):
  - con `src`: falla si `script-src` no incluye `'self'`;
  - en línea: el SHA-256 en base64 del texto exacto entre las etiquetas debe estar en `script-src`.
- `seo.ts` ya corre tras `astro build` en cada `pnpm build`, en el `pre-push` y en CI. No hace falta `dist/` en los tests: el test de la regla usa HTML de ejemplo.
- `worker/index.test.ts` sigue comprobando que el hash del tema está en la CSP.

### 2. `pnpm preview` es el Worker
- `scripts/run.ts preview` lanza `wrangler dev --port <puerto de la copia>` en vez de `astro preview`. Con la ruta `custom_domain` de `wrangler.jsonc`, `wrangler dev` responde como `chambasimple.com`: cabeceras de producción, sin `noindex`. La auditoría local incluye `is-crawlable`.
- `pnpm perf` sin `--url` sigue midiendo `http://localhost:<puerto>`, pero antes comprueba que la página envía `Content-Security-Policy`. Si no, falla: no es el Worker.
- Las páginas salen del `sitemap-0.xml` del propio destino, no de `dist/`: el Lighthouse de producción y el de `monitor.yml` cubren todas las páginas sin construir.
- `pnpm preview:worker` (puerto fijo 8787) se elimina: chocaba entre copias y ya no aporta.

### 3. Una corrida, y repetir solo Performance
- Por página y dispositivo: una corrida con las cuatro categorías.
- Si Performance queda bajo el umbral (95 en CI, 100 en local), hasta dos corridas más solo de Performance (`onlyCategories: ['performance']`). Vale la mejor: el ruido de un runner compartido solo hace las páginas más lentas, nunca más rápidas, y Google recomienda repetir hasta que pase.
- El informe final toma accesibilidad, buenas prácticas y SEO de la corrida completa, y Performance y sus métricas (LCP, TBT, CLS, red) de la mejor.
- En el caso habitual son 2 corridas por página en vez de 6.

### 4. Lighthouse por su API de Node
- `lighthouse@13.5.0` y `chrome-launcher` como `devDependencies` fijas. Un Chrome nuevo por corrida (`chrome-launcher`), `desktopConfig` para escritorio y la cabecera `x-chambea-check` para quedar fuera de la analítica.
- Se ahorra el arranque de `pnpm dlx` en cada corrida, y la versión queda en el lockfile.

### 5. PR: vista previa, un job por página y un job final
- `preview` (necesita `check`): construye, sube la versión `pr-<n>`, corre la prueba rápida y publica `url` y `pages` (las rutas de `dist/sitemap-0.xml`). Sin `CLOUDFLARE_API_TOKEN` falla con un mensaje claro: sin vista previa no hay Lighthouse, y un check obligatorio no debe pasar sin medir.
- `audit` (matriz por página, `fail-fast: false`): `pnpm perf --ci --url <vista previa> --path <página>`, móvil y escritorio. Guarda sus líneas como artefacto.
- `lighthouse` (job final, `if: !cancelled()` y solo en PR): junta los artefactos, comenta el PR con la URL, la prueba rápida y Lighthouse, y falla si `preview` o algún `audit` no terminó en `success`. Un job omitido cuenta como éxito para un check obligatorio; por eso el job final comprueba los resultados él mismo.
- `check` sigue igual (Biome, tipos, tests, Knip, OpenSpec, build con SEO y CSP, auditoría, mensajes de commit y gitleaks). `preview` espera a `check` para que nada llegue a una URL pública sin pasar gitleaks.
- Se elimina `perf` contra localhost: auditaba un runtime distinto del real.

### 6. `main`: desplegar tras `check`
- `deploy` necesita solo `check`. El mismo árbol ya pasó Lighthouse en la vista previa del PR, y la protección estricta exige que la rama esté al día con `main`.
- Se mantienen la prueba rápida y el rollback.
- Lighthouse de producción es un job aparte (`production`, necesita `deploy`): no retiene el grupo de concurrencia del despliegue ni puede activar el rollback. Si falla, la corrida de `main` queda en rojo: el mismo código pasó en la vista previa, así que algo propio de producción cambió.
- `monitor.yml` sigue con la prueba diaria y Lighthouse los lunes.

### 7. Caché de pnpm
- `pnpm/action-setup` (fijado por SHA, toma la versión de `packageManager`) antes de `actions/setup-node` con `cache: pnpm`. Reemplaza `corepack enable`, que dependía del Node preinstalado del runner.

### 8. Checks obligatorios
- `main` exige `check` y `lighthouse`, estrictos. `perf` deja de existir.
- Se cambian en GitHub cuando los dos nuevos ya reportaron en el PR de este cambio, y antes de fusionarlo.

## Riesgos
- **Dependabot:** sin los secretos de Cloudflare como secretos de Dependabot, sus PR no tienen vista previa y `lighthouse` falla. Los dueños deben agregarlos.
- **PR desde forks:** no ven secretos; `lighthouse` falla. Es intencional: no se fusiona sin medir.
- **Una sola corrida completa:** si accesibilidad, buenas prácticas o SEO fallan por algo intermitente (un recurso que no carga), el PR falla; se reintenta el job.
