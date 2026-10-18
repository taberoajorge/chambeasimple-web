# Tasks

## 1. Disponibilidad de varios calendarios

- [x] 1.1 `agenda/wrangler.jsonc`: `PEOPLE` pasa a los cinco ids (el estudio y los cuatro calendarios de los dueños) con el comentario que explica el compartir «ver solo libre/ocupado» y los tres pasos para agregar a una persona. Se verifica con `corepack pnpm check`. El compartir de los cuatro calendarios a `hola@chambasimple.com` lo confirmaron los dueños antes de este cambio.
- [x] 1.2 `agenda/src/google.ts`: los comentarios pasan de «el calendario de hola@» a «los calendarios configurados». Se verifica con `corepack pnpm check` (Biome y Knip).

## 2. Degradación al correo

- [x] 2.1 `agenda/src/index.ts`: si `freeBusy` falla al mostrar la agenda o al reservar, se muestra la página del correo en lugar de un error de servidor, sin prometer ningún horario. Se verifica con `corepack pnpm test`.
- [x] 2.2 `agenda/src/index.test.ts`: un calendario ocupado quita el bloque; un calendario que no se puede leer deja la página y la reserva en el correo, sin crear ningún evento. Se verifica con `corepack pnpm test` (33 tests, en verde).

## 3. Documentación y publicación

- [x] 3.1 `docs/agenda.md`: cómo se calcula la disponibilidad, qué calendarios cuentan y los tres pasos para agregar o quitar a una persona. Se verifica leyendo el documento contra la configuración real de `agenda/wrangler.jsonc`.
- [x] 3.2 `corepack pnpm check` y `corepack pnpm build` en verde. Se verifica con el certificado del check y con la salida del build (`seo: 10 pages ok; csp: every script allowed on 11`).
- [ ] 3.3 Desplegar la agenda (`corepack pnpm deploy:agenda`) y probar una reserva real. Requiere el visto bueno de los dueños y va después del merge.
