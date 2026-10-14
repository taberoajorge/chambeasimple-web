# Proposal

## Why

Chambea Simple (Sandra y Jorge) tiene el dominio `chambasimple.com` en Namecheap y todavía no tiene sitio. Las empresas que contratan software a la medida deciden por confianza: si entienden en segundos qué hacemos, ven trabajo real con resultados y tienen un siguiente paso fácil. La investigación de consultoras de software (ver `design.md`) muestra lo mismo una y otra vez:

- **Rediseños con datos.** Al rediseñar sus sitios con esas piezas, consultoras como 7Factor y Callstack multiplicaron sus contactos: +467 % de formularios enviados y +176 % de conversión.
- **Las piezas que convierten.** Una promesa clara, prueba temprana, un proceso explicado paso a paso, casos con problema → solución → resultado, preguntas frecuentes y un contacto de bajo riesgo.
- **El mercado peruano.** Los competidores que más se acercan a nuestro tamaño (Booster, Innova Total, Altimea) compiten con eso mismo: primera entrega en días, "el código es tuyo", trato directo con quien construye, rango de precio visible y una llamada gratis de 30 minutos.

Queremos el mismo estándar técnico que el portafolio de Jorge: rápido (Lighthouse 100), bien posicionado en buscadores clásicos y de IA, accesible y listo para que agentes de IA trabajen el repo.

## What Changes

- **Repositorio nuevo** `taberoajorge/chambeasimple-web`, con la misma base que `taberoa-portfolio`:
  - instrucciones para agentes;
  - skills y hooks comunes a todos los clientes de agentes;
  - bootstrap para worktrees y Orca;
  - CI;
  - commits y PRs con reglas;
  - presupuestos de rendimiento.
- **Sitio bilingüe, de una página principal**, con español en `/` e inglés en `/en`. Secciones:
  1. Promesa: lo que hacemos y para quién.
  2. Prueba temprana.
  3. Qué resolvemos: soluciones a la medida, no un catálogo, con cada tipo de problema enlazado a su caso.
  4. Cómo trabajamos: sesiones de entendimiento, propuesta por etapas, prueba con punto de decisión, construcción iterativa y traspaso; con el precio explicado.
  5. Casos de éxito.
  6. Por qué nosotros.
  7. Quiénes somos.
  8. Preguntas frecuentes.
  9. Contacto.
- **Páginas de casos y proyectos**, una por cada uno, indexables. Solo con datos reales y aprobados:
  - **O&L Asesores** ([oylasesores.com](https://www.oylasesores.com/), gestión migratoria corporativa): un buscador de prospectos B2B con IA. Es un **proyecto en curso** (propuesta del 14 de octubre de 2026); se publica como tal, sin resultados y sin precios del cliente;
  - **CRM de búsqueda de empleo** (`job.taberoa.com`): producto propio en producción;
  - **búsqueda y seguimiento de departamentos y proyectos inmobiliarios con IA**: encuentra opciones que cumplen requisitos concretos y lleva por WhatsApp las conversaciones, el seguimiento y la negociación con las inmobiliarias (producto propio).
- **Quiénes somos**, con Sandra Arroyo y Alex Taberoa, su experiencia y su LinkedIn. Va abajo en la página, no en la primera pantalla.
- **Contacto:** `hola@chambasimple.com` para informes, los LinkedIn de los dos y una llamada gratis de 30 minutos. El WhatsApp se añade cuando haya número; el sitio lanza sin él.
- **Identidad visual** sacada del logo: fondo casi negro verdoso, verde menta y blanco; tema oscuro primero, *mobile-first* y con escritorio al mismo nivel.
- **SEO técnico completo**:
  - URL por idioma con `hreflang` y `canonical`;
  - JSON-LD (`Organization`/`ProfessionalService`, `Service`, `FAQPage` y los casos);
  - `sitemap.xml`, `robots.txt`, `llms.txt` en cada idioma e imágenes OG.
- **Despliegue** en Cloudflare (Worker con recursos estáticos, plan gratis) con `chambasimple.com`. El DNS pasa de Namecheap a Cloudflare para automatizar dominios, certificados, despliegues y medición. Vercel quedó descartado: su plan gratis prohíbe el uso comercial.

## Capabilities

### New Capabilities
- `sitio-comercial`: la página principal, sus secciones, el contenido por idioma y el comportamiento móvil y de escritorio.
- `casos-de-exito`: el formato de cada caso, su página propia, las reglas de evidencia y cómo aparecen en la principal.
- `contacto`: los canales (WhatsApp, correo, llamada), dónde aparecen y qué se mide.
- `seo-e-idiomas`: las URL por idioma, los metadatos, los datos estructurados, el sitemap, robots y `llms.txt`.
- `rendimiento-y-accesibilidad`: Lighthouse 100, los presupuestos de carga, la tipografía y la accesibilidad.
- `repo-y-entrega`: la base AI-native heredada del portafolio, CI, Cloudflare y el traspaso de DNS.

### Modified Capabilities
<!-- Ninguna: el repositorio es nuevo. -->

## Impact

- **Código:** repositorio nuevo; nada cambia en `taberoa-portfolio`. Las herramientas del portafolio (scripts de checks, hooks, delivery, bootstrap, CI) se copian y se adaptan. No se comparten como paquete: son pocos archivos, y compartirlos ataría los dos proyectos.
- **Dominio:** `chambasimple.com` (sin "e", decisión de los dueños). Hoy no tiene web, pero sí correo: `hola@chambasimple.com` funciona con SimpleLogin, mediante MX, SPF, tres DKIM, DMARC y un TXT de verificación en el DNS de Namecheap. Los nameservers pasan a Vercel al final, con visto bueno de los dueños y solo después de recrear esos registros en Vercel; si no, el correo deja de llegar.
- **Ya aportado por los dueños:**
  - el correo `hola@chambasimple.com`;
  - los LinkedIn de Jorge (`taberoajorge`) y Sandra (`sandiroar`);
  - la propuesta para O&L, el permiso para nombrarla con su web y la conformidad de Josué para citarla;
  - el nombre público de Jorge: "Alex Taberoa";
  - la descripción del proyecto de departamentos.

  El RUC está en trámite: no se muestra hasta tenerlo.
- **Pendiente de los dueños:**
  - el número de WhatsApp (cuando exista);
  - las fotos, o la decisión de lanzar sin ellas;
  - alinear sus LinkedIn con Chambea Simple antes de enlazarlos (ver `design.md`, 4b);
  - cuando la empresa exista: razón social, RUC y factura electrónica, y el rango de partida en soles y dólares. Hasta entonces el sitio explica el método sin cifras ni datos legales.
