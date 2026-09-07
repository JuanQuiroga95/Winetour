import { NextResponse } from 'next/server';
import { isAdmin, sameOrigin } from '@/lib/auth';
import { getDb } from '@/db';
import { quotes } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Iniciá sesión.' }, { status: 401 });
  if (!sameOrigin(req))
    return NextResponse.json({ error: 'Origen no permitido.' }, { status: 403 });
  try {
    const { id } = await params;
    if (!z.uuid().safeParse(id).success)
      return NextResponse.json({ error: 'Identificador inválido.' }, { status: 400 });
    const b = z
      .object({ status: z.enum(['Pendiente', 'En Gestión', 'Confirmado', 'Cancelado']) })
      .safeParse(await req.json());
    if (!b.success) return NextResponse.json({ error: 'Estado inválido.' }, { status: 400 });
    const rows = await getDb()
      .update(quotes)
      .set({ status: b.data.status })
      .where(eq(quotes.id, id))
      .returning({ id: quotes.id });
    if (!rows.length)
      return NextResponse.json({ error: 'Solicitud no encontrada.' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'No se pudo actualizar la solicitud.' }, { status: 500 });
  }
}
