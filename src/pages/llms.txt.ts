// llms.txt (https://llmstxt.org): what Chamba Simple is and where the Markdown of each page lives.
import type { APIRoute } from 'astro';
import { published } from '../content/cases.ts';
import { clients } from '../content/clients.ts';
import { en } from '../content/en.ts';
import { es } from '../content/es.ts';
import { PATHS, SITE } from '../content/site.ts';

const url = (path: string) => new URL(path, SITE.url).href;

export const GET: APIRoute = () => {
  const cases = published(import.meta.env.DEV);
  const body = [
    `# ${SITE.name}`,
    `> ${es.meta.description}`,
    `${en.meta.description} Contact: ${SITE.email}.`,
    `Clients: ${clients(import.meta.env.DEV)
      .map((c) => `${c.name} (${c.url})`)
      .join(', ')}.`,
    '## Español',
    [
      `- [${es.meta.title}](${url('/index.md')})`,
      ...cases.map(
        (c) => `- [${c.es.title}](${url(PATHS.es.case(c.es.slug))}.md): ${c.es.summary}`,
      ),
    ].join('\n'),
    '## English',
    [
      `- [${en.meta.title}](${url('/en.md')})`,
      ...cases.map(
        (c) => `- [${c.en.title}](${url(PATHS.en.case(c.en.slug))}.md): ${c.en.summary}`,
      ),
    ].join('\n'),
  ].join('\n\n');
  return new Response(`${body}\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
