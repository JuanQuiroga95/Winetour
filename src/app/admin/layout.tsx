import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Administración | Terroir Mendoza',
  robots: { index: false, follow: false },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
