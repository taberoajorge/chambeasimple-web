# Diseño: agenda multicalendario

## Contexto

- `hola@chambasimple.com` es un alias de SimpleLogin que reparte correo; un alias no une calendarios. La agenda leía **su** calendario como única fuente de ocupación, y ahí nadie bloquea su trabajo diario.
- Los dueños trabajan fuera de la consultoría en sus propios calendarios. Dos son cuentas personales (`sandrarap.15@gmail.com`, `taberoa@pm.me`) y dos son las cuentas de Google creadas con el dominio (`sandra@chambasimple.com`, `alex@chambasimple.com`).
- `freeBusy` acepta varios calendarios en una sola consulta. Para cada uno devuelve solo bloques ocupados: nunca títulos ni invitados. El token sigue siendo uno, el de la cuenta del estudio.

## Decisiones

### 1. Varios calendarios, un token
`PEOPLE` es la lista de ids y el cálculo ya los fusiona (`google.ts` los manda todos en una sola consulta; `slots.ts` descarta un bloque si se solapa con cualquiera). La ocupación es la **unión**: estar ocupado en cualquier calendario quita el horario.

Cada dueño comparte su calendario con la cuenta del estudio con permiso «ver solo libre/ocupado». No hay que mover eventos ni compartir contraseñas ni usar todos la misma cuenta. El calendario del estudio se queda en la lista: sirve para bloquear cierres o vacaciones sin ensuciar un calendario personal.

Para un calendario primario el id **es la dirección de la cuenta**, así que la lista se escribe sin buscar nada en la configuración de Google.

Agregar o quitar a una persona son tres pasos explícitos, y ninguno depende del alias: el alias de correo (SimpleLogin), compartir su calendario al estudio, y su id en `PEOPLE`.

### 2. La disponibilidad tiene que ser en tiempo real
La tentación es suscribir Google al enlace «solo ocupado» de Proton (o que el Worker lea ese ICS). Se descarta: las suscripciones ICS llegan con horas de retraso —Proton avisa de hasta ocho horas— y ofrecer un horario ya ocupado es peor que no ofrecer horarios. `freeBusy` sobre calendarios de Google es inmediato, y eso manda sobre cualquier ahorro de trabajo manual.

### 3. Falla en cerrado, con el correo como salida
No se promete un horario que no se pudo verificar. Eso ya estaba: si un calendario no se puede leer, `busy()` lanza (nada de asumir que está libre). Lo que cambia es la salida: en vez de terminar en un error de servidor, la página del correo, tanto al mostrar la agenda como al reservar. Con cinco calendarios en lugar de uno, la probabilidad de un compartir roto sube, y el visitante no debe ver un 500.

## Descartado

- **Que el Worker lea el enlace ICS de Proton:** obliga a un parseador de ICS con recurrencias, eventos de día completo y zonas, justo donde un parseador ingenuo se equivoca; equivocarse ahí es una doble reserva.
- **Un calendario espejo** donde los dueños dupliquen su tiempo a mano: trabajo permanente y peor que compartir una vez.
- **Una verificación diaria en el cron** de que los calendarios siguen legibles: pedida y descartada por los dueños.

## Riesgos

- **Un compartir revocado o mal hecho:** la página pasa al correo, que es lo correcto, pero nadie se entera hasta que un visitante escribe. Aceptado por ahora; automatizar el aviso queda pendiente.
- **Un calendario personal aporta todo su tiempo ocupado,** incluido el personal. Es el precio de «libre/ocupado»: se ve que estás ocupado, nunca por qué.
- **Orden de archivado:** los requisitos que este cambio modifica viven todavía en el cambio pendiente `agenda-propia`. Ese se archiva primero; este después.
