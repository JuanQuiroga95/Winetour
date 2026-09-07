import { defaultContent, contentSchema, type SiteContent } from './content';
import { getDb } from '@/db';
import { siteContent } from '@/db/schema';
export async function getSiteContent(strict = false): Promise<SiteContent> {
  if (!process.env.DATABASE_URL) return defaultContent;
  try {
    const rows = await getDb().select().from(siteContent);
    const parsed = contentSchema.safeParse(rows[0]?.content);
    if (strict && !parsed.success) throw new Error('El catálogo publicado no está disponible.');
    return parsed.success ? parsed.data : defaultContent;
  } catch (e) {
    if (strict) throw e;
    console.error('content-read-failed', e instanceof Error ? e.name : 'unknown');
    return defaultContent;
  }
}
