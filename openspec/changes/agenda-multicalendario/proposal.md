# Proposal

## Why

La agenda ofrece horarios mirando un solo calendario, el de la cuenta del estudio (`hola@chambasimple.com`), que nadie usa como agenda diaria. Los dueños trabajan fuera de la consultoría en sus propios calendarios, así que la agenda propone horas en las que ya están ocupados. `hola@` es un alias de SimpleLogin: reparte correo, no une calendarios.

## What Changes

- La disponibilidad pasa a ser la unión de varios calendarios, no de uno: el del estudio (`hola@chambasimple.com`) y los calendarios de trabajo de los dueños (`sandra@chambasimple.com`, `alex@chambasimple.com`, `sandrarap.15@gmail.com`, `taberoa@pm.me`), cada uno compartido a la cuenta del estudio en modo «ver solo libre/ocupado».
- Si `freeBusy` no puede leer alguno de esos calendarios, la agenda muestra el correo como alternativa en lugar de ofrecer horarios, al mostrarla y al reservar. Hoy eso es un error de servidor sin mensaje.
- Agregar o quitar a una persona pasa a ser una operación explícita de tres pasos (alias de correo, compartir su calendario, agregar su id), documentada, en vez de depender de un alias.

## Capabilities

### New Capabilities
<!-- Ninguna. -->

### Modified Capabilities
- `agenda`: la disponibilidad se calcula sobre varios calendarios compartidos al estudio, y la agenda degrada al correo cuando no puede verificar la disponibilidad. También se precisa el alcance del token, que ahora ve bloques ocupados de varios calendarios.

## Impact

- **Repo:** `agenda/wrangler.jsonc` (la lista `PEOPLE`), `agenda/src/index.ts` (degradación al correo), y los comentarios de `agenda/src/google.ts`; tests en `agenda/src/index.test.ts`. Sin cambios en el sitio ni en la página.
- **Fuera del repo:** cada dueño comparte su calendario con `hola@chambasimple.com` como «ver solo libre/ocupado». La ocupación que la agenda lee es la de esos calendarios de Google; lo que esté solo en otro proveedor no cuenta.
- **Alcance del token:** sin cambios de scopes. Sigue siendo `calendar.freebusy` + `calendar.app.created`: más calendarios, pero nunca títulos ni invitados.
- **Orden de archivado:** este cambio MODIFICA requisitos del cambio pendiente `agenda-propia`, que aún no se archivó. Este cambio se archiva después.
