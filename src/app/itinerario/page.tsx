import { Suspense } from 'react';
import { Builder } from '@/components/builder';
import { getSiteContent } from '@/lib/content-server';
export const dynamic = 'force-dynamic';
export default async function Page() {
  const content = await getSiteContent();
  return (
    <Suspense fallback={<p>Cargando tu experiencia…</p>}>
      <Builder catalog={content.wineries} packages={content.combos} />
    </Suspense>
  );
}
