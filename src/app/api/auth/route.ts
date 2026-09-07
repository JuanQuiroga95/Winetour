import { NextResponse } from 'next/server';
import { createSession, safeEqual, sameOrigin } from '@/lib/auth';
export async function POST(req: Request) {
  if (!sameOrigin(req))
    return NextResponse.json({ error: 'Origen no permitido.' }, { status: 403 });
  if (!process.env.ADMIN_PASSWORD || !process.env.SESSION_SECRET)
    return NextResponse.json(
      { error: 'Configurá el acceso de administración en el servidor.' },
      { status: 503 },
    );
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Datos inválidos.' }, { status: 400 });
  }
  if (
    typeof body.username !== 'string' ||
    typeof body.password !== 'string' ||
    !safeEqual(body.username, process.env.ADMIN_USERNAME || 'dani.v') ||
    !safeEqual(body.password, process.env.ADMIN_PASSWORD)
  ) {
    await new Promise((r) => setTimeout(r, 800));
    return NextResponse.json({ error: 'Usuario o contraseña incorrectos.' }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set('terroir-session', await createSession(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 8 * 3600,
  });
  return res;
}
export async function DELETE(req: Request) {
  if (!sameOrigin(req))
    return NextResponse.json({ error: 'Origen no permitido.' }, { status: 403 });
  const res = NextResponse.json({ ok: true });
  res.cookies.set('terroir-session', '', { maxAge: 0, path: '/' });
  return res;
}
