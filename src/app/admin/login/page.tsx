'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mountain, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
export default function Login() {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const f = new FormData(e.currentTarget);
    try {
      const r = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(f)),
      });
      const b = await r.json();
      if (!r.ok) throw new Error(b.error);
      router.push('/admin');
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error de conexión.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="login-page">
      <form onSubmit={submit} className="login-card">
        <Link href="/" className="brand">
          <Mountain strokeWidth={1} />
          <span>
            terroir<span className="brand-sub">MENDOZA · ARGENTINA</span>
          </span>
        </Link>
        <span className="eyebrow wine-text">ESPACIO DE LA AGENCIA</span>
        <h1>
          Bienvenida,
          <br />
          <em>Dani.</em>
        </h1>
        <label className="field">
          <span>Usuario</span>
          <input name="username" required autoComplete="username" placeholder="Tu usuario" />
        </label>
        <label className="field">
          <span>Contraseña</span>
          <input name="password" type="password" required autoComplete="current-password" />
        </label>
        {error && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}
        <Button disabled={busy} type="submit">
          {busy ? 'Ingresando…' : 'Ingresar'}
          <ArrowRight size={16} />
        </Button>
        <Link href="/" className="fine-print">
          Volver a la página
        </Link>
      </form>
    </main>
  );
}
