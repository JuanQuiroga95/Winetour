import type { Metadata } from 'next';
import './globals.css';
import { SiteProvider } from '@/components/site-provider';
import { getSiteContent } from '@/lib/content-server';
export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getSiteContent();
  return {
    title: settings.pageTitle,
    description: settings.pageDescription,
    robots: { index: true, follow: true },
  };
}
export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const content = await getSiteContent();
  return (
    <html lang="es-AR" data-scroll-behavior="smooth">
      <body>
        <SiteProvider content={content}>{children}</SiteProvider>
      </body>
    </html>
  );
}
