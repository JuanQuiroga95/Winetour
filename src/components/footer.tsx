'use client';
import Link from 'next/link';
import { useContent } from './site-provider';
import { Mountain, ArrowUpRight } from 'lucide-react';
export function Footer() {
  const { copy, ...content } = useContent();
  void content;
  return (
    <footer>
      <div className="footer-main">
        <Link href="/" className="brand">
          <Mountain size={32} strokeWidth={1} />
          <span>
            {copy.footer_76}
            <span className="brand-sub">{copy.footer_77}</span>
          </span>
        </Link>
        <p>
          {copy.footer_78}
          <br />
          {copy.footer_79}
        </p>
        <div>
          <span className="eyebrow">{copy.footer_80}</span>
          <Link href="/itinerario">
            {copy.footer_81}
            <ArrowUpRight size={20} />
          </Link>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Terroir Mendoza</span>
        <span>{copy.footer_82}</span>
        <Link href="/admin">{copy.footer_83}</Link>
      </div>
    </footer>
  );
}
