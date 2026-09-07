import { z } from 'zod';
import { wineries, type Winery } from './data';
export function minimumDate(now = new Date()) {
  const local = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Argentina/Mendoza',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
  const result = new Date(`${local}T12:00:00Z`);
  result.setUTCDate(result.getUTCDate() + 7);
  return result.toISOString().slice(0, 10);
}
export const tripSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine(
      (s) =>
        !Number.isNaN(Date.parse(s)) &&
        new Date(s).toISOString().slice(0, 10) === s &&
        s >= minimumDate(),
      'Seleccioná una fecha con al menos 7 días de anticipación.',
    ),
  days: z.number().int().min(1).max(3),
  pax: z.number().int().min(1).max(12),
  privateTransfer: z.boolean(),
});
export const quoteSchema = tripSchema
  .extend({
    items: z
      .array(
        z.object({ day: z.number().int().min(1).max(3), wineryId: z.number().int().positive() }),
      )
      .min(1)
      .max(9),
    name: z.string().trim().min(2).max(100),
    email: z.email().max(200),
    phone: z
      .string()
      .trim()
      .regex(/^\+?[\d\s()-]{7,25}$/),
    notes: z.string().trim().max(1500).default(''),
    accepted: z.literal(true),
  })
  .superRefine((v, ctx) => {
    const keys = new Set<string>();
    for (const item of v.items) {
      const key = `${item.day}:${item.wineryId}`;
      if (item.day > v.days || keys.has(key))
        ctx.addIssue({
          code: 'custom',
          message: 'El itinerario contiene días o visitas inválidas.',
          path: ['items'],
        });
      keys.add(key);
    }
    for (let day = 1; day <= v.days; day++) {
      const count = v.items.filter((i) => i.day === day).length;
      if (count < 1 || count > 3)
        ctx.addIssue({
          code: 'custom',
          message: 'Elegí entre 1 y 3 bodegas para cada día.',
          path: ['items'],
        });
    }
  });
export type Trip = z.infer<typeof tripSchema>;
export type QuoteInput = z.infer<typeof quoteSchema>;
export type Selection = { day: number; wineryId: number };
export function calculateQuote(
  trip: Pick<Trip, 'days' | 'pax' | 'privateTransfer'>,
  items: Selection[],
  catalog: Pick<Winery, 'id' | 'price'>[] = wineries,
  transferPerDay = 120,
) {
  const experiences = items.reduce((sum, item) => {
    const winery = catalog.find((w) => w.id === item.wineryId);
    if (!winery) throw new Error('Bodega no disponible.');
    return sum + winery.price * trip.pax;
  }, 0);
  const transfer = trip.privateTransfer ? trip.days * transferPerDay * Math.ceil(trip.pax / 4) : 0;
  return {
    experiences,
    transfer,
    total: experiences + transfer,
    perPerson: (experiences + transfer) / trip.pax,
  };
}
export const money = (n: number) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n);
export const pesos = (n: number) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 2,
  }).format(n);
