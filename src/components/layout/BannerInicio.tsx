import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { cx } from '../ui/primitives';
import { useBannersQueCargan, type BannerHero } from './HeroCarrusel';

export function BannerInicio({ banners, intervalo = 5000, autoAvance = true }: { banners: BannerHero[]; intervalo?: number; autoAvance?: boolean }) {
  const listos = useBannersQueCargan(banners);
  const [i, setI] = useState(0);
  const [pausa, setPausa] = useState(false);
  const total = listos.length;
  useEffect(() => { if (i >= total) setI(0); }, [i, total]);
  useEffect(() => {
    if (!autoAvance || pausa || total < 2) return;
    const t = window.setTimeout(() => setI((x) => (x + 1) % total), intervalo);
    return () => window.clearTimeout(t);
  }, [autoAvance, pausa, total, intervalo, i]);
  if (!total) return null;
  return (
    <section aria-roledescription="carrusel" aria-label="Novedades" className="relative h-[clamp(270px,calc(100svh-284px),556px)] overflow-hidden bg-cafe lg:h-[calc(var(--alto-vista)-92px)] lg:min-h-[440px]"
      onMouseEnter={() => setPausa(true)} onMouseLeave={() => setPausa(false)}>
      {listos.map((b, k) => {
        const imagen = (
          <picture>
            <source media="(min-width: 640px)" srcSet={b.desktop} />
            <img src={b.movil || b.desktop} alt="" data-prueba="no" className="size-full object-cover" loading={k === 0 ? 'eager' : 'lazy'} />
          </picture>
        );
        const clase = cx('absolute inset-0 transition-opacity duration-700', k === i ? 'opacity-100' : 'pointer-events-none opacity-0');
        if (!b.link) return <div key={b.id} className={clase} aria-hidden={k !== i}>{imagen}</div>;
        return b.externo || /^https?:/.test(b.link)
          ? <a key={b.id} href={b.link} target={b.externo ? '_blank' : undefined} rel={b.externo ? 'noopener noreferrer' : undefined} className={clase} aria-hidden={k !== i} tabIndex={k === i ? 0 : -1}>{imagen}</a>
          : <Link key={b.id} to={b.link} className={clase} aria-hidden={k !== i} tabIndex={k === i ? 0 : -1}>{imagen}</Link>;
      })}
      {total > 1 && (
        <div className="absolute inset-x-0 bottom-3 z-10 flex justify-center gap-2">
          {listos.map((b, k) => (
            <button key={b.id} onClick={() => setI(k)} aria-label={`Ver banner ${k + 1}`} aria-current={k === i}
              className={cx('h-2.5 rounded-[5px] transition-all', k === i ? 'w-7 bg-n0' : 'w-2.5 bg-n0/50')} />
          ))}
        </div>
      )}
    </section>
  );
}
