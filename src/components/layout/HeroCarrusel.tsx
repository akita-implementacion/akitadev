import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Hero } from './Hero';
import { Nube } from '../ui/Brand';
import { LogoMarca } from '../ui/LogoMarca';
import { cx, type Pose } from '../ui/primitives';
import type { PromoMarca } from '../../data/mock';
import { asset } from '../../data/assets';

function destacar(titulo: string, d?: string) {
  const T = titulo.toUpperCase(); const D = (d ?? '').toUpperCase(); const i = D ? T.indexOf(D) : -1;
  return i < 0 ? titulo : <>{T.slice(0, i)}<span className="text-n0">{T.slice(i, i + D.length)}</span>{T.slice(i + D.length)}</>;
}

export type BannerHero = { id: string; desktop: string; movil: string; link?: string; externo?: boolean };

export function useBannersQueCargan(banners: BannerHero[]) {
  const [listos, setListos] = useState<string[]>([]);
  const claves = banners.map((b) => b.id).join(',');
  useEffect(() => {
    let vivo = true;
    banners.forEach((b) => {
      const img = new Image();
      img.onload = () => { if (vivo) setListos((l) => (l.includes(b.id) ? l : [...l, b.id])); };
      img.src = window.matchMedia('(min-width: 640px)').matches || !b.movil ? b.desktop : b.movil;
    });
    return () => { vivo = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [claves]);
  return banners.filter((b) => listos.includes(b.id));
}

export function HeroCarrusel({ color, titulo, bajada, pose, promos: ejemplos, banners = [] }: { color: string; titulo: ReactNode; bajada: ReactNode; pose: Pose; promos: PromoMarca[]; banners?: BannerHero[] }) {
  const deApi = useBannersQueCargan(banners);
  const promos = deApi.length ? [] : ejemplos;
  const total = promos.length + deApi.length + 1;
  const [i, setI] = useState(0);
  const [pausa, setPausa] = useState(false);
  useEffect(() => {
    if (pausa || total < 2) return;
    const t = setInterval(() => setI((x) => (x + 1) % total), 5000);
    return () => clearInterval(t);
  }, [pausa, total]);

  return (
    <div className={cx('relative', promos.some((p) => p.imagen) && 'max-lg:[&_section]:min-h-[300px]')} onMouseEnter={() => setPausa(true)} onMouseLeave={() => setPausa(false)}>
      <div className={cx('transition-opacity duration-500', i === 0 ? 'opacity-100' : 'pointer-events-none opacity-0')} aria-hidden={i !== 0}>
        <Hero color={color} titulo={titulo} bajada={bajada} pose={pose} />
      </div>
      {promos.map((p, k) => (
        <section key={p.id} aria-hidden={i !== k + 1}
          className={cx('absolute inset-0 overflow-hidden transition-opacity duration-500', i === k + 1 ? 'opacity-100' : 'pointer-events-none opacity-0')}
          style={{ background: p.color }}>
          {p.fondo && <img src={asset(p.fondo)} alt="" aria-hidden className="pointer-events-none absolute inset-0 size-full object-cover object-[78%_50%] lg:object-center" />}
          <div className="relative z-10 mx-auto flex h-full max-w-[1366px] items-stretch gap-3 px-6 pb-12 pt-6 lg:gap-8 lg:px-16 lg:pb-16 lg:pt-6">
            <div className="flex min-w-0 flex-1 flex-col justify-center gap-2 lg:max-w-[620px] lg:gap-3">
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                <LogoMarca src={p.logo} nombre={p.marca} tamano="md" className="!h-9 !w-[78px] !p-1.5 lg:!h-12 lg:!w-[120px] lg:!p-2" />
                <span className={cx('w-fit whitespace-nowrap rounded-pill px-3 py-1 text-[10px] font-bold tracking-[1px] lg:text-[11px]', p.oscuro ? 'bg-amarillo text-cafe' : 'bg-cafe text-amarillo')}>{p.etiqueta}</span>
              </div>
              <p className={cx('text-[21px] font-black uppercase leading-[1.02] lg:text-[clamp(30px,2.9vw,42px)]', p.oscuro ? 'text-amarillo' : 'text-cafe')}>{destacar(p.titulo, p.destacado)}</p>
              <p className={cx('max-w-[460px] text-[13px] leading-[18px] lg:text-[16px] lg:leading-6', p.oscuro ? 'text-n0/90' : 'text-cafe/90')}>{p.bajada}</p>
            </div>
            <div className="relative flex w-[42%] shrink-0 items-center justify-center lg:w-auto lg:flex-1">
              {p.imagen
                ? <img src={asset(p.imagen)} alt="" className="max-h-[150px] w-auto max-w-full object-contain drop-shadow-[0_14px_18px_rgba(33,20,2,0.3)] lg:max-h-[220px] lg:max-w-[440px]" />
                : <LogoMarca src={p.logo} nombre={p.marca} tamano="lg" className="!h-16 !w-[120px] lg:!h-28 lg:!w-[240px] lg:!p-4" />}
            </div>
          </div>
          <Nube className="-bottom-[88px] -left-[50px] w-[150px] text-fondo lg:hidden" />
          <Nube className="-bottom-[112px] -right-[50px] w-[200px] text-fondo lg:hidden" />
          <Nube className="-bottom-[158px] -left-20 hidden w-[260px] text-fondo lg:block" />
          <Nube className="-bottom-[161px] left-[42%] hidden w-[220px] text-fondo lg:block" />
        </section>
      ))}
      {deApi.map((b, k) => {
        const activo = i === promos.length + k + 1;
        const clase = cx('absolute inset-0 overflow-hidden transition-opacity duration-500', activo ? 'opacity-100' : 'pointer-events-none opacity-0');
        const imagen = (
          <picture>
            <source media="(min-width: 640px)" srcSet={b.desktop} />
            <img src={b.movil || b.desktop} alt="" data-prueba="no" className="size-full object-cover" />
          </picture>
        );
        if (!b.link) return <section key={b.id} aria-hidden={!activo} className={clase}>{imagen}</section>;
        return b.externo || /^https?:/.test(b.link)
          ? <a key={b.id} href={b.link} target={b.externo ? '_blank' : undefined} rel={b.externo ? 'noopener noreferrer' : undefined} aria-hidden={!activo} tabIndex={activo ? 0 : -1} className={clase}>{imagen}</a>
          : <Link key={b.id} to={b.link} aria-hidden={!activo} tabIndex={activo ? 0 : -1} className={clase}>{imagen}</Link>;
      })}
      {total > 1 && (
        <div className="absolute inset-x-0 bottom-3 z-20 flex justify-center gap-2 lg:bottom-5">
          {Array.from({ length: total }, (_, k) => (
            <button key={k} aria-label={`Ver banner ${k + 1}`} onClick={() => setI(k)}
              className={cx('h-2 rounded-pill transition-all', k === i ? 'w-6 bg-cafe' : 'w-2 bg-cafe/30')} />
          ))}
        </div>
      )}
    </div>
  );
}
