# Spec Delta

## Purpose

Rediseño visual de la homepage de Chamba Simple: de presentación corporativa a creative technology studio. Jerarquía visual mejorada, Bento Grid para soluciones, Timeline animado para proceso, badges dinámicos en casos. Mantiene accesibilidad y Lighthouse 100 en 4 categorías.

## ADDED Requirements

### Requirement: Hero Section Visual Hierarchy
La sección Hero SHALL mostrar tipografía mejorada con jerarquía clara. El título principal SHALL usar el mayor tamaño que quepa: en desktop escala con el ancho de su columna y con la altura del viewport, de modo que todo el Hero (título, lema, enlaces y tarjeta de Proceso) quepa en la primera pantalla. El elemento de Proceso Visual SHALL ser una tarjeta destacada con mayor peso visual (border, fondo sutil, padding generoso) y SHALL ajustarse al ancho de su contenido, sin dejar hueco a su derecha. En desktop la sección SHALL ocupar toda la altura útil de la pantalla (`min-height: calc(100dvh - var(--header-h))`) y SHALL acotar su ancho para que la columna del texto y la tarjeta queden contiguas, sin hueco muerto entre ambas. La sección SHALL usar un padding lateral de 4rem en desktop (el doble que las demás secciones).

#### Scenario: Hero on Desktop
- **WHEN** usuario carga la página en viewport desktop (1440px)
- **THEN** el título escala con el ancho de su columna y la altura del viewport (`min(12cqw, 9vh)`), el lema es 2.5vw, y el Proceso Visual es una tarjeta separada a la derecha, de ancho según su contenido (máx. 28rem)

#### Scenario: Hero fits the first screen
- **WHEN** usuario carga la página en desktop (de 1024×768 a 1512×982) en español o inglés
- **THEN** la primera sección llena la altura útil de la pantalla, sin que la sección siguiente asome, con el título, el lema, los enlaces y la tarjeta de Proceso dentro del viewport

#### Scenario: Hero on Mobile
- **WHEN** usuario carga la página en viewport móvil (390px)
- **THEN** layout es single column, título 4.5-5vw, Proceso Visual debajo en full width, padding respeta mobile-first

### Requirement: Soluciones Bento Grid
La sección Soluciones SHALL usar grid asimétrico tipo Bento: IA ocupa 2 columnas (col-span-2), resto (Seguimiento, CRM, Integraciones) ocupan 1 columna cada uno. Grid SHALL ser responsivo: en móvil todos los items ocupan 1 columna.

#### Scenario: Bento Layout Desktop
- **WHEN** viewport ≥768px
- **THEN** IA (2 cols) + Seguimiento (1 col) + CTA (1 col) en grid, Integraciones y CRM en fila inferior

#### Scenario: Bento Layout Mobile
- **WHEN** viewport <768px
- **THEN** todos los items son 1 columna, stacked verticalmente

#### Scenario: Bento Hover States
- **WHEN** usuario hoverea un BentoGridItem
- **THEN** card tiene scale(1.02), border cambia a mint (accent), shadow sutil aparece

### Requirement: Casos Cards with Solution Badges
Cada card de caso SHALL mostrar badges de soluciones (IA, CRM, Seguimiento, Integraciones) que se usaron en ese caso. Badges SHALL tener colores dinámicos: IA=azul (#3B82F6), CRM=mint (#62F0BB), Seguimiento=naranja (#F97316), Integraciones=púrpura (#A78BFA).

#### Scenario: Cases Display Badges
- **WHEN** usuario ve cards de casos
- **THEN** cada card muestra 1-3 badges según `c.solutions` del content, con colores correctos

#### Scenario: Cases Hover
- **WHEN** usuario hoverea una card de caso
- **THEN** border cambia a accent (mint), badges se vuelven más vibrantes (saturación +15%)

### Requirement: Proceso Timeline Visual
La sección Proceso SHALL mostrar timeline visual: línea vertical conectando 5 pasos, números (● para activo, ○ para siguientes), contenido alineado a derecha de línea.

#### Scenario: Timeline on Desktop
- **WHEN** viewport ≥768px
- **THEN** línea vertical en left (ancho 2px, color accent), 5 números connectados, contenido en right

#### Scenario: Timeline on Mobile
- **WHEN** viewport <768px
- **THEN** línea desaparece, solo números + texto apilado en single column

#### Scenario: Timeline Current Step
- **WHEN** página carga en Proceso
- **THEN** primer paso muestra ● (mint), resto muestran ○ (neutral color)

### Requirement: Global Animation System
La página SHALL no usar animaciones de entrada: el contenido SHALL pintarse de inmediato, sin scroll reveal ni fade-in on-load, porque un elemento del primer viewport que arranca en `opacity: 0` deja a Lighthouse sin LCP. Las únicas animaciones SHALL ser transiciones CSS de hover (tarjetas, avatar y wordmark), nunca JavaScript, y SHALL respetar `prefers-reduced-motion`.

#### Scenario: Content paints on load
- **WHEN** la página carga
- **THEN** todo el contenido es visible de inmediato, sin animaciones de entrada ni scroll reveal

#### Scenario: Hover transitions respect Reduced Motion
- **WHEN** usuario tiene `prefers-reduced-motion: reduce` en el sistema
- **THEN** las transiciones del avatar y el wordmark se desactivan (`transition: none`)

### Requirement: Lighthouse Performance
Homepage SHALL mantener Lighthouse 100 en Performance, Accessibility, Best Practices, SEO (desktop y mobile).

#### Scenario: Lighthouse Desktop
- **WHEN** se corre Lighthouse en desktop (1440px)
- **THEN** scores: Performance ≥100, Accessibility ≥100, Best Practices ≥100, SEO ≥100

#### Scenario: Lighthouse Mobile
- **WHEN** se corre Lighthouse en mobile (390px)
- **THEN** scores: Performance ≥100, Accessibility ≥100, Best Practices ≥100, SEO ≥100

### Requirement: Responsive Design
Todas las secciones SHALL responder correctamente a 3 viewports: 390px (mobile), 768px (tablet), 1440px (desktop).

#### Scenario: Mobile Responsiveness
- **WHEN** viewport es 390px
- **THEN** layout es single column, padding es 16px, font sizes reducen 20-30%, todos los elementos visible sin horizontal scroll

#### Scenario: Desktop Spacing
- **WHEN** viewport es 1440px
- **THEN** grid columns aprovechan 1440px, max-width es 1280px, gap entre sections es 120-220px

## REMOVED Requirements

(None: primera versión de specs para este proyecto)

## MODIFIED Requirements

(None: no hay specs previos modificados)
