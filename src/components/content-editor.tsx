'use client';
import { useEffect, useState } from 'react';
import { Save, Plus, Trash2, ExternalLink, Download } from 'lucide-react';
import { Button } from './ui/button';
import { defaultContent, contentSchema, type SiteContent } from '@/lib/content';
import { photo, experienceLabels } from '@/lib/data';
type Tab =
  'Textos' | 'Imágenes' | 'Regiones' | 'Bodegas' | 'Paquetes' | 'Configuración' | 'Avanzado';
export function ContentEditor({ initial, ready }: { initial: SiteContent; ready: boolean }) {
  const [draft, setDraft] = useState<SiteContent>(structuredClone(initial));
  const [tab, setTab] = useState<Tab>('Textos');
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [raw, setRaw] = useState('');
  useEffect(() => {
    const saved = localStorage.getItem('terroir-content-draft');
    if (saved) {
      try {
        const parsed = contentSchema.safeParse(JSON.parse(saved));
        if (parsed.success) {
          setDraft(parsed.data);
          setDirty(true);
          setMessage('Recuperamos tu borrador local. Todavía no está publicado.');
        }
      } catch {
        /* Ignore invalid draft. */
      }
    }
  }, []);
  useEffect(() => {
    if (!dirty) return;
    localStorage.setItem('terroir-content-draft', JSON.stringify(draft));
    const handler = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [draft, dirty]);
  function update(next: SiteContent) {
    setDraft(next);
    setDirty(true);
    setError('');
    setMessage('');
  }
  function section<K extends keyof SiteContent>(key: K, value: SiteContent[K]) {
    update({ ...draft, [key]: value });
  }
  function textField(
    label: string,
    value: string,
    onChange: (v: string) => void,
    multiline = false,
  ) {
    return (
      <label className="field">
        <span>{label}</span>
        {multiline ? (
          <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} />
        ) : (
          <input value={value} onChange={(e) => onChange(e.target.value)} />
        )}
      </label>
    );
  }
  function numberField(
    label: string,
    value: number,
    onChange: (v: number) => void,
    min = 0,
    max = 100000,
  ) {
    return (
      <label className="field">
        <span>{label}</span>
        <input
          type="number"
          min={min}
          max={max}
          step="any"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      </label>
    );
  }
  async function save() {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const parsed = contentSchema.safeParse(draft);
      if (!parsed.success)
        throw new Error(
          parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(' · '),
        );
      const res = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });
      const b = await res.json();
      if (!res.ok) throw new Error(b.error);
      setDirty(false);
      localStorage.removeItem('terroir-content-draft');
      setMessage('Cambios publicados. La página y el cotizador ya usan esta versión.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error de conexión.');
    } finally {
      setBusy(false);
    }
  }
  function imageList(key: 'heroSlides' | 'gallery') {
    return (
      <>
        <p className="fine-print">
          Pegá la URL HTTPS de una imagen o su ID de Unsplash. El orden define cómo aparecen.
        </p>
        {draft[key].map((url, i) => (
          <div className="image-edit" key={`${key}-${i}`}>
            <img src={photo(url, 200)} alt={`Vista previa ${i + 1}`} />
            {textField(`Imagen ${i + 1}`, url, (v) =>
              section(
                key,
                draft[key].map((x, n) => (n === i ? v : x)),
              ),
            )}
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Quitar imagen ${i + 1}`}
              disabled={draft[key].length === 1}
              onClick={() =>
                section(
                  key,
                  draft[key].filter((_, n) => n !== i),
                )
              }
            >
              <Trash2 size={16} />
            </Button>
          </div>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={() => section(key, [...draft[key], defaultContent.heroSlides[0]])}
        >
          <Plus size={14} /> Agregar imagen
        </Button>
      </>
    );
  }
  return (
    <>
      <div className="editor-layout">
        <aside className="editor-sidebar">
          {(
            [
              'Textos',
              'Imágenes',
              'Regiones',
              'Bodegas',
              'Paquetes',
              'Configuración',
              'Avanzado',
            ] as Tab[]
          ).map((t) => (
            <button
              className={tab === t ? 'active' : ''}
              key={t}
              onClick={() => {
                setTab(t);
                if (t === 'Avanzado') setRaw(JSON.stringify(draft, null, 2));
              }}
            >
              {t}
            </button>
          ))}
        </aside>
        <section className="editor-main">
          <h2>{tab === 'Configuración' ? 'Dólar, contacto y estilo' : tab}</h2>
          {tab === 'Textos' && (
            <>
              <p className="fine-print">
                Editá los textos de inicio, navegación y pie de página. Los fragmentos están en el
                orden en que aparecen.
              </p>
              <input
                className="search-input"
                aria-label="Buscar texto"
                placeholder="Buscar un texto de la página…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {Object.entries(draft.copy)
                .filter(
                  ([key, value]) =>
                    key !== 'header_75' &&
                    `${key} ${value}`.toLowerCase().includes(query.toLowerCase()),
                )
                .map(([key, value]) => (
                  <div key={key}>
                    {textField(
                      `${key.startsWith('home') ? 'Inicio' : key.startsWith('header') ? 'Navegación' : 'Pie de página'} · ${key.split('_')[1]}`,
                      value,
                      (v) => section('copy', { ...draft.copy, [key]: v }),
                      value.length > 90,
                    )}
                  </div>
                ))}
            </>
          )}
          {tab === 'Imágenes' && (
            <>
              <h3>Carrusel principal</h3>
              {imageList('heroSlides')}
              <div className="edit-record">
                <h3>Imagen del viaje a medida</h3>
                <div className="image-edit">
                  <img src={photo(draft.personalImage, 200)} alt="Viaje a medida" />
                  {textField('URL de imagen', draft.personalImage, (v) =>
                    section('personalImage', v),
                  )}
                </div>
              </div>
              <div className="edit-record">
                <h3>Galería ampliable</h3>
                {imageList('gallery')}
              </div>
              <p className="fine-print">
                Las fotos de regiones y paquetes se editan en sus respectivas secciones.
              </p>
            </>
          )}
          {tab === 'Regiones' &&
            draft.regions.map((r, i) => (
              <article className="edit-record" key={i}>
                <h3>{r.name}</h3>
                {(['name', 'subtitle', 'description', 'image'] as const).map((k) => (
                  <div key={k}>
                    {textField(
                      {
                        name: 'Nombre',
                        subtitle: 'Subtítulo',
                        description: 'Descripción',
                        image: 'Imagen · URL HTTPS o ID Unsplash',
                      }[k],
                      r[k],
                      (v) => {
                        const next = structuredClone(draft);
                        next.regions[i][k] = v;
                        if (k === 'name')
                          next.wineries = next.wineries.map((w) =>
                            w.region === r.name ? { ...w, region: v } : w,
                          );
                        update(next);
                      },
                      k === 'description',
                    )}
                  </div>
                ))}
              </article>
            ))}
          {tab === 'Bodegas' && (
            <>
              <p className="fine-print">
                Precios por persona en USD. Las coordenadas posicionan el pin en el mapa. Los
                cambios no modifican cotizaciones ya recibidas.
              </p>
              {draft.wineries.map((w, i) => {
                const change = (k: string, v: string | number) =>
                  section(
                    'wineries',
                    draft.wineries.map((x, n) => (n === i ? { ...x, [k]: v } : x)),
                  );
                return (
                  <article className="edit-record" key={w.id}>
                    <h3>{w.name}</h3>
                    {textField('Nombre', w.name, (v) => change('name', v))}
                    <div className="editor-row">
                      <label className="field">
                        <span>Región</span>
                        <select value={w.region} onChange={(e) => change('region', e.target.value)}>
                          {draft.regions.map((r) => (
                            <option key={r.id}>{r.name}</option>
                          ))}
                        </select>
                      </label>
                      {numberField('Precio por persona · USD', w.price, (v) => change('price', v))}
                    </div>
                    <div className="editor-row">
                      <label className="field">
                        <span>Experiencia</span>
                        <select
                          value={w.experience}
                          onChange={(e) => change('experience', e.target.value)}
                        >
                          {Object.entries(experienceLabels).map(([k, label]) => (
                            <option key={k} value={k}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="field">
                        <span>Categoría</span>
                        <select value={w.tier} onChange={(e) => change('tier', e.target.value)}>
                          <option value="icon">Ícono</option>
                          <option value="premium">Premium</option>
                          <option value="standard">Estándar</option>
                        </select>
                      </label>
                    </div>
                    <div className="editor-row">
                      {numberField('Latitud', w.lat, (v) => change('lat', v), -90, 90)}
                      {numberField('Longitud', w.lng, (v) => change('lng', v), -180, 180)}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={
                        draft.wineries.length === 1 ||
                        draft.combos.some((c) => c.items.some((it) => it.wineryId === w.id))
                      }
                      onClick={() =>
                        section(
                          'wineries',
                          draft.wineries.filter((x) => x.id !== w.id),
                        )
                      }
                    >
                      <Trash2 size={14} /> Quitar del catálogo
                    </Button>
                    <small className="fine-print">
                      {' '}
                      Para quitarla, primero retirala de los paquetes.
                    </small>
                  </article>
                );
              })}
              <Button
                className="mt-5"
                variant="outline"
                onClick={() =>
                  section('wineries', [
                    ...draft.wineries,
                    {
                      id: Math.max(...draft.wineries.map((w) => w.id)) + 1,
                      name: 'Nueva bodega',
                      region: draft.regions[0].name,
                      lat: -33.1,
                      lng: -68.9,
                      tier: 'premium',
                      experience: 'tasting',
                      price: 0,
                    },
                  ])
                }
              >
                <Plus size={15} /> Agregar bodega
              </Button>
            </>
          )}
          {tab === 'Paquetes' && (
            <>
              <p className="fine-print">
                El precio se calcula a partir de las bodegas, los pasajeros y el transfer. Elegí
                entre 1 y 3 visitas para cada día.
              </p>
              {draft.combos.map((c, i) => {
                const change = (k: string, v: unknown) =>
                  section(
                    'combos',
                    draft.combos.map((x, n) => (n === i ? { ...x, [k]: v } : x)),
                  );
                return (
                  <article className="edit-record" key={c.id}>
                    <h3>{c.name}</h3>
                    {(['name', 'tagline', 'region', 'label', 'description', 'image'] as const).map(
                      (k) => (
                        <div key={k}>
                          {textField(
                            {
                              name: 'Nombre',
                              tagline: 'Frase de presentación',
                              region: 'Regiones que recorre',
                              label: 'Etiqueta',
                              description: 'Bodegas, almuerzo e inclusiones',
                              image: 'Imagen',
                            }[k],
                            c[k],
                            (v) => change(k, v),
                            k === 'description',
                          )}
                        </div>
                      ),
                    )}
                    <label className="field">
                      <span>Duración</span>
                      <select
                        value={c.days}
                        onChange={(e) => {
                          const days = Number(e.target.value);
                          section(
                            'combos',
                            draft.combos.map((x, n) =>
                              n === i
                                ? { ...x, days, items: x.items.filter((it) => it.day <= days) }
                                : x,
                            ),
                          );
                        }}
                      >
                        {[1, 2, 3].map((n) => (
                          <option key={n} value={n}>
                            {n} día(s)
                          </option>
                        ))}
                      </select>
                    </label>
                    {Array.from({ length: c.days }, (_, d) => d + 1).map((day) => (
                      <fieldset className="edit-record" key={day}>
                        <legend>Día {day}</legend>
                        {draft.wineries.map((w) => (
                          <label className="consent" style={{ margin: '9px 0' }} key={w.id}>
                            <input
                              type="checkbox"
                              checked={c.items.some((it) => it.day === day && it.wineryId === w.id)}
                              onChange={(e) =>
                                change(
                                  'items',
                                  e.target.checked
                                    ? [...c.items, { day, wineryId: w.id }]
                                    : c.items.filter(
                                        (it) => !(it.day === day && it.wineryId === w.id),
                                      ),
                                )
                              }
                            />
                            <span>{w.name}</span>
                          </label>
                        ))}
                      </fieldset>
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-4"
                      disabled={draft.combos.length === 1}
                      onClick={() =>
                        section(
                          'combos',
                          draft.combos.filter((x) => x.id !== c.id),
                        )
                      }
                    >
                      <Trash2 size={14} /> Quitar paquete
                    </Button>
                  </article>
                );
              })}
              <Button
                variant="outline"
                className="mt-5"
                onClick={() =>
                  section('combos', [
                    ...draft.combos,
                    {
                      id: crypto.randomUUID(),
                      name: 'Nueva experiencia',
                      days: 1,
                      region: draft.regions[0].name,
                      tagline: 'Un viaje a tu medida.',
                      image: defaultContent.heroSlides[0],
                      items: [{ day: 1, wineryId: draft.wineries[0].id }],
                      label: 'NUEVA EXPERIENCIA',
                      description: 'Describí las visitas y el almuerzo incluido.',
                    },
                  ])
                }
              >
                <Plus size={15} /> Agregar paquete
              </Button>
            </>
          )}
          {tab === 'Configuración' && (
            <>
              {numberField(
                'Valor del dólar · ARS por 1 USD',
                draft.settings.usdToArs,
                (v) => section('settings', { ...draft.settings, usdToArs: v }),
                0,
                1000000,
              )}
              <p className="fine-print">
                Ingresá el valor que toma la agencia. Por ejemplo, 1400 equivale a 1 USD = ARS
                1.400. Con 0, la página muestra “cotización en pesos a confirmar”. Las solicitudes
                guardan el valor vigente al enviarse.
              </p>
              {numberField(
                'Transfer privado · USD por día cada 4 pasajeros',
                draft.settings.transferPerDay,
                (v) => section('settings', { ...draft.settings, transferPerDay: v }),
              )}
              {textField(
                'WhatsApp de la agencia · código de país y número',
                draft.settings.whatsappNumber,
                (v) => section('settings', { ...draft.settings, whatsappNumber: v }),
              )}
              <p className="fine-print">
                Ejemplo de formato: 5492611234567, sin +, espacios ni guiones.
              </p>
              {textField(
                'Política de disponibilidad',
                draft.settings.policy,
                (v) => section('settings', { ...draft.settings, policy: v }),
                true,
              )}
              <div className="editor-row">
                {textField('Color principal · hexadecimal', draft.settings.brandColor, (v) =>
                  section('settings', { ...draft.settings, brandColor: v }),
                )}
                {textField('Color arena · hexadecimal', draft.settings.sandColor, (v) =>
                  section('settings', { ...draft.settings, sandColor: v }),
                )}
              </div>
              {textField('Título para buscadores', draft.settings.pageTitle, (v) =>
                section('settings', { ...draft.settings, pageTitle: v }),
              )}
              {textField(
                'Descripción para buscadores',
                draft.settings.pageDescription,
                (v) => section('settings', { ...draft.settings, pageDescription: v }),
                true,
              )}
            </>
          )}
          {tab === 'Avanzado' && (
            <>
              <p className="fine-print">
                Respaldo completo del contenido editable. Para importar, pegá el JSON y aplicalo al
                borrador antes de publicar.
              </p>
              <label className="field">
                <span>Contenido JSON</span>
                <textarea
                  className="json-editor"
                  value={raw}
                  onChange={(e) => setRaw(e.target.value)}
                  spellCheck={false}
                />
              </label>
              <Button
                variant="outline"
                onClick={() => {
                  try {
                    const parsed = contentSchema.parse(JSON.parse(raw));
                    update(parsed);
                    setMessage('JSON aplicado al borrador. Publicá para guardar en Neon.');
                  } catch (e) {
                    setError(e instanceof Error ? e.message : 'JSON inválido.');
                  }
                }}
              >
                Aplicar al borrador
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  const url = URL.createObjectURL(
                    new Blob([JSON.stringify(draft, null, 2)], { type: 'application/json' }),
                  );
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'terroir-contenido.json';
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                <Download size={15} /> Exportar respaldo
              </Button>
            </>
          )}
        </section>
      </div>
      {message && (
        <p role="status" className="success-message">
          {message}
        </p>
      )}
      {error && (
        <p role="alert" className="error-message">
          {error}
        </p>
      )}
      <div className="editor-savebar">
        <span>
          {dirty ? 'Tenés cambios en borrador.' : 'Contenido actualizado.'}{' '}
          {!ready && 'El borrador se conserva en este navegador.'}
        </span>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" asChild>
            <a href="/" target="_blank" rel="noreferrer">
              Ver página <ExternalLink size={13} />
            </a>
          </Button>
          <Button size="sm" disabled={busy || !dirty || !ready} onClick={save}>
            <Save size={14} />
            {busy ? 'Publicando…' : 'Publicar cambios'}
          </Button>
        </div>
      </div>
    </>
  );
}
