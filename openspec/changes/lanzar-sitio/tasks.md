# Tasks

## 1. Base del repo

- [x] 1.1 Copiar y adaptar desde `taberoa-portfolio` lo siguiente, sin las figuras ni sus checks:
  - `package.json`, `tsconfig.json`, `biome.json`, `knip.jsonc` y `.node-version`;
  - `scripts/` (bootstrap, port, run, `checks/{boundaries,parity,perf}`, commit-msg, delivery, agent-hooks, con sus tests);
  - `.githooks/`, `.github/`, `orca.yaml`, `docs/worktrees.md`;
  - `AGENTS.md`, `CLAUDE.md`, `.claude`, `.codex`, `.gemini`, `.agents/hooks.json`, `.opencode`;
  - las skills `worktree-bootstrap`, `orca-cli`, `orchestration` y `verify-ui`.

  Se verifica con `sh scripts/bootstrap.sh` y `pnpm check` terminando en 0.
- [ ] 1.1b Configurar el MCP de Chrome DevTools (`chrome-devtools-mcp@1.10.1`, `--isolated`, `--performance-crux=false`) en `.mcp.json`, `.cursor/mcp.json`, `.vscode/mcp.json`, `.codex/config.toml`, `.gemini/settings.json`, `opencode.json` y `.agents/mcp_config.json`, y reescribir la skill `verify-ui` con la secuencia de verificación. Se verifica con Claude Code listando el servidor conectado y un `lighthouse_audit` real contra `pnpm preview`.
- [x] 1.1c Añadir a `scripts/agent-hooks.ts` el certificado de `pnpm perf`: lo pide el hook de cierre si cambiaron `src/`, `public/`, `astro.config.*`, `worker/` o `wrangler.jsonc`, y el hook de inicio muestra el último resultado. Se verifica con tests: cerrar tras editar `src/` sin `perf` pide correrlo; con `perf` en verde, deja terminar.
- [x] 1.2 Crear el proyecto Astro 7 estático (Tailwind 4, `@astrojs/sitemap`) con la estructura `src/{pages,layouts,sections,content,styles}` y sus fronteras de importación. Se verifica con `pnpm build` en verde, `node scripts/checks/boundaries.ts` en verde y su test cubriendo las reglas nuevas.

## 2. Marca

- [x] 2.1 Crear los tokens de los temas en `styles/global.css`, con los temas claro y oscuro (`prefers-color-scheme`, `prefers-contrast` y `forced-colors`) y un test que calcule el contraste de cada par. Se verifica con el test en verde (todos de 4.5:1 o más) y capturas en los dos temas a 390 y 1440 px.
- [ ] 2.2 Comparar dos o tres fuentes candidatas y elegir una con los dueños. Se verifica con capturas comparadas en `docs/brand.md` y el archivo de fuente de 40 KB o menos.
- [ ] 2.3 Pasar el logo a SVG, con favicon, `apple-icon` e imagen OG por idioma. Se verifica con los `<link>` en `/` y `/en` y sin 404 en consola.

## 3. Página principal

- [ ] 3.1 Escribir `content/es.ts` (forma de referencia) con promesa, servicios, proceso, por qué nosotros, preguntas frecuentes y contacto, a partir de los datos de los dueños. Se verifica con revisión de los dueños, que aprueban el texto.
- [ ] 3.2 Construir las secciones en `sections/`, mobile-first. Se verifica con capturas a 320, 390, 768, 1024, 1440 y 1920 px, sin desplazamiento horizontal, sin texto cortado y con objetivos táctiles de 44 px o más.
- [ ] 3.3 Añadir el botón de WhatsApp fijo en el teléfono y los llamados a la acción. Se verifica con el enlace `wa.me` y el mensaje prellenado probados en un teléfono real; el botón no tapa contenido a 390 px.
- [ ] 3.4 Escribir `content/en.ts`, tipado contra `es.ts`, y añadir la ruta `/en`. Se verifica con `pnpm typecheck`, que falla si falta una clave, y con revisión de los dueños.

## 4. Casos de éxito

- [ ] 4.1 Reunir con los dueños los datos y aprobaciones de cada caso, en `content/cases/<slug>.ts` con su registro de aprobaciones. Se verifica cuando cada caso publicado tiene problema, solución, resultado y aprobaciones completas.
- [ ] 4.2 Crear las páginas `/casos/[slug]` y `/en/case-studies/[slug]` y sus resúmenes en la principal. Se verifica con cada página respondiendo 200, con `canonical` y `hreflang` propios, y Lighthouse en 100.

- [ ] 4.3 Crear `content/clients.ts` como registro único de clientes, enlazarlo desde los casos y mostrar los aprobados en la prueba temprana, en el Markdown y en `llms.txt`; añadir la skill `add-client`. Se verifica con tests (cada caso apunta a un cliente que existe; un cliente sin aprobación no se construye) y con O&L visible en `/` y `/en`.

## 5. SEO y medición

- [ ] 5.1 Añadir metadatos, JSON-LD (`Organization`, `ProfessionalService`, `Service`, `FAQPage` y los casos), sitemap, `robots.txt` y `llms.txt` en cada idioma. Se verifica con el validador de Rich Results de Google sin errores y `/llms.txt` coincidiendo con la página.
- [x] 5.1b Generar la versión `.md` de cada página, anunciarla con `<link rel="alternate">` y servirla en la misma URL con `Accept: text/markdown` desde el Worker (`worker/index.ts`). (2026-10-14: verificado con `curl` en `wrangler dev` y en la vista previa de `workers.dev`, con `Vary: Accept`; tests del Worker.)
- [ ] 5.2 Medir sin cookies: cada vista de página escribe un punto en Workers Analytics Engine desde el Worker (página, origen, UTM, país, persona, bot o agente de IA), sin IP ni identificadores. Se verifica con el test del Worker (ya en verde) y con datos visibles tras activar Analytics Engine en el panel. Search Console y Bing Webmaster cuando el dominio esté en Cloudflare.
- [ ] 5.3 Pipeline: checks y Lighthouse en cada PR con vista previa propia en Cloudflare; despliegue de `main` solo con checks en verde, prueba rápida y reversión automática; monitoreo diario. Se verifica con un PR real (comentario con URL y resultados) y un merge que despliega.

## 6. Calidad

- [x] 6.1 Ejecutar `pnpm perf` en `/`, `/en` y cada caso. Se verifica con 100 en las cuatro categorías, en móvil y en escritorio, dentro de los presupuestos. (2026-10-14: 12/12 en 100, LCP móvil ≤ 757 ms; se repite en cada cambio visible y en 7.4.)
- [ ] 6.2 Revisar el código con `/code-review` y probar sin JavaScript, con movimiento reducido y con teclado. Se verifica con los hallazgos resueltos o justificados.

## 7. Publicación (al final, con visto bueno de los dueños)

- [ ] 7.1 Crear el repo público `taberoajorge/chambeasimple-web`, proteger `main` y añadir los secretos `CLOUDFLARE_API_TOKEN` (plantilla "Edit Cloudflare Workers") y `CLOUDFLARE_ACCOUNT_ID`, y la variable `SITE_URL`. Se verifica con un PR que produce su vista previa y un merge que produce producción.
- [ ] 7.2 Añadir `chambasimple.com` como zona en Cloudflare (plan gratis) y recrear en su DNS los registros del correo con SimpleLogin (2 MX, SPF, `sl-verification`, 3 CNAME de DKIM y DMARC), antes de tocar los nameservers. Se verifica con `dig` contra los nameservers de Cloudflare devolviendo exactamente los valores que hoy da Namecheap.
- [ ] 7.3 Cambiar los nameservers en Namecheap a los de Cloudflare, conectar `chambasimple.com` como dominio del Worker y redirigir `www` con 308. Se verifica con `dig NS` mostrando Cloudflare, `curl -I` (200 en el dominio y 308 en `www`), certificados válidos y un correo de prueba a `hola@chambasimple.com` que llega con SPF, DKIM y DMARC en `pass`.
- [ ] 7.4 Repetir `pnpm perf --url https://chambasimple.com` y la paridad en producción. Se verifica con los mismos umbrales que en local.
