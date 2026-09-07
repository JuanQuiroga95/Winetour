import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { timingSafeEqual, createHash } from 'node:crypto';
export function safeEqual(a: string, b: string) {
  return timingSafeEqual(
    createHash('sha256').update(a).digest(),
    createHash('sha256').update(b).digest(),
  );
}
function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32)
    throw new Error('SESSION_SECRET debe tener al menos 32 caracteres.');
  return new TextEncoder().encode(value);
}
export async function createSession() {
  return new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(process.env.ADMIN_USERNAME || 'dani.v')
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(secret());
}
export async function isAdmin() {
  try {
    const token = (await cookies()).get('terroir-session')?.value;
    if (!token) return false;
    const { payload } = await jwtVerify(token, secret(), { algorithms: ['HS256'] });
    return payload.role === 'admin' && payload.sub === (process.env.ADMIN_USERNAME || 'dani.v');
  } catch {
    return false;
  }
}
export function sameOrigin(req: Request) {
  const origin = req.headers.get('origin');
  return !!origin && origin === new URL(req.url).origin;
}
