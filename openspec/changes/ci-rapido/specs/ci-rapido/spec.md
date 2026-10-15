# Spec Delta

## Purpose

Que un PR sepa en pocos minutos si rompe algo, midiendo lo mismo que verá el visitante.

## ADDED Requirements

### Requirement: La CSP se revisa al construir
`pnpm build` SHALL fallar si una página de `dist/` tiene un `<script>` que la CSP del Worker no permite: uno en línea cuyo hash SHA-256 no está en `script-src`, o uno con `src` sin `'self'` en `script-src`. Los bloques `type="application/ld+json"` MUST ignorarse. La CSP MUST leerse de `worker/index.ts`, sin copiarla.

#### Scenario: Un script en línea nuevo
- **WHEN** alguien agrega un `<script>` en línea a una página y corre `pnpm build`
- **THEN** el build falla y nombra la página y el hash que falta en la CSP

### Requirement: El mismo runtime en local y en CI
`pnpm preview` SHALL servir el build con el Worker (`wrangler dev`) en el puerto propio de la copia. `pnpm perf` sin `--url` MUST medir ese servidor y MUST fallar si la página no envía `Content-Security-Policy`. Un `pnpm perf` local en verde MUST seguir escribiendo el certificado `perf`.

#### Scenario: Alguien mide `astro preview`
- **WHEN** `pnpm perf` corre contra un servidor sin las cabeceras del Worker
- **THEN** falla diciendo que no es el Worker, sin correr Lighthouse

### Requirement: Lighthouse repite solo Performance
Por página y dispositivo, `pnpm perf` SHALL correr Lighthouse una vez con las cuatro categorías, por la API de Node de una versión fija. Si Performance queda bajo el umbral, MUST repetir solo Performance hasta dos veces más y quedarse con la mejor. Accesibilidad, buenas prácticas y SEO MUST salir de la corrida completa. `--path <ruta>` MUST limitar la medición a esa página.

#### Scenario: Un runner lento
- **WHEN** la primera corrida da Performance 93 en CI y la segunda 98
- **THEN** la página pasa con 98 y no se corre una tercera

### Requirement: PR medidos en paralelo y con un único check final
En cada PR del repo, el pipeline SHALL subir una vista previa, auditar cada página de su sitemap en un job propio, en paralelo, y reunir los resultados en un job `lighthouse` que comenta el PR y falla si la vista previa o alguna página no pasó. `main` MUST exigir los checks `check` y `lighthouse`, estrictos.

#### Scenario: Una página baja de 100 en accesibilidad
- **WHEN** un PR deja `/en` con accesibilidad 96
- **THEN** su job de `/en` falla, `lighthouse` falla y el PR no se puede fusionar

#### Scenario: La vista previa no se sube
- **WHEN** no hay token de Cloudflare o la subida falla
- **THEN** `lighthouse` falla: un PR no se fusiona sin medir

### Requirement: Despliegue sin repetir Lighthouse
En `main`, `deploy` SHALL esperar solo a `check`, desplegar, correr la prueba rápida y volver a la versión anterior si falla. Lighthouse de producción MUST correr en un job aparte, después del despliegue, sin poder bloquear el rollback.

#### Scenario: Fusión de un PR verde
- **WHEN** se fusiona un PR con `check` y `lighthouse` en verde
- **THEN** el despliegue empieza al terminar `check`, y Lighthouse de producción queda en su propio job
