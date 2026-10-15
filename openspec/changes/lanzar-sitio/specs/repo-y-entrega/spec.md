# Spec Delta

## Purpose

Que el repo se trabaje igual que `taberoa-portfolio`, por personas y por agentes de IA, y que cada cambio llegue a `chambasimple.com` de forma automática y verificada.

## ADDED Requirements

### Requirement: Base AI-native heredada
El repo SHALL traer, adaptado, lo que ya funciona en `taberoa-portfolio`:
- **instrucciones:** `AGENTS.md` en la raíz y por carpeta, más `CLAUDE.md` y la configuración de Gemini;
- **skills y hooks:** skills compartidas en `.agents/skills` con adaptadores para Claude, y un script de hooks común para Claude Code, Codex, Antigravity, Gemini CLI y OpenCode;
- **worktrees:** `scripts/bootstrap.sh`, un puerto por worktree y `orca.yaml`;
- **calidad:** `pnpm check` (Biome, tipos, tests, fronteras, Knip y OpenSpec), `pnpm perf` y `pnpm parity`;
- **entrega:** hooks de Git (`commit-msg` y `pre-push`), scripts de entrega para PRs y CI en GitHub (acciones fijadas por SHA, auditoría y escaneo de secretos).

No se copia lo que solo sirve al portafolio (las figuras isométricas y sus checks). Los scripts se adaptan a Astro: las reglas de fronteras, Knip con su plugin de Astro y `pnpm perf`.

#### Scenario: Check verde desde el primer commit
- **WHEN** se clona el repo y se ejecutan `sh scripts/bootstrap.sh` y `pnpm check`
- **THEN** ambos terminan con código 0

### Requirement: Verificación continua con Chrome DevTools
El repo SHALL traer configurado, a nivel de proyecto, el MCP oficial de Chrome DevTools (`chrome-devtools-mcp` en versión fija), con un perfil aislado y sin enviar URLs a CrUX. Debe estar disponible para todos los clientes de agentes:

| Cliente | Archivo |
|---|---|
| Claude Code | `.mcp.json` |
| Cursor | `.cursor/mcp.json` |
| VS Code y Copilot | `.vscode/mcp.json` |
| Codex | `.codex/config.toml` |
| Gemini CLI | `.gemini/settings.json` |
| OpenCode | `opencode.json` |
| Antigravity | `.agents/mcp_config.json` |

La skill `verify-ui` MUST indicar cómo usarlo en cada cambio visual, contra el build de producción local:
- `lighthouse_audit` en móvil y escritorio, con tema claro y oscuro;
- una traza de rendimiento con sus *insights* (LCP, CLS, INP);
- la consola sin errores;
- capturas a 390 y 1440 px.

#### Scenario: Cambio visual verificado por el agente
- **WHEN** un agente cambia una sección y termina su trabajo
- **THEN** ha corrido `lighthouse_audit` y una traza con el MCP en los dos temas y anchos, y reporta los resultados con capturas

### Requirement: Harness que no deja bajar del 100
El script de hooks común SHALL tener, además de las guardas del portafolio, un segundo certificado: el de `pnpm perf`. Si cambió algo que afecta lo que ve el visitante (`src/`, `public/`, configuración de Astro, `worker/` o `wrangler.jsonc`) desde el último `pnpm perf` en verde, el hook de cierre pide correrlo antes de dar el trabajo por terminado. El hook de inicio de sesión MUST recordar el último resultado de `pnpm perf` (puntuaciones y fecha). En CI, `pnpm perf --ci` corre en cada PR y su resultado queda como check.

#### Scenario: Cambio sin medir
- **WHEN** un agente modifica `src/sections/Hero.astro` y termina sin correr `pnpm perf`
- **THEN** el hook de cierre le pide correrlo, y el trabajo no queda certificado

#### Scenario: Una regresión no pasa
- **WHEN** un PR baja la accesibilidad, el SEO o las buenas prácticas por debajo de 100, o el rendimiento por debajo del umbral de CI
- **THEN** el check `lighthouse` falla en el PR y nombra la auditoría

### Requirement: Despliegue continuo en Cloudflare
El repo `taberoajorge/chambeasimple-web` SHALL desplegarse como un Cloudflare Worker con recursos estáticos, en el plan gratis y sin método de pago, para que pasar los límites devuelva errores y nunca cargos. El pipeline (`.github/workflows/`) MUST:
- **en cada PR:** correr `pnpm check`, `pnpm build` (con la revisión de SEO), gitleaks, los mensajes de commit y Lighthouse; subir una versión de vista previa con su propia URL (`pr-<n>-…workers.dev`, siempre con `noindex`), correr allí la prueba rápida y Lighthouse, y comentar la URL y los resultados en el PR;
- **en `main`:** desplegar solo si pasaron los checks; correr la prueba rápida contra producción y, si falla, volver a la versión anterior (`wrangler rollback`); dejar Lighthouse de producción en el resumen del job;
- **cada día:** correr la prueba rápida contra producción, y los lunes también Lighthouse; si algo falla, abrir o actualizar un issue.

`main` MUST estar protegida con el check de CI obligatorio. El token de despliegue MUST limitarse a Workers de esta cuenta.

#### Scenario: Merge a main
- **WHEN** se fusiona un PR
- **THEN** el sitio se despliega desde ese commit, la prueba rápida pasa contra `chambasimple.com` y el resumen del job muestra Lighthouse

#### Scenario: Despliegue roto
- **WHEN** un despliegue rompe la negociación de Markdown o una página responde 500
- **THEN** la prueba rápida falla, el job vuelve a la versión anterior y el job queda en rojo

### Requirement: Dominio gestionado por Cloudflare
`chambasimple.com` SHALL ser una zona de Cloudflare (plan gratis) con los nameservers de Cloudflare, cambiados en Namecheap. `www.chambasimple.com` MUST redirigir con 308 a `chambasimple.com`.

Antes de cambiar los nameservers, MUST recrearse en el DNS de Cloudflare todos los registros del correo actual con SimpleLogin:
- MX `mx1.simplelogin.co` (prioridad 10) y `mx2.simplelogin.co` (prioridad 20);
- el TXT de SPF (`v=spf1 include:simplelogin.co ~all`);
- el TXT de verificación `sl-verification=…`;
- los CNAME `dkim`, `dkim02` y `dkim03` `._domainkey` hacia `simplelogin.co`, sin proxy;
- el DMARC (`v=DMARC1; p=quarantine; pct=100; adkim=s; aspf=s`).

El cambio se hace al final y con el visto bueno de los dueños.

#### Scenario: El correo sigue llegando tras el cambio
- **WHEN** los nameservers ya son los de Cloudflare
- **THEN** `dig MX`, `dig TXT` y los CNAME de DKIM devuelven los mismos valores que antes, y un correo de prueba a `hola@chambasimple.com` llega con SPF, DKIM y DMARC en `pass`

#### Scenario: Dominio en producción
- **WHEN** se piden `https://chambasimple.com` y `https://www.chambasimple.com`
- **THEN** el primero responde 200 con el sitio y el segundo redirige con 308 al primero
