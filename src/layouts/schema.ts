// JSON-LD for the pages: who we are, what we solve and the FAQ, from the same content the page shows.
import { type Case, clientOf } from '../content/cases.ts';
import type { Content } from '../content/es.ts';
import { faqItems, invoicing, type Lang, PATHS, SITE, TEAM } from '../content/site.ts';

const org = (t: Content) => ({
  '@type': 'ProfessionalService',
  '@id': `${SITE.url}/#org`,
  name: SITE.name,
  url: SITE.url,
  email: SITE.email,
  slogan: t.hero.lema,
  description: t.meta.description,
  areaServed: 'PE',
  ...(invoicing()[0] && { legalName: invoicing()[0].legalName, taxID: invoicing()[0].taxId }),
  founder: TEAM.map((p) => ({
    '@type': 'Person',
    name: p.name,
    ...(SITE.showLinkedIn && { sameAs: p.linkedin }),
  })),
});

export const homeSchema = (t: Content, lang: Lang) => ({
  '@context': 'https://schema.org',
  '@graph': [
    {
      ...org(t),
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: t.solutions.title,
        itemListElement: t.solutions.items.map((s) => ({
          '@type': 'Offer',
          itemOffered: { '@type': 'Service', name: s.title, description: s.body },
        })),
      },
    },
    {
      '@type': 'WebPage',
      url: new URL(PATHS[lang].home, SITE.url).href,
      name: t.meta.title,
      inLanguage: t.lang,
      about: { '@id': `${SITE.url}/#org` },
    },
    {
      '@type': 'FAQPage',
      mainEntity: faqItems(t).map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ],
});

export const caseSchema = (t: Content, lang: Lang, c: Case) => {
  const home = new URL(PATHS[lang].home, SITE.url).href;
  const url = new URL(PATHS[lang].case(c[lang].slug), SITE.url).href;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: c[lang].title,
        description: c[lang].summary,
        inLanguage: t.lang,
        url,
        author: { '@id': `${SITE.url}/#org`, '@type': 'Organization', name: SITE.name },
        ...(clientOf(c) && {
          about: {
            '@type': 'Organization',
            name: clientOf(c)?.name,
            url: clientOf(c)?.url,
            ...(clientOf(c)?.logo && {
              logo: new URL(clientOf(c)?.logo?.src ?? '', SITE.url).href,
            }),
          },
        }),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: SITE.name, item: home },
          { '@type': 'ListItem', position: 2, name: t.cases.title, item: `${home}#${t.cases.id}` },
          { '@type': 'ListItem', position: 3, name: c[lang].title, item: url },
        ],
      },
    ],
  };
};
