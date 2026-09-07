import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/auth';
import { getSiteContent } from '@/lib/content-server';
import { getDb } from '@/db';
import { quotes, quoteItems } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { AdminDashboard, type Lead } from '@/components/admin-dashboard';
export const dynamic = 'force-dynamic';
export default async function Page() {
  if (!(await isAdmin())) redirect('/admin/login');
  const content = await getSiteContent();
  let leads: Lead[] = [];
  let databaseReady = false;
  let databaseError = '';
  if (process.env.DATABASE_URL) {
    try {
      const db = getDb();
      const [rows, items] = await Promise.all([
        db.select().from(quotes).orderBy(desc(quotes.createdAt)),
        db.select().from(quoteItems),
      ]);
      leads = rows.map((q) => ({
        ...q,
        createdAt: q.createdAt.toISOString(),
        policyAcceptedAt: q.policyAcceptedAt.toISOString(),
        items: items.filter((i) => i.quoteId === q.id),
      }));
      databaseReady = true;
    } catch {
      databaseError = 'No se pudo leer Neon. Revisá la conexión y ejecutá las migraciones.';
    }
  }
  return (
    <AdminDashboard
      initialLeads={leads}
      content={content}
      databaseReady={databaseReady}
      databaseError={databaseError}
    />
  );
}
