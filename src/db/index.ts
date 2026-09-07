import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
export function getDb() {
  if (!process.env.DATABASE_URL) throw new Error('Neon no está configurado.');
  return drizzle(neon(process.env.DATABASE_URL), { schema });
}
