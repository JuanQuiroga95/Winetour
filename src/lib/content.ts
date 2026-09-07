import { z } from 'zod';
import { regions, wineries, combos, policy } from './data';
import { defaultCopy } from './copy';
export const defaultContent = {
  copy: defaultCopy as Record<string, string>,
  regions,
  wineries,
  combos,
  heroSlides: [
    'photo-1504279577054-acfeccf8fc52',
    'photo-1464822759023-fed622ff2c3b',
    'photo-1510812431401-41d2bd2722f3',
  ],
  personalImage: 'photo-1504279577054-acfeccf8fc52',
  gallery: [
    'photo-1510812431401-41d2bd2722f3',
    'photo-1414235077428-338989a2e8c0',
    'photo-1464822759023-fed622ff2c3b',
  ],
  settings: {
    usdToArs: 0,
    transferPerDay: 120,
    whatsappNumber: '',
    policy,
    brandColor: '#773748',
    sandColor: '#eee8dd',
    pageTitle: 'Terroir Mendoza | Viajes con origen',
    pageDescription:
      'Experiencias privadas de vino y gastronomía en Mendoza. Diseñá tu propio itinerario.',
  },
};
export type SiteContent = typeof defaultContent;
const imageSchema = z
  .string()
  .max(2000)
  .refine(
    (v) => /^photo-[a-zA-Z0-9-]+$/.test(v) || /^https:\/\//.test(v),
    'Usá un ID de Unsplash o una URL HTTPS.',
  );
const itemSchema = z.object({
  day: z.number().int().min(1).max(3),
  wineryId: z.number().int().positive(),
});
export const contentSchema = z
  .object({
    settings: z.object({
      usdToArs: z.number().min(0).max(1000000),
      transferPerDay: z.number().int().min(0).max(100000),
      whatsappNumber: z
        .string()
        .regex(/^\d{7,16}$|^$/, 'Ingresá solo números, con código de país.'),
      policy: z.string().min(20).max(5000),
      brandColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
      sandColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
      pageTitle: z.string().min(1).max(150),
      pageDescription: z.string().min(1).max(500),
    }),
    copy: z
      .record(z.string(), z.string().max(5000))
      .refine(
        (v) => Object.keys(defaultCopy).every((k) => typeof v[k] === 'string'),
        'Faltan textos obligatorios.',
      ),
    regions: z
      .array(
        z.object({
          id: z.string().min(1),
          name: z.string().min(1),
          subtitle: z.string(),
          description: z.string(),
          image: imageSchema,
        }),
      )
      .length(3),
    wineries: z
      .array(
        z.object({
          id: z.number().int().positive(),
          name: z.string().min(1),
          region: z.string().min(1),
          lat: z.number().min(-90).max(90),
          lng: z.number().min(-180).max(180),
          tier: z.enum(['standard', 'premium', 'icon']),
          experience: z.enum(['tasting', 'lunch_3_steps', 'lunch_5_steps']),
          price: z.number().int().min(0).max(100000),
        }),
      )
      .min(1)
      .max(100),
    combos: z
      .array(
        z.object({
          id: z.string().min(1),
          name: z.string().min(1),
          days: z.number().int().min(1).max(3),
          region: z.string(),
          tagline: z.string(),
          image: imageSchema,
          items: z.array(itemSchema).min(1).max(9),
          label: z.string(),
          description: z.string(),
        }),
      )
      .min(1)
      .max(12),
    heroSlides: z.array(imageSchema).min(1).max(8),
    personalImage: imageSchema,
    gallery: z.array(imageSchema).min(1).max(12),
  })
  .superRefine((v, ctx) => {
    if (
      new Set(v.wineries.map((w) => w.id)).size !== v.wineries.length ||
      new Set(v.wineries.map((w) => w.name)).size !== v.wineries.length ||
      new Set(v.regions.map((r) => r.id)).size !== 3 ||
      new Set(v.regions.map((r) => r.name)).size !== 3 ||
      new Set(v.combos.map((c) => c.id)).size !== v.combos.length
    )
      ctx.addIssue({ code: 'custom', message: 'Los identificadores y nombres deben ser únicos.' });
    if (v.wineries.some((w) => !v.regions.some((r) => r.name === w.region)))
      ctx.addIssue({
        code: 'custom',
        message: 'Cada bodega debe pertenecer a una región existente.',
      });
    for (const c of v.combos) {
      if (
        c.items.some((i) => i.day > c.days || !v.wineries.some((w) => w.id === i.wineryId)) ||
        new Set(c.items.map((i) => `${i.day}:${i.wineryId}`)).size !== c.items.length ||
        Array.from({ length: c.days }, (_, i) => i + 1).some((d) => {
          const n = c.items.filter((i) => i.day === d).length;
          return n < 1 || n > 3;
        })
      )
        ctx.addIssue({
          code: 'custom',
          message: `Revisá las visitas del paquete ${c.name}: entre 1 y 3 por día, sin repetir.`,
        });
    }
  });
