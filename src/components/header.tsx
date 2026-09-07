'use client';
import Link from 'next/link';
import { useContent } from './site-provider';
import { useState } from 'react';
import { ArrowUpRight, Menu, X, Mountain } from 'lucide-react';
import { Button } from '@/components/ui/button';
export function Header({ dark = false }: { dark?: boolean }) {
  const { copy, ...content } = useContent();
  void content;
  const [open, setOpen] = useState(false);
  return (
    <header className={`site-header ${dark ? 'header-dark' : ''}`}>
      <Link href="/" className="brand" aria-label="Terroir Mendoza, inicio">
        <Mountain size={30} strokeWidth={1} />
        <span>
          {copy.header_68}
          <span className="brand-sub">{copy.header_69}</span>
        </span>
      </Link>
      <nav className={open ? 'nav-links nav-open' : 'nav-links'} aria-label="Navegación principal">
        <Link onClick={() => setOpen(false)} href="/#filosofia">
          {copy.header_70}
        </Link>
        <Link onClick={() => setOpen(false)} href="/#regiones">
          {copy.header_71}
        </Link>
        <Link onClick={() => setOpen(false)} href="/#experiencias">
          {copy.header_72}
        </Link>
        <Link onClick={() => setOpen(false)} href="/itinerario" className="mobile-cta">
          {copy.header_73}
        </Link>
      </nav>
      <Button asChild variant="outline" className="header-cta">
        <Link href="/itinerario">
          {copy.header_74}
          <ArrowUpRight size={15} />
        </Link>
      </Button>
      <button
        className="menu-toggle"
        aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {open ? <X /> : <Menu />}
      </button>
    </header>
  );
}
