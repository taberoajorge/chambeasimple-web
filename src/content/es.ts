// The Spanish page. Its shape is the `Content` type: en.ts must match it key by key.
// Every claim here is a fact from the owners or a case; the owners approve the text (task 3.1).

export const es = {
  lang: 'es-PE',
  meta: {
    title: 'Chambea Simple · Software a la medida para empresas',
    description:
      'Software a la medida para empresas en Perú y México: investigación con IA, seguimiento de clientes, sistemas internos e integraciones. Probamos con tus datos.',
  },
  nav: {
    skip: 'Saltar al contenido',
    label: 'Principal',
    switchTo: { label: 'English', lang: 'en' },
  },
  cta: {
    primary: 'Agenda una conversación',
    mailSubject: 'Quiero conversar sobre un proyecto',
    mailBody: 'Hola, somos [empresa]. Nos gustaría resolver: ',
  },
  hero: {
    title: 'Software a la medida para empresas',
    lema: 'Hacemos software para la buena chamba.',
    lead: 'Para equipos que hoy hacen a mano lo que un sistema podría hacer por ellos: buscar clientes, darles seguimiento, ordenar la operación o conectar sus herramientas. Primero entendemos cómo trabajas; luego construimos por etapas, probando con datos reales.',
    secondary: 'Ver casos',
    note: 'La primera conversación es gratis. Antes de construir, probamos con tus datos.',
  },
  clients: {
    title: 'Empresas que trabajan con nosotros',
    country: { PE: 'Perú', MX: 'México' },
  },
  solutions: {
    id: 'que-resolvemos',
    title: 'Qué resolvemos',
    intro:
      'No vendemos un catálogo: cada solución se hace a la medida. Estos son los problemas que ya resolvimos, con el caso que lo prueba.',
    seeCase: 'Ver caso',
    items: [
      {
        id: 'research',
        title: 'Investigación y búsqueda con IA',
        body: 'Encontrar prospectos, empresas o inmuebles que cumplen tus criterios, con la fuente de cada dato.',
      },
      {
        id: 'follow-up',
        title: 'Seguimiento y conversaciones',
        body: 'Llevar las conversaciones por WhatsApp o correo en un solo lugar, con el siguiente paso claro.',
      },
      {
        id: 'internal',
        title: 'Sistemas internos y CRM',
        body: 'Ordenar clientes, oportunidades y tareas en una herramienta hecha para tu proceso.',
      },
      {
        id: 'integrations',
        title: 'Integraciones',
        body: 'Conectar las herramientas que ya usas para que los datos no se copien a mano.',
      },
    ],
  },
  process: {
    id: 'como-trabajamos',
    title: 'Cómo trabajamos',
    intro: 'Cinco pasos. En cada uno sabes qué recibes y qué decides.',
    gets: 'Recibes',
    steps: [
      {
        title: 'Conversación inicial',
        body: 'Nos cuentas qué quieres resolver. Es gratis.',
        gets: 'Una respuesta honesta sobre si podemos ayudarte.',
      },
      {
        title: 'Sesiones de entendimiento',
        body: 'Conocemos tu proceso, tus clientes y tus criterios con las personas que hacen el trabajo.',
        gets: 'Una propuesta con etapas, entregables y precio por etapa.',
      },
      {
        title: 'Prueba con datos reales',
        body: 'Antes de construir, probamos la idea con tus datos.',
        gets: 'Un punto de decisión: seguir, ajustar o parar.',
      },
      {
        title: 'Construcción por etapas',
        body: 'Construimos en entregas cortas, con sesiones de validación.',
        gets: 'Avances que puedes usar y una ronda de ajustes por etapa.',
      },
      {
        title: 'Entrega y traspaso',
        body: 'Capacitamos a tu equipo y dejamos todo documentado.',
        gets: 'El código y las cuentas, a nombre de tu empresa.',
      },
    ],
    pricing: {
      title: 'Cómo cobramos',
      items: [
        'Cotizamos por etapas después de entender el proceso, no antes.',
        'Pagas por hito: al aprobar cada entrega.',
        'Los servicios que usa el sistema (servidores, IA, datos) van a nombre de tu empresa; te estimamos su costo antes de empezar.',
      ],
      from: (p: { pen: string; mxn: string; usd: string }) =>
        `Una primera versión parte de S/ ${p.pen} en Perú, MXN ${p.mxn} en México o USD ${p.usd} en otros países.`,
    },
  },
  cases: {
    id: 'casos',
    title: 'Casos',
    intro: 'Proyectos reales, contados como son: qué problema había, qué construimos y qué falta.',
    status: {
      'in-progress': 'En curso',
      'own-product': 'Producto propio',
      delivered: 'Entregado',
    },
    readMore: 'Leer el caso',
    page: {
      client: 'Cliente',
      problem: 'El problema',
      built: 'Qué construimos',
      limits: 'Límites y decisiones',
      outcome: 'Dónde está hoy',
      back: 'Volver al inicio',
      nextStep: '¿Tienes un problema parecido?',
    },
  },
  ai: {
    id: 'ideas-con-ia',
    title: '¿Tienes una idea con IA? La hacemos realidad',
    intro:
      'La mayoría de los proyectos de IA no fallan por el modelo, sino por cómo encajan en el trabajo diario. Por eso empezamos con una prueba sobre tus datos, y con ese resultado decides.',
    fact: 'El 95 % de los pilotos de IA generativa no logra un impacto financiero medible.',
    source: {
      label: 'MIT NANDA (2025), citado por Stanford Digital Economy Lab (2026)',
      url: 'https://digitaleconomy.stanford.edu/app/uploads/2026/03/EnterpriseAIPlaybook_PereiraGraylinBrynjolfsson.pdf',
    },
    works: {
      title: 'Lo que funciona bien',
      items: [
        'Buscar e investigar en fuentes públicas, con la fuente de cada dato.',
        'Leer documentos y sacar sus datos: contratos, facturas, formularios.',
        'Clasificar y priorizar: correos, solicitudes, prospectos.',
        'Redactar borradores que una persona revisa: respuestas, propuestas, reportes.',
        'Responder preguntas sobre tus propios documentos.',
      ],
    },
    limits: {
      title: 'Lo que no prometemos',
      items: [
        'Decisiones sin revisión: la IA propone y una persona aprueba.',
        'Resultados sin datos: si la información no existe o está desordenada, primero la ordenamos.',
        'Cero errores: en la prueba medimos cuánto se equivoca y te lo decimos.',
        'Reemplazar el criterio de un abogado, un contador o un médico.',
      ],
    },
    cta: 'Cuéntanos tu idea',
    mailSubject: 'Tengo una idea con IA',
    mailBody: 'Hola, mi idea es: ',
  },
  why: {
    title: 'Por qué trabajar con nosotros',
    items: [
      {
        title: 'Probamos antes de construir',
        body: 'Antes de la construcción probamos la idea con tus datos reales. Si no da lo que esperamos, te lo decimos y decidimos juntos si ajustar o parar.',
      },
      {
        title: 'El código es tuyo',
        body: 'Todo queda a nombre de tu empresa: el código, las cuentas y los servicios.',
      },
      {
        title: 'Hablas con quien construye',
        body: 'Sin intermediarios: las sesiones son con las personas que escriben el software.',
      },
      {
        title: 'Entregas frecuentes',
        body: 'Ves avances desde las primeras semanas y decides con algo en la mano.',
      },
      {
        title: 'IA con revisión humana',
        body: 'Usamos IA para avanzar más rápido; cada cambio lo revisa una persona, y los sistemas que proponen acciones piden aprobación antes de ejecutarlas.',
      },
    ],
  },
  team: {
    title: 'Quiénes somos',
    intro:
      'Somos dos ingenieros de software. Juntamos el entendimiento de procesos de negocio con ingeniería de producto e IA.',
    linkedin: (name: string) => `LinkedIn de ${name}`,
    people: {
      sandra: {
        role: 'Cofundadora · Ingeniera full stack',
        bio: 'Llegó al software desde la ingeniería civil, la planificación y los datos. Lleva más de cuatro años construyendo software para equipos de construcción: planificación, tableros, permisos y reportes. Su fuerte es entender el proceso y convertirlo en un producto claro. React, Node.js, TypeScript y PostgreSQL.',
      },
      alex: {
        role: 'Cofundador · Ingeniero de software senior',
        bio: 'Más de cinco años llevando producto a producción, dos veces elegido desarrollador del año en su empresa. Construye agentes de IA que proponen antes de escribir, con aprobación explícita, y evaluaciones de modelos de lenguaje. TypeScript, Node.js, React, Python, PostgreSQL y AWS.',
      },
    },
  },
  faq: {
    title: 'Preguntas frecuentes',
    items: [
      {
        q: '¿Cuánto cuesta?',
        a: 'Depende de lo que haya que resolver. Después de las sesiones de entendimiento te enviamos una propuesta con etapas, entregables y el precio de cada etapa, en soles o en dólares. Pagas por hito.',
      },
      {
        q: '¿De quién es el código?',
        a: 'De tu empresa. El código, las cuentas y los servicios quedan a su nombre desde el inicio.',
      },
      {
        q: '¿Qué costos hay además del desarrollo?',
        a: 'Los servicios que el sistema usa para funcionar, como servidores, IA o fuentes de datos. Van a nombre de tu empresa y te estimamos su costo antes de empezar.',
      },
      {
        q: '¿Qué pasa si la prueba no funciona?',
        a: 'Por eso probamos antes de construir. Si la prueba con tus datos no da lo esperado, decidimos juntos si ajustar el enfoque o detenernos ahí.',
      },
      {
        q: '¿Qué necesitan de nosotros?',
        a: 'Tiempo para las sesiones, ejemplos reales de tu trabajo y una persona de tu equipo que valide cada entrega.',
      },
      {
        q: '¿Trabajan en remoto?',
        a: 'Sí. Trabajamos en remoto, en español y en inglés.',
      },
    ],
    invoice: {
      q: '¿Emiten factura?',
      a: (
        where: { country: 'PE' | 'MX'; legalName: string; doc: string; taxId: string }[],
        names: Record<'PE' | 'MX', string>,
      ) =>
        `Sí, en ${where.map((b) => `${names[b.country]} (${b.legalName}, ${b.doc} ${b.taxId})`).join(' y en ')}. En otros países cobramos en dólares, sin comprobante local.`,
    },
  },
  contact: {
    title: '¿Qué quieres resolver?',
    body: 'Cuéntanos en un correo qué hace tu equipo a mano hoy. Te respondemos para agendar una conversación de 30 minutos, gratis.',
    email: 'Escríbenos a',
  },
  notFound: {
    title: 'Esta página no existe',
    body: 'Puede que el enlace haya cambiado. Vuelve al inicio o escríbenos y te ayudamos.',
    home: 'Ir al inicio',
  },
  footer: {
    rights: 'Chambea Simple',
    inFormation: 'Empresa en constitución.',
    markdown: 'Esta página en Markdown',
  },
};

export type Content = typeof es;
