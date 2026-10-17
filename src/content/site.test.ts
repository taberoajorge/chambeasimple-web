import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { test } from 'node:test';
import { clientOf, published } from './cases.ts';
import { clients } from './clients.ts';
import { en } from './en.ts';
import { es } from './es.ts';
import { agendaUrl, book, faqItems, invoicing, SITE } from './site.ts';

test('every book-a-call link goes to the agenda in the right language, with its origin', () => {
  assert.equal(book('es', 'hero'), 'https://agenda.chambasimple.com?from=hero');
  assert.equal(book('en', 'case-ol'), 'https://agenda.chambasimple.com/en?from=case-ol');
});

test('only pnpm dev books against the local agenda; builds and tests use the published one', () => {
  assert.equal(agendaUrl(true), 'http://localhost:8788');
  assert.equal(agendaUrl(false), 'https://agenda.chambasimple.com');
  assert.equal(SITE.agenda, 'https://agenda.chambasimple.com', 'tests have no import.meta.env');
});

test('the invoice question appears only when the company can issue invoices', () => {
  const extra = invoicing().length ? 1 : 0;
  assert.equal(faqItems(es).length, es.faq.items.length + extra);
  assert.equal(faqItems(en).length, en.faq.items.length + extra);
  assert.deepEqual(
    SITE.billing.map((b) => b.country),
    ['PE', 'MX'],
    'we have tax residence only in Peru and Mexico',
  );
  const both = [
    {
      country: 'PE' as const,
      legalName: 'Chambea Simple S.A.C.',
      doc: 'RUC',
      taxId: '20123456789',
    },
    { country: 'MX' as const, legalName: 'Chambea Simple', doc: 'RFC', taxId: 'XAXX010101000' },
  ];
  assert.match(es.faq.invoice.a(both, es.clients.country), /Perú .*RUC 20123456789.* México .*RFC/);
  assert.match(en.faq.invoice.a(both, en.clients.country), /US dollars/);
});

test('only approved cases are built; dev shows every case', () => {
  assert.ok(published(false).every((c) => c.approval));
  assert.ok(published(true).length > published(false).length, 'the job CRM waits for approval');
});

test('both languages link the same anchors and case slugs differ per language', () => {
  for (const key of ['solutions', 'process', 'cases'] as const) assert.ok(es[key].id && en[key].id);
  for (const c of published(true)) assert.notEqual(c.es.slug, c.en.slug);
});

test('every case points at a client that exists, and ids are unique', () => {
  for (const c of published(true))
    if (c.client) assert.ok(clientOf(c), `${c.id}: no client '${c.client}'`);
  for (const list of [published(true), clients(true)]) {
    const ids = list.map((x) => x.id);
    assert.equal(new Set(ids).size, ids.length);
  }
});

test('only approved clients are built, with a start date and a public https site', () => {
  assert.ok(clients(false).every((c) => c.approval));
  for (const c of clients(true)) {
    assert.match(c.since, /^\d{4}-(0[1-9]|1[0-2])$/, c.id);
    assert.equal(new URL(c.url).protocol, 'https:', c.id);
  }
});

test('every client logo exists in public/ with its size', () => {
  for (const c of clients(true))
    if (c.logo) {
      assert.ok(
        existsSync(new URL(`../../public${c.logo.src}`, import.meta.url)),
        `${c.id}: ${c.logo.src} missing`,
      );
      assert.ok(c.logo.width > 0 && c.logo.height > 0, `${c.id}: logo needs its size`);
    }
});
