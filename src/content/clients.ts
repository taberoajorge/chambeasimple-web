// Every client, once. Cases point here by id. To add one, follow the add-client skill:
// a client appears on the built site only with `approval` (who said yes, and when).

import type { Country } from './site.ts';

type Client = {
  id: string;
  name: string;
  url: string;
  country: Country;
  since: string; // YYYY-MM, when the work started
  // Their logo in public/clients/, with its pixel size (no layout shift). The name is its alt text.
  logo?: { src: string; width: number; height: number };
  approval: { by: string; on: string } | null;
};

const CLIENTS: Client[] = [
  {
    id: 'ol-asesores',
    name: 'O&L Asesores Perú',
    url: 'https://www.oylasesores.com/',
    country: 'PE',
    since: '2026-08',
    logo: { src: '/clients/ol-asesores.webp', width: 277, height: 96 }, // from their public site
    approval: { by: 'Josué, de O&L Asesores, por medio de Alex Taberoa', on: '2026-10-14' },
  },
];

export const clientById = (id: string) => CLIENTS.find((c) => c.id === id);

// Approved clients only, except while developing locally.
export const clients = (dev: boolean) => CLIENTS.filter((c) => dev || c.approval);
