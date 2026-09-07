import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { quotes, quoteItems } from '@/db/schema';
import { getSiteContent } from '@/lib/content-server';
import { calculateQuote, quoteSchema } from '@/lib/quote';
export async function POST(req: Request) {
  if (!process.env.DATABASE_URL)
    return NextResponse.json(
      { error: 'La recepción de solicitudes todavía no está habilitada. Intentá más tarde.' },
      { status: 503 },
    );
  try {
    if (Number(req.headers.get('content-length') || 0) > 20000)
      return NextResponse.json({ error: 'Solicitud demasiado extensa.' }, { status: 413 });
    const raw = await req.text();
    if (raw.length > 20000)
      return NextResponse.json({ error: 'Solicitud demasiado extensa.' }, { status: 413 });
    let body;
    try {
      body = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: 'Datos inválidos.' }, { status: 400 });
    }
    const parsed = quoteSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    const { items, accepted, ...input } = parsed.data;
    void accepted;
    const db = getDb();
    const content = await getSiteContent(true);
    const catalog = content.wineries;
    if (items.some((i) => !catalog.some((w) => w.id === i.wineryId)))
      return NextResponse.json(
        { error: 'Una bodega ya no está disponible. Actualizá la página.' },
        { status: 400 },
      );
    const { perPerson, ...costs } = calculateQuote(
      input,
      items,
      catalog,
      content.settings.transferPerDay,
    );
    void perPerson;
    if (
      body.displayedTotal !== costs.total ||
      body.displayedExchangeRate !== content.settings.usdToArs ||
      body.displayedPolicy !== content.settings.policy
    ) {
      return NextResponse.json(
        {
          error:
            'Se actualizaron las tarifas o condiciones mientras armabas tu viaje. Recargá la página para revisar los valores antes de enviar.',
        },
        { status: 409 },
      );
    }
    const id = crypto.randomUUID();
    await db.batch([
      db.insert(quotes).values({
        id,
        ...input,
        ...costs,
        exchangeRate: content.settings.usdToArs,
        totalArs: Math.round(costs.total * content.settings.usdToArs * 100) / 100,
        policyText: content.settings.policy,
      }),
      db.insert(quoteItems).values(
        items.map((i) => {
          const w = catalog.find((w) => w.id === i.wineryId)!;
          return {
            quoteId: id,
            wineryId: w.id,
            day: i.day,
            wineryName: w.name,
            experience: w.experience,
            unitPrice: w.price,
          };
        }),
      ),
    ]);
    const number = (content.settings.whatsappNumber || process.env.WHATSAPP_NUMBER)?.replace(
      /\D/g,
      '',
    );
    const message = `Hola, soy ${input.name}. Guardé mi solicitud #${id.slice(0, 8)} para el ${input.date}: ${input.pax} personas, ${input.days} día(s). Total referencial: USD ${costs.total}. Me gustaría coordinar mi viaje.`;
    return NextResponse.json(
      {
        id,
        whatsappUrl: number ? `https://wa.me/${number}?text=${encodeURIComponent(message)}` : null,
      },
      { status: 201 },
    );
  } catch (e) {
    console.error('quote-save-failed', e instanceof Error ? e.name : 'unknown');
    return NextResponse.json(
      { error: 'No pudimos guardar tu solicitud. Intentá nuevamente en unos minutos.' },
      { status: 500 },
    );
  }
}
