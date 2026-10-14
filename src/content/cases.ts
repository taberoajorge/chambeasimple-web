// Cases and projects. Only real, approved facts: a figure needs its baseline, period and source;
// without one, the text describes what changed and no percentage appears. `approval` records who
// approved publishing and when; a case without it only shows in `astro dev`.

import { clientById } from './clients.ts';

type Text = {
  slug: string;
  title: string;
  summary: string;
  problem: string;
  built: string[];
  limits: string[];
  outcome: string;
};

export type Case = {
  id: string;
  status: 'in-progress' | 'own-product' | 'delivered';
  solutions: ('research' | 'follow-up' | 'internal' | 'integrations')[];
  client?: string; // an id from clients.ts
  approval: { by: string; on: string } | null;
  es: Text;
  en: Text;
};

const CASES: Case[] = [
  {
    id: 'ol-backoffice',
    status: 'delivered',
    solutions: ['internal'],
    client: 'ol-asesores',
    approval: { by: 'Alex Taberoa, con conformidad de O&L Asesores', on: '2026-10-14' },
    es: {
      slug: 'ol-asesores-vencimientos-migratorios',
      title: 'Control de vencimientos migratorios para O&L Asesores',
      summary:
        'Un back office donde O&L lleva cada trámite de sus clientes por etapas y avisa por correo antes de que venza un permiso.',
      problem:
        'Para un estudio de asesoría migratoria, el problema no es el papeleo sino la memoria: si un permiso de residencia vence sin que nadie lo note, el cliente pierde su situación legal. La información de clientes y trámites estaba repartida entre hojas de cálculo y chats.',
      built: [
        'Servicios: todos los trámites del estudio, con contadores que sirven de filtro, exportación a CSV y un panel de detalle.',
        'Un tablero por tipo de servicio: cada trámite avanza por sus etapas arrastrándolo, y cerrar o cancelar pide confirmación.',
        'Clientes: empresas y personas, la gente de cada empresa y sus próximos vencimientos.',
        'Tipos de servicio que el estudio configura solo: qué fechas generan alertas, con cuántos días de anticipación y qué etapas tienen. Un trámite nuevo es configuración, no código.',
        'Alertas por correo cada lunes: un solo correo por cliente con todo lo que vence, y un resumen para el equipo. Cada envío queda registrado.',
        'Usuarios con roles de administrador y editor, todo en español y con tema claro y oscuro.',
      ],
      limits: [
        'Cada cambio se escribe primero como especificación y se revisa con el estudio por rondas.',
        'Antes de publicar, 35 pruebas de punta a punta recorren la aplicación contra su propia base de datos.',
        'Las vistas previas usan una base de datos separada: los datos reales nunca salen de producción.',
      ],
      outcome:
        'En producción desde septiembre de 2026, con los clientes reales de O&L. Siguen abiertos ajustes a las alertas y a algunas vistas.',
    },
    en: {
      slug: 'ol-asesores-immigration-case-management',
      title: 'Immigration case management software for O&L Asesores',
      summary:
        'Custom immigration case management software: O&L moves each client case through its stages, and an email goes out before a permit expires.',
      problem:
        "For an immigration consultancy, the hard part isn't the paperwork, it's remembering. If a residence permit expires and nobody notices, the client loses their legal status. Client and case information was spread across spreadsheets and chats.",
      built: [
        'Services: every case the firm handles, with counters that double as filters, CSV export and a detail panel.',
        'A board for each service type: cases move through their stages by drag and drop, and closing or cancelling a case asks for confirmation.',
        'Clients: companies and individuals, the people at each company, and their upcoming expiry dates.',
        'Service types the firm configures on its own: which dates trigger alerts, how many days ahead, and which stages each type has. A new kind of procedure is a setting, not code.',
        "Email alerts every Monday: one email per client with everything coming due, plus a summary for the firm's team. Every email sent is logged.",
        'Admin and editor roles, an interface in Spanish, and light and dark themes.',
      ],
      limits: [
        'Every change starts as a written spec and is reviewed with the firm in rounds.',
        'Before each release, 35 end-to-end tests run through the app against its own database.',
        'Preview deployments use a separate database, so real data never leaves production.',
      ],
      outcome:
        "In production since September 2026, with O&L's real clients. Some changes to the alerts and a few views are still open.",
    },
  },
  {
    id: 'ol-prospects',
    status: 'in-progress',
    solutions: ['research'],
    client: 'ol-asesores',
    approval: { by: 'Alex Taberoa, con conformidad de O&L Asesores', on: '2026-10-14' },
    es: {
      slug: 'ol-asesores-buscador-de-prospectos',
      title: 'Buscador de prospectos B2B con IA para O&L Asesores',
      summary:
        'El equipo de O&L dice qué busca y la IA entrega empresas que probablemente necesiten gestión migratoria corporativa, cada una con su evidencia y su fuente.',
      problem:
        'O&L acompaña a empresas con personal extranjero en el Perú: contratos, calidades migratorias, carnés de extranjería, renovaciones y control del límite de extranjeros. Encontrar empresas a las que vale la pena escribir era un trabajo manual.',
      built: [
        'Configuramos la aplicación con el conocimiento de O&L: sus servicios, sus tipos de cliente, sus criterios y sus exclusiones.',
        'El equipo elige un perfil de búsqueda y añade documentos y requisitos (territorio, sector, tamaño u otra condición).',
        'Dos perfiles iniciales: empresas extranjeras que inician operaciones en el Perú y empresas medianas con personal extranjero en planilla.',
        'La IA investiga fuentes públicas y entrega una lista de empresas, cada una con su web, la señal encontrada, la fuente y la fecha, por qué encaja y qué no se pudo confirmar.',
        'El equipo revisa cada empresa, marca las que le interesan y exporta la lista. Los resultados quedan guardados.',
      ],
      limits: [
        'Antes de construir, probamos la búsqueda con prospectos reales.',
        'Los resultados describen señales públicas para decidir a quién contactar; no acreditan que una empresa necesite el servicio.',
        'Preparar mensajes y dar seguimiento a los contactos queda para una segunda etapa.',
      ],
      outcome:
        'Proyecto en curso: empezamos por la definición de los perfiles y la prueba con prospectos reales.',
    },
    en: {
      slug: 'ol-asesores-ai-lead-generation',
      title: 'AI lead generation tool for O&L Asesores',
      summary:
        "O&L's team describes what it's looking for, and AI returns companies likely to need corporate immigration services, each with its evidence and source.",
      problem:
        'O&L supports companies with foreign staff in Peru: contracts, immigration status, foreign resident cards, renewals and the legal cap on foreign workers. Finding companies worth contacting was manual work.',
      built: [
        "We set up the app with O&L's know-how: its services, client types, criteria and exclusions.",
        'The team picks a search profile and adds documents and requirements (region, industry, company size or another condition).',
        'Two starting profiles: foreign companies starting operations in Peru, and mid-sized companies with foreign staff on payroll.',
        'AI researches public sources and returns a list of companies, each with its website, the signal it found, the source and date, why it fits, and what it could not confirm.',
        'The team reviews each company, marks the ones worth pursuing and exports the list. Results are saved.',
      ],
      limits: [
        'Before the full build, we pilot the search on real prospects.',
        'Results describe public signals to help decide whom to contact; they do not prove that a company needs the service.',
        'Drafting outreach messages and following up with contacts come in a second phase.',
      ],
      outcome:
        'In progress: we are starting with the search profiles and the pilot on real prospects.',
    },
  },
  {
    id: 'real-estate',
    status: 'own-product',
    solutions: ['research', 'follow-up'],
    approval: { by: 'Alex Taberoa', on: '2026-10-14' },
    es: {
      slug: 'busqueda-y-seguimiento-de-inmuebles',
      title: 'Búsqueda y seguimiento de departamentos con IA',
      summary:
        'Encuentra departamentos que cumplen requisitos concretos y lleva por WhatsApp las conversaciones, el seguimiento y la negociación con las inmobiliarias.',
      problem:
        'Buscar departamento es revisar decenas de anuncios que no cumplen lo que necesitas y sostener a la vez conversaciones con varias inmobiliarias.',
      built: [
        'Búsqueda de departamentos y proyectos con requisitos concretos (por ejemplo zona, precio o metraje); la IA descarta lo que no encaja.',
        'Las conversaciones con cada inmobiliaria por WhatsApp quedan en un solo lugar, con su historial.',
        'La IA sugiere respuestas y próximos pasos para el seguimiento y la negociación; una persona decide qué se envía.',
      ],
      limits: [
        'Es un producto propio, sin cifras medidas.',
        'Para clientes usamos la API oficial de WhatsApp Business.',
      ],
      outcome:
        'La misma base, búsqueda con criterios más conversaciones con seguimiento, sirve para encontrar y atender prospectos comerciales.',
    },
    en: {
      slug: 'ai-apartment-search-whatsapp-follow-up',
      title: 'AI apartment search and WhatsApp follow-up',
      summary:
        'Finds apartments that meet specific requirements and manages the WhatsApp conversations, follow-up and negotiation with real estate agencies.',
      problem:
        "Looking for an apartment means going through dozens of listings that don't match what you need, while keeping conversations going with several agencies at once.",
      built: [
        "Search for apartments and new developments against specific requirements (for example neighborhood, price or size); AI filters out what doesn't fit.",
        'Every WhatsApp conversation with each agency lives in one place, with its full history.',
        'AI suggests replies and next steps for follow-up and negotiation; a person decides what gets sent.',
      ],
      limits: [
        "It's our own product, with no measured results.",
        'For client projects we use the official WhatsApp Business API.',
      ],
      outcome:
        'The same foundation, criteria-based search plus conversations with follow-up, works for finding and following up with sales prospects.',
    },
  },
  {
    id: 'job-crm',
    status: 'own-product',
    solutions: ['internal', 'research', 'integrations'],
    approval: null, // drafted from the repository; Alex approves before it is published
    es: {
      slug: 'crm-con-agentes-de-ia',
      title: 'CRM con agentes de IA para una búsqueda de empleo',
      summary:
        'Un CRM móvil en producción donde agentes de IA investigan empresas y registran vacantes y contactos, siempre con aprobación antes de escribir.',
      problem:
        'Una búsqueda de empleo seria son decenas de empresas, vacantes y contactos repartidos en hojas y chats; sin orden, los seguimientos se pierden.',
      built: [
        'Aplicación web móvil sobre Supabase, con inicio de sesión (Clerk) y permisos que solo dejan pasar al dueño.',
        'Herramientas MCP para que los agentes de IA consulten y registren datos sin duplicar ni pisar cambios.',
        'Un ciclo de investigación de empresas que propone oportunidades con su fuente.',
        'Migración verificada desde la versión anterior: 93 vacantes y 92 contactos restaurados.',
      ],
      limits: ['Ningún mensaje sale solo: los envíos externos necesitan la aprobación del dueño.'],
      outcome: 'En producción en job.taberoa.com.',
    },
    en: {
      slug: 'custom-crm-with-ai-agents',
      title: 'Custom CRM with AI agents for a job search',
      summary:
        'A mobile CRM in production where AI agents research companies and log jobs and contacts, always with approval before they write anything.',
      problem:
        'A serious job search means dozens of companies, openings and contacts spread across spreadsheets and chats; without a system, follow-ups get lost.',
      built: [
        'A mobile web app on Supabase, with sign-in through Clerk and permissions that only let the owner in.',
        'MCP tools that let AI agents read and record data without creating duplicates or overwriting changes.',
        'A company research loop that suggests opportunities, each with its source.',
        'A verified migration from the previous version: 93 jobs and 92 contacts restored.',
      ],
      limits: ["Nothing goes out on its own: every external message needs the owner's approval."],
      outcome: 'In production at job.taberoa.com.',
    },
  },
];

export const clientOf = (c: Case) => (c.client ? clientById(c.client) : undefined);

// Approved cases only, except while developing locally.
export const published = (dev: boolean) => CASES.filter((c) => dev || c.approval);
