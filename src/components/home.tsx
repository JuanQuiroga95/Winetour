'use client';
import Link from 'next/link';
import { useContent } from './site-provider';
import { motion } from 'framer-motion';
import {
  ArrowDown,
  ArrowUpRight,
  ArrowRight,
  MapPin,
  Wine,
  Utensils,
  Car,
  Compass,
  Clock,
  Mountain,
  Leaf,
} from 'lucide-react';
import { HeroCarousel, LightboxGallery } from './visuals';
import { ExchangeRate } from './exchange-rate';
import { Header } from './header';
import { Footer } from './footer';
import { Button } from './ui/button';
import { photo } from '@/lib/data';
import { calculateQuote, money } from '@/lib/quote';
const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.7 },
};
export function Home() {
  const { copy, ...content } = useContent();
  const { combos, regions } = content;
  return (
    <>
      <section className="hero">
        <HeroCarousel slides={content.heroSlides} />
        <div className="hero-shade" />
        <Header />
        <div className="hero-content">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9 }}
          >
            <span className="eyebrow hero-kicker">
              <span />
              {copy.home_1}
            </span>
            <h1>
              {copy.home_2}
              <br />
              {copy.home_3}
              <em>{copy.home_4}</em>
            </h1>
            <p>
              {copy.home_5}
              <br className="desktop-br" />
              {copy.home_6}
            </p>
            <div className="hero-buttons">
              <Button asChild className="sand-button">
                <Link href="/itinerario">
                  {copy.home_7}
                  <ArrowUpRight size={17} />
                </Link>
              </Button>
              <Link className="text-link" href="#experiencias">
                {copy.home_8}
                <ArrowRight size={17} />
              </Link>
            </div>
          </motion.div>
        </div>
        <div className="hero-bottom">
          <span>
            <MapPin size={14} />
            {copy.home_9}
            <i />
            {copy.home_10}
          </span>
          <Link href="#filosofia">
            {copy.home_11}
            <ArrowDown size={16} />
          </Link>
        </div>
        <div className="hero-side">{copy.home_12}</div>
      </section>
      <div className="promise-strip">
        <span>
          <Wine />
          {copy.home_13}
        </span>
        <span>
          <Utensils />
          {copy.home_14}
        </span>
        <span>
          <Car />
          {copy.home_15}
        </span>
        <span>
          <Compass />
          {copy.home_16}
        </span>
      </div>
      <section id="filosofia" className="section intro">
        <motion.div {...reveal}>
          <span className="eyebrow wine-text">{copy.home_17}</span>
          <h2>
            {copy.home_18}
            <br />
            {copy.home_19}
            <em>{copy.home_20}</em>
          </h2>
        </motion.div>
        <motion.div {...reveal} className="intro-copy">
          <p>{copy.home_21}</p>
          <p>{copy.home_22}</p>
          <a href="#nosotros" className="under-link">
            {copy.home_23}
            <ArrowUpRight size={17} />
          </a>
        </motion.div>
      </section>
      <section id="regiones" className="section regions-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow wine-text">{copy.home_24}</span>
            <h2>
              {copy.home_25}
              <em>{copy.home_26}</em>
            </h2>
          </div>
          <span className="section-aside">{copy.home_27}</span>
        </div>
        <div className="region-grid">
          {regions.map((r, i) => (
            <motion.div {...reveal} transition={{ duration: 0.6, delay: i * 0.1 }} key={r.id}>
              <Link
                href={`/itinerario?region=${encodeURIComponent(r.name)}`}
                className={`region-card region-${r.id}`}
                style={{ backgroundImage: `url(${photo(r.image, 900)})` }}
              >
                <div className="region-top">
                  <span>0{i + 1}</span>
                  <MapPin size={17} />
                </div>
                <div className="region-copy">
                  <span className="eyebrow">{r.subtitle}</span>
                  <h3>{r.name}</h3>
                  <p>{r.description}</p>
                  <span className="region-arrow">
                    <ArrowUpRight size={22} />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
        <div className="regions-note">
          <Mountain size={20} strokeWidth={1} />
          <span>{copy.home_28}</span>
        </div>
      </section>
      <section id="experiencias" className="experience-section">
        <div className="section">
          <div className="section-heading">
            <div>
              <span className="eyebrow wine-text">{copy.home_29}</span>
              <h2>
                {copy.home_30}
                <em>{copy.home_31}</em>
              </h2>
            </div>
            <Link href="/itinerario" className="under-link">
              {copy.home_32}
              <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="combo-grid">
            {combos.map((c) => (
              <motion.article {...reveal} className="combo-card" key={c.id}>
                <Link
                  href={`/itinerario?combo=${c.id}`}
                  className="combo-photo"
                  key="photo"
                  style={{ backgroundImage: `url(${photo(c.image, 850)})` }}
                >
                  <span className="combo-label">{c.label}</span>
                  <span className="combo-duration">
                    <Clock size={13} />
                    {c.days} {c.days === 1 ? 'día' : 'días'}
                  </span>
                </Link>
                <div className="combo-body" key="body">
                  <span className="eyebrow muted">
                    <MapPin size={12} />
                    {c.region}
                  </span>
                  <h3>{c.name}</h3>
                  <p>{c.tagline}</p>
                  <details>
                    <summary>{copy.home_33}</summary>
                    <p>{c.description} Transfer privado incluido.</p>
                  </details>
                  <div className="combo-features">
                    <span>
                      <Wine size={14} />
                      {copy.home_34}
                    </span>
                    <span>
                      <Utensils size={14} />
                      {copy.home_35}
                    </span>
                    <span>
                      <Car size={14} />
                      {copy.home_36}
                    </span>
                  </div>
                  <div className="combo-bottom">
                    <div>
                      <small>{copy.home_37}</small>
                      <strong>
                        {money(
                          calculateQuote(
                            { days: c.days, pax: 2, privateTransfer: true },
                            c.items,
                            content.wineries,
                            content.settings.transferPerDay,
                          ).perPerson,
                        )}{' '}
                        <span>{copy.home_38}</span>
                      </strong>
                      <small>{copy.home_39}</small>
                    </div>
                    <Link href={`/itinerario?combo=${c.id}`} aria-label={`Elegir ${c.name}`}>
                      <ArrowUpRight size={23} />
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
          <ExchangeRate />
          <p className="price-note">{copy.home_40}</p>
        </div>
      </section>
      <section className="section personal-section">
        <div
          className="personal-image"
          style={{ backgroundImage: `url(${photo(content.personalImage, 1200)})` }}
        >
          <span className="image-caption">{copy.home_41}</span>
        </div>
        <motion.div {...reveal} className="personal-copy">
          <span className="eyebrow wine-text">{copy.home_42}</span>
          <h2>
            {copy.home_43}
            <br />
            {copy.home_44}
            <em>{copy.home_45}</em>
          </h2>
          <p>{copy.home_46}</p>
          <div className="process-list">
            <span>
              <b>{copy.home_47}</b>
              {copy.home_48}
            </span>
            <span>
              <b>{copy.home_49}</b>
              {copy.home_50}
            </span>
            <span>
              <b>{copy.home_51}</b>
              {copy.home_52}
            </span>
          </div>
          <Button asChild>
            <Link href="/itinerario">
              {copy.home_53}
              <ArrowUpRight size={16} />
            </Link>
          </Button>
          <small>{copy.home_54}</small>
        </motion.div>
      </section>
      <section id="nosotros" className="team-section">
        <div className="section">
          <span className="eyebrow">{copy.home_55}</span>
          <h2>
            {copy.home_56}
            <em>{copy.home_57}</em>
          </h2>
          <p>{copy.home_58}</p>
          <div className="team-values">
            <span>
              <Wine strokeWidth={1} />
              {copy.home_59}
            </span>
            <span>
              <Leaf strokeWidth={1} />
              {copy.home_60}
            </span>
            <span>
              <Compass strokeWidth={1} />
              {copy.home_61}
            </span>
          </div>
          <LightboxGallery images={content.gallery} />
          <small className="gallery-note">{copy.home_62}</small>
        </div>
      </section>
      <section className="closing section">
        <span className="eyebrow wine-text">{copy.home_63}</span>
        <h2>
          {copy.home_64}
          <br />
          {copy.home_65}
          <em>{copy.home_66}</em>
        </h2>
        <Button asChild>
          <Link href="/itinerario">
            {copy.home_67}
            <ArrowUpRight size={17} />
          </Link>
        </Button>
      </section>
      <Footer />
    </>
  );
}
