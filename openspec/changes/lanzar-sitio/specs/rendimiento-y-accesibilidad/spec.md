# Spec Delta

## Purpose

Una consultora de software se juzga por su propio sitio: si carga lento o falla en el teléfono, el visitante asume lo mismo de lo que construye.

## ADDED Requirements

### Requirement: Lighthouse al máximo
Lighthouse SHALL dar 100 en Performance, Accessibility, Best Practices y SEO, en móvil y en escritorio, en `/`, `/en` y en cada caso. `pnpm perf` lo comprueba en local y contra producción. En CI se toma la mediana de tres ejecuciones, y en Performance se acepta 95 o más.

#### Scenario: Medición local
- **WHEN** se ejecuta `pnpm perf` contra el build de producción
- **THEN** cada página y dispositivo da 100 en las cuatro categorías

### Requirement: Presupuestos de carga
Cada página SHALL cumplir:
- HTML de 40 KB o menos comprimido;
- CSS en línea (ningún recurso que bloquee el renderizado);
- JavaScript: ninguno por defecto. Solo se permite el de piezas interactivas pequeñas y justificadas, con un total de 10 KB o menos comprimido;
- una sola familia tipográfica, autoalojada y en subconjunto latino, de 40 KB o menos;
- CLS de 0;
- LCP simulado de 2,0 s o menos en móvil y de 0,8 s o menos en escritorio.

#### Scenario: Tipografía
- **WHEN** carga `/`
- **THEN** se descarga como mucho un archivo de fuente, sin desplazamiento de layout al aplicarse

### Requirement: Accesible por diseño
La página SHALL cumplir:
- navegación completa con teclado y foco visible;
- un orden de encabezados sin saltos;
- un enlace "saltar al contenido";
- etiquetas en todos los controles;
- respeto a `prefers-reduced-motion`;
- contenido completo sin JavaScript.

#### Scenario: Sin JavaScript
- **WHEN** se abre `/` con JavaScript desactivado
- **THEN** se leen todas las secciones, y los enlaces de WhatsApp y correo funcionan
