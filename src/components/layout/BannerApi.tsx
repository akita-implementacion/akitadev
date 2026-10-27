import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { cx } from '../ui/primitives';
import { useBanners, type SeccionBanner } from '../../data/datos';

export function BannerApi({ secciones, className }: { secciones: SeccionBanner[]; className?: string }) {
  const todas = useBanners(secciones);
  const [fallidas, setFallidas] = useState<string[]>([]);
  const imagenes = todas.imagenes.filter((im) => !fallidas.includes(im.id));
  const { autoAvance, intervalo } = todas;
  const [i, setI] = useState(0);
  const [pausa, setPausa] = useState(false);
  const total = imagenes.length;
  useEffect(() => { if (i >= total) setI(0); }, [i, total]);
  useEffect(() => {
    if (!autoAvance || pausa || total < 2) return;
    const t = window.setTimeout(() => setI((x) => (x + 1) % total), intervalo);
    return () => window.clearTimeout(t);
  }, [autoAvance, pausa, total, intervalo, i]);
  if (!total) return null;
  return (
    <section aria-roledescription="carrusel" aria-label="Novedades" className={cx('flex flex-col gap-3', className)}
      onMouseEnter={() => setPausa(true)} onMouseLeave={() => setPausa(false)}>
      <div className="relative aspect-[4/3] overflow-hidden rounded-[24px] bg-n5 sm:aspect-[3/1]">
        {imagenes.map((im, k) => {
          const imagen = (
            <picture>
              <source media="(min-width: 640px)" srcSet={im.desktop} />
              <img src={im.movil || im.desktop} alt="" data-prueba="no" className="size-full object-cover" loading={k === 0 ? 'eager' : 'lazy'}
                onError={() => setFallidas((f) => (f.includes(im.id) ? f : [...f, im.id]))} />
            </picture>
          );
          const clase = cx('absolute inset-0 transition-opacity duration-500', k === i ? 'opacity-100' : 'pointer-events-none opacity-0');
          if (!im.link) return <div key={im.id} className={clase} aria-hidden={k !== i}>{imagen}</div>;
          return im.externo || /^https?:/.test(im.link)
            ? <a key={im.id} href={im.link} target={im.externo ? '_blank' : undefined} rel={im.externo ? 'noopener noreferrer' : undefined} className={clase} tabIndex={k === i ? 0 : -1}>{imagen}</a>
            : <Link key={im.id} to={im.link} className={clase} tabIndex={k === i ? 0 : -1}>{imagen}</Link>;
        })}
      </div>
      {total > 1 && (
        <div className="flex justify-center gap-2">
          {imagenes.map((im, k) => (
            <button key={im.id} aria-label={`Ver banner ${k + 1}`} aria-current={k === i} onClick={() => setI(k)}
              className={cx('h-2 rounded-pill transition-all', k === i ? 'w-6 bg-cafe' : 'w-2 bg-cafe/30')} />
          ))}
        </div>
      )}
    </section>
  );
}
