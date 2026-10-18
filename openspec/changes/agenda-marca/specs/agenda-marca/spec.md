# Spec Delta

## Purpose

Que la vista de agenda se sienta de la casa: el mismo color de selección y el mismo aura de menta del
sitio, sin ningún script distinto a los ya previstos y sin relajar el CSP.

## ADDED Requirements

### Requirement: Color de selección de la marca en la agenda

La vista de agenda SHALL pintar el texto seleccionado con el par de la marca (fondo menta, tinta
encima), el mismo que el sitio, en tema claro y oscuro.

#### Scenario: Seleccionar texto en la agenda

- **WHEN** el visitante selecciona texto en la página de agenda
- **THEN** la selección se pinta en menta con tinta, legible en tema claro y oscuro

### Requirement: Aura que sigue al puntero en la agenda

La agenda SHALL mostrar el aura de menta que sigue al puntero, la misma capa decorativa del sitio
(oculta a lectores de pantalla, sin capturar eventos y sin ocultar el cursor nativo).

#### Scenario: Seguir al puntero en escritorio

- **WHEN** alguien mueve el puntero por la agenda en una pantalla ≥ 768 px con puntero fino
- **THEN** el aura se dibuja y se desplaza tras el puntero con el mismo retardo suave del sitio

#### Scenario: Táctil, pantalla angosta y movimiento reducido

- **WHEN** la agenda se abre en táctil, en una ventana menor a 768 px o con `prefers-reduced-motion`
- **THEN** el aura no se pinta ni registra ningún listener

### Requirement: El CSP de la agenda solo permite el aura

El CSP de la agenda MUST permitir su único script (el aura) por su hash, MUST NOT habilitar
`unsafe-inline` ni `'self'` para scripts y MUST NOT permitir otro script salvo Turnstile cuando está
configurado.

#### Scenario: La página pasa su propio CSP

- **WHEN** la agenda responde cualquier página
- **THEN** el único script inline que lleva (el aura) está autorizado por su hash en el CSP

#### Scenario: El hash no diverge

- **WHEN** el script del aura (`src/layouts/cursor.ts`) cambia
- **THEN** el test de la agenda falla hasta que el hash del CSP se actualiza

### Requirement: Sin coste donde no se ve

La agenda SHALL verse y funcionar igual sin JavaScript, y el aura MUST usar solo `transform` y dormir
su bucle en reposo, sin afectar el contenido ni el layout.

#### Scenario: Sin JavaScript

- **WHEN** la agenda carga con JavaScript desactivado
- **THEN** no se ve el aura y los horarios, el formulario y los enlaces funcionan igual
