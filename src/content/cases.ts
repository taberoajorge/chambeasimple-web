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
      slug: 'ol-asesores-immigration-deadlines',
      title: 'Immigration deadline tracking for O&L Asesores',
      summary:
        'A back office where O&L moves each client case through its stages and emails the client before a permit expires.',
      problem:
        'For an immigration law firm, the problem is not paperwork but memory: if a residence permit expires unnoticed, the client loses their legal status. Client and case information was spread across spreadsheets and chats.',
      built: [
        'Services: every case the firm handles, with counters that double as filters, CSV export and a detail panel.',
        'A board per service type: each case moves through its stages by drag and drop, and closing or cancelling asks for confirmation.',
        'Clients: companies and individuals, the people at each company and their upcoming expiries.',
        'Service types the firm sets up on its own: which dates raise alerts, how many days ahead and which stages they have. A new kind of procedure is configuration, not code.',
        "Email alerts every Monday: one email per client with everything coming due, and a digest for the firm's team. Every send is logged.",
        'Admin and editor roles, all in Spanish, with light and dark themes.',
      ],
      limits: [
        'Every change is written as a spec first and reviewed with the firm in rounds.',
        'Before release, 35 end-to-end tests walk through the app against its own database.',
        'Preview deployments use a separate database: real data never leaves production.',
      ],
      outcome:
        "In production since September 2026, with O&L's real clients. Adjustments to alerts and some views are still open.",
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
      slug: 'ol-asesores-b2b-prospect-finder',
      title: 'An AI B2B prospect finder for O&L Asesores',
      summary:
        "An app where O&L's team says what it needs and AI returns a list of companies likely to need corporate immigration services, each with its evidence and source.",
      problem:
        'O&L supports companies with foreign staff in Peru: contracts, immigration status, foreign resident cards, renewals and the legal cap on foreign workers. Finding companies worth contacting was manual work.',
      built: [
        "We configure the app with O&L's knowledge: its services, client types, criteria and exclusions.",
        'The team picks a search profile and adds documents and requirements (region, sector, size or another condition).',
        'Two starting profiles: foreign companies starting operations in Peru, and mid-sized companies with foreign staff on payroll.',
        'AI researches public sources and returns a list of companies, each with its website, the signal found, its source and date, why it fits and what could not be confirmed.',
        'The team reviews each company, marks the ones it wants and exports the list. Results are saved.',
      ],
      limits: [
        'Before building, we test the search with real prospects.',
        'Results describe public signals to decide whom to contact; they do not prove a company needs the service.',
        'Drafting messages and following up with contacts is a second stage.',
      ],
      outcome:
        'In progress: we start by defining the profiles and testing the search with real prospects.',
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
      slug: 'real-estate-search-and-follow-up',
      title: 'AI search and follow-up for apartments',
      summary:
        'Finds apartments and projects that meet specific requirements and carries the WhatsApp conversations, follow-up and negotiation with real-estate agencies.',
      problem:
        "Looking for an apartment means sifting through dozens of listings that don't match and keeping several conversations with agencies going at once.",
      built: [
        "Search for apartments and projects against specific requirements (for example area, price or size); AI discards what doesn't fit.",
        'The WhatsApp conversations with each agency live in one place, with their history.',
        'AI suggests replies and next steps for follow-up and negotiation; a person decides what is sent.',
      ],
      limits: [
        'It is our own product, with no measured figures.',
        'For clients we use the official WhatsApp Business API.',
      ],
      outcome:
        'The same base, search with criteria plus conversations with follow-up, works for finding and answering sales prospects.',
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
      slug: 'crm-with-ai-agents',
      title: 'A CRM with AI agents for a job search',
      summary:
        'A mobile CRM in production where AI agents research companies and record jobs and contacts, always with approval before writing.',
      problem:
        'A serious job search means dozens of companies, openings and contacts spread across sheets and chats; without order, follow-ups get lost.',
      built: [
        'A mobile web app on Supabase, with sign-in (Clerk) and permissions that only let the owner in.',
        'MCP tools so AI agents can read and record data without duplicating or overwriting changes.',
        'A company research loop that proposes opportunities with their source.',
        'Verified migration from the previous version: 93 jobs and 92 contacts restored.',
      ],
      limits: ['No message goes out on its own: external sends need the owner’s approval.'],
      outcome: 'In production at job.taberoa.com.',
    },
  },
];

export const clientOf = (c: Case) => (c.client ? clientById(c.client) : undefined);

// Approved cases only, except while developing locally.
export const published = (dev: boolean) => CASES.filter((c) => dev || c.approval);
