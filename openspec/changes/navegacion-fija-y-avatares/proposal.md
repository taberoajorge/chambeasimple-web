# Proposal

## Why

En una página larga, quien lee pierde de vista dónde está y tiene que volver arriba para saltar a
otra sección. El prototipo aprobado fija el título de "Cómo trabajamos" mientras dura la sección;
los dueños quieren eso en todas las secciones, el menú siempre a mano, y que "Quiénes somos" tenga
una cara: un avatar ilustrado al estilo Notion, con la foto real al pasar el puntero.

## What Changes

- El header (logo, secciones, agendar, tema, idioma) queda fijo arriba al hacer scroll. Los saltos a
  `#seccion` caen debajo del header, no tapados por él.
- Desde `md`, el título de cada sección se queda fijo bajo el header mientras su sección está en
  pantalla y se va con ella al terminar. En el teléfono no: header, título y barra de contacto
  juntos dejan poco espacio para leer.
- "Quiénes somos": cada persona tiene un avatar ilustrado (SVG, colores de la marca) en una forma
  orgánica, no cuadrada. Con `photo` en `TEAM`, al pasar el puntero o enfocar la tarjeta aparece la
  foto real en la misma forma; sin `photo`, solo el avatar.

## Capabilities

### New Capabilities

- `navegacion-y-equipo`: header fijo, títulos de sección fijos y avatares del equipo.

## Impact

- `src/layouts/Base.astro`, `src/sections/Section.astro`, `src/sections/Home.astro`,
  `src/styles/global.css`, `src/content/site.ts`, `public/team/`.
- Sin dependencias ni JavaScript nuevos.
