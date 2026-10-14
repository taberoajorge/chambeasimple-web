// The Markdown twin of every page, for agents (spec seo-e-idiomas): same facts, no layout.
// worker/index.ts serves it on the page URL too when the request asks for `Accept: text/markdown`.
import type { APIRoute } from 'astro';
import { type Case, clientOf, published } from '../content/cases.ts';
import { clients } from '../content/clients.ts';
import { en } from '../content/en.ts';
import { type Content, es } from '../content/es.ts';
import { book, faqItems, type Lang, PATHS, SITE, TEAM } from '../content/site.ts';

const T: Record<Lang, Content> = { es, en };
const url = (path: string) => new URL(path, SITE.url).href;
const list = (items: string[]) => items.map((i) => `- ${i}`).join('\n');

const home = (lang: Lang, cases: Case[]) => {
  const t = T[lang];
  return [
    `# ${SITE.name}: ${t.hero.title}`,
    `> ${t.hero.lema} ${t.meta.description}`,
    t.hero.lead,
    `${t.cta.primary}: <${book(lang, 'markdown')}>`,
    `## ${t.clients.title}`,
    list(
      clients(import.meta.env.DEV).map(
        (c) => `[${c.name}](${c.url}) (${t.clients.country[c.country]})`,
      ),
    ),
    `## ${t.solutions.title}`,
    t.solutions.intro,
    list(t.solutions.items.map((s) => `**${s.title}:** ${s.body}`)),
    `## ${t.process.title}`,
    t.process.steps
      .map((s, i) => `${i + 1}. **${s.title}.** ${s.body} ${t.process.gets}: ${s.gets}`)
      .join('\n'),
    `### ${t.process.pricing.title}`,
    list(t.process.pricing.items),
    `## ${t.cases.title}`,
    list(
      cases.map(
        (c) =>
          `[${c[lang].title}](${url(PATHS[lang].case(c[lang].slug))}.md) (${t.cases.status[c.status]}): ${c[lang].summary}`,
      ),
    ),
    `## ${t.ai.title}`,
    t.ai.intro,
    `> ${t.ai.fact} (${t.ai.source.label}: ${t.ai.source.url})`,
    `### ${t.ai.works.title}`,
    list(t.ai.works.items),
    `### ${t.ai.limits.title}`,
    list(t.ai.limits.items),
    `${t.ai.cta}: <${book(lang, 'markdown')}>`,
    `## ${t.why.title}`,
    list(t.why.items.map((w) => `**${w.title}:** ${w.body}`)),
    `## ${t.team.title}`,
    t.team.intro,
    list(TEAM.map((p) => `**${p.name}**, ${t.team.people[p.id].role}. ${t.team.people[p.id].bio}`)),
    `## ${t.faq.title}`,
    faqItems(t)
      .map((f) => `### ${f.q}\n\n${f.a}`)
      .join('\n\n'),
    `## ${t.contact.title}`,
    `${t.contact.body} <${book(lang, 'markdown')}> · ${t.contact.email} <mailto:${SITE.email}>.`,
  ].join('\n\n');
};

const study = (lang: Lang, item: Case) => {
  const t = T[lang];
  const c = item[lang];
  const client = clientOf(item);
  return [
    `# ${c.title}`,
    `> ${c.summary}`,
    `${t.cases.status[item.status]}${client ? `. ${t.cases.page.client}: [${client.name}](${client.url})` : ''}.`,
    `## ${t.cases.page.problem}\n\n${c.problem}`,
    `## ${t.cases.page.built}\n\n${list(c.built)}`,
    `## ${t.cases.page.limits}\n\n${list(c.limits)}`,
    `## ${t.cases.page.outcome}\n\n${c.outcome}`,
    `${t.cases.page.nextStep} ${t.cta.primary}: <${book(lang, 'markdown')}>.`,
  ].join('\n\n');
};

const privacy = (lang: Lang) => {
  const t = T[lang];
  return [
    `# ${t.privacy.title}`,
    `> ${t.privacy.updated} ${t.privacy.draft}`,
    ...t.privacy.sections.map((s) => `## ${s.title}\n\n${s.body}`),
  ].join('\n\n');
};

export const getStaticPaths = () => {
  const cases = published(import.meta.env.DEV);
  return (['es', 'en'] as const).flatMap((lang) => [
    { params: { path: lang === 'es' ? 'index' : 'en' }, props: { body: home(lang, cases) } },
    { params: { path: PATHS[lang].privacy.slice(1) }, props: { body: privacy(lang) } },
    ...cases.map((c) => ({
      params: { path: PATHS[lang].case(c[lang].slug).slice(1) },
      props: { body: study(lang, c) },
    })),
  ]);
};

export const GET: APIRoute = ({ props }) =>
  new Response(`${props.body}\n`, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
