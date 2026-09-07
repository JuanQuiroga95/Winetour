'use client';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Pause, Play, X, Expand } from 'lucide-react';
import { photo } from '@/lib/data';
export function HeroCarousel({ slides }: { slides: string[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (paused || reduced || slides.length < 2) return;
    const timer = setInterval(() => setActive((i) => (i + 1) % slides.length), 6500);
    return () => clearInterval(timer);
  }, [paused, reduced, slides.length]);
  return (
    <>
      <AnimatePresence initial={false}>
        <motion.div
          key={slides[active]}
          className="hero-image"
          style={{ backgroundImage: `url("${photo(slides[active], 2200)}")` }}
          initial={{ opacity: 0, scale: reduced ? 1 : 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ opacity: { duration: 1.3 }, scale: { duration: 7 } }}
        />
      </AnimatePresence>
      <div className="hero-carousel-controls" aria-label="Fotos de Mendoza">
        <button
          aria-label="Foto anterior"
          onClick={() => setActive((active + slides.length - 1) % slides.length)}
        >
          <ChevronLeft size={17} />
        </button>
        {slides.map((_, i) => (
          <button
            key={i}
            aria-label={`Ver foto ${i + 1}`}
            aria-current={active === i}
            onClick={() => setActive(i)}
            className={`slide-dot ${active === i ? 'active' : ''}`}
          />
        ))}
        <button aria-label="Foto siguiente" onClick={() => setActive((active + 1) % slides.length)}>
          <ChevronRight size={17} />
        </button>
        <button
          aria-label={paused ? 'Reproducir carrusel' : 'Pausar carrusel'}
          onClick={() => setPaused(!paused)}
        >
          {paused ? <Play size={13} /> : <Pause size={13} />}
        </button>
      </div>
    </>
  );
}
export function LightboxGallery({ images }: { images: string[] }) {
  const [index, setIndex] = useState<number | null>(null);
  useEffect(() => {
    if (index === null) return;
    const previous = document.activeElement as HTMLElement | null;
    const old = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const dialog = document.querySelector<HTMLDialogElement>('.lightbox');
    dialog?.showModal();
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setIndex(null);
      }
      if (e.key === 'ArrowRight') setIndex((i) => (i === null ? null : (i + 1) % images.length));
      if (e.key === 'ArrowLeft')
        setIndex((i) => (i === null ? null : (i + images.length - 1) % images.length));
    };
    window.addEventListener('keydown', key);
    return () => {
      document.body.style.overflow = old;
      window.removeEventListener('keydown', key);
      dialog?.close();
      previous?.focus();
    };
  }, [index === null, images.length]);
  return (
    <>
      <div className="gallery">
        {images.map((p, i) => (
          <button
            key={`${p}-${i}`}
            aria-label={`Ampliar fotografía ${i + 1}`}
            onClick={() => setIndex(i)}
            style={{ backgroundImage: `url("${photo(p, 900)}")` }}
          >
            <Expand size={22} />
          </button>
        ))}
      </div>
      {index !== null && (
        <dialog
          className="lightbox"
          aria-label="Galería de inspiración"
          onCancel={() => setIndex(null)}
        >
          <button
            className="lightbox-close"
            aria-label="Cerrar galería"
            onClick={() => setIndex(null)}
          >
            <X />
          </button>
          <button
            aria-label="Fotografía anterior"
            onClick={() => setIndex((index + images.length - 1) % images.length)}
          >
            <ChevronLeft />
          </button>
          <img
            src={photo(images[index], 1800)}
            alt={`Inspiración de vino, gastronomía y paisajes. Fotografía ${index + 1}.`}
          />
          <button
            aria-label="Fotografía siguiente"
            onClick={() => setIndex((index + 1) % images.length)}
          >
            <ChevronRight />
          </button>
          <span>
            {index + 1} / {images.length}
          </span>
        </dialog>
      )}
    </>
  );
}
