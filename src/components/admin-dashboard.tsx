'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { X, LogOut, ExternalLink, RefreshCw, Mail, Phone } from 'lucide-react';
import { Button } from './ui/button';
import { ContentEditor } from './content-editor';
import type { SiteContent } from '@/lib/content';
import { money, pesos } from '@/lib/quote';
const statuses = ['Pendiente', 'En Gestión', 'Confirmado', 'Cancelado'] as const;
type Status = (typeof statuses)[number];
export type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
  date: string;
  days: number;
  pax: number;
  privateTransfer: boolean;
  experiences: number;
  transfer: number;
  total: number;
  exchangeRate: number;
  totalArs: number;
  status: Status;
  createdAt: string;
  policyAcceptedAt: string;
  items: { id: number; day: number; wineryName: string; experience: string; unitPrice: number }[];
};
export function AdminDashboard({
  initialLeads,
  content,
  databaseReady,
  databaseError,
}: {
  initialLeads: Lead[];
  content: SiteContent;
  databaseReady: boolean;
  databaseError: string;
}) {
  const [leads, setLeads] = useState(initialLeads);
  const [tab, setTab] = useState('Solicitudes');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const lead = leads.find((l) => l.id === selected);
  useEffect(() => {
    setLeads(initialLeads);
  }, [initialLeads]);
  useEffect(() => {
    if (selected) dialog.current?.showModal();
    else dialog.current?.close();
  }, [selected]);
  async function status(id: string, status: Status) {
    setBusy(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/quotes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const b = await res.json();
      if (!res.ok) throw new Error(b.error);
      setLeads(leads.map((l) => (l.id === id ? { ...l, status } : l)));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error de conexión.');
    } finally {
      setBusy(false);
    }
  }
  async function logout() {
    try {
      const r = await fetch('/api/auth', { method: 'DELETE' });
      if (!r.ok) throw new Error();
      router.push('/admin/login');
      router.refresh();
    } catch {
      setError('No se pudo cerrar la sesión. Intentá nuevamente.');
    }
  }
  return (
    <main className="admin-page">
      <header className="admin-header">
        <div>
          <span className="eyebrow wine-text">TERROIR MENDOZA · ADMINISTRACIÓN</span>
          <h1>
            Hola, Dani. <em>Este es tu espacio.</em>
          </h1>
        </div>
        <div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/" target="_blank">
              Ver sitio <ExternalLink size={14} />
            </Link>
          </Button>
          <Button variant="ghost" size="sm" onClick={logout}>
            <LogOut size={14} /> Salir
          </Button>
        </div>
      </header>
      <nav className="admin-nav" aria-label="Administración">
        {['Solicitudes', 'Editar página'].map((t) => (
          <button className={tab === t ? 'active' : ''} key={t} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </nav>
      {!databaseReady && (
        <p className="admin-notice">
          {databaseError ||
            'Falta conectar Neon para recibir solicitudes y publicar cambios. Podés preparar el contenido: el editor guarda automáticamente un borrador en este navegador.'}
        </p>
      )}
      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}
      {tab === 'Editar página' ? (
        <ContentEditor initial={content} ready={databaseReady} />
      ) : (
        <>
          <div className="admin-stats">
            <div>
              <small>Solicitudes recibidas</small>
              <strong>{leads.length}</strong>
            </div>
            <div>
              <small>Por atender</small>
              <strong>{leads.filter((l) => l.status === 'Pendiente').length}</strong>
            </div>
            <div>
              <small>Confirmado · USD</small>
              <strong>
                {money(
                  leads.filter((l) => l.status === 'Confirmado').reduce((s, l) => s + l.total, 0),
                )}
              </strong>
            </div>
          </div>
          <div className="admin-toolbar">
            <input
              className="search-input"
              placeholder="Buscar nombre, email o solicitud…"
              aria-label="Buscar solicitudes"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button size="sm" variant="outline" onClick={() => router.refresh()}>
              <RefreshCw size={14} /> Actualizar
            </Button>
          </div>
          <div className="kanban">
            {statuses.map((s) => {
              const cards = leads.filter(
                (l) =>
                  l.status === s &&
                  `${l.name} ${l.email} ${l.id}`.toLowerCase().includes(search.toLowerCase()),
              );
              return (
                <section
                  className="kanban-column"
                  key={s}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const id = e.dataTransfer.getData('text/plain');
                    if (leads.some((l) => l.id === id) && !busy) void status(id, s);
                  }}
                >
                  <h2>
                    {s}
                    <span>{cards.length}</span>
                  </h2>
                  {cards.map((l) => (
                    <button
                      key={l.id}
                      draggable={!busy}
                      onDragStart={(e) => e.dataTransfer.setData('text/plain', l.id)}
                      onClick={() => setSelected(l.id)}
                      className="lead-card"
                    >
                      <strong>{l.name}</strong>
                      <small>
                        {l.date} · {l.pax} pax · {l.days} día(s)
                      </small>
                      <small>#{l.id.slice(0, 8)}</small>
                      <div>
                        <span>{money(l.total)}</span>
                        <span>Ver detalle ↗</span>
                      </div>
                    </button>
                  ))}
                  {!cards.length && (
                    <p className="empty-column">
                      Sin solicitudes {search ? 'para esta búsqueda' : 'en este estado'}.
                    </p>
                  )}
                </section>
              );
            })}
          </div>
          <p className="fine-print">
            Arrastrá una tarjeta para cambiar su estado o abrí el detalle y usá el selector.
          </p>
        </>
      )}
      <dialog ref={dialog} className="lead-dialog" onCancel={() => setSelected(null)}>
        {lead && (
          <div className="detail-card">
            <button className="close" aria-label="Cerrar detalle" onClick={() => setSelected(null)}>
              <X size={20} />
            </button>
            <span className="eyebrow wine-text">SOLICITUD #{lead.id.slice(0, 8)}</span>
            <h2>{lead.name}</h2>
            <p>
              <a href={`mailto:${lead.email}`}>
                <Mail size={13} className="inline" /> {lead.email}
              </a>
              <br />
              <a href={`tel:${lead.phone}`}>
                <Phone size={13} className="inline" /> {lead.phone}
              </a>
            </p>
            <p>
              {lead.date} · {lead.days} día(s) · {lead.pax} persona(s)
              <br />
              {lead.privateTransfer ? 'Transfer privado incluido' : 'Sin movilidad privada'}
            </p>
            <label className="field">
              <span>Estado de la solicitud</span>
              <select
                value={lead.status}
                disabled={busy}
                onChange={(e) => status(lead.id, e.target.value as Status)}
              >
                {statuses.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            {error && <p className="error-message">{error}</p>}
            <div className="cost-lines">
              {lead.items.map((item) => (
                <span key={item.id}>
                  Día {item.day} · {item.wineryName}
                  <b>
                    {money(item.unitPrice)} × {lead.pax}
                  </b>
                </span>
              ))}
              <span>
                Experiencias<b>{money(lead.experiences)}</b>
              </span>
              <span>
                Movilidad privada<b>{money(lead.transfer)}</b>
              </span>
              <span>
                <strong>Total USD</strong>
                <b>{money(lead.total)}</b>
              </span>
              {lead.exchangeRate > 0 && (
                <>
                  <span>
                    Dólar tomado al solicitar<b>{pesos(lead.exchangeRate)} ARS</b>
                  </span>
                  <span>
                    Total referencial ARS<b>{pesos(lead.totalArs)}</b>
                  </span>
                </>
              )}
            </div>
            {lead.notes && (
              <p>
                <strong>Preferencias y comentarios</strong>
                <br />
                {lead.notes}
              </p>
            )}
            <p className="fine-print">
              Recibida: {new Date(lead.createdAt).toLocaleString('es-AR')}
              <br />
              Política aceptada: {new Date(lead.policyAcceptedAt).toLocaleString('es-AR')}
            </p>
          </div>
        )}
      </dialog>
    </main>
  );
}
