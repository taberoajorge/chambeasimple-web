# Spec Delta

## Purpose

Que quien lee sepa siempre en qué sección está y pueda saltar a otra sin volver arriba, y que el
equipo tenga cara.

## ADDED Requirements

### Requirement: Header fijo
El header SHALL quedar fijo arriba de la ventana en todas las páginas y anchos. Un salto a un ancla de la página MUST dejar el destino debajo del header, no tapado por él.

#### Scenario: Saltar a una sección
- **WHEN** alguien en la mitad de la página hace clic en "Casos que resolvemos" del header
- **THEN** la página baja a la sección y su título queda visible bajo el header

### Requirement: Título de sección fijo
Desde 768 px, el título de cada sección construida con `Section` SHALL quedar fijo bajo el header mientras la sección está en pantalla y MUST irse con ella al terminar. Bajo 768 px el título MUST desplazarse con el contenido.

#### Scenario: Leer una sección larga
- **WHEN** alguien baja por "Cómo trabajamos" en una pantalla de escritorio
- **THEN** el título sigue visible bajo el header hasta que termina la sección, y luego lo reemplaza el de la siguiente

### Requirement: Avatares del equipo
Cada persona de "Quiénes somos" SHALL mostrar un avatar ilustrado en una forma no rectangular. Si la persona tiene `photo` en `TEAM`, la foto MUST aparecer en la misma forma al pasar el puntero o enfocar su tarjeta; sin `photo`, solo se muestra el avatar.

#### Scenario: Pasar el puntero sobre una persona con foto
- **WHEN** alguien pasa el puntero sobre la tarjeta de una persona con `photo`
- **THEN** el avatar se reemplaza por su foto, y vuelve el avatar al retirar el puntero
