# Spec Delta

## MODIFIED Requirements

### Requirement: Solo horarios libres en el calendario de Chambea Simple
La agenda SHALL ofrecer bloques de 30 minutos dentro del horario laboral configurado (por defecto, de lunes a viernes de 9:00 a 18:00 en Lima), con al menos 24 horas de anticipación y como máximo 21 días hacia adelante. Un bloque MUST aparecer solo si están libres **todos** los calendarios configurados y el calendario propio de la agenda, según `freeBusy`. Esos calendarios son el del estudio (`hola@chambasimple.com`, donde los dueños bloquean su tiempo) y los calendarios de trabajo de los dueños, cada uno compartido a la cuenta del estudio con permiso «ver solo libre/ocupado». Los horarios MUST mostrarse en la zona horaria del visitante, indicando cuál es.

#### Scenario: Uno de los dueños está ocupado en su propio calendario
- **WHEN** cualquiera de los calendarios configurados tiene un evento de 10:00 a 11:00
- **THEN** los bloques de 10:00 y 10:30 no se ofrecen

#### Scenario: Un calendario que no se puede leer
- **WHEN** `freeBusy` responde con error para alguno de los calendarios configurados
- **THEN** al mostrar la página y al intentar reservar la agenda ofrece el correo como alternativa, y no responde con un error de servidor

#### Scenario: Visitante en Ciudad de México
- **WHEN** alguien en Ciudad de México abre la agenda
- **THEN** ve los horarios en hora de Ciudad de México, con la zona indicada

### Requirement: Los datos de los clientes nunca quedan expuestos
La agenda SHALL exponer solo dos operaciones: consultar horarios libres (bloques sin ningún dato de otras reservas) y crear una reserva. Ninguna ruta MUST listar, leer ni exportar reservas, nombres o correos. Además:
- **Permisos de Google mínimos, sobre la cuenta `hola@chambasimple.com`:** `calendar.app.created`, para un calendario secundario "Chambea Simple · Agenda" que la app crea y es lo único que puede leer o editar, y `calendar.freebusy`, que sobre los calendarios de los dueños devuelve solo bloques ocupados, sin títulos ni invitados.
- **El token de Google** vive como secreto del Worker (cifrado, no legible por la API ni por el repo), nunca en KV, en el código ni en los logs.
- **Los logs y la analítica** no registran nombre, correo ni texto del visitante.

#### Scenario: Alguien intenta descargar las reservas
- **WHEN** se piden rutas como `/api/reservas`, `/api/eventos` o cualquier otra que no sea consultar horarios o reservar
- **THEN** responden 404 y no existe ninguna forma de obtener datos de otras reservas

#### Scenario: El token se filtra
- **WHEN** alguien obtiene el token de la agenda
- **THEN** solo ve el calendario secundario de la agenda y bloques ocupados de los calendarios configurados, nunca sus eventos ni sus invitados, ni correos
