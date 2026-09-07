import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculateQuote, minimumDate, quoteSchema } from '../src/lib/quote';
import { wineries, combos } from '../src/lib/data';
import { contentSchema, defaultContent } from '../src/lib/content';
const valid = () => ({
  date: minimumDate(),
  days: 1,
  pax: 2,
  privateTransfer: true,
  items: [{ day: 1, wineryId: 1 }],
  name: 'Viajera Test',
  email: 'test@example.com',
  phone: '+5492611234567',
  notes: '',
  accepted: true,
});
test('Seven-day boundary uses Mendoza calendar, including UTC midnight', () => {
  assert.equal(minimumDate(new Date('2026-09-07T01:00:00Z')), '2026-09-13');
  assert.equal(minimumDate(new Date('2026-12-28T15:00:00Z')), '2027-01-04');
});
test('Dates reject impossible days and less than seven days notice', () => {
  assert.equal(quoteSchema.safeParse(valid()).success, true);
  assert.equal(quoteSchema.safeParse({ ...valid(), date: '2030-02-30' }).success, false);
  assert.equal(quoteSchema.safeParse({ ...valid(), date: '2020-01-01' }).success, false);
});
test('Quote requires visits each day, unique visits, max three and valid day assignment', () => {
  for (const changes of [
    { days: 2 },
    { items: [{ day: 2, wineryId: 1 }] },
    {
      items: [
        { day: 1, wineryId: 1 },
        { day: 1, wineryId: 1 },
      ],
    },
    { items: [1, 2, 3, 4].map((wineryId) => ({ day: 1, wineryId })) },
    { accepted: false },
    { pax: 0 },
    { pax: 13 },
  ])
    assert.equal(quoteSchema.safeParse({ ...valid(), ...changes }).success, false);
});
test('Server calculation ignores arbitrary supplied totals and groups transfers by four', () => {
  assert.deepEqual(
    calculateQuote({ days: 1, pax: 5, privateTransfer: true }, [{ day: 1, wineryId: 1 }]),
    { experiences: 600, transfer: 240, total: 840, perPerson: 168 },
  );
  assert.equal(
    calculateQuote({ days: 2, pax: 3, privateTransfer: false }, [
      { day: 1, wineryId: 1 },
      { day: 2, wineryId: 8 },
    ]).total,
    540,
  );
  assert.equal(
    calculateQuote(
      { days: 1, pax: 2, privateTransfer: true },
      [{ day: 1, wineryId: 1 }],
      wineries,
      150,
    ).total,
    390,
  );
  assert.throws(() =>
    calculateQuote({ days: 1, pax: 2, privateTransfer: false }, [{ day: 1, wineryId: 999 }]),
  );
});
test('All curated combos validate and prices use the same engine', () => {
  for (const combo of combos) {
    assert.equal(
      quoteSchema.safeParse({ ...valid(), days: combo.days, items: combo.items }).success,
      true,
    );
    assert.ok(
      calculateQuote({ days: combo.days, pax: 2, privateTransfer: true }, combo.items).total > 0,
    );
  }
  assert.equal(wineries.length, 9);
});
test('CMS validates initial content and refuses invalid prices, URLs and orphan visits', () => {
  assert.equal(contentSchema.safeParse(defaultContent).success, true);
  const c = structuredClone(defaultContent);
  c.settings.usdToArs = -1;
  assert.equal(contentSchema.safeParse(c).success, false);
  c.settings.usdToArs = 1400;
  c.heroSlides = ['javascript:alert(1)'];
  assert.equal(contentSchema.safeParse(c).success, false);
  c.heroSlides = defaultContent.heroSlides;
  c.combos[0].items = [{ day: 1, wineryId: 999 }];
  assert.equal(contentSchema.safeParse(c).success, false);
});
