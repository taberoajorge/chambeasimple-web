# CI rápido sin perder confianza

## Why

Hoy cada PR espera unos 13 minutos y `main` unos 25. Lighthouse corre 66 veces seguidas por job (11 páginas × 2 dispositivos × 3 corridas), y lo hace dos veces por PR: en `perf`, contra `astro preview` en el runner, y en `preview`, contra la versión de Cloudflare. Después lo repite en `main` antes y después de desplegar.

Además, `perf` y el `pnpm perf` local auditan `astro preview`, que no pasa por el Worker: no hay CSP ni cabeceras de seguridad. En el PR #4 un `<script>` en línea que la CSP del Worker bloquea pasó en local y en `perf`, y solo falló en `preview` 12 minutos después. Y `preview` no es un check obligatorio: un PR con Lighthouse rojo en la vista previa podía fusionarse.

## What Changes

- **La CSP se revisa al construir:** la revisión de `pnpm build` (`scripts/checks/seo.ts`) calcula el hash de cada `<script>` en línea de `dist/` y falla si la CSP del Worker no lo permite. Corre en `pnpm build`, en el `pre-push` y en CI, en segundos.
- **El mismo runtime en todas partes:** `pnpm preview` sirve el build con el Worker (`wrangler dev`) en el puerto de la copia, y `pnpm perf` se niega a medir algo que no envía la CSP. Local, CI y Cloudflare miden lo mismo. `pnpm preview:worker` deja de hacer falta.
- **Menos corridas:** una corrida completa por página y dispositivo. Solo si Performance queda bajo el umbral se repite Performance, hasta dos veces más, y vale la mejor. Accesibilidad, buenas prácticas y SEO son deterministas.
- **Lighthouse como dependencia fija** (`lighthouse@13.5.0` y `chrome-launcher`) por su API de Node, en vez de `pnpm dlx` en cada corrida.
- **En los PR:** un job sube la vista previa y publica sus páginas; un job por página audita la vista previa en paralelo; un job final `lighthouse` reúne los resultados, comenta el PR y falla si algo no pasó. Desaparece el job `perf` contra localhost.
- **En `main`:** `deploy` espera solo a `check` (el mismo código ya pasó Lighthouse en la vista previa de su PR, y la protección exige ramas al día). Se mantienen la prueba rápida y el rollback. Lighthouse de producción pasa a un job aparte, que no retiene el despliegue ni toca el rollback.
- **Caché de pnpm** en `setup-node` (`pnpm/action-setup` fijado por SHA antes).
- **Protección de `main`:** los checks obligatorios pasan a ser `check` y `lighthouse`.

## Capabilities

### New Capabilities
- `ci-rapido`: revisión de la CSP al construir, mismo runtime en local y CI, corridas de Lighthouse en paralelo y con repetición solo de Performance, y checks obligatorios del pipeline.

### Modified Capabilities
<!-- Ninguna: `repo-y-entrega` sigue dentro del cambio `lanzar-sitio`, que aún no se archiva. Este cambio reemplaza allí el check `perf` por `lighthouse`. -->

## Impact

- **Archivos:** `.github/workflows/check.yml`, `scripts/checks/perf.ts`, `scripts/checks/seo.ts` y su test, `scripts/run.ts`, `worker/csp.ts` (la CSP, ahora importable), `package.json`, `AGENTS.md`, la skill `verify-ui`.
- **GitHub:** los checks obligatorios de `main` cambian de `check` y `perf` a `check` y `lighthouse`.
- **Dependabot:** sus PR no ven los secretos de Actions; sin `CLOUDFLARE_API_TOKEN` y `CLOUDFLARE_ACCOUNT_ID` como secretos de Dependabot no hay vista previa y `lighthouse` falla. Los dueños deben agregarlos.
- **Minutos de Actions:** el repo es público; los jobs en paralelo no cuestan.
