import type { Content } from './es.ts';

// Written for English-speaking buyers, not translated line by line. Same keys as es.ts.
// The "small version first" step is called a pilot everywhere (docs/seo-ingles.md explains why).
export const en: Content = {
  lang: 'en',
  meta: {
    title: 'Custom software development for businesses · Chambea Simple',
    description:
      'Custom software development for companies in Peru, Mexico and beyond: AI prospect research, follow-up, internal tools and integrations. See a pilot work first.',
  },
  nav: {
    skip: 'Skip to content',
    theme: 'Dark mode',
    label: 'Main',
    switchTo: { label: 'Español', lang: 'es' },
  },
  cta: {
    primary: 'Book a call',
  },
  hero: {
    title: 'Custom software for the way your business works',
    lema: 'We build software for good work.',
    lead: 'For teams still doing by hand what software could do for them: finding customers, following up, keeping operations organized or connecting their tools. We start by learning how you work. Then we build in phases, and you see each one working.',
    secondary: 'See case studies',
    note: 'The first call is free. Before you commit to the full build, you see a pilot working on your own cases.',
  },
  clients: {
    title: 'Companies we work with',
    country: { PE: 'Peru', MX: 'Mexico' },
  },
  solutions: {
    id: 'what-we-solve',
    title: 'What we build',
    intro:
      "We don't sell off-the-shelf packages: everything is built to fit. These are problems we've already solved, each with the case study that shows it.",
    seeCase: 'See the case study',
    items: [
      {
        id: 'research',
        title: 'AI research and prospecting',
        body: 'Find prospects, companies or properties that match your criteria, with a source for every fact.',
      },
      {
        id: 'follow-up',
        title: 'Conversations and follow-up',
        body: 'Keep WhatsApp and email conversations in one place, with a clear next step.',
      },
      {
        id: 'internal',
        title: 'Internal tools and custom CRMs',
        body: 'Track customers, deals and tasks in a tool built around your process.',
      },
      {
        id: 'integrations',
        title: 'Integrations',
        body: 'Connect the tools you already use, so nobody copies data by hand.',
      },
    ],
  },
  process: {
    id: 'how-we-work',
    title: 'How we work',
    intro: 'Five steps. At each one, you know what you get and what you decide.',
    gets: 'You get',
    steps: [
      {
        title: 'Free intro call',
        body: 'Tell us what you want to fix. The call is free.',
        gets: 'An honest answer on whether we can help.',
      },
      {
        title: 'Discovery',
        body: 'We learn your process, your customers and your criteria from the people who do the work.',
        gets: 'A proposal with phases, deliverables and a price for each phase.',
      },
      {
        title: 'A pilot first',
        body: 'Before we build everything, we build a pilot: a small version that runs on real cases from your company.',
        gets: 'You see it working and decide: continue, adjust or stop.',
      },
      {
        title: 'Build in phases',
        body: 'We build in short iterations, with review sessions along the way.',
        gets: 'Working software you can use, plus one round of changes per phase.',
      },
      {
        title: 'Launch and handover',
        body: 'We train your team and document everything.',
        gets: "The code and the accounts, in your company's name.",
      },
    ],
    pricing: {
      title: 'How pricing works',
      items: [
        'We quote each phase once we understand your process, not before.',
        'You pay by milestone, as you approve each delivery.',
        "The services the system runs on (servers, AI, data) are set up in your company's name. We estimate what they cost before we start.",
      ],
      from: (p: { pen: string; mxn: string; usd: string }) =>
        `A first version starts at USD ${p.usd} (S/ ${p.pen} in Peru, MXN ${p.mxn} in Mexico).`,
    },
  },
  cases: {
    id: 'case-studies',
    title: 'Case studies',
    intro: "Real projects, told straight: the problem, what we built and what's still open.",
    status: {
      'in-progress': 'In progress',
      'own-product': 'Our own product',
      delivered: 'Delivered',
    },
    readMore: 'Read the case study',
    page: {
      client: 'Client',
      problem: 'The problem',
      built: 'What we built',
      limits: 'Limits and decisions',
      outcome: 'Where it stands',
      back: 'Back to home',
      nextStep: 'Facing a similar problem?',
    },
  },
  ai: {
    id: 'ai-ideas',
    title: "Have an AI idea? We'll build it",
    intro:
      "Most AI projects don't fail because of the model. They fail because they don't fit the way people actually work. So we start with a pilot on real cases from your company and measure how it does. You see it working, then decide whether to continue, adjust or stop.",
    fact: '95% of generative AI pilots show no measurable financial impact.',
    source: {
      label: 'MIT NANDA (2025), cited by the Stanford Digital Economy Lab (2026)',
      url: 'https://digitaleconomy.stanford.edu/app/uploads/2026/03/EnterpriseAIPlaybook_PereiraGraylinBrynjolfsson.pdf',
    },
    works: {
      title: 'Where AI works well',
      items: [
        'Searching and researching public sources, with the source of every fact.',
        'Reading documents and pulling out the data: contracts, invoices, forms.',
        'Sorting and prioritizing emails, requests and prospects.',
        'Drafting replies, proposals and reports for a person to review.',
        'Answering questions about your own documents.',
      ],
    },
    limits: {
      title: "What we don't promise",
      items: [
        'Decisions without review: AI suggests, a person approves.',
        "Results without data: if the information doesn't exist or is a mess, we organize it first.",
        'Zero errors: in the pilot we measure how often it gets things wrong, and we tell you.',
        'Replacing the judgment of a lawyer, an accountant or a doctor.',
      ],
    },
    cta: 'Tell us your idea',
  },
  why: {
    title: 'Why work with us',
    items: [
      {
        title: 'See it work before you invest',
        body: "Before we build the whole system, we run a pilot on real cases from your company. If it doesn't deliver what we expected, we tell you, and we decide together whether to adjust or stop, before you invest in the rest.",
      },
      {
        title: 'You own the code',
        body: "Everything is in your company's name: the code, the accounts and the services.",
      },
      {
        title: 'You talk to the people who build it',
        body: 'No middlemen: every session is with the engineers who write the software.',
      },
      {
        title: 'Frequent releases',
        body: 'You see progress from the first few weeks and make decisions with something real in hand.',
      },
      {
        title: 'AI with a human in the loop',
        body: 'We use AI to move faster, and a person reviews every change. Systems that suggest actions ask for approval before they act.',
      },
    ],
  },
  team: {
    title: 'Who we are',
    intro:
      "We're two software engineers. We combine a working knowledge of business processes with product engineering and AI.",
    linkedin: (name: string) => `${name} on LinkedIn`,
    people: {
      sandra: {
        role: 'Co-founder · Full-stack engineer',
        bio: 'She came to software from civil engineering, planning and data. For more than four years she has built software for construction teams: scheduling, dashboards, permissions and reports. Her strength is understanding a process and turning it into a clear product. React, Node.js, TypeScript and PostgreSQL.',
      },
      alex: {
        role: 'Co-founder · Senior software engineer',
        bio: 'More than five years shipping products to production, and twice named developer of the year at his company. He builds AI agents that propose before they write, with explicit approval, and LLM evaluations. TypeScript, Node.js, React, Python, PostgreSQL and AWS.',
      },
    },
  },
  faq: {
    title: 'Frequently asked questions',
    items: [
      {
        q: 'How much does it cost?',
        a: 'It depends on what needs fixing. After discovery we send you a proposal with phases, deliverables and the price of each phase, in US dollars or Peruvian soles. You pay by milestone.',
      },
      {
        q: 'Who owns the code?',
        a: 'Your company does. The code, the accounts and the services are in its name from day one.',
      },
      {
        q: 'Are there costs besides development?',
        a: "Yes: the services the system needs to run, such as servers, AI or data sources. They're in your company's name, and we estimate their cost before we start.",
      },
      {
        q: "What if the pilot doesn't work?",
        a: "That's why we build it first. If it doesn't deliver on your real cases, we decide together whether to change the approach or stop there, without you paying for the whole system.",
      },
      {
        q: 'What do you need from us?',
        a: 'Time for the sessions, real examples of your work, and one person on your team to review each delivery.',
      },
      {
        q: 'Do you work remotely or on site?',
        a: 'The whole project can run remotely, in English or Spanish. For mid-size and larger projects we can also meet on site in Peru or Mexico, for example for discovery or team training.',
      },
    ],
    invoice: {
      q: 'Do you issue invoices?',
      a: (
        where: { country: 'PE' | 'MX'; legalName: string; doc: string; taxId: string }[],
        names: Record<'PE' | 'MX', string>,
      ) =>
        `Yes, in ${where.map((b) => `${names[b.country]} (${b.legalName}, ${b.doc} ${b.taxId})`).join(' and in ')}. Elsewhere we bill in US dollars, without a local tax invoice.`,
    },
  },
  contact: {
    title: 'What do you want to fix?',
    body: 'Pick a time for a free 30-minute call on Google Meet. Tell us what your team still does by hand and we will see if we can help.',
    email: 'Prefer email? Write to',
  },
  notFound: {
    title: 'Page not found',
    body: "The link may have changed. Go back to the home page, or write to us and we'll help.",
    home: 'Go to the home page',
  },
  privacy: {
    title: 'Privacy',
    description:
      'What data Chambea Simple handles: no cookies or tracking, visits counted without identifying anyone, and your rights over the data you give us.',
    updated: 'Updated October 14, 2026.',
    sections: [
      {
        title: 'No cookies, no tracking',
        body: "This site uses no cookies, loads no ad pixels or analytics scripts, and doesn't follow you to other sites.",
      },
      {
        title: 'What we measure',
        body: "For each page view, our server records the page, the site you came from, the campaign (if the link carries one), the country, and whether the visit looks like a person, a bot or an AI agent. We don't store your IP address or anything that identifies you.",
      },
      {
        title: 'If you write to us or book a call',
        body: "We use your name, company, email and what you tell us only to reply and prepare for the call. A booking lives in our Google Calendar; we don't share or sell it. Only with your separate consent do we tell an ad platform that a visit ended in a booking.",
      },
      {
        title: 'Your rights',
        body: 'You can ask us to see, correct or delete your data, or object to its use (Peru: Ley 29733; Mexico: LFPDPPP), by writing to hola@chambasimple.com. We reply within 10 business days.',
      },
    ],
    draft: 'Draft pending legal review.',
    link: 'Privacy',
  },
  footer: {
    rights: 'Chambea Simple',
    inFormation: 'Incorporation in progress.',
    markdown: 'This page in Markdown',
  },
};
