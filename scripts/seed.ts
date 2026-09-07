import { config } from 'dotenv';
config({ path: '.env.local' });
config();
import { getDb } from '../src/db';
import * as schema from '../src/db/schema';
import { regions, wineries, combos } from '../src/lib/data';
import { defaultContent } from '../src/lib/content';
async function seed() {
  const db = getDb();
  await db
    .insert(schema.regions)
    .values(regions.map((r) => ({ name: r.name, slug: r.id })))
    .onConflictDoNothing();
  const saved = await db.select().from(schema.regions);
  await db
    .insert(schema.wineries)
    .values(
      wineries.map(({ region, ...w }) => ({
        ...w,
        regionId: saved.find((r) => r.name === region)!.id,
      })),
    )
    .onConflictDoNothing();
  await db
    .insert(schema.combos)
    .values(
      combos.map((c) => ({
        id: c.id,
        name: c.name,
        days: c.days,
        description: c.description,
        items: c.items,
      })),
    )
    .onConflictDoNothing();
  await db
    .insert(schema.siteContent)
    .values({ id: 1, content: defaultContent })
    .onConflictDoNothing();
  console.log('Seed completo: 3 regiones, 9 bodegas y 3 combos.');
}
seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
