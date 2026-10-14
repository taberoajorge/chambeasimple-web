import type { Content } from './es.ts';

// Language-free facts about the company. Empty fields switch their sections off until the owners
// fill them in: no WhatsApp button without a number, no tax id or invoice mention without a company.

export type Country = 'PE' | 'MX'; // add a code when the first client from there arrives

export const SITE = {
  url: 'https://chambasimple.com',
  name: 'Chambea Simple',
  email: 'hola@chambasimple.com',
  agenda: 'https://agenda.chambasimple.com',
  whatsapp: '', // international format without "+", e.g. "51999999999"
  // Where we can issue a local invoice (we have tax residence only in Peru and Mexico). An entry
  // shows up, in the footer, the FAQ and the JSON-LD, once its tax id is filled in.
  billing: [
    { country: 'PE', legalName: '', taxId: '', doc: 'RUC' }, // factura electrónica (SUNAT)
    { country: 'MX', legalName: '', taxId: '', doc: 'RFC' }, // CFDI (SAT)
  ] satisfies { country: Country; legalName: string; taxId: string; doc: string }[],
  // A starting price for a first version. Empty: only the method is shown.
  price: { pen: '', mxn: '', usd: '' },
  // The founders' LinkedIn links, so visitors can check who they would work with. Their profiles
  // should list Chambea Simple in their experience (design.md, 4b).
  showLinkedIn: true,
};

export const TEAM = [
  { id: 'sandra', name: 'Sandra Arroyo', linkedin: 'https://www.linkedin.com/in/sandiroar/' },
  { id: 'alex', name: 'Alex Taberoa', linkedin: 'https://www.linkedin.com/in/taberoajorge/' },
] as const;

export const PATHS = {
  es: { home: '/', privacy: '/privacidad', case: (slug: string) => `/casos/${slug}` },
  en: { home: '/en', privacy: '/en/privacy', case: (slug: string) => `/en/case-studies/${slug}` },
} as const;

export type Lang = keyof typeof PATHS;

// Search results show about 60 characters of a title: add the brand only when it fits.
export const pageTitle = (title: string) =>
  title.length + SITE.name.length + 3 <= 60 ? `${title} · ${SITE.name}` : title;

// Every "book a call" button goes to the agenda, in the page's language. `from` names the button
// (hero, header, contact…) so the owners' notice says where the booking came from.
export const book = (lang: Lang, from: string) =>
  `${SITE.agenda}${lang === 'en' ? '/en' : ''}?from=${encodeURIComponent(from)}`;

export const invoicing = () => SITE.billing.filter((b) => b.taxId);

// The invoice question only exists once we can issue an invoice somewhere.
export const faqItems = (t: Content) =>
  invoicing().length
    ? [...t.faq.items, { q: t.faq.invoice.q, a: t.faq.invoice.a(invoicing(), t.clients.country) }]
    : t.faq.items;
