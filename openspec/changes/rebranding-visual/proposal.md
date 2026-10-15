# Proposal

## Why

Chamba Simple tiene una base sólida (contenido real, casos probados, proceso claro) pero su presentación se siente corporativa: bloques de texto, cards uniformes, ritmo visual plano. Los visitantes no *ven* el software que construimos, solo lo leemos.

Para posicionarse como "creative technology studio" ante PyMEs de Perú y México, necesitamos que la página se sienta como un **producto tecnológico moderno**: jerarquía visual clara, interactividad que muestre cómo resolvemos problemas, animaciones que transmitan movimiento sin perder funcionalidad. Todo sin agregar dependencias (Tailwind 4 + CSS puro en Astro).

## What Changes

### Secciones de la homepage rediseñadas:

- **Hero**: Más protagonismo (tipografía 7-8vw), menos grid. Proceso visual como tarjeta destacada con mayor peso visual. Animaciones de entrada staggered (titulo → lema → CTA → proceso).

- **Soluciones (4 items: IA, Seguimiento, CRM, Integraciones)**: De grid 2x2 uniforme a **Bento Grid asimétrico** — IA ocupa 2 columnas, otros 3 items en 1 columna. Hover effects sutiles (scale, border accent). Scroll reveal con stagger.

- **Casos reales (3 cards)**: Integración visual con Soluciones via **badges de soluciones coloreadas** (IA=azul, CRM=mint, Seguimiento=naranja). Cards con mejor jerarquía: nombre + badges + resumen + link. Scroll reveal fade-in.

- **Proceso (5 pasos)**: De lista vertical a **Timeline visual** — línea vertical conectando pasos, números se revelan al hacer scroll (scroll-triggered), contenido fades in con stagger de 100ms.

### Componentes nuevos:

- `BentoGrid.astro`: Wrapper para grid asimétrico con `grid-template-columns` y `grid-column-span`.
- `BentoGridItem.astro`: Items individuales con hover states, scroll animations, soporte `span={1|2}`.

### Animaciones:

- **On-load**: Fade-in + slide up (200-300ms) en Hero, Soluciones, Casos.
- **Scroll-triggered**: Proceso timeline (línea crece, pasos revelan uno a uno).
- **Hover**: Soluciones: scale(1.02) + border accent; Casos: border accent + badges más vibrantes.
- **Prefers-reduced-motion**: Fallback sin travel, solo opacity.

### Sin cambios de contenido:

- Copy existente se mantiene igual (reutilización máxima).
- Screenshots/imágenes del software: sin cambios (se usan los que ya existen en los casos).
- Estructura SEO y accesibilidad preservada.

## Capabilities

### New Capabilities

- `homepage-visual-redesign`: Homepage de Chamba Simple pasa de presentación corporativa a creative technology studio. Incluye jerarquía visual mejorada (Hero 7-8vw), Bento Grid para Soluciones, Timeline para Proceso, badges de soluciones en Casos. Animaciones scroll-triggered + on-load. Tailwind 4 + CSS puro, sin librerías nuevas.

### Modified Capabilities

- (None: no hay specs previos en el proyecto)

## Impact

**Código afectado:**
- `src/sections/Home.astro`: Reorganización de 4 secciones (Hero, Soluciones, Casos, Proceso).
- `src/sections/Card.astro`: Posible mejora visual (spacing, badges).
- Nuevos: `src/sections/BentoGrid.astro`, `src/sections/BentoGridItem.astro`.
- `src/styles/global.css` (o nuevo archivo): Animaciones CSS (keyframes, scroll-triggered).

**Dependencias:**
- Ninguna nueva (Astro, Tailwind 4 ya están en uso).

**Testing:**
- Visual: Lighthouse 100 en 4 categorías, móvil y desktop.
- Funcional: Links de CTA, badges dinámicos funcionan.
- Accesibilidad: prefers-reduced-motion, focus states.

**Scope de sesión:**
- Una sola sesión, múltiples archivos modificados + componentes nuevos.
- Estimado: ~3-4 horas de desarrollo + testing.
