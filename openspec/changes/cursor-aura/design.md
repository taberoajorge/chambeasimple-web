# Design

## Contexto

El sitio tiene una regla dura: **nada de JavaScript por defecto**; el único script que corre es el
del tema, que el CSP del Worker autoriza por su hash (`worker/csp.ts`). Cualquier script nuevo tiene
que sumarse a esa lista y superar `scripts/checks/seo.ts`, que falla el build si el CSP bloquearía un
script. Lighthouse 100 en las cuatro categorías es un requisito, y el movimiento se reduce cuando el
sistema lo pide.

## Decisiones

### El efecto: aura, no cursor de reemplazo

Se descarta el "custom cursor" que oculta el nativo (riesgo de accesibilidad y de perder el puntero).
Se elige un **aura difusa de menta** por encima del contenido, muy baja en alfa, que se siente como
una luz y no como un velo. Reproduce lo que ya hace el wordmark de la marca con su glow menta.

### Una sola capa, centrada con `transform`

El `<div id="aura">` es fijo, `pointer-events: none`, `aria-hidden`. La posición se mueve solo con
`translate3d(x, y, 0) translate(-50%, -50%)` (composición en GPU, sin reflow). El centro de la capa
queda bajo el puntero con el `translate(-50%, -50%)`, así el script no calcula offsets.

### Apilado: por encima de lo fijo, nunca cortada

El header (`z-30`) y los títulos de sección pegajosos (`z-20`) son opacos; con la capa por debajo, el
aura quedaba cortada justo ahí. El `z-index` se fija en **31**: por encima de ambos para que la luz no
se corte, pero por debajo del skip-link (`z-50`) para no tapar el foco. Como la capa no captura
eventos y va a baja alfa, pasar por encima de esos bloques no los vuelve inoperables (el banner
inferior de contacto es móvil, donde el aura no corre).

### Movimiento suave y auto-terminante

La posición sigue al puntero con interpolación lineal (`x += (target - x) * 0.12`) dentro de
`requestAnimationFrame`, disparado desde `pointermove`. El bucle se **duerme** cuando el delta baja
de 0.1 px y vuelve a despertar en el siguiente `pointermove`: no consume en reposo.

### Acotado por media queries *y* por JavaScript

El aura se muestra solo bajo `(hover: hover) and (pointer: fine) and (min-width: 768px)` y con
`:root[data-js]`. El script repite las mismas guardas y retorna antes de registrar cualquier
listener: en táctil/móvil el coste es cero. Con `prefers-reduced-motion: reduce` la capa se oculta
por CSS (`display: none`) y el script no arranca.

### El CSP, por hash

El script viaja inline (como el del tema) y se autoriza por `sha256` en `worker/csp.ts`, que guarda el
hash literal. `worker/index.test.ts` calcula el hash del string exportado y falla si divergen; el
`seo.ts` del build comprueba cada página contra el CSP. Al ser un string insertado con `set:html`,
no lleva `<` ni `&` para que el HTML serializado sea idéntico al string y el hash no cambie.

### Tokens, no colores sueltos

El color del aura es el token `--aura` (`light-dark(...)`, menta de la marca en ambos temas, algo más
fuerte en claro para que se perciba sobre el blanco). `contrast.test.ts` prohíbe hex fuera de
`global.css`, así que el script y el markup no llevan color.

## Alternativas descartadas

- **CSS puro sin JS**: imposible seguir el puntero sin script.
- **Ocultar el cursor nativo**: problemas de accesibilidad; se mantiene el nativo.
- **Estela de partículas**: más peso y ruido del que pide la marca.
- **Solo en el hero**: menos superficie de riesgo, pero el objetivo es que toda la visita se sienta
  interactiva.

## Riesgos

- **Contraste**: el aura pasa por encima del texto a baja alfa. Se verifica visualmente en claro y
  oscuro y con Lighthouse; si molesta, se baja el alfa o el tamaño.
- **Lighthouse**: en móvil no corre (sin puntero); en escritorio, con solo `transform` y el bucle
  dormido, no debe mover INP, LCP ni CLS. Se comprueba con `pnpm perf`.
