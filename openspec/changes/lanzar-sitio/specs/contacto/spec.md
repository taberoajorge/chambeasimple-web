# Spec Delta

## Purpose

Que contactarnos sea el paso más fácil de la página. En Perú y Latam el canal natural es WhatsApp, y las consultoras que mejor convierten ofrecen un primer paso sin riesgo: un diagnóstico gratuito de 30 minutos.

## ADDED Requirements

### Requirement: Canales de contacto
El sitio SHALL ofrecir:
- **correo de informes** `hola@chambasimple.com`, con un `mailto:`; es el contacto principal mientras no haya WhatsApp;
- **WhatsApp** con un enlace `wa.me` y un mensaje inicial prellenado en el idioma de la página, en cuanto exista el número. Sin número, el sitio MUST NOT mostrar ningún botón de WhatsApp;
- **las personas:** Sandra Arroyo y Alex Taberoa con su LinkedIn (`linkedin.com/in/sandiroar` y `linkedin.com/in/taberoajorge`);
- **una llamada de diagnóstico de 30 minutos**, gratuita y sin compromiso, que se agenda por WhatsApp o correo.

Los datos de contacto MUST vivir en un solo archivo de datos del sitio.

#### Scenario: Lanzamiento sin WhatsApp
- **WHEN** el archivo de datos del sitio no tiene número de WhatsApp
- **THEN** el botón principal abre un correo a `hola@chambasimple.com` con el asunto prellenado, y no aparece ningún botón de WhatsApp

#### Scenario: WhatsApp desde el teléfono
- **WHEN** ya hay número y alguien toca el botón de WhatsApp en `/`
- **THEN** se abre WhatsApp con el número de Chambea Simple y un mensaje en español listo para enviar

### Requirement: Contacto siempre a mano
El contacto principal (WhatsApp si existe; si no, correo) SHALL estar en la primera pantalla, al final de cada caso y en el cierre de la página. En el teléfono MUST además verse siempre un acceso al contacto que no tape contenido ni botones.

#### Scenario: Leyendo un caso en el teléfono
- **WHEN** alguien llega al final de una página de caso a 390 px
- **THEN** tiene a la vista un llamado a contactar

### Requirement: Medir sin rastrear
El sitio SHALL medir cada vista de página desde el servidor (el Worker, en Workers Analytics Engine), con página, sitio de origen, UTM, país y tipo de visitante (persona, bot o agente de IA). No MUST guardar IP, cookies, el user agent completo ni otro dato que identifique a alguien, así que no hace falta banner de cookies. El sitio MUST NOT cargar scripts de analítica ni píxeles de anuncios. Las conversiones (reservas) se miden en la agenda y solo se envían a plataformas de anuncios, por sus APIs de servidor, con un consentimiento explícito y separado (`docs/medicion-y-anuncios.md`).

#### Scenario: Vista medida sin rastrear
- **WHEN** alguien abre `/en?utm_source=google&utm_medium=cpc`
- **THEN** se registra un punto con `/en`, el origen, `google`, `cpc`, su país y "persona", sin IP ni cookies, y la página no carga ningún script
