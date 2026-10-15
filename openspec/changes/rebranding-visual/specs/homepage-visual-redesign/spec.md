# Spec Delta

## Purpose

Rediseño visual de la homepage de Chamba Simple: de presentación corporativa a creative technology studio. Jerarquía visual mejorada, Bento Grid para soluciones, Timeline animado para proceso, badges dinámicos en casos. Mantiene accesibilidad y Lighthouse 100 en 4 categorías.

## ADDED Requirements

### Requirement: Hero Section Visual Hierarchy
La sección Hero SHALL mostrar tipografía mejorada con jerarquía clara. El título principal SHALL tener tamaño de 7-8vw en desktop y 4-5vw en móvil. El elemento de Proceso Visual SHALL ser una tarjeta destacada con mayor peso visual (border, fondo sutil, padding generoso).

#### Scenario: Hero on Desktop
- **WHEN** usuario carga la página en viewport desktop (1440px)
- **THEN** título tiene tamaño ≥7vw, lema es 2.5vw, Proceso Visual como tarjeta separada en derecha

#### Scenario: Hero on Mobile
- **WHEN** usuario carga la página en viewport móvil (390px)
- **THEN** layout es single column, título 4.5-5vw, Proceso Visual debajo en full width, padding respeta mobile-first

#### Scenario: Hero Animations
- **WHEN** página carga
- **THEN** título fade-in + slide up (200ms), lema aparece 100ms después, CTA aparece 200ms después, Proceso Visual 300ms después

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

#### Scenario: Bento Scroll Reveal
- **WHEN** usuario hace scroll y sección entra en viewport
- **THEN** cada item fade-in + slide up con 100ms stagger entre items

### Requirement: Casos Cards with Solution Badges
Cada card de caso SHALL mostrar badges de soluciones (IA, CRM, Seguimiento, Integraciones) que se usaron en ese caso. Badges SHALL tener colores dinámicos: IA=azul (#3B82F6), CRM=mint (#62F0BB), Seguimiento=naranja (#F97316), Integraciones=púrpura (#A78BFA).

#### Scenario: Cases Display Badges
- **WHEN** usuario ve cards de casos
- **THEN** cada card muestra 1-3 badges según `c.solutions` del content, con colores correctos

#### Scenario: Cases Hover
- **WHEN** usuario hoverea una card de caso
- **THEN** border cambia a accent (mint), badges se vuelven más vibrantes (saturación +15%)

#### Scenario: Cases Scroll Reveal
- **WHEN** usuario hace scroll a sección de casos
- **THEN** cards fade-in + slide up con 100ms stagger

### Requirement: Proceso Timeline Visual
La sección Proceso SHALL mostrar timeline visual: línea vertical conectando 5 pasos, números (● para activo, ○ para siguientes), contenido alineado a derecha de línea.

#### Scenario: Timeline on Desktop
- **WHEN** viewport ≥768px
- **THEN** línea vertical en left (ancho 2px, color accent), 5 números connectados, contenido en right

#### Scenario: Timeline Scroll Triggered
- **WHEN** usuario hace scroll y Proceso entra en viewport
- **THEN** línea crece de top a bottom (CSS animation), números revelan uno a uno (100ms stagger), contenido fades in con 200ms delay

#### Scenario: Timeline on Mobile
- **WHEN** viewport <768px
- **THEN** línea desaparece, solo números + texto apilado en single column

#### Scenario: Timeline Current Step
- **WHEN** página carga en Proceso
- **THEN** primer paso muestra ● (mint), resto muestran ○ (neutral color)

### Requirement: Global Animation System
Animaciones SHALL usar CSS (no JavaScript) donde sea posible. Todos los animations SHALL respetar `prefers-reduced-motion` (fallback sin travel, solo opacity).

#### Scenario: Animations with Reduced Motion
- **WHEN** usuario tiene `prefers-reduced-motion: reduce` en OS
- **THEN** fade-in y slide animations usan 0 travel (solo opacity), velocidad es instant (0ms)

#### Scenario: Animation Keyframes
- **WHEN** animaciones ejecutan on-load
- **THEN** duraciones son 200-300ms, easing es ease-out, stagger entre items es 100ms

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
