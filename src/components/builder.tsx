'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCheck,
  CalendarDays,
  Users,
  Car,
  Wine,
  MapPin,
  ShieldCheck,
  LoaderCircle,
  MessageCircle,
  Plus,
  Minus,
} from 'lucide-react';
import { useContent } from './site-provider';
import { ExchangeRate } from './exchange-rate';
import { Header } from './header';
import { Footer } from './footer';
import { Button } from './ui/button';
import { experienceLabels, type Winery } from '@/lib/data';
import { calculateQuote, minimumDate, money, tripSchema, type Selection } from '@/lib/quote';
import type { SiteContent } from '@/lib/content';
const Map = dynamic(() => import('./winery-map'), {
  ssr: false,
  loading: () => <div className="map-loading">Preparando el mapa de Mendoza…</div>,
});
export function Builder({
  catalog,
  packages,
}: {
  catalog: Winery[];
  packages: SiteContent['combos'];
}) {
  const { settings } = useContent();
  const params = useSearchParams();
  const combo = packages.find((c) => c.id === params.get('combo'));
  const [step, setStep] = useState(0);
  const [date, setDate] = useState('');
  const [days, setDays] = useState(combo?.days || 1);
  const [pax, setPax] = useState(2);
  const [privateTransfer, setPrivateTransfer] = useState(true);
  const [items, setItems] = useState<Selection[]>(combo?.items || []);
  const [day, setDay] = useState(1);
  const [region, setRegion] = useState(params.get('region') || 'Todas');
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ id: string; whatsappUrl: string | null } | null>(null);
  const trip = { date, days, pax, privateTransfer };
  const costs = calculateQuote(trip, items, catalog, settings.transferPerDay);
  const selected = items.filter((i) => i.day === day).map((i) => i.wineryId);
  const visible = catalog.filter((w) => region === 'Todas' || w.region === region);
  function toggle(id: number) {
    setError('');
    if (selected.includes(id)) setItems(items.filter((i) => !(i.day === day && i.wineryId === id)));
    else if (selected.length >= 3)
      setError('Para disfrutar cada visita, elegí un máximo de 3 bodegas por día.');
    else setItems([...items, { day, wineryId: id }]);
  }
  function next() {
    setError('');
    if (step === 0) {
      const v = tripSchema.safeParse(trip);
      if (!v.success) {
        setError(v.error.issues[0].message);
        return;
      }
    }
    if (
      step === 1 &&
      Array.from({ length: days }, (_, i) => i + 1).some((d) => !items.some((i) => i.day === d))
    ) {
      setError('Elegí al menos una bodega para cada día de excursión.');
      return;
    }
    if (step === 2 && !accepted) {
      setError('Aceptá la política de disponibilidad para continuar.');
      return;
    }
    setStep(step + 1);
  }
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...trip,
          items,
          accepted,
          displayedTotal: costs.total,
          displayedExchangeRate: settings.usdToArs,
          displayedPolicy: settings.policy,
          name: form.get('name'),
          email: form.get('email'),
          phone: form.get('phone'),
          notes: form.get('notes'),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No pudimos enviar tu solicitud.');
      setResult(data);
      if (data.whatsappUrl) window.open(data.whatsappUrl, '_blank', 'noopener,noreferrer');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error de conexión. Intentá nuevamente.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Header dark />
      <main className="builder-page">
        <div className="builder-heading">
          <span className="eyebrow wine-text">UN VIAJE TAN ÚNICO COMO VOS</span>
          <h1>
            Diseñá tu <em>Mendoza.</em>
          </h1>
          <p>Uní tus lugares favoritos. Nosotros nos ocupamos del resto.</p>
        </div>
        <div className="steps">
          {['Tu viaje', 'Las bodegas', 'Los detalles', 'Hablemos'].map((s, i) => (
            <button
              key={s}
              disabled={i > step || !!result}
              onClick={() => {
                setStep(i);
                setError('');
              }}
              className={i === step ? 'active' : i < step ? 'complete' : ''}
            >
              <span>{i < step ? <Check size={16} /> : String(i + 1).padStart(2, '0')}</span>
              {s}
            </button>
          ))}
        </div>
        <div className="builder-grid">
          <section className="wizard-panel">
            {result ? (
              <div className="success-panel">
                <CheckCheck size={48} />
                <h2>
                  Tu viaje ya está
                  <br />
                  <em>un paso más cerca.</em>
                </h2>
                <p>
                  Guardamos tu solicitud <strong>#{result.id.slice(0, 8)}</strong>. Nuestro equipo
                  revisará las visitas y se pondrá en contacto con vos.
                </p>
                {result.whatsappUrl ? (
                  <Button asChild>
                    <a href={result.whatsappUrl} target="_blank" rel="noreferrer">
                      <MessageCircle size={17} /> Continuar en WhatsApp
                    </a>
                  </Button>
                ) : (
                  <p>Te contactaremos por los datos que nos dejaste.</p>
                )}
                <p className="fine-print">Esta solicitud no constituye una reserva confirmada.</p>
              </div>
            ) : (
              <>
                {step === 0 && (
                  <>
                    <span className="eyebrow muted">PASO 01 · EMPECEMOS POR VOS</span>
                    <h2>¿Cuándo nos visitás?</h2>
                    <p className="panel-subtitle">El primer paso de una gran historia.</p>
                    <label className="field">
                      <span>
                        <CalendarDays size={16} /> Fecha de la primera excursión
                      </span>
                      <input
                        type="date"
                        min={minimumDate()}
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                      />
                      <small>Planificamos cada detalle con al menos 7 días de anticipación.</small>
                    </label>
                    <fieldset className="field">
                      <legend>Días para descubrir Mendoza</legend>
                      <div className="choice-row">
                        {[1, 2, 3].map((n) => (
                          <button
                            key={n}
                            className={days === n ? 'choice selected' : 'choice'}
                            onClick={() => {
                              setDays(n);
                              setItems(items.filter((i) => i.day <= n));
                              setDay(1);
                            }}
                          >
                            <strong>{n}</strong> {n === 1 ? 'día' : 'días'}
                          </button>
                        ))}
                      </div>
                    </fieldset>
                    <label className="field">
                      <span>
                        <Users size={16} /> ¿Cuántas personas viajan?
                      </span>
                      <select value={pax} onChange={(e) => setPax(Number(e.target.value))}>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                          <option key={n} value={n}>
                            {n} {n === 1 ? 'persona' : 'personas'}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="transfer-choice">
                      <Car size={26} strokeWidth={1.3} />
                      <span>
                        <strong>Movilidad privada</strong>
                        <small>
                          Chofer y vehículo exclusivo. USD {settings.transferPerDay} por día cada 4
                          pasajeros.
                        </small>
                      </span>
                      <input
                        type="checkbox"
                        checked={privateTransfer}
                        onChange={(e) => setPrivateTransfer(e.target.checked)}
                      />
                    </label>
                  </>
                )}
                {step === 1 && (
                  <>
                    <span className="eyebrow muted">PASO 02 · EXPLORÁ EL TERRITORIO</span>
                    <h2>Tu ruta entre viñedos.</h2>
                    <p className="panel-subtitle">
                      Elegí hasta 3 bodegas por día. Recomendamos una región por jornada.
                    </p>
                    <div className="day-tabs">
                      {Array.from({ length: days }, (_, i) => i + 1).map((d) => (
                        <button
                          className={day === d ? 'active' : ''}
                          onClick={() => setDay(d)}
                          key={d}
                        >
                          Día {d}
                          <span>{items.filter((i) => i.day === d).length}/3</span>
                        </button>
                      ))}
                    </div>
                    <label className="field compact">
                      <span>Explorar una región</span>
                      <select value={region} onChange={(e) => setRegion(e.target.value)}>
                        {['Todas', ...new Set(catalog.map((w) => w.region))].map((r) => (
                          <option key={r}>{r}</option>
                        ))}
                      </select>
                    </label>
                    <Map wineries={visible} selected={selected} toggle={toggle} />
                    <div className="winery-list">
                      {visible.map((w) => (
                        <button
                          key={w.id}
                          className={selected.includes(w.id) ? 'winery-row selected' : 'winery-row'}
                          onClick={() => toggle(w.id)}
                        >
                          <span className="winery-icon">
                            <Wine size={20} />
                          </span>
                          <span>
                            <strong>{w.name}</strong>
                            <small>
                              {w.region} · {experienceLabels[w.experience]}
                            </small>
                          </span>
                          <span className="winery-price">
                            {money(w.price)}
                            <small>por persona</small>
                          </span>
                          {selected.includes(w.id) ? <Minus size={18} /> : <Plus size={18} />}
                        </button>
                      ))}
                    </div>
                    {new Set(
                      items
                        .filter((i) => i.day === day)
                        .map((i) => catalog.find((w) => w.id === i.wineryId)?.region),
                    ).size > 1 && (
                      <p className="notice">
                        Elegiste distintas regiones en un mismo día. El equipo revisará los tiempos
                        de traslado antes de confirmar la ruta.
                      </p>
                    )}
                  </>
                )}
                {step === 2 && (
                  <>
                    <span className="eyebrow muted">PASO 03 · CADA DETALLE IMPORTA</span>
                    <h2>Viajá con tranquilidad.</h2>
                    <div className="policy-card">
                      <ShieldCheck size={30} />
                      <h3>Una experiencia cuidada, de principio a fin.</h3>
                      <p>{settings.policy}.</p>
                    </div>
                    <p className="panel-subtitle">
                      La cotización es referencial, en dólares estadounidenses. Revisaremos
                      horarios, traslados, restricciones alimentarias y tarifas vigentes antes de
                      confirmar. No se realiza ningún cobro en este sitio.
                    </p>
                    <label className="consent">
                      <input
                        type="checkbox"
                        checked={accepted}
                        onChange={(e) => setAccepted(e.target.checked)}
                      />
                      <span>
                        Leí y acepto la política de disponibilidad y autorizo que me contacten para
                        gestionar esta solicitud.
                      </span>
                    </label>
                  </>
                )}
                {step === 3 && (
                  <form id="lead-form" onSubmit={submit}>
                    <span className="eyebrow muted">PASO 04 · TU PRÓXIMO VIAJE EMPIEZA ACÁ</span>
                    <h2>Nos falta conocerte.</h2>
                    <p className="panel-subtitle">
                      Dejanos tus datos y convertimos este recorrido en una propuesta personal.
                    </p>
                    <label className="field">
                      <span>Nombre y apellido</span>
                      <input
                        name="name"
                        autoComplete="name"
                        minLength={2}
                        maxLength={100}
                        required
                        placeholder="¿Cómo te llamás?"
                      />
                    </label>
                    <div className="form-two">
                      <label className="field">
                        <span>Email</span>
                        <input
                          name="email"
                          type="email"
                          autoComplete="email"
                          maxLength={200}
                          required
                          placeholder="vos@email.com"
                        />
                      </label>
                      <label className="field">
                        <span>WhatsApp con código de país</span>
                        <input
                          name="phone"
                          type="tel"
                          autoComplete="tel"
                          pattern="\+?[0-9 ()\-]{7,25}"
                          required
                          placeholder="+54 9 261 000 0000"
                        />
                      </label>
                    </div>
                    <label className="field">
                      <span>
                        Algo más que debamos saber <small>(opcional)</small>
                      </span>
                      <textarea
                        name="notes"
                        rows={3}
                        maxLength={1500}
                        placeholder="Alojamiento, preferencias, restricciones alimentarias…"
                      />
                    </label>
                    <p className="fine-print">
                      Tus datos se utilizarán únicamente para atender tu consulta y coordinar este
                      viaje.
                    </p>
                  </form>
                )}
                {error && (
                  <p role="alert" className="error-message">
                    {error}
                  </p>
                )}
                <div className="wizard-actions">
                  <Button
                    variant="ghost"
                    disabled={step === 0 || busy}
                    onClick={() => {
                      setStep(step - 1);
                      setError('');
                    }}
                  >
                    <ArrowLeft size={16} /> Atrás
                  </Button>
                  {step < 3 ? (
                    <Button onClick={next}>
                      Continuar <ArrowRight size={16} />
                    </Button>
                  ) : (
                    <Button form="lead-form" type="submit" disabled={busy}>
                      {busy ? (
                        <LoaderCircle className="spin" size={16} />
                      ) : (
                        <MessageCircle size={16} />
                      )}{' '}
                      {busy ? 'Guardando…' : 'Enviar y abrir WhatsApp'}
                    </Button>
                  )}
                </div>
              </>
            )}
          </section>
          <aside className="trip-summary">
            <span className="eyebrow wine-text">TU EXPERIENCIA, HASTA AHORA</span>
            <h3>Un adelanto de tu viaje.</h3>
            <div className="summary-facts">
              <span>
                <CalendarDays size={16} />
                {date || 'Fecha por definir'} · {days} {days === 1 ? 'día' : 'días'}
              </span>
              <span>
                <Users size={16} />
                {pax} {pax === 1 ? 'persona' : 'personas'}
              </span>
              <span>
                <Car size={16} />
                {privateTransfer ? 'Transfer privado incluido' : 'Sin transfer'}
              </span>
            </div>
            {items.length ? (
              Array.from({ length: days }, (_, i) => i + 1).map((d) => (
                <div className="summary-day" key={d}>
                  <span className="eyebrow">DÍA {d}</span>
                  {items
                    .filter((i) => i.day === d)
                    .map((i) => (
                      <p key={i.wineryId}>
                        <MapPin size={13} />
                        {catalog.find((w) => w.id === i.wineryId)?.name}
                      </p>
                    ))}
                  {!items.some((i) => i.day === d) && (
                    <small>Tu próxima parada está por descubrir.</small>
                  )}
                </div>
              ))
            ) : (
              <div className="summary-empty">
                <Wine size={28} strokeWidth={1} />
                <p>
                  Tus próximas historias
                  <br />
                  todavía están por elegir.
                </p>
              </div>
            )}
            <div className="cost-lines">
              <span>
                Experiencias <b>{money(costs.experiences)}</b>
              </span>
              <span>
                Movilidad privada <b>{money(costs.transfer)}</b>
              </span>
            </div>
            <div className="summary-total">
              <span>
                Total estimado <small>USD · {money(costs.perPerson)} por persona</small>
              </span>
              <strong>{money(costs.total)}</strong>
            </div>
            <ExchangeRate total={costs.total} />
            <p className="fine-print">
              Valores de referencia. Sujeto a disponibilidad y confirmación de la agencia.
            </p>
            <div className="summary-help">
              <ShieldCheck size={19} />
              <span>
                Atención personal.
                <br />
                Cada detalle en buenas manos.
              </span>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
