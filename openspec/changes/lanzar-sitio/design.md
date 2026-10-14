# Design

## Context

- **Situación:** Chambea Simple no tiene sitio. El dominio `chambasimple.com` está en Namecheap con sus DNS por defecto y no apunta a nada.
- **Marca:** el logo usa tres colores, que se midieron sobre el propio logo:

  | Color | Valor |
  |---|---|
  | Fondo casi negro verdoso | `#02130F` |
  | Verde menta | `#62F0BB` |
  | Texto | blanco |

  El lema es "Hacemos software para la buena chamba".
- **Base técnica:** `taberoa-portfolio` ya resolvió:
  - Lighthouse 100 en las cuatro categorías;
  - SEO por idioma y `llms.txt`;
  - hooks para agentes;
  - CI;
  - entrega por PR y despliegue en Vercel.

  Este repo parte de ahí.

### Lo que dice la investigación (Exa, 2026-10-14)

- **Lo que más pesa en un rediseño.** Las consultoras que rediseñaron su sitio con promesa clara, prueba temprana, proceso explicado y casos fuertes multiplicaron sus contactos:
  - 7Factor: +467 % de formularios enviados y +63 % de tráfico orgánico;
  - Callstack: +176 % de conversión y Lighthouse de 34 a 90.
- **Lo que pide el visitante.** En la página de inicio quiere saber en segundos si somos confiables (logos, cifras), qué pasa después de decir que sí (un proceso en pasos) y cuál es el siguiente paso sin riesgo. La sección de testimonios es la más débil en promedio, y en 144 sitios de software analizados es la que más diferencia marca.
- **Cómo se escribe un caso.** El formato que convence:
  1. un titular que empieza por el resultado;
  2. el problema;
  3. las restricciones;
  4. lo que se construyó y con qué tecnología;
  5. las decisiones y lo que quedó fuera;
  6. una tabla antes/después con cifras que tengan punto de partida y periodo;
  7. una cita con nombre y cargo.

  Sin cifra medida, se describe el cambio observado y no se inventa un porcentaje. Cada caso va en su propia página indexable, no en un PDF.
- **El mercado en Perú.** Los competidores más cercanos a nuestro tamaño:
  - Booster: primer módulo en 10 días, precio en dólares publicado, "el código es tuyo", tres personas apoyadas en agentes de IA, sesión gratuita de 30 minutos y WhatsApp;
  - Innova Total: "casa de software peruana", facturación SUNAT, agentes de IA en WhatsApp, diagnóstico de 30 minutos;
  - Altimea: 28 años de trayectoria, precios desde USD 2,990 y preguntas frecuentes escritas para buscadores de IA.

  El diferencial que se repite es trato directo, código propiedad del cliente, entregas frecuentes y un rango de precio a la vista.

## Goals / Non-Goals

**Goals:**
- Una página principal en español y en inglés que convierta: promesa, prueba, servicios, proceso, casos, por qué nosotros, quiénes somos, preguntas frecuentes y contacto.
- Casos con evidencia real y su propia página.
- El mismo estándar técnico que el portafolio, mobile-first.

**Non-Goals:**
- Sin blog ni CMS en el lanzamiento. El contenido vive en el repo; un CMS se añade si los dueños publican a menudo.
- Sin formulario con backend en el lanzamiento: WhatsApp y correo cubren el contacto. Un formulario con Resend se añade si hace falta filtrar los pedidos.
- Sin páginas por servicio en el lanzamiento. Se añaden en una segunda fase, cuando haya contenido propio para cada búsqueda (por ejemplo "software a medida Lima" o "CRM a medida").
- Sin figuras isométricas animadas en el lanzamiento. Una ilustración de marca puede venir después, con el mismo motor del portafolio.

## Decisions

### 1. Stack: Astro 7, estático, en Vercel
- **Elegido:** Astro 7 en modo estático, con Tailwind 4, Biome y pnpm, sobre Node 24, desplegado en Vercel.
- **Por qué no Next.js como en el portafolio:** este sitio es contenido, no una aplicación.
  - Astro manda HTML con cero JavaScript por defecto. Next.js carga siempre su runtime (80–120 KB); en el portafolio hubo que diferir las figuras para quedar dentro de presupuesto.
  - En comparaciones medidas de 2026, Astro saca de forma constante Lighthouse 95–100 en sitios de contenido, contra 80–90 de Next.js, con alrededor de un 90 % menos de JS.
  - Las colecciones de contenido de Astro validan con esquemas los casos y los idiomas, y el hreflang por archivo es más simple.
  - Vercel lo despliega de forma nativa (vistas previas, Web Analytics).
  - Next.js gana cuando el sitio es una aplicación (login, paneles). Si algún día Chambea Simple tiene un portal de clientes, irá en un subdominio aparte.
- **Astro 7** (estable, octubre de 2026): Vite 8 y compilador en Rust, que rechaza HTML sin cerrar o mal anidado; se aprovecha como validación gratis del marcado.
- **Interactividad:** solo islas pequeñas cuando hagan falta (por ejemplo el menú del teléfono), con `<details>` y CSS antes que JS.

### 1b. Versiones (verificadas el 2026-10-14 con npm, Context7 y Exa)

| Pieza | Versión | Por qué esa |
|---|---|---|
| Astro | 7.3.8 | La última; Vite 8 y compilador en Rust. |
| `@astrojs/sitemap` | 3.7.4 | La última. |
| Tailwind CSS (`@tailwindcss/vite`) | 4.3.3 | La última. |
| TypeScript | 6.0.3 | La 7.0.2 existe, pero `@astrojs/check` 0.9.10 solo declara `^5 \|\| ^6`. Se sube cuando lo soporte. |
| Node | 24 (LTS) | Vercel construye con 22 y 24. Node 26 solo está en Vercel Sandbox. Astro 7 pide 22.12 o más. |
| pnpm | 10.34.7 | La 12.11 es la última, pero Vercel solo soporta pnpm hasta la 10 (issue vercel/vercel#17434 abierto para la 11 y la 12). Se sube cuando Vercel lo soporte. |
| Biome | 2.5.15 | La última; configuración migrada con `biome migrate`. |
| Knip | 6.41.0 | La última; tiene plugin de Astro. |
| Lighthouse (para `pnpm perf`) | 13.5.0 | La última. |
| `chrome-devtools-mcp` | 1.10.1 | La última; trae `lighthouse_audit` y las trazas de rendimiento. |
| `@types/node` | 24.19.2 | La última de la rama 24, igual que el runtime. |

Dependabot (semanal) propone las actualizaciones, y los límites de esta tabla se revisan en cada una.

### 2. Estructura
```
src/
  pages/      index.astro (es), en/index.astro, casos/[slug].astro, en/case-studies/[slug].astro,
              las versiones .md de cada página, llms.txt, robots.txt; sitemap con @astrojs/sitemap
  layouts/    Base.astro (head, meta, hreflang, JSON-LD, temas)
  sections/   Hero, Proof, Solutions, Process, Cases, Why, Team, Faq, Contact, StickyCta
  content/    es.ts (forma de referencia, idioma por defecto), en.ts (tipado contra es),
              site.ts (contacto, redes, empresa, precio), casos en una colección con esquema
  styles/     tokens.css (temas), global.css
scripts/      heredados del portafolio: bootstrap, port, run, checks (boundaries, parity, perf), commit-msg, delivery, agent-hooks
```
- Fronteras: `pages` → `layouts`, `sections` y `content`; `sections` no importa `pages`; `content` no importa nada de `src/`.
- Cada caso es un archivo con sus dos idiomas y su registro de aprobaciones.

### 3. Identidad visual y temas
- **Tema según el sistema.** Claro u oscuro según `prefers-color-scheme`, con `color-scheme: light dark` y variables CSS; sin JS ni parpadeo. No hay interruptor manual en el lanzamiento: se añade si los visitantes lo piden.
- **Tokens medidos:**

  | Par | Contraste |
  |---|---|
  | Oscuro: texto `#EFFBF6` / fondo `#02130F` | 18,0:1 |
  | Oscuro: secundario `#A3B8B0` | 9,1:1 |
  | Oscuro: menta como texto `#62F0BB` | 13,3:1 |
  | Claro: texto `#02130F` / fondo `#F7FBF9` | 18,3:1 |
  | Claro: secundario `#4A5E57` | 6,6:1 |
  | Claro: acento `#0A6B4B` | 6,3:1 |
  | Botón: texto `#02130F` sobre menta `#62F0BB` | 13,3:1 |

- **Regla de oro:** el menta sobre blanco da 1,4:1, así que en el tema claro nunca es texto. Solo es el relleno del botón principal (igual en los dos temas, para que la acción se reconozca siempre) y algún acento decorativo.
- **UX del llamado a la acción:**
  - una sola acción principal ("Agenda una conversación") con un solo estilo;
  - las secundarias como enlace o contorno;
  - en el teléfono, una barra inferior fija con la acción, que reserva su espacio para no tapar contenido.
- **Profesional y "cómo trabajamos" a la vista.** El proceso en cinco pasos es el corazón de la página: una línea de tiempo con lo que recibe el cliente en cada paso y el punto de decisión destacado. Va justo después de "Qué resolvemos" y antes de los casos.
- **Tipografía:** una sola familia variable, autoalojada con `next/font` y en subconjunto latino, de 40 KB o menos. Se eligen dos o tres candidatas cercanas al logo (sans geométrica redondeada, en negrita) y se comparan en capturas antes de decidir.
- **Detalle de marca:** el trazo "✓" del logo (las dos rayas menta) se usa con moderación en títulos y botones.

### 3b. Legible por agentes
- **El HTML ya trae todo.** Astro estático ya sirve el contenido completo en el HTML; es lo que más cuenta para agentes que no ejecutan JS (datos de Vercel, 2026).
- **Versiones en Markdown.** Cada página se genera también como `.md` desde el mismo contenido, en una ruta estática de Astro. Se anuncia con `<link rel="alternate" type="text/markdown">`.
- **Negociación de contenido.** Una regla en `vercel.json` (`rewrites` con condición `has` sobre la cabecera `accept`) sirve el `.md` cuando el cliente pide `text/markdown`, con `Vary: Accept`. Sin funciones de servidor.
- **Por qué vale la pena:** en los estudios de Vercel, el 65 % de las peticiones de agentes pedían Markdown. Claude Code, Cursor y OpenCode ya lo piden.
- **`llms.txt` por idioma** enlaza esas versiones en Markdown. No hay `llms-full.txt`: en un sitio comercial no aporta.
- **Rastreadores:** `robots.txt` no bloquea a ninguno.

### 3c. Harness y verificación continua
- **Dos niveles:**
  - **mientras se trabaja:** el MCP de Chrome DevTools (`chrome-devtools-mcp@1.10.1`, con `--isolated` y `--performance-crux=false`). El agente corre `lighthouse_audit` (accesibilidad, SEO y buenas prácticas), trazas de rendimiento con *insights*, revisa la consola y toma capturas, emulando teléfono y tema claro u oscuro;
  - **como compuerta:** `pnpm perf` (Lighthouse CLI en versión fija: las cuatro categorías en `/`, `/en` y cada caso, en móvil y escritorio, más los presupuestos), local, en el pre-push y en CI.
- **Hooks:** el script de hooks del portafolio con un segundo certificado (`perf`) guardado en `.git/agent-hooks/`. Lo exige el hook de cierre cuando cambian archivos que afectan a la página. El de inicio muestra el último resultado.
- **Configuración por cliente:** un archivo MCP de proyecto por cliente, todos con el mismo comando y la misma versión. Esto cambia una decisión del portafolio (allí no había MCP de proyecto): aquí verificar el 100 forma parte del trabajo diario.
- **La skill `verify-ui`** se reescribe para este sitio: la secuencia con el MCP, los anchos (320, 390, 768, 1440 y 1920 px), los temas, sin JS y con teclado.

### 4. Contenido y casos
- La página principal se escribe en español y se adapta al inglés; no es una traducción literal.
- **Qué resolvemos, en vez de servicios.** Chambea Simple no vende un catálogo: hace soluciones a la medida. La sección agrupa los problemas que ya resolvió y enlaza cada uno al caso que lo prueba:
  - investigación y búsqueda con IA → O&L e inmuebles;
  - seguimiento y conversaciones → inmuebles;
  - sistemas internos y CRM → el job CRM;
  - integraciones.

  Así cada afirmación tiene su prueba al lado. Los datos estructurados `Service` se generan desde estos grupos.
- **Precio.** Booster y Altimea publican un "desde"; las demás consultoras, solo el método. Se muestran las dos cosas: el método (cotización por etapas después del entendimiento, pagos por hito, punto de decisión, costos de operación del cliente) y, si los dueños lo fijan, un rango de partida para una primera versión. Las cifras van en soles y en dólares. Los precios cobrados a clientes no sirven de referencia y no se publican. Por ahora el rango queda vacío y solo se explica el método; los dueños lo fijan cuando tengan la empresa y una tarifa estable. No se cita ningún precio de cliente.
- **Empresa en constitución.** El nombre "Chambea Simple" ya está reservado; el RUC está en trámite. La razón social, el RUC y la factura electrónica son campos de `content/site.ts`. Vacíos, no aparecen en ninguna parte; rellenos, salen en el pie, en una pregunta frecuente y en el JSON-LD (`legalName`, `taxID`), sin tocar código.
- **Modelo de trabajo visible.** La propuesta a O&L muestra cómo trabaja Chambea Simple, y eso se lleva al proceso de la página como forma de trabajar general, sin datos del cliente:
  - etapas con sesiones y entregables (definición, prueba de fuentes, implementación, validación y entrega);
  - un **punto de decisión** antes de construir;
  - una ronda de ajustes por etapa;
  - pagos por hito;
  - costos de operación a nombre del cliente.
- **Casos de lanzamiento:**
  - **O&L Asesores:** el back office de vencimientos (en producción) y el buscador de prospectos (en curso), con permiso de O&L para citarlos.
  - **CRM de búsqueda de empleo** (`job.taberoa.com`): hay datos verificables en su repo: CRM móvil con Vite, React y Supabase; login con Clerk; herramientas MCP para agentes de IA; Edge Functions; un ciclo de investigación de empresas; restauración verificada de 93 empleos y 92 contactos. Se redacta como caso de producto propio y se aprueba antes de publicar.

### 4b. Quiénes somos
- Sandra Arroyo y Alex Taberoa, con su rol, una bio de 40 a 80 palabras basada en sus perfiles públicos y el enlace a su LinkedIn. Cada uno aprueba su texto.
- La sección va abajo en la página: un estudio de CXL encontró que una foto del fundador en la portada baja la percepción de profesionalismo y de tamaño. Fotos reales y consistentes, nunca de banco, cuando las tengan.
- Las bios no nombran clientes, montos ni métricas internas de ningún empleador.
- Los perfiles de LinkedIn deben mencionar Chambea Simple antes de difundir el sitio (decisión de los dueños, fuera del repo).

### 5. Contacto
- **Sin número todavía:** el contacto principal es `hola@chambasimple.com`, con el asunto prellenado. El número de WhatsApp es un campo opcional en `content/site.ts`; si está vacío, no aparece ningún botón de WhatsApp.
- **WhatsApp, cuando haya número:** `https://wa.me/<número>?text=<mensaje por idioma>`.
- **WhatsApp en proyectos de clientes:** el proyecto de departamentos usó un conector de WhatsApp de GitHub, que no es la API oficial de Meta. Para clientes se ofrece la API oficial de WhatsApp Business: sus condiciones permiten la automatización, y es lo que destacan competidores como Innova Total. El caso no nombra el conector.
- **Correo:** `mailto:` a una dirección del dominio, que exige configurar antes el correo del dominio.
- **Llamada:** el diagnóstico de 30 minutos se ofrece como el primer paso del proceso.
- **Medición:** Vercel Web Analytics, sin cookies, con eventos personalizados en los clics de contacto.

### 6. Dominio y despliegue
- **Al final y con visto bueno:**
  1. crear el proyecto de Vercel conectado a `taberoajorge/chambeasimple-web`;
  2. añadir `chambasimple.com` y `www.chambasimple.com` (redirección 308);
  3. cambiar en Namecheap los nameservers a `ns1.vercel-dns.com` y `ns2.vercel-dns.com`.
- **Correo del dominio:** si se usa (Google Workspace, Zoho o el buzón de Resend), sus registros se crean en el DNS de Vercel antes de publicar la dirección.

## Risks / Trade-offs

- **Lanzar sin casos completos.** → La sección muestra solo los casos listos. Lanzar con uno sólido es mejor que con tres flojos.
- **El dominio sin "e" no coincide con el logo.** Es una decisión de los dueños. → Quien escriba `chambeasimple.com` no llegará. Se puede registrar después y redirigir si se ve que pasa.
- **Una fuente web cuesta rendimiento.** → Una sola familia en subconjunto latino con `display: swap` y métricas de respaldo, dentro del presupuesto.
- **El contenido en inglés duplica la revisión.** → `en.ts` tipado contra `es.ts` impide que falte una sección. La revisión de estilo la hacen los dueños.

## Migration Plan

1. Base del repo (herramientas del portafolio adaptadas) con `pnpm check` en verde.
2. Tokens, tipografía y estructura de secciones con contenido real en español; las secciones sin datos quedan fuera.
3. Inglés, SEO, `llms.txt` y casos listos.
4. `pnpm perf` en 100 y revisión de código.
5. Repo público, Vercel, nameservers y verificación en producción, con visto bueno.

## Open Questions

Ya resuelto: el correo `hola@chambasimple.com` (SimpleLogin), los LinkedIn de los dos, el nombre público de Alex, el permiso para nombrar y citar a O&L con su web (la propuesta no se publica: precios y condiciones son del cliente), la descripción del proyecto de departamentos y el RUC (en trámite, no se muestra).

Las responden los dueños:
- **WhatsApp:** el número, cuando exista.
- **Equipo:** fotos coherentes (o lanzar sin ellas), la aprobación de cada bio y lo de alinear LinkedIn (4b).
- **Proyecto inmobiliario:** confirmar que fue un proyecto propio y, si se puede, alguna captura con los datos privados ocultos.
- **Precio y empresa (cuando exista):** el rango de partida en soles y dólares, la razón social, el RUC y si emiten factura. Todo se activa rellenando datos, sin cambiar el diseño.

### Notas de implementación (2026-10-14)
- **Negociación de Markdown:** en Vercel el sistema de archivos gana a `rewrites`, así que con `cleanUrls` una regla por `Accept` nunca llegaría a `/en`. `vercel.json` usa `routes`: redirecciones de `.html` y barra final, la regla por `Accept: text/markdown` antes de `{ "handle": "filesystem" }` y, después, `/<ruta>` → `/<ruta>.html`. `has` no funciona en `vercel dev`: se comprueba en la primera vista previa (5.1b).
- **Puertos:** la copia principal usa 3400 y los worktrees 3401–3499, para no chocar con el portafolio (3302) ni con la principal.
- **Biome:** lint completo de `.astro` (`html.experimentalFullSupportEnabled`), con el formateador de HTML apagado porque no es estable entre ejecuciones.
- **Alojamiento, por decidir con los dueños:** el plan Hobby de Vercel es solo para uso personal no comercial; "anunciar la venta de un servicio" cuenta como comercial (vercel.com/docs/limits/fair-use-guidelines). Para este sitio hay dos opciones: Vercel Pro (20 USD al mes) o Cloudflare (Workers con recursos estáticos y DNS gratis, sin restricción comercial en su acuerdo de suscripción). Recomendación: Cloudflare, junto con la agenda (`agenda-propia`). La negociación de Markdown pasa a un Worker pequeño, y los registros de SimpleLogin se recrean en el DNS de Cloudflare en lugar del de Vercel. **Decidido el 2026-10-14 (Alex): Cloudflare.** `repo-y-entrega` ya lo refleja.
