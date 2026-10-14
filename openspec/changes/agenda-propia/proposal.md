# Agenda propia en agenda.chambasimple.com

## Why

El botón principal del sitio dice "Agenda una conversación", pero hoy abre un correo: el visitante escribe y espera. Los dueños no quieren pagar ninguna herramienta, y las gratuitas no cumplen lo esencial:
- **Calendly gratis:** conecta un solo calendario.
- **Citas de Google Calendar en cuentas personales:** no revisan la disponibilidad del segundo anfitrión.
- **Eventos colectivos de Cal.com, Zcal y Koalendar:** son de pago.

Los proyectos open source (cal.diy, Easy!Appointments, Tymeslot, Rallly) necesitan un servidor siempre encendido y una base de datos, que no existen gratis de forma fiable. Una agenda propia, pequeña y con la marca de Chambea Simple, resuelve el problema sin costo. Además sirve de muestra de lo que hacemos.

## What Changes

- **Página de reserva:** `agenda.chambasimple.com`, en español e inglés, con la paleta y los temas del sitio. Muestra solo los horarios en que Sandra y Alex están libres, en la zona horaria del visitante.
- **Al reservar:**
  - se crea el evento en el calendario de Alex con un enlace de Google Meet;
  - Sandra y el visitante van como invitados, y Google les envía la invitación;
  - el visitante deja nombre, empresa, correo y qué quiere resolver.
- **Servicio:** un Cloudflare Worker gratuito sobre la API de Google Calendar. Usa un solo token de Alex, guardado en Workers KV.
- **Robustez:** una tarea diaria comprueba que el token sigue vivo y avisa por correo si muere. Justo antes de crear el evento se vuelve a consultar la disponibilidad, para no reservar dos veces el mismo horario.
- **El sitio:** "Agenda una conversación" apunta a la agenda cuando existe; el correo queda como alternativa. El sitio sigue sin JavaScript.
- **Agentes de los dueños:** un MCP de Google Calendar (`nspady/google-calendar-mcp`, MIT) para gestionar sus propios calendarios. Es opcional y no lo usan los visitantes.

## Capabilities

### New Capabilities
- `agenda`: reserva de la conversación inicial, disponibilidad conjunta, invitaciones con Meet, privacidad de los datos del visitante y salud del token.

### Modified Capabilities
<!-- Ninguna: `contacto` y `repo-y-entrega` siguen dentro del cambio `lanzar-sitio`, que aún no se archiva. El enlace del botón principal se ajusta allí. -->

## Impact

- **Repo:** un paquete nuevo `agenda/` (Worker, página y tests) con su propio `wrangler.toml`. El sitio solo cambia el destino del botón principal (`content/site.ts`).
- **Cuentas, que crean los dueños:**
  - un proyecto de Google Cloud con la API de Calendar y un cliente OAuth publicado en producción, sin verificar (excepción de uso personal);
  - Cloudflare Free, con el subdominio.
- **Datos personales:** nombre, empresa y correo del visitante. Solo viajan a Google Calendar y no se guardan en otro lugar. Tienen su aviso de privacidad, por la Ley 29733 en Perú y la LFPDPPP en México.
- **Límites conocidos:**
  - la API de Calendar es gratis hoy y Google anunció un modelo de cobro con 90 días de aviso;
  - Meet en cuentas personales corta a los 60 minutos las llamadas de tres o más personas, y la conversación dura 30;
  - el token puede morir si se revoca o pasa seis meses sin uso.
