# Diseño: agenda propia

## Contexto
Investigación del 2026-10-14 (Exa, documentación de Google y Cloudflare, `gh`):
- **Calendly gratis:** conecta un solo calendario.
- **Citas de Google en cuentas personales:** una sola página de reservas; revisar varios calendarios o añadir coanfitriones requiere Google One Premium o Workspace.
- **Eventos colectivos de Cal.com, Zcal y Koalendar:** son de pago.
- **Cal.com:** cerró su código el 2026-04-14. El fork `cal.diy` (MIT) quitó los equipos y se declara "para uso personal, no producción".
- **Easy!Appointments (GPL, PHP), Tymeslot (AGPL, Elixir) y Rallly (AGPL, encuestas):** todos necesitan un servidor siempre encendido y una base de datos, sin un plan gratuito fiable.

Ninguna plantilla de GitHub resuelve "los dos libres + Meet + invitaciones" a costo cero. Lo más corto es construirlo sobre la API de Google Calendar.

## Decisiones

### 1. Un token, el de Alex
- **Lectura:** Sandra comparte con Alex su calendario en modo libre/ocupado. Con eso, una sola autorización de Alex sirve para leer los dos con `freeBusy.query` (alcance `calendar.freebusy`: solo bloques ocupados, sin títulos ni invitados).
- **Escritura:** el evento se crea en un calendario secundario "Chambea Simple · Agenda" que la app crea con el alcance `calendar.app.created`. Ese alcance solo da acceso a calendarios creados por la app: aunque el token se filtre, no se lee el calendario personal de nadie. El evento lleva `conferenceDataVersion=1` con `createRequest` de tipo `hangoutsMeet`, `attendees` (Alex, Sandra y el visitante) y `sendUpdates=all`.
- **Cuenta de Google:** no hace falta Workspace. Sirve la cuenta personal de Alex, o una cuenta de Google creada con `hola@chambasimple.com` ("usar mi dirección de correo actual", sin Gmail), que sería la organizadora de todas las reuniones. La segunda opción es más limpia: las invitaciones llegan de Chambea Simple, y el alias de SimpleLogin reenvía las respuestas a los dos.
- **Descartado: una cuenta de servicio.** Sin delegación de Workspace no puede invitar a nadie ni crear enlaces de Meet.
- **Por confirmar en la prueba:** si una invitación que Sandra aún no acepta cuenta como ocupado en su `freeBusy`. Si no cuenta, el Worker también revisa los eventos de la agenda en el calendario de Alex.

### 2. OAuth sin verificación, publicado en producción
- **El estado de prueba no sirve:** en "Testing", los tokens de actualización caducan a los 7 días.
- **Lo que se hace:** se publica la app en producción, se acepta una vez la pantalla de "app no verificada" y se autoriza después de publicar. Como solo autoriza Alex, entra en la excepción de uso personal (menos de 100 usuarios) y no necesita revisión de Google.
- **Alcances:** solo `calendar.app.created` y `calendar.freebusy`. Por confirmar en la prueba 1.2: que un evento en el calendario secundario acepte Meet e invitados.

### 3. Cloudflare Workers Free
- **Alojamiento:** el plan Hobby de Vercel prohíbe el uso comercial; el acuerdo de suscripción de Cloudflare no lo limita.
- **Lo que se usa:**
  - Workers con recursos estáticos, para la página y la API;
  - KV, para el token y un candado corto por bloque mientras se crea el evento;
  - Cron Triggers, para la revisión diaria del token.
- **Límites del plan gratis:** 100 000 peticiones al día, 10 ms de CPU por petición y 5 tareas programadas.

### 4. La página
- **Contenido:** HTML generado en el servidor, con la paleta y los tokens del sitio. Usa los mismos valores de `global.css`, copiados y comprobados por un test que compara ambos archivos.
- **JavaScript:** un script pequeño para elegir día y hora. Sin JavaScript, se ve la lista de días con sus horarios como enlaces y el correo como alternativa.
- **Idiomas:** español en `/` e inglés en `/en`, con el mismo `Content` tipado del sitio.

### 5. Avisos
Para avisar que el token murió se usa el mismo Google, enviando un correo con la API de Gmail. Eso amplía los alcances, así que hay que decidirlo en la implementación. La alternativa más simple es crear un evento de aviso en el calendario de Alex, que llega como notificación del propio Google sin alcances extra. Se empieza por esta.

### 6. MCP para los dueños
`nspady/google-calendar-mcp` (MIT, multi-cuenta) les permite a Sandra y a Alex ver y mover sus eventos desde sus agentes. No forma parte de la agenda pública. Se documenta en `docs/` como herramienta interna.

## Seguridad y costos
- **Sin cobros sorpresa:** la cuenta se queda en Workers Free, sin método de pago. Pasar los límites devuelve errores (429 o 1027), nunca cargos. Si algún día se pasa a Workers Paid, se configuran alertas de uso.
- **Abuso:** Turnstile, Rate Limiting por IP, campo trampa, límite por correo y caché de 5 minutos de los horarios (requisitos del spec). La protección DDoS de Cloudflare viene incluida en todos los planes.
- **Secretos:** el token de Google (`wrangler secret put`), la clave de Turnstile y el token de despliegue de GitHub Actions (plantilla "Edit Cloudflare Workers", limitado a esta cuenta). Nada en el repo: hooks y gitleaks lo bloquean.

## Riesgos
- **Cobro de la API de Calendar:** Google anunció un modelo de cobro con 90 días de aviso. Mitigación: volumen mínimo y un aviso en el panel de Google Cloud.
- **Token caído:** si se revoca o pasa seis meses sin uso, la agenda deja de funcionar. Mitigación: la revisión diaria y el correo como alternativa visible.
- **Spam de reservas:** límite por IP en KV, un campo trampa (*honeypot*) y Cloudflare Turnstile, que es gratis, solo si aparece abuso.
