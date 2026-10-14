# Spec Delta

## Purpose

Los casos de éxito son la prueba más fuerte de una consultora: muestran que entendimos un problema parecido al del visitante, que entregamos y qué cambió. Esta capacidad define su formato, dónde viven y qué evidencia se exige para publicarlos.

## ADDED Requirements

### Requirement: Un caso, una página
Cada caso SHALL tener su propia página indexable en cada idioma (`/casos/<slug>` y `/en/case-studies/<slug>`), con:
- un titular que empieza por el resultado;
- el cliente (nombre o descripción anónima aprobada), su sector y su tamaño;
- el problema;
- lo que construimos y con qué tecnología;
- las decisiones y límites (qué quedó fuera);
- el resultado;
- una cita del cliente, cuando la apruebe;
- un llamado a la acción ("¿Un problema parecido? Hablemos").

La página principal MUST mostrar un resumen de cada caso que enlace a su página.

#### Scenario: Caso completo
- **WHEN** se abre `/casos/<slug>`
- **THEN** se ven titular, cliente, problema, solución, decisiones, resultado y contacto, y la página tiene su propio `title`, `description`, `canonical` y `hreflang`

### Requirement: Solo evidencia real y aprobada
Un caso SHALL publicarse solo con datos reales:
- una cifra MUST indicar su punto de partida, su periodo y su fuente;
- si no hay cifra medida, se describe el cambio observado sin inventar porcentajes;
- el nombre, el logo, las capturas y las citas del cliente MUST tener aprobación escrita;
- los datos privados MUST aparecer ocultos en las capturas.

Cada caso MUST llevar en su contenido un registro de qué está aprobado y por quién. El sitio no muestra ese registro.

#### Scenario: Caso sin aprobación del nombre
- **WHEN** el cliente no aprobó aparecer con su nombre
- **THEN** el caso se publica con una descripción anónima (sector y tamaño) y sin logo

#### Scenario: Sin cifra medida
- **WHEN** no hay una cifra con punto de partida y periodo
- **THEN** el resultado se escribe como cambio observado ("pasó de hojas sueltas a un solo sistema") y no aparece ningún porcentaje

### Requirement: Proyectos en curso
Un proyecto que todavía no se entrega SHALL poder publicarse como **proyecto en curso**, con una etiqueta visible. Debe mostrar:
- el cliente, si está aprobado;
- el problema;
- qué se está construyendo;
- cómo se trabaja (etapas y punto de decisión);
- en qué etapa va.

Un proyecto en curso MUST NOT mostrar resultados, precios ni condiciones comerciales del cliente. Cuando se entregue, pasa a caso completo con su resultado.

#### Scenario: O&L en curso
- **WHEN** se abre la página del buscador de prospectos de O&L Asesores
- **THEN** se ve la etiqueta "proyecto en curso", el problema, el flujo (configuración, documentos y requisitos, investigación con IA, lista de empresas con evidencia y revisión del equipo) y la etapa actual, sin precios ni resultados

### Requirement: Los primeros casos
El lanzamiento SHALL incluir los que los dueños aprueben de esta lista:
- **O&L Asesores** ([oylasesores.com](https://www.oylasesores.com/)), proyecto en curso: buscador de prospectos B2B con IA. El equipo de O&L indica qué necesita (un perfil de búsqueda, hasta 3 documentos y hasta 3 requisitos); la IA investiga fuentes públicas y entrega hasta 100 empresas, cada una con la señal encontrada, la fuente, la fecha y por qué encaja; el equipo revisa y exporta. Los dos perfiles iniciales son empresas extranjeras que inician operaciones en el Perú y empresas medianas con personal extranjero en planilla.
- **CRM de búsqueda de empleo** (`job.taberoa.com`), producto propio en producción: CRM móvil con Supabase, login con Clerk, herramientas MCP para agentes de IA y un ciclo de investigación de empresas.
- **Búsqueda y seguimiento de departamentos y proyectos inmobiliarios con IA**, producto propio: encuentra opciones que cumplen requisitos concretos (zona, precio, metraje y otros) y lleva por WhatsApp las conversaciones, el seguimiento y la negociación con las inmobiliarias, con la IA sugiriendo respuestas y próximos pasos. Se describe sin cifras, porque no hay mediciones, y sin nombrar el conector de WhatsApp que se usó.

Un caso sin datos suficientes MUST NOT publicarse a medias.

#### Scenario: Faltan datos de un caso
- **WHEN** un caso no tiene problema, solución y resultado confirmados por sus dueños
- **THEN** no se publica y la sección muestra solo los casos completos
