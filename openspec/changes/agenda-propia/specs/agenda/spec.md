# Spec Delta

## Purpose

Que una empresa pase de "me interesa" a una conversación agendada en menos de un minuto, sin herramientas de pago y sin depender de que alguien conteste un correo.

## ADDED Requirements

### Requirement: Solo horarios en que los dos están libres
La agenda SHALL ofrecer bloques de 30 minutos dentro del horario laboral configurado (por defecto, de lunes a viernes de 9:00 a 18:00 en Lima), con al menos 24 horas de anticipación y como máximo 21 días hacia adelante. Un bloque MUST aparecer solo si los calendarios de Sandra y de Alex están libres, según `freeBusy`. Los horarios MUST mostrarse en la zona horaria del visitante, indicando cuál es.

#### Scenario: Uno de los dos está ocupado
- **WHEN** Sandra tiene un evento de 10:00 a 11:00 y Alex está libre
- **THEN** los bloques de 10:00 y 10:30 no se ofrecen

#### Scenario: Visitante en Ciudad de México
- **WHEN** alguien en Ciudad de México abre la agenda
- **THEN** ve los horarios en hora de Ciudad de México, con la zona indicada

### Requirement: Reserva con invitación y Meet
Al reservar, la agenda SHALL volver a consultar la disponibilidad del bloque y, si sigue libre, crear el evento en el calendario de Alex con un enlace de Google Meet, con Sandra y el visitante como invitados (`sendUpdates=all`). Si el bloque ya no está libre, MUST avisar al visitante y ofrecer los siguientes. El visitante MUST recibir la invitación de Google en su correo.

#### Scenario: Dos personas eligen el mismo bloque
- **WHEN** dos visitantes envían el mismo bloque casi a la vez
- **THEN** solo uno queda reservado, y el otro ve que ya no está disponible junto con nuevas opciones

### Requirement: Datos mínimos y privados
El formulario SHALL pedir solo nombre, empresa, correo y qué quiere resolver (máximo 500 caracteres). Esos datos MUST ir únicamente a la descripción del evento: ningún registro aparte, ni analítica con datos personales. El formulario MUST enlazar un aviso de privacidad (Ley 29733 en Perú, LFPDPPP en México) y validar las entradas en el servidor.

#### Scenario: Entrada inválida
- **WHEN** el correo no es válido o el texto supera 500 caracteres
- **THEN** no se crea ningún evento y el formulario dice qué corregir

### Requirement: Marca, accesibilidad y velocidad del sitio
La página de la agenda SHALL usar la paleta, la tipografía y los temas claro y oscuro del sitio. Lighthouse MUST dar 100 en Accessibility, Best Practices y SEO, y 95 o más en Performance, en móvil y escritorio. El JavaScript MUST limitarse a elegir día y hora, en 15 KB o menos comprimido. Sin JavaScript, la página MUST ofrecer el correo como alternativa.

#### Scenario: Teclado y lector de pantalla
- **WHEN** alguien reserva solo con el teclado
- **THEN** puede elegir día, hora y enviar, con el foco visible y cada horario anunciado con su fecha

### Requirement: Token vigilado
Una tarea diaria SHALL comprobar que el token de Google sigue siendo válido. Si falla, MUST enviar un aviso a `hola@chambasimple.com`, y la agenda MUST mostrar el correo como alternativa en lugar de los horarios.

#### Scenario: Token revocado
- **WHEN** Alex revoca el acceso de la aplicación en su cuenta de Google
- **THEN** al día siguiente llega el aviso, y la agenda ofrece el correo en vez de los horarios

### Requirement: Los datos de los clientes nunca quedan expuestos
La agenda SHALL exponer solo dos operaciones: consultar horarios libres (bloques sin ningún dato de otras reservas) y crear una reserva. Ninguna ruta MUST listar, leer ni exportar reservas, nombres o correos. Además:
- **Permisos de Google mínimos:** `calendar.app.created`, para un calendario secundario "Chambea Simple · Agenda" que la app crea y es lo único que puede leer o editar, y `calendar.freebusy`, que devuelve solo bloques ocupados, sin títulos ni invitados.
- **El token de Google** vive como secreto del Worker (cifrado, no legible por la API ni por el repo), nunca en KV, en el código ni en los logs.
- **Los logs y la analítica** no registran nombre, correo ni texto del visitante.

#### Scenario: Alguien intenta descargar las reservas
- **WHEN** se piden rutas como `/api/reservas`, `/api/eventos` o cualquier otra que no sea consultar horarios o reservar
- **THEN** responden 404 y no existe ninguna forma de obtener datos de otras reservas

#### Scenario: El token se filtra
- **WHEN** alguien obtiene el token de la agenda
- **THEN** solo ve el calendario secundario de la agenda, no el calendario personal de Alex, ni sus correos, ni el calendario de Sandra

### Requirement: Protección contra spam y abuso
La creación de reservas SHALL exigir:
- Cloudflare Turnstile, gratuito e invisible para la mayoría;
- un límite por IP con el binding de Rate Limiting de Workers (por defecto, 5 intentos cada 10 minutos);
- un campo trampa;
- validación en el servidor;
- como máximo 2 reservas por correo cada 7 días;
- un cuerpo de 4 KB como máximo;
- `POST` solo desde el propio origen.

Los horarios libres MUST servirse desde caché por 5 minutos, para que una ráfaga de visitas no consuma la cuota de Google.

#### Scenario: Ráfaga de reservas falsas
- **WHEN** un script envía 100 reservas en un minuto desde una IP
- **THEN** a partir del sexto intento recibe 429, no se crea ningún evento extra, y Google no recibe más de 5 consultas

### Requirement: Costo cero

La agenda SHALL funcionar dentro de los planes gratuitos de Cloudflare Workers (incluidos KV y Cron) y de la API de Google Calendar. Ninguna dependencia de pago.

#### Scenario: Tráfico normal
- **WHEN** la agenda recibe un tráfico normal para una consultora de dos personas
- **THEN** no aparece ningún cargo en Cloudflare ni en Google
