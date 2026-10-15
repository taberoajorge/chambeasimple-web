# Tasks

## 1. Revisión local

- [x] 1.1 Mover la CSP a `worker/csp.ts` (workerd no acepta que la entrada exporte un texto) y revisar cada `<script>` de `dist/` en `scripts/checks/seo.ts`, con casos en `seo.test.ts`. Se verifica con `pnpm build` en verde y en rojo al agregar un script en línea a `Base.astro` (luego se revierte).
- [x] 1.2 `scripts/run.ts preview` con `wrangler dev`; quitar `preview:worker` de `package.json`. Se verifica con `curl -I` al puerto de la copia mostrando la CSP.
- [x] 1.3 `scripts/checks/perf.ts` con la API de Node de Lighthouse (`lighthouse@13.5.0`, `chrome-launcher` en `package.json`), una corrida por página y dispositivo, repetición solo de Performance, `--path` y la comprobación de la CSP. Se verifica con `pnpm perf` en verde contra `pnpm preview` y en rojo contra `astro preview`.

(2026-10-15: con un `<script>` en línea en `Base.astro`, `pnpm build` falló en cada página con el hash que falta. `pnpm perf` local contra `pnpm preview`: 10 páginas × 2 dispositivos en 100/100/100/100, 22 corridas en 2 min. Contra `astro preview` se negó: sin CSP. Exportar la CSP desde `worker/index.ts` rompía `wrangler dev`; de ahí `worker/csp.ts`.)

## 2. Pipeline

- [ ] 2.1 `.github/workflows/check.yml`: caché de pnpm, `preview` con `url` y `pages`, matriz `audit`, job final `lighthouse`, sin `perf`; `deploy` tras `check` y Lighthouse de producción en su propio job. Se verifica con las corridas del PR de este cambio.
- [x] 2.2 `monitor.yml` con la misma instalación de pnpm y caché; su Lighthouse toma las páginas del sitemap de producción. (`copilot-setup-steps.yml` sigue con `scripts/bootstrap.sh`, como cualquier copia.) Se verifica con `actionlint`.
- [ ] 2.3 Checks obligatorios de `main`: `check` y `lighthouse`, estrictos. Se verifica con `gh api repos/taberoajorge/chambeasimple-web/branches/main/protection/required_status_checks`.

## 3. Documentación

- [x] 3.1 `AGENTS.md` (comandos y pipeline) y la skill `verify-ui`. Se verifica leyendo que no queden menciones a `astro preview`, `preview:worker` ni al job `perf`.
