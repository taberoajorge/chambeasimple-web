# Tasks

## 1. Prueba de concepto (antes de construir)

- [x] 1.1 Con los dueños: proyecto de Google Cloud, API de Calendar activa, cliente OAuth publicado en producción. Sandra comparte su libre/ocupado con Alex. Se verifica con un script local que lista los bloques libres de los dos para la próxima semana.
- [x] 1.2 Crear un evento de prueba con Meet e invitados desde el script. Se verifica con la invitación recibida por Sandra y por un correo de prueba, con enlace de Meet, y con el bloque marcado como ocupado en la siguiente consulta, aunque Sandra aún no acepte.

## 2. Worker

- [x] 2.1 Crear `agenda/` con `wrangler.jsonc`, el Worker, el cálculo de bloques (horario laboral, anticipación, horizonte, zonas horarias) y sus tests. Se verifica con tests del cálculo: dos calendarios, cambio de día, Lima y Ciudad de México.
- [x] 2.2 Implementar la reserva: validación en el servidor, candado en KV, nueva consulta de disponibilidad y `events.insert`. Se verifica con tests contra un Google simulado (bloque tomado, entrada inválida, éxito) y una reserva real en la vista previa.
- [x] 2.2b Añadir Turnstile, Rate Limiting por IP, campo trampa, límite por correo y caché de horarios. Se verifica con tests (ráfaga de 100 envíos, correo repetido, token de Turnstile inválido) y con una prueba de que ninguna ruta devuelve datos de reservas.
- [x] 2.3 Añadir la revisión diaria del token y la alternativa por correo. Se verifica con un test del token inválido y con la página mostrando el correo.

(2026-10-14: 25 tests en `agenda/src`: horarios en Lima y Ciudad de México, Google simulado, trampas, límites, escape de HTML, rutas que no existen, token caído. Turnstile queda listo y se activa al poner su clave. La reserva real en la vista previa espera las credenciales de Google, 1.1 y 1.2. Desplegada en `chambeasimple-agenda.tools-tc136.workers.dev`; sin credenciales muestra el correo.)

## 3. Página

- [x] 3.1 Página en español e inglés con la marca, los temas y el selector de día y hora; aviso de privacidad. Se verifica con la skill `verify-ui` (390 y 1440 px, claro y oscuro, teclado, sin JS) y con Lighthouse en los umbrales del spec. (2026-10-16: la marca del encabezado quedó "chambasimple" en un solo hijo flex, para que el hueco del topbar no parta la palabra, y el selector de idioma pasó a relativo, para no salir del origen que sirve la página.)

## 4. Publicación (con visto bueno de los dueños)

- [x] 4.1 Desplegar en Cloudflare Workers Free con `agenda.chambasimple.com`. Se verifica con una reserva real de punta a punta.
- [x] 4.2 Apuntar "Agenda una conversación" del sitio a la agenda. Se verifica con los tests del contenido y `pnpm perf` en verde. (2026-10-16: con `pnpm dev` los botones abren la agenda local de `dev:agenda` (puerto 8788) y el sitio construido sigue apuntando a `agenda.chambasimple.com`; hay un test para cada rama.)
- [ ] 4.3 Documentar en `docs/` el MCP de Google Calendar para los dueños. Se verifica con los dos conectados desde su cliente.

## 5. Correo con nuestro dominio (2026-10-14)

- [x] 5.1 Las invitaciones de Google salían como `hola@` firmadas por `google.com` y fallaban el DMARC estricto (SimpleLogin las marcaba como phishing). La agenda envía ahora sus propios correos con Resend (plan gratis), firmados como `chambasimple.com`: confirmación al cliente con invitación `.ics` y aviso a `agenda@` con el origen del botón. Google crea el evento y el Meet con `sendUpdates=none`. Se verificó con una reserva real: los dos correos llegaron sin alerta.
