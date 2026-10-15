# Tasks

## 1. Componentes Bento Grid

- [x] 1.1 Crear `src/sections/BentoGrid.astro` con grid CSS (grid-template-columns con auto-fit minmax). Se verifica: archivo existe, grid renderiza en dev server (localhost:3429) sin errores.

- [x] 1.2 Crear `src/sections/BentoGridItem.astro` con soporte `span={1|2}`, clases hover, border. Se verifica: component acepta prop `span`, renderiza `col-span-2` en HTML cuando span={2}.

- [x] 1.3 Verificar que BentoGridItem hereda estilos de Card (border, rounded, padding). Se verifica: viewport desktop 1440px muestra card con borders y padding correctos, matches existentes Card styling.

## 2. Animaciones CSS + JavaScript base

- [x] 2.1 Agregar keyframes en `src/styles/global.css`: `fadeInUp` (0→20px translateY, 0→1 opacity), `slideIn` timing 200-300ms. Se verifica: `pnpm build` compila sin errores, keyframes aparecen en CSS compilado.

- [x] 2.2 Agregar utility classes `.scroll-reveal` en global.css con stagger delays (nth-child 0ms, 100ms, 200ms). Se verifica: `pnpm build` compila, clases aparecen en output CSS.

- [x] 2.3 Crear `src/scripts/scroll-reveal.ts`: IntersectionObserver que agrega `.scroll-reveal` a elementos `[data-scroll]`. Se verifica: dev server carga sin errores, console limpia (sin JS errors).

- [x] 2.4 Integrar script en `src/layouts/Base.astro` con `<script>` tag que importe scroll-reveal.ts. Se verifica: dev server muestra script loaded, no errors en console.

- [x] 2.5 Agregar CSS `prefers-reduced-motion` fallback: animations disabled, opacity: 1. Se verifica: `pnpm build` compila, `@media (prefers-reduced-motion: reduce)` existe en output CSS.

## 3. Home.astro: Sección Soluciones rediseño

- [x] 3.1 En `src/sections/Home.astro`, reemplazar CardGrid con BentoGrid en sección Soluciones. Se verifica: `pnpm build` sin errores, Home.astro importa BentoGrid.

- [ ] 3.2 Mapear t.solutions.items dentro de BentoGridItem con `span={i === 0 ? 2 : 1}` (IA span 2, resto span 1). Se verifica: dev server renderiza Soluciones, IA card 2x en desktop, resto 1x.

- [ ] 3.3 Agregar `data-scroll` atributo a cada BentoGridItem en Soluciones. Se verifica: dev server renderiza atributos en HTML, inspector browser muestra `data-scroll` presentes.

- [ ] 3.4 Verificar responsive: 390px y 1440px. Se verifica: 390px todo single column, 1440px bento layout asymétrico visible (IA 2x, resto 1x).

## 4. Casos: Solution Badges dinámicos

- [ ] 4.1 En `src/sections/Home.astro` (Cases section), agregar badges renderizados desde `c.solutions`. Se verifica: dev server muestra badges para cada caso (IA, CRM, etc).

- [ ] 4.2 Crear mapping de colores en CSS: `.badge-ia` (azul), `.badge-crm` (mint), `.badge-seguimiento` (naranja), `.badge-integraciones` (púrpura). Se verifica: viewport muestra badges con colores correctos.

- [ ] 4.3 Agregar `data-scroll` a cada Cases Card para reveal animation. Se verifica: dev server renderiza atributos, scroll down hacia casos muestra fade-in animation.

- [ ] 4.4 Verificar badges se ven bien en light y dark theme. Se verifica: browser toggle light/dark muestra badges legibles en ambos.

## 5. Proceso: Timeline Visual

- [ ] 5.1 En `src/sections/Home.astro` (Process section), reemplazar lista numbered items con timeline layout. Se verifica: dev server renderiza timeline, no es lista más, es grid con border-left.

- [ ] 5.2 Crear CSS timeline styling: `.timeline` con `border-left: 2px solid var(--accent)`, `.timeline-step` con `::before` pseudo circle. Se verifica: dev server 1440px muestra línea vertical + 5 círculos.

- [ ] 5.3 Agregar `data-scroll` a cada `.timeline-step` para stagger reveal. Se verifica: scroll a sección Proceso, pasos revelan uno por uno con 100ms delay.

- [ ] 5.4 Responsive: hide timeline line en <768px, stack steps vertical. Se verifica: viewport 390px sin línea, steps stacked, 1440px con línea visible.

## 6. Hero Section refinamiento

- [ ] 6.1 Verificar H1 font-size: 7-8vw desktop, 4.5-5vw mobile. Se verifica: dev server 1440px título ~7.5vw, 390px ~5vw, measurements en inspector browser.

- [ ] 6.2 Agregar `data-scroll` a Hero elements (título, lema, CTA, Proceso card) con stagger delays. Se verifica: dev server page load, elementos fade-in con visual stagger.

- [ ] 6.3 Verificar Hero layout: en desktop 1.5fr | 1fr grid, en mobile single column. Se verifica: 1440px grid layout, 390px single column, desktop Proceso card visible right, mobile below.

## 7. Testing: Responsive + Accesibilidad

- [ ] 7.1 Test 390px viewport: scroll cada sección, verificar no horizontal overflow, padding/margins OK. Se verifica: dev server http://localhost:3429, emulate 390px, scroll full page, no horizontal scroll.

- [ ] 7.2 Test 1440px viewport: verificar bento grid layout (IA 2x), timeline linea visible, badges colors. Se verifica: dev server 1440px, screenshot de cada sección.

- [ ] 7.3 Test prefers-reduced-motion: OS setting motion reduce, verificar animations son instant (no travel, solo opacity). Se verifica: Chrome DevTools → Rendering → prefers-reduced-motion, page animations instant/invisible.

- [ ] 7.4 Test keyboard navigation: Tab through all links/buttons (CTA, badges, timeline clicks si aplica). Se verifica: Tab desde top of page, visible focus on each interactive element.

- [ ] 7.5 Test color contrast badges + backgrounds en light/dark theme usando existing contrast.test.ts. Se verifica: `pnpm check` pasa, contrast.test.ts sin failures.

## 8. Testing: Lighthouse + Performance

- [ ] 8.1 Run Lighthouse desktop (1440px): Performance, Accessibility, Best Practices, SEO. Se verifica: `pnpm build && pnpm preview && pnpm perf`, Lighthouse scores ≥100 en 4 categorías.

- [ ] 8.2 Run Lighthouse mobile (390px): mismo 4 categorías. Se verifica: `pnpm perf` con mobile emulation, scores ≥100.

- [ ] 8.3 Verificar no animaciones CSS rompen Core Web Vitals (CLS, LCP). Se verifica: Lighthouse CLS ≤0.1, LCP ≤2.5s desktop.

- [ ] 8.4 Verificar scroll performance: 60fps animations, no jank. Se verifica: Chrome DevTools → Performance → record scroll Soluciones/Casos/Proceso, frame rate ≥55fps.

## 9. Testing: Visual + Content

- [ ] 9.1 Visual check: Hero → Soluciones → Casos → Proceso completo at 1440px. Verificar jerarquía visual, tamaños, spacing, colores. Se verifica: screenshot full page, matches blueprints de proposal (Hero 7-8vw, bento asymétrico, timeline).

- [ ] 9.2 Visual check: responsive 390px full page. Se verifica: screenshot mobile, single column layout, no overflow, readable.

- [ ] 9.3 Verificar caso "O&L Asesores" muestra badges IA + CRM + Seguimiento con colores. Se verifica: dev server viewport, caso O&L visible con 3 colored badges.

- [ ] 9.4 Verificar content no cambió (copy, links, images). Se verifica: `git diff src/content/` no tiene cambios, solo src/sections/ y src/styles/ modificadas.

## 10. Build + Cleanup

- [ ] 10.1 `pnpm check` (Biome, types, tests, imports, dead code). Se verifica: `pnpm check` pasa sin errors/warnings.

- [ ] 10.2 `pnpm build` producción. Se verifica: build succeeds, no errors, `.dist/` contiene assets.

- [ ] 10.3 `pnpm preview` (servidor static local). Se verifica: server runs, http://localhost:3000 cargable, página funciona.

- [ ] 10.4 Final Lighthouse on production build. Se verifica: `pnpm perf`, scores ≥100 todas 4 categorías desktop + mobile.

- [ ] 10.5 Verificar no console errors (JS, CSS parsing). Se verifica: dev tools Console tab limpia, sin errors/warnings rojos.

## 11. Documentation (opcional)

- [ ] 11.1 Actualizar `README.md` o `docs/` si hay cambios arquitectónicos significantes (BentoGrid, animation system). Se verifica: docs menciona nuevos componentes + cómo usarlos.

- [ ] 11.2 Agregar comentarios en `BentoGrid.astro` y `scroll-reveal.ts` si lógica no es obvia. Se verifica: código tiene comments que explican span logic y observer setup.
