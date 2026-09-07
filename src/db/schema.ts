import {
  pgTable,
  serial,
  text,
  integer,
  doublePrecision,
  uuid,
  timestamp,
  date,
  boolean,
  pgEnum,
  jsonb,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
export const siteContent = pgTable('site_content', {
  id: integer('id').primaryKey(),
  content: jsonb('content').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
export const quoteStatus = pgEnum('quote_status', [
  'Pendiente',
  'En Gestión',
  'Confirmado',
  'Cancelado',
]);
export const regions = pgTable('regions', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
});
export const wineries = pgTable('wineries', {
  id: integer('id').primaryKey(),
  regionId: integer('region_id')
    .notNull()
    .references(() => regions.id),
  name: text('name').notNull().unique(),
  lat: doublePrecision('lat').notNull(),
  lng: doublePrecision('lng').notNull(),
  tier: text('tier').notNull(),
  experience: text('experience').notNull(),
  price: integer('price_usd').notNull(),
});
export const combos = pgTable('combos', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  days: integer('days').notNull(),
  description: text('description').notNull(),
  items: jsonb('items').$type<{ day: number; wineryId: number }[]>().notNull(),
});
export const quotes = pgTable('quotes', {
  id: uuid('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  notes: text('notes').notNull(),
  date: date('travel_date').notNull(),
  days: integer('days').notNull(),
  pax: integer('pax').notNull(),
  privateTransfer: boolean('private_transfer').notNull(),
  experiences: integer('experiences_usd').notNull(),
  transfer: integer('transfer_usd').notNull(),
  total: integer('total_usd').notNull(),
  exchangeRate: doublePrecision('exchange_rate_ars').notNull().default(0),
  totalArs: doublePrecision('total_ars').notNull().default(0),
  policyText: text('policy_text').notNull().default(''),
  policyAcceptedAt: timestamp('policy_accepted_at', { withTimezone: true }).notNull().defaultNow(),
  status: quoteStatus('status').notNull().default('Pendiente'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
export const quoteItems = pgTable(
  'quote_items',
  {
    id: serial('id').primaryKey(),
    quoteId: uuid('quote_id')
      .notNull()
      .references(() => quotes.id, { onDelete: 'cascade' }),
    wineryId: integer('winery_id')
      .notNull()
      .references(() => wineries.id),
    day: integer('day').notNull(),
    wineryName: text('winery_name').notNull(),
    experience: text('experience').notNull(),
    unitPrice: integer('unit_price_usd').notNull(),
  },
  (t) => [uniqueIndex('quote_day_winery_idx').on(t.quoteId, t.day, t.wineryId)],
);
