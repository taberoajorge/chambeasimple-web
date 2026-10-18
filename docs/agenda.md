# Agenda de chambasimple.com

La agenda vive aparte del sitio: el Worker `agenda/`, servido en `agenda.chambasimple.com`. Calcula la
disponibilidad con `freeBusy` de Google sobre varios calendarios, ofrece bloques de 30 minutos dentro
del horario laboral (lunes a viernes, 9:00 a 18:00 en Lima, con 24 horas de anticipación y 21 días de
horizonte) y crea el evento con Meet en su propio calendario secundario.

## Qué calendarios cuentan

La ocupación es la **unión** de todos los calendarios de `PEOPLE` (`agenda/wrangler.jsonc`) más el
calendario de la agenda. Un bloque ocupado en cualquiera de ellos quita el horario.

| Calendario | Para qué |
|---|---|
| `hola@chambasimple.com` | El del estudio: cierres, vacaciones y bloqueos sueltos. |
| Los de Sandra y Alex | Su trabajo real, dentro y fuera de la consultoría. |

Cada uno de esos calendarios se comparte a `hola@chambasimple.com` en Google Calendar, sección
«Compartir con determinadas personas», con permiso **«Ver solo libre/ocupado»**. Ese permiso es el
mínimo: la agenda ve que estás ocupado, nunca el título ni los invitados. La cuenta del estudio es la
que autorizó la app, así que `freeBusy` lee con el token del Worker.

Para un calendario primario, el id que va en `PEOPLE` **es la dirección de la cuenta**. Lo que no
aparezca en la barra lateral de Google Calendar de `hola@chambasimple.com` no lo lee `freeBusy`.

## Agregar o quitar a una persona

1. El correo: agregarla al alias de SimpleLogin que corresponda (`hola@` para los avisos).
2. Su calendario: compartirlo a `hola@chambasimple.com` con «Ver solo libre/ocupado».
3. Su id en `PEOPLE` (`agenda/wrangler.jsonc`) y desplegar con `corepack pnpm deploy:agenda`.

El alias solo reparte correo: no aporta disponibilidad. Se puede quitar a alguien del alias sin tocar
`PEOPLE`, y quitar su id sin tocar el alias.

## Si un calendario deja de leerse

La agenda ofrece el correo como alternativa en lugar de horarios, al mostrarla y al reservar. Es a
propósito: no se promete un horario que no se pudo verificar. Revisar en Google Calendar de
`hola@chambasimple.com` que el calendario siga compartido; si no aparece en la barra lateral, se
revocó el compartir o cambió el id.
