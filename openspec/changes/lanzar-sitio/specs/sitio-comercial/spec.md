# Spec Delta

## Purpose

La página principal de Chambea Simple: que una empresa entienda en segundos qué hacemos y para quién, vea pruebas reales, sepa cómo sería trabajar con nosotros y tenga un siguiente paso fácil, en el teléfono igual que en el escritorio.

## ADDED Requirements

### Requirement: Promesa en la primera pantalla
La primera pantalla SHALL decir, sin desplazarse y en el teléfono (390×844) igual que en el escritorio (1440×900):
- qué hacemos (software a la medida para empresas);
- para quién es;
- el lema "Hacemos software para la buena chamba";
- un botón principal de contacto y uno secundario (ver casos).

El título MUST ser un `h1` que incluya el nombre de la marca y el servicio.

#### Scenario: Primer vistazo en el teléfono
- **WHEN** alguien abre `/` en un viewport de 390×844
- **THEN** ve la promesa, el lema y el botón de contacto sin desplazarse

### Requirement: Secciones en orden de decisión
La página SHALL presentar, en este orden:
1. **Promesa.**
2. **Prueba temprana:** cifras verificables o logos de clientes que aprobaron aparecer.
3. **Qué resolvemos:** no es un catálogo. Cada solución es a la medida, y la sección muestra los tipos de problema que ya resolvimos, cada uno enlazado al caso que lo prueba:
   - investigación y búsqueda con IA (prospectos, empresas, inmuebles);
   - seguimiento y conversaciones (WhatsApp, correo);
   - sistemas internos y CRM;
   - integraciones.
4. **Cómo trabajamos:** el método, en cinco pasos, cada uno con lo que el cliente recibe:
   1. conversación inicial gratuita;
   2. sesiones de entendimiento del proceso, los clientes y los criterios, que terminan en una propuesta con etapas, entregables y precio por etapa;
   3. prueba con datos reales y un punto de decisión antes de construir;
   4. construcción iterativa con sesiones de validación y una ronda de ajustes por etapa;
   5. entrega, capacitación y traspaso; el código y las cuentas quedan a nombre del cliente.
5. **Casos de éxito.**
6. **Por qué nosotros:** el código es del cliente, trato directo con quien construye, entregas frecuentes, desarrollo asistido por IA con revisión humana.
7. **Quiénes somos:** Sandra Arroyo y Alex Taberoa.
8. **Preguntas frecuentes.**
9. **Contacto final.**

Una sección sin datos reales aprobados MUST NOT publicarse con contenido de relleno: se omite hasta tenerlos.

#### Scenario: Sin cifras todavía
- **WHEN** aún no hay cifras ni logos aprobados para la prueba temprana
- **THEN** la sección no aparece y la página pasa de la promesa a los servicios

### Requirement: Inversión transparente
La página SHALL explicar cómo se arma el precio:
- se cotiza después de las sesiones de entendimiento, por etapas y con entregables;
- se paga por hito;
- si la prueba con datos reales no sirve, no se sigue sin acuerdo de las dos partes;
- los costos de operación (IA, búsqueda, hosting) van a nombre del cliente.

Puede mostrar además un rango de partida para una primera versión, en **soles y en dólares**, como dos valores que los dueños fijan en los datos del sitio. Si están vacíos, la página solo explica el método, sin cifra. El rango MUST NOT revelar el precio de un cliente concreto ni basarse en un precio de excepción.

#### Scenario: Sin rango definido
- **WHEN** el rango de partida está vacío en los datos del sitio
- **THEN** la sección explica el método de cotización y no muestra ninguna cifra

#### Scenario: Rango en las dos monedas
- **WHEN** los dueños fijan el rango en soles y en dólares
- **THEN** la página en español lo muestra primero en soles y la página en inglés primero en dólares, siempre con las dos cifras

### Requirement: Datos de empresa cuando existan
Chambea Simple está en proceso de constituirse; el nombre ya está reservado. Solo hay residencia fiscal en Perú y en México, así que los datos legales SHALL vivir en los datos del sitio, uno por país:
- Perú: razón social y RUC (factura electrónica SUNAT);
- México: razón social y RFC (CFDI del SAT).

Mientras un país no tenga su identificador fiscal, la página MUST NOT mencionarlo. Cuando exista, aparece en el pie, en las preguntas frecuentes ("¿Emiten factura?", que aclara que en otros países se cobra en dólares sin comprobante local) y en el JSON-LD de la organización (`legalName`, `taxID`), sin tocar componentes. El precio de partida, cuando se fije, se muestra en soles, pesos mexicanos y dólares.

#### Scenario: Antes de tener RUC ni RFC
- **WHEN** los dos identificadores están vacíos
- **THEN** ni el pie, ni las preguntas frecuentes, ni el JSON-LD mencionan RUC, RFC o factura

#### Scenario: Con RUC y sin RFC
- **WHEN** se rellenan la razón social y el RUC de Perú, y México sigue vacío
- **THEN** la factura se ofrece solo en Perú, y México no aparece

### Requirement: Clientes en un solo registro
Los clientes SHALL vivir en una sola lista tipada (`content/clients.ts`): nombre, web, país, desde cuándo y quién aprobó que aparezca. Agregar un cliente MUST ser agregar una entrada, sin tocar componentes. Los casos MUST referirse al cliente por su identificador, sin repetir sus datos. Un cliente sin aprobación MUST NOT aparecer en el sitio construido. La lista de clientes aprobados aparece en la prueba temprana, en la versión Markdown de la página y en `llms.txt`. La skill `add-client` MUST guiar a cualquier agente por los pasos, incluida la aprobación.

#### Scenario: Nuevo cliente
- **WHEN** se agrega a `clients.ts` un cliente con su aprobación
- **THEN** aparece en `/`, `/en`, `index.md`, `en.md` y `llms.txt` sin otros cambios, y `pnpm check` lo valida

#### Scenario: Caso con un cliente que no existe
- **WHEN** un caso apunta a un identificador de cliente que no está en la lista
- **THEN** `pnpm check` falla

### Requirement: Contenido por idioma, tipado
Todos los textos SHALL vivir en archivos de contenido por idioma (`es` por defecto, `en`). El inglés MUST tener la misma forma que el español, y si falta una clave la comprobación de tipos falla. Ningún componente MUST contener texto visible escrito a mano.

#### Scenario: Clave que falta
- **WHEN** se borra una clave del contenido en inglés
- **THEN** `pnpm typecheck` falla

### Requirement: Mobile-first y escritorio a la par
El diseño SHALL construirse primero para 360–430 px y ampliarse a tablet y escritorio. En ningún ancho entre 320 y 1920 px MUST haber desplazamiento horizontal, texto cortado ni controles desalineados. Los objetivos táctiles MUST medir al menos 44×44 px. La navegación en el teléfono MUST dejar a mano el contacto en todo momento, con un botón que siempre se ve y no tapa contenido.

#### Scenario: Anchos extremos
- **WHEN** se recorre la página a 320, 390, 768, 1024, 1440 y 1920 px
- **THEN** no hay desplazamiento horizontal ni elementos solapados, y las capturas lo muestran

### Requirement: Las personas detrás
La sección "Quiénes somos" SHALL presentar a Sandra Arroyo y Alex Taberoa. Cada uno lleva:
- su nombre y su rol en Chambea Simple;
- una bio de 40 a 80 palabras con una experiencia verificable;
- un enlace a su LinkedIn.

La sección va en la mitad inferior de la página, nunca en la primera pantalla.

Fotos:
- MUST ser reales, recientes y de estilo coherente entre los dos (misma luz, fondo y encuadre);
- nunca de banco de imágenes;
- sin fotos que cumplan esto, se publica sin fotos.

Ningún dato confidencial de un empleador actual (clientes, montos de contratos, métricas internas) MUST aparecer en las bios.

#### Scenario: Sin fotos coherentes
- **WHEN** no hay fotos reales de los dos con el mismo estilo
- **THEN** la sección muestra nombre, rol, bio y LinkedIn sin imagen, y no usa avatares genéricos

### Requirement: Tema claro y oscuro según el usuario
La página SHALL seguir la preferencia del sistema del visitante (`prefers-color-scheme`), en el teléfono y en el escritorio, sin JavaScript y sin parpadeo. Los dos temas salen de la paleta del logo:

| Token | Oscuro | Claro |
|---|---|---|
| Fondo | `#02130F` | `#F7FBF9` |
| Superficie | `#0B231C` | `#FFFFFF` |
| Texto | `#EFFBF6` | `#02130F` |
| Texto secundario | `#A3B8B0` | `#4A5E57` |
| Acento como texto | `#62F0BB` | `#0A6B4B` |
| Botón principal | menta `#62F0BB` con texto `#02130F` | igual |

Cada combinación de texto y fondo MUST tener un contraste de al menos 4.5:1. El menta MUST NOT usarse como color de texto en el tema claro (sobre blanco da 1,4:1). El tema también MUST respetar `prefers-contrast: more` y `forced-colors`. El logo se sirve como SVG en las dos variantes, y `theme-color` va por esquema.

#### Scenario: Teléfono en modo claro
- **WHEN** alguien abre `/` con su teléfono en modo claro
- **THEN** la página se ve en el tema claro desde el primer pintado, y todos los textos cumplen 4.5:1

#### Scenario: Contrastes medidos
- **WHEN** se miden los pares de la tabla en los dos temas
- **THEN** todos dan al menos 4.5:1 (el texto sobre el botón menta da 13,3:1)

### Requirement: Llamado a la acción inconfundible
Hay una sola acción principal, "Agenda una conversación", con un solo estilo: el botón menta con texto oscuro, igual en los dos temas. Mientras no haya WhatsApp abre un correo; después abre WhatsApp. Se repite en la primera pantalla, después de "Cómo trabajamos", al final de cada caso y en el cierre. En el teléfono una barra inferior fija la deja siempre a mano, sin tapar contenido.

Las acciones secundarias ("Ver casos", "Cómo trabajamos") SHALL verse claramente secundarias: enlace o botón de contorno. Ningún otro elemento MUST usar el estilo del botón principal.

#### Scenario: Una acción por pantalla
- **WHEN** se recorre la página en el teléfono
- **THEN** en cada pantalla hay como mucho un botón menta, y la barra inferior no tapa el texto ni los enlaces
