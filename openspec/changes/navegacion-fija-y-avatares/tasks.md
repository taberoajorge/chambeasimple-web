# Tasks

## 1. Navegación

- [x] 1.1 Header fijo con fondo y `scroll-padding-top` igual a su alto. Se verifica en 390 y 1440 px: el header sigue visible al bajar y un clic en "Casos" deja el título de la sección visible.
- [x] 1.2 Título de sección fijo desde `md` en `Section.astro`, con el fondo del tono de la sección. Se verifica en 1440 px: el título acompaña a su sección y se va con ella.

## 2. Equipo

- [x] 2.1 Avatares SVG en `public/team/` y `avatar`/`photo` en `TEAM`. Se verifica viendo ambos avatares en `/` y `/en`, en tema claro y oscuro.
- [x] 2.2 Foto al pasar el puntero o enfocar, solo con `photo`. Se verifica con `photo` vacío (solo avatar) y con una foto de prueba (aparece al pasar el puntero).

## 3. Cierre

- [x] 3.1 `pnpm check`, `pnpm build` y `pnpm perf` en verde.

(2026-10-15: header de 73 px en escritorio y 69 px en 390 px (sin scroll horizontal, título sin fijar);
`#casos` deja la sección a 73 px del borde, justo bajo el header; el título fijo no deja asomar los puntos del
timeline en tema oscuro. Foto probada con una imagen temporal: opacidad 1 al pasar el puntero, y
vuelta a `photo: ''`. `pnpm perf`: 10 páginas × 2 dispositivos en 100/100/100/100.)

(2026-10-16: el logo del header decía "chambea" y el `gap` del flex partía la palabra en dos (texto suelto y
`span` eran flex items distintos); ahora es un solo `span` con "chamba" + "simple" y sin hueco interno. El
`<title>` del logo del footer pasa a "ChambaSimple". Avatar de Alex con el cabello rizado, como la referencia.
Fotos reales de `docs/investigacion-marca/fotos/` (400×400) convertidas a `public/team/*.webp` y en su lugar:
se ven al pasar el puntero, en lugar de los placeholders. `pnpm check`, `pnpm build` y `pnpm perf` en verde
con Node 24.)
