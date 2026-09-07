'use client';
import { useContent } from './site-provider';
import { pesos } from '@/lib/quote';
export function ExchangeRate({ total }: { total?: number }) {
  const { settings } = useContent();
  return (
    <div className="exchange-rate">
      {settings.usdToArs > 0 ? (
        <>
          {total !== undefined && (
            <strong>
              Equivalente: {pesos(Math.round(total * settings.usdToArs * 100) / 100)} ARS
            </strong>
          )}
          <span>Dólar de referencia: 1 USD = {pesos(settings.usdToArs)} ARS</span>
          <small>Cotización de la agencia · importes referenciales</small>
        </>
      ) : (
        <span>Precios en USD · cotización en pesos a confirmar con la agencia.</span>
      )}
    </div>
  );
}
