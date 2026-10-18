# Spec Delta

## Purpose

Que la página se sienta viva mientras el visitante la lee: un aura de menta de la marca que acompaña
al puntero con un movimiento suave, sin tocar el cursor nativo, sin costo en táctil/móvil y sin
romper el presupuesto de JavaScript, el CSP, la accesibilidad ni Lighthouse.

## ADDED Requirements

### Requirement: Aura que sigue al puntero

La página SHALL mostrar una capa decorativa única (el aura) que sigue al puntero con un movimiento
suave y retardado en escritorio. El aura MUST ser decorativa (oculta a lectores de pantalla y sin
capturar eventos) y MUST NOT ocultar ni reemplazar el cursor nativo.

#### Scenario: Seguir al puntero en escritorio

- **WHEN** alguien mueve el puntero por la página en una pantalla ≥ 768 px con puntero fino
- **THEN** el aura se dibuja y se desplaza tras el puntero con un retardo suave, sin saltos bruscos

#### Scenario: El cursor nativo se conserva

- **WHEN** el aura está activa
- **THEN** el cursor del sistema sigue visible y todos los clics y enlaces funcionan con normalidad

### Requirement: Solo con puntero fino y sin movimiento reducido

El aura MUST activarse únicamente con puntero fino (`hover: hover` y `pointer: fine`), pantalla de al
menos 768 px y sin preferencia de movimiento reducido. Fuera de esas condiciones MUST estar ausente:
sin elementos pintados y sin escuchar eventos.

#### Scenario: Dispositivo táctil o pantalla angosta

- **WHEN** la página se abre en un teléfono o en una ventana menor a 768 px
- **THEN** no aparece ningún aura y no se registra ningún listener de puntero

#### Scenario: Movimiento reducido

- **WHEN** el sistema tiene `prefers-reduced-motion: reduce`
- **THEN** el aura no se muestra y el script no arranca

### Requirement: Costo mínimo y sin JavaScript por defecto

El aura SHALL implementarse con un único script inline, autorizado en el CSP del Worker por su hash,
sin dependencias nuevas. El script MUST mover la capa solo con `transform`, MUST dormir su bucle
cuando el aura alcanza al puntero, y MUST NOT afectar contenido, layout, SEO, CLS, LCP ni INP. Sin
JavaScript el aura MUST quedar invisible y la página MUST verse y funcionar igual.

#### Scenario: Sin JavaScript

- **WHEN** la página carga con JavaScript desactivado
- **THEN** no se ve el aura y todo el contenido, los enlaces y el layout quedan intactos

#### Scenario: El build no se bloquea por el CSP

- **WHEN** se corre `pnpm build`
- **THEN** `scripts/checks/seo.ts` confirma que el script del aura está permitido por el CSP y el build pasa

#### Scenario: Reposo sin costo

- **WHEN** el puntero deja de moverse
- **THEN** el bucle de animación se detiene y no consume cuadros hasta el próximo movimiento

### Requirement: Lighthouse y temas

El aura SHALL mantener Lighthouse 100 en Performance, Accessibility, Best Practices y SEO, en móvil
y escritorio, y SHALL verse bien y con contraste de texto correcto en tema claro y oscuro.

#### Scenario: Lighthouse en verde

- **WHEN** se corre `pnpm perf` sobre el build de producción
- **THEN** cada página obtiene 100/100/100/100 en móvil y escritorio

#### Scenario: Ambos temas

- **WHEN** se alterna entre tema claro y oscuro con el aura activa
- **THEN** el aura es visible y sutil en ambos y el texto conserva su contraste

## REMOVED Requirements

(None)

## MODIFIED Requirements

(None)
