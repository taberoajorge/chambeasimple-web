# Design

## Context

Homepage actual: 10 secciones (Hero, Clientes, Soluciones, Proceso, Casos, IA, Why, Team, FAQ, Contacto). Estructura HTML limpia (Astro, Tailwind 4), componentes reutilizables (Section, CardGrid, Card). Paleta verde mint + dark theme establecida. 4 secciones van a rediseñarse: Hero, Soluciones, Casos, Proceso.

Restricciones clave:
- Zero nuevas dependencias (Astro, Tailwind 4, CSS puro)
- Lighthouse 100 en 4 categorías (desktop + mobile)
- Contenido existente se mantiene (no refactor de copy)
- Imágenes: usar las que ya existen en casos

## Goals / Non-Goals

**Goals:**
- Visual hierarchy mejorada: título 7-8vw, jerarquía clara en todas las secciones
- Interactividad visual: Bento Grid, Timeline animado, badges dinámicos
- Animaciones sutiles: on-load stagger + scroll-triggered reveals, respeta prefers-reduced-motion
- Responsiveness: 390px / 768px / 1440px tested
- Performance: Lighthouse 100 sin regresiones

**Non-Goals:**
- Crear assets nuevos (videos, mockups, fotos)
- Cambiar copy o estructura semántica
- Agregar comportamiento JavaScript complejo (solo CSS animations)
- Modificar otras secciones (AI, Why, Team, FAQ, Contacto)

## Decisions

### 1. **Bento Grid: CSS puro en lugar de librería (Aceternity UI)**

**Decision**: Crear 2 componentes Astro nuevos (`BentoGrid.astro`, `BentoGridItem.astro`) usando CSS grid nativo + Tailwind utilities.

**Rationale:**
- Aceternity UI es React, el proyecto es Astro puro. Agregar React aislado suma ~15KB minificado.
- CSS grid es soportado en todos los navegadores modernos (95%+ coverage).
- Control total: layouts asimétricos, responsive breakpoints, sin dependencias.
- Mantenible: cambios visuales = cambios en Astro + Tailwind, no en otra librería.

**Alternatives considered:**
- Grid layout con clases Tailwind puras: más verboso, menos legible.
- Aceternity Bento: simples, pero agrega dependencia React.
- CSS Grid avanzado (subgrid): mejor en CSS, pero navegadores viejos (IE) no soportan.

**Approach:**
```astro
<!-- BentoGrid.astro -->
<div class="grid gap-4 md:gap-6 auto-rows-max"
  style="grid-template-columns: repeat(auto-fit, minmax(250px, 1fr))"
>
  <slot />
</div>

<!-- BentoGridItem.astro -->
<div class:list={[
  "rounded-2xl border border-line hover:border-accent transition-colors",
  span === 2 && "md:col-span-2"
]}>
  <slot />
</div>
```

### 2. **Animaciones: CSS Keyframes + Scroll-triggered (con `@keyframes` e `animation` de CSS)**

**Decision**: No usar GSAP, Framer Motion, o AOS. Solo CSS puro + IntersectionObserver simple en HTML.

**Rationale:**
- CSS puro: 0 dependencias, Lighthouse no penaliza, 100% control.
- Scroll-triggered: IntersectionObserver nativo en JS, soportado 98%+.
- Accesibilidad: `prefers-reduced-motion` fallback es sencillo con CSS.
- Performance: CSS animations son hardware-accelerated (GPU), no bloquean main thread.

**Alternatives considered:**
- GSAP: librería pesada (~35KB), overkill para animaciones simples.
- Framer Motion: React, no aplica a Astro.
- AOS (Animate On Scroll): ~5KB, pero duplica funcionalidad que CSS da gratis.

**Approach:**
```css
/* Global animations */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Applied via class + inline style delay */
.scroll-reveal {
  animation: fadeInUp 0.6s ease-out forwards;
}

/* Stagger via nth-child */
.scroll-reveal:nth-child(1) { animation-delay: 0ms; }
.scroll-reveal:nth-child(2) { animation-delay: 100ms; }
.scroll-reveal:nth-child(3) { animation-delay: 200ms; }

/* Reduced motion fallback */
@media (prefers-reduced-motion: reduce) {
  .scroll-reveal {
    animation: none;
    opacity: 1;
  }
}
```

JavaScript mínimo:
```js
// IntersectionObserver simple
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('scroll-reveal');
      observer.unobserve(e.target);
    }
  });
});

document.querySelectorAll('[data-scroll]').forEach(el => observer.observe(el));
```

### 3. **Badges de Soluciones en Cases: Datos dinámicos desde content**

**Decision**: Reutilizar `c.solutions` (array existente en cases.ts) para renderizar badges coloreados dinámicamente.

**Rationale:**
- Ya existe `solutions` en cada caso (IA, CRM, etc).
- No requiere datos nuevos, solo presentación visual.
- Badge colors mapeados a solution IDs en Tailwind classes o CSS custom properties.

**Approach:**
```astro
<!-- En Card de Caso -->
{c.solutions.map(solutionId => (
  <span class={`badge badge-${solutionId}`}>
    {t.solutions.items.find(s => s.id === solutionId)?.title}
  </span>
))}
```

```css
.badge-ia { background: #3B82F6; /* blue */ }
.badge-crm { background: #62F0BB; /* mint */ }
.badge-seguimiento { background: #F97316; /* orange */ }
.badge-integraciones { background: #A78BFA; /* purple */ }
```

### 4. **Timeline Visual: SVG inline vs CSS grid con línea CSS**

**Decision**: CSS grid + border left para línea vertical (no SVG).

**Rationale:**
- SVG: más control visual, pero requiere asset separado.
- CSS border: sencillo, ligero, escalable, se anima con CSS ease.
- Mobile: ocultar línea en <768px con `display: none`.

**Approach:**
```css
.timeline {
  display: grid;
  gap: 32px;
  border-left: 2px solid var(--accent);
  padding-left: 32px;
}

.timeline-step {
  position: relative;
}

.timeline-step::before {
  content: '';
  position: absolute;
  left: -42px;
  top: 0;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--accent); /* ● */
  border: 3px solid var(--background);
}

@media (max-width: 767px) {
  .timeline {
    border-left: none;
    padding-left: 0;
  }
}
```

### 5. **Home.astro Reorganización: Mínimos cambios al componente**

**Decision**: Reemplazar CardGrid/Card en Soluciones con BentoGrid/BentoGridItem. El resto de Home.astro se mantiene igual.

**Rationale:**
- Cambio localizado: solo Soluciones section.
- Casos y Proceso: reutilizan Card/CardGrid existentes (sin cambiar componentes base).
- Minimiza riesgo de regresión.

**Impacto:**
- Home.astro: 1 import nuevo (BentoGrid), 1 sección cambia de CardGrid → BentoGrid
- Card.astro: sin cambios
- CardGrid.astro: sin cambios
- Nuevos: BentoGrid.astro, BentoGridItem.astro

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| **Animaciones CPU-pesadas en móvil** → Flickering, batería | Usar solo opacity + transform (GPU-friendly). Test en device real (iPhone 12, Android 12). |
| **IntersectionObserver fallback en navegadores viejos** → Animaciones no ejecutan | Feature detect + graceful degradation (elemento visible sin animation-delay). |
| **Bento Grid col-span en navegadores que no soportan CSS Grid** → Layout roto | No es blocker (CSS Grid: 95%+ coverage). Fallback a flex column si grid no se detect. |
| **Lighthouse regresiones por nuevas animaciones** → Score baja | Animations usan transform + opacity only. Test al final con Lighthouse. |
| **Mobile viewport: Hero text + Proceso Visual overflow** → Layout roto en 390px | Test temprano en 390px. Ajustar font-size fluido, padding, stacking. |
| **Badges colores poco contraste** → Accesibilidad WCAG AA | Verificar colores contra background (light + dark theme). Usar contrast.test.ts existente. |

## Migration Plan

1. **Crear componentes nuevos** (BentoGrid, BentoGridItem) en src/sections/
2. **Modificar Home.astro** (import BentoGrid, reemplazar Soluciones section)
3. **Agregar CSS** (global.css o archivo nuevo): keyframes, animaciones, scroll-reveal
4. **Agregar JS mínimo** (global.js o script en Base.astro): IntersectionObserver
5. **Test visual** en 3 viewports (390, 768, 1440)
6. **Test Lighthouse** (desktop + mobile, todas 4 categorías)
7. **Test accesibilidad** (keyboard nav, prefers-reduced-motion, color contrast)
8. **Deploy** a staging, luego producción

## Open Questions

- ¿Se usan ya CSS custom properties para colors/spacing en el proyecto, o solo Tailwind utilities? → Respuesta afecta cómo escribir `BentoGrid.astro` (inline styles vs utility classes).
- ¿Timeline debe ser animado solo al entrar en viewport, o al cargar la página?  → Spec dice scroll-triggered, pero confirmar si Home.astro está above fold y timeline siempre visible en móvil.
- ¿Aceptar propuesta de colores para badges (azul, mint, naranja, púrpura), o tomar de paleta existente?
