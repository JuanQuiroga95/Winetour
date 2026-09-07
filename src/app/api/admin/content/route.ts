import { NextResponse } from 'next/server';
import { isAdmin, sameOrigin } from '@/lib/auth';
import { contentSchema } from '@/lib/content';
import { getDb } from '@/db';
import { siteContent, regions, wineries, combos } from '@/db/schema';
import { sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
export async function PUT(req: Request) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: 'Iniciá sesión para editar.' }, { status: 401 });
  if (!sameOrigin(req))
    return NextResponse.json({ error: 'Origen no permitido.' }, { status: 403 });
  if (!process.env.DATABASE_URL)
    return NextResponse.json(
      { error: 'Conectá Neon y ejecutá las migraciones para publicar cambios.' },
      { status: 503 },
    );
  try {
    const raw = await req.text();
    if (raw.length > 250000)
      return NextResponse.json({ error: 'Contenido demasiado extenso.' }, { status: 413 });
    let body;
    try {
      body = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: 'Formato inválido.' }, { status: 400 });
    }
    const parsed = contentSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json(
        { error: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(' · ') },
        { status: 400 },
      );
    const c = parsed.data;
    const db = getDb();
    await db.batch([
      db
        .insert(regions)
        .values(c.regions.map((r) => ({ name: r.name, slug: r.id })))
        .onConflictDoUpdate({ target: regions.slug, set: { name: sql`excluded.name` } }),
      ...c.wineries.map((w) =>
        db
          .insert(wineries)
          .values({
            id: w.id,
            name: w.name,
            regionId: sql`(select id from regions where slug = ${c.regions.find((r) => r.name === w.region)!.id})`,
            lat: w.lat,
            lng: w.lng,
            tier: w.tier,
            experience: w.experience,
            price: w.price,
          })
          .onConflictDoUpdate({
            target: wineries.id,
            set: {
              name: w.name,
              regionId: sql`(select id from regions where slug = ${c.regions.find((r) => r.name === w.region)!.id})`,
              lat: w.lat,
              lng: w.lng,
              tier: w.tier,
              experience: w.experience,
              price: w.price,
            },
          }),
      ),
      ...c.combos.map((c) =>
        db
          .insert(combos)
          .values({
            id: c.id,
            name: c.name,
            days: c.days,
            description: c.description,
            items: c.items,
          })
          .onConflictDoUpdate({
            target: combos.id,
            set: { name: c.name, days: c.days, description: c.description, items: c.items },
          }),
      ),
      db
        .insert(siteContent)
        .values({ id: 1, content: c })
        .onConflictDoUpdate({ target: siteContent.id, set: { content: c, updatedAt: new Date() } }),
    ]);
    revalidatePath('/', 'layout');
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('content-save-failed', e instanceof Error ? e.name : 'unknown');
    return NextResponse.json(
      {
        error:
          'No se pudieron publicar los cambios. Revisá la conexión y que los nombres no estén repetidos.',
      },
      { status: 500 },
    );
  }
}
