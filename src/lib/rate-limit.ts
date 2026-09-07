const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;
const BLOCK_MS = 15 * 60 * 1000;
const MAX_TRACKED = 5000;

type Attempt = { count: number; firstAt: number; blockedUntil: number };

// Estado en memoria del proceso. En serverless cada instancia lleva su propio
// conteo, asi que un atacante repartido entre muchas instancias no queda
// frenado del todo; aun asi encarece mucho la fuerza bruta desde una IP. Si
// hace falta un limite real y compartido, hay que moverlo a la base.
const attempts = new Map<string, Attempt>();

export function clientIp(req: Request) {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.headers.get('x-real-ip') || 'desconocida';
}

function prune(now: number) {
  if (attempts.size < MAX_TRACKED) return;
  for (const [ip, a] of attempts) {
    if (a.blockedUntil < now && now - a.firstAt > WINDOW_MS) attempts.delete(ip);
  }
}

/** Segundos que faltan para poder reintentar, o 0 si la IP puede intentar. */
export function retryAfter(ip: string) {
  const found = attempts.get(ip);
  if (!found) return 0;
  const remaining = found.blockedUntil - Date.now();
  return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
}

export function recordFailure(ip: string) {
  const now = Date.now();
  prune(now);
  const found = attempts.get(ip);
  // ventana vencida: se arranca de cero
  if (!found || now - found.firstAt > WINDOW_MS) {
    attempts.set(ip, { count: 1, firstAt: now, blockedUntil: 0 });
    return;
  }
  found.count++;
  if (found.count >= MAX_ATTEMPTS) found.blockedUntil = now + BLOCK_MS;
}

export function clearFailures(ip: string) {
  attempts.delete(ip);
}
