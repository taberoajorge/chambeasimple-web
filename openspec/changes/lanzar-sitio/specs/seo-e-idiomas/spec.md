# Spec Delta

## Purpose

Que Chambea Simple aparezca cuando una empresa busca "software a medida" en Google y cuando le pregunta a un asistente de IA, en español y en inglés.

## ADDED Requirements

### Requirement: Una URL por idioma
El español SHALL vivir en `/` y el inglés en `/en`, cada uno con su página estática y su `<html lang>`. Cada página MUST declarar su `canonical` y sus alternativas `hreflang` (`es`, `en`, `x-default` hacia el español). El cambio de idioma MUST ser un enlace normal. Para quien llega a `/` con el navegador en inglés, el sitio ofrece la versión en inglés con un aviso, sin redirigir: así los buscadores indexan las dos.

#### Scenario: hreflang
- **WHEN** se piden `/` y `/en`
- **THEN** cada una responde 200 con su `lang`, su `canonical` y los tres `hreflang`

### Requirement: Metadatos y datos estructurados
Cada página SHALL tener `title` y `description` propios, Open Graph y Twitter con una imagen generada por idioma, y JSON-LD válido:
- `Organization` y `ProfessionalService` en la principal (nombre, logo, área de servicio Perú y Latam, contacto, `sameAs`);
- `Service` por servicio;
- `FAQPage` con las preguntas frecuentes visibles;
- en cada caso, un `Article` que cite al cliente solo si su nombre está aprobado.

El validador de Rich Results de Google MUST darlo sin errores.

#### Scenario: FAQ como dato estructurado
- **WHEN** se valida el JSON-LD de `/`
- **THEN** `FAQPage` contiene exactamente las preguntas y respuestas visibles en la página

### Requirement: Sitemap, robots y llms.txt
El sitio SHALL servir:
- `sitemap.xml` con todas las páginas y sus alternativas de idioma;
- `robots.txt`, que permite todo y enlaza el sitemap;
- `/llms.txt` en Markdown, generado del mismo contenido: quiénes somos, servicios, cómo trabajamos, casos con su enlace, preguntas frecuentes y contacto, con enlace a la versión en inglés.

#### Scenario: llms.txt
- **WHEN** se pide `/llms.txt`
- **THEN** responde 200 en Markdown, y su texto coincide con el de la página

### Requirement: Legible por agentes de IA
Cada página SHALL tener su respuesta completa en el HTML servido, sin depender de JavaScript. Además:
- una versión en Markdown en la misma ruta con `.md` (por ejemplo `/index.md` o `/casos/<slug>.md`), anunciada con `<link rel="alternate" type="text/markdown">`;
- una petición con `Accept: text/markdown` recibe esa versión con `Content-Type: text/markdown; charset=utf-8` y `Vary: Accept`;
- `llms.txt` enlaza las versiones en Markdown;
- `robots.txt` no bloquea a los rastreadores de IA.

#### Scenario: Agente pidiendo Markdown
- **WHEN** un cliente pide `/` con `Accept: text/markdown`
- **THEN** recibe el Markdown de la página con `Content-Type: text/markdown` y `Vary: Accept`

#### Scenario: Agente sin JavaScript
- **WHEN** un cliente que no ejecuta JavaScript pide `/casos/<slug>`
- **THEN** el HTML ya contiene el problema, la solución y el contacto
