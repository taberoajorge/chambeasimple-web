import type { Content } from './es.ts';

// Adapted for English readers, not translated line by line. Same keys as es.ts.
export const en: Content = {
  lang: 'en',
  meta: {
    title: 'Chambea Simple · Custom software for companies',
    description:
      'Custom software for companies in Peru, Mexico and beyond: AI research, client follow-up, internal tools and integrations. We test with your data first.',
  },
  nav: {
    skip: 'Skip to content',
    label: 'Main',
    switchTo: { label: 'Español', lang: 'es' },
  },
  cta: {
    primary: 'Book a conversation',
    mailSubject: "I'd like to talk about a project",
    mailBody: "Hi, we're [company]. We'd like to solve: ",
  },
  hero: {
    title: 'Custom software for companies',
    lema: 'We build software for good work.',
    lead: 'For teams that do by hand what a system could do for them: finding clients, following up, keeping operations in order or connecting their tools. First we learn how you work; then we build in stages, testing with real data.',
    secondary: 'See case studies',
    note: 'The first conversation is free. Before building, we test with your data.',
  },
  clients: {
    title: 'Companies we work with',
    country: { PE: 'Peru', MX: 'Mexico' },
  },
  solutions: {
    id: 'what-we-solve',
    title: 'What we solve',
    intro:
      "We don't sell a catalog: every solution is built to fit. These are the problems we've already solved, each with the case that shows it.",
    seeCase: 'See the case',
    items: [
      {
        id: 'research',
        title: 'AI research and search',
        body: 'Finding prospects, companies or properties that meet your criteria, with the source of every fact.',
      },
      {
        id: 'follow-up',
        title: 'Follow-up and conversations',
        body: 'Keeping WhatsApp or email conversations in one place, with the next step clear.',
      },
      {
        id: 'internal',
        title: 'Internal tools and CRMs',
        body: 'Organizing clients, opportunities and tasks in a tool built around your process.',
      },
      {
        id: 'integrations',
        title: 'Integrations',
        body: 'Connecting the tools you already use so nobody copies data by hand.',
      },
    ],
  },
  process: {
    id: 'how-we-work',
    title: 'How we work',
    intro: 'Five steps. At each one you know what you get and what you decide.',
    gets: 'You get',
    steps: [
      {
        title: 'First conversation',
        body: 'You tell us what you want to solve. It is free.',
        gets: 'An honest answer on whether we can help.',
      },
      {
        title: 'Discovery sessions',
        body: 'We learn your process, your clients and your criteria from the people who do the work.',
        gets: 'A proposal with stages, deliverables and a price per stage.',
      },
      {
        title: 'A test with real data',
        body: 'Before building, we test the idea with your data.',
        gets: 'A decision point: go on, adjust or stop.',
      },
      {
        title: 'Building in stages',
        body: 'We build in short deliveries, with review sessions.',
        gets: 'Progress you can use, and one round of changes per stage.',
      },
      {
        title: 'Delivery and handover',
        body: 'We train your team and leave everything documented.',
        gets: "The code and the accounts, in your company's name.",
      },
    ],
    pricing: {
      title: 'How we charge',
      items: [
        'We quote per stage after we understand the process, not before.',
        'You pay per milestone, when you approve each delivery.',
        "The services the system runs on (servers, AI, data) are in your company's name; we estimate their cost before we start.",
      ],
      from: (p: { pen: string; mxn: string; usd: string }) =>
        `A first version starts at USD ${p.usd} (S/ ${p.pen} in Peru, MXN ${p.mxn} in Mexico).`,
    },
  },
  cases: {
    id: 'case-studies',
    title: 'Case studies',
    intro: 'Real projects, told as they are: the problem, what we built and what is still open.',
    status: {
      'in-progress': 'In progress',
      'own-product': 'Our own product',
      delivered: 'Delivered',
    },
    readMore: 'Read the case',
    page: {
      client: 'Client',
      problem: 'The problem',
      built: 'What we built',
      limits: 'Limits and decisions',
      outcome: 'Where it stands',
      back: 'Back to home',
      nextStep: 'Have a similar problem?',
    },
  },
  ai: {
    id: 'ai-ideas',
    title: 'Have an AI idea? We build it',
    intro:
      "Most AI projects don't fail because of the model, but because of how they fit into daily work. So we start with a test on your data, and you decide with that result in hand.",
    fact: '95% of generative AI pilots show no measurable financial impact.',
    source: {
      label: 'MIT NANDA (2025), cited by the Stanford Digital Economy Lab (2026)',
      url: 'https://digitaleconomy.stanford.edu/app/uploads/2026/03/EnterpriseAIPlaybook_PereiraGraylinBrynjolfsson.pdf',
    },
    works: {
      title: 'What works well',
      items: [
        'Searching and researching public sources, with the source of every fact.',
        'Reading documents and pulling out their data: contracts, invoices, forms.',
        'Sorting and prioritizing: emails, requests, prospects.',
        'Drafting what a person then reviews: replies, proposals, reports.',
        'Answering questions about your own documents.',
      ],
    },
    limits: {
      title: "What we don't promise",
      items: [
        'Decisions nobody reviews: AI proposes, a person approves.',
        "Results without data: if the information doesn't exist or is a mess, we sort it out first.",
        'Zero errors: in the test we measure how often it is wrong and tell you.',
        'Replacing the judgment of a lawyer, an accountant or a doctor.',
      ],
    },
    cta: 'Tell us your idea',
    mailSubject: 'I have an AI idea',
    mailBody: 'Hi, my idea is: ',
  },
  why: {
    title: 'Why work with us',
    items: [
      {
        title: 'We test before we build',
        body: "Before building, we test the idea with your real data. If it doesn't deliver, we tell you and decide together whether to adjust or stop.",
      },
      {
        title: 'The code is yours',
        body: "Everything is in your company's name: the code, the accounts and the services.",
      },
      {
        title: 'You talk to the builders',
        body: 'No middlemen: sessions are with the people who write the software.',
      },
      {
        title: 'Frequent deliveries',
        body: 'You see progress from the first weeks and decide with something in hand.',
      },
      {
        title: 'AI with human review',
        body: 'We use AI to move faster; a person reviews every change, and systems that propose actions ask for approval before acting.',
      },
    ],
  },
  team: {
    title: 'Who we are',
    intro:
      'We are two software engineers. We bring together an understanding of business processes with product engineering and AI.',
    linkedin: (name: string) => `${name} on LinkedIn`,
    people: {
      sandra: {
        role: 'Co-founder · Full-stack engineer',
        bio: 'She came to software from civil engineering, planning and data. For more than four years she has built software for construction teams: scheduling, dashboards, permissions and reports. Her strength is understanding a process and turning it into a clear product. React, Node.js, TypeScript and PostgreSQL.',
      },
      alex: {
        role: 'Co-founder · Senior software engineer',
        bio: 'More than five years shipping product to production, twice named developer of the year at his company. He builds AI agents that propose before they write, with explicit approval, and language-model evaluations. TypeScript, Node.js, React, Python, PostgreSQL and AWS.',
      },
    },
  },
  faq: {
    title: 'Frequently asked questions',
    items: [
      {
        q: 'How much does it cost?',
        a: 'It depends on what needs solving. After the discovery sessions we send a proposal with stages, deliverables and the price of each stage, in US dollars or Peruvian soles. You pay per milestone.',
      },
      {
        q: 'Who owns the code?',
        a: 'Your company. The code, the accounts and the services are in its name from day one.',
      },
      {
        q: 'What costs are there besides development?',
        a: 'The services the system needs to run, such as servers, AI or data sources. They are in your company’s name and we estimate their cost before we start.',
      },
      {
        q: "What if the test doesn't work?",
        a: "That's why we test before building. If the test with your data doesn't deliver, we decide together whether to change the approach or stop there.",
      },
      {
        q: 'What do you need from us?',
        a: 'Time for the sessions, real examples of your work and one person on your team to review each delivery.',
      },
      {
        q: 'Do you work remotely?',
        a: 'Yes. We work remotely, in Spanish and English.',
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
    title: 'What do you want to solve?',
    body: 'Email us what your team does by hand today. We reply to set up a free 30-minute conversation.',
    email: 'Write to',
  },
  notFound: {
    title: 'This page does not exist',
    body: 'The link may have changed. Go back home or write to us and we will help.',
    home: 'Go home',
  },
  footer: {
    rights: 'Chambea Simple',
    inFormation: 'Company being incorporated.',
    markdown: 'This page in Markdown',
  },
};
