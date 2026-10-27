import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon, type IconName } from '../ui/Icon';
import { ButtonCompacto, Foto, ImagenOpcional, cx } from '../ui/primitives';
import { Nube } from '../ui/Brand';
import { Carrusel, FilaAuto } from '../ui/Carrusel';
import { REDES } from '../layout/AppShell';
import { CardGanador, CardPremio } from '../cards/cards';
import { useUltimosGanadores } from '../../data/datos';
import { Tx } from '../../data/revision';
import { tx, type ClaveTexto } from '../../data/textos';


const PASOS: { t: ClaveTexto; d: ClaveTexto; icono: IconName; img: string }[] = [
  { t: 'paso1.t', d: 'paso1.d', icono: 'ticket', img: 'paso-1' },
  { t: 'paso2.t', d: 'paso2.d', icono: 'cuenta', img: 'paso-2' },
  { t: 'paso4.t', d: 'paso4.d', icono: 'beneficios', img: 'paso-4' },
  { t: 'paso3.t', d: 'paso3.d', icono: 'trofeo', img: 'paso-3' },
];

function conNegritas(t: string) {
  return t.split(/(\*\*[^*]+\*\*)/).map((x, k) => x.startsWith('**') ? <strong key={k} className="font-bold text-cafe">{x.slice(2, -2)}</strong> : x);
}

export function PasosComoFunciona() {
  return (
    <ol className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
      {PASOS.map((p, i) => (
        <li key={p.t} className="flex h-full items-center gap-3 rounded-[18px] bg-n0 px-3 py-2.5 lg:rounded-[20px] lg:p-4">
          <div className="relative flex size-[56px] shrink-0 items-end justify-center lg:size-[88px]">
            <span className="absolute inset-[6%] rounded-full bg-crema ring-2 ring-amarillo/60 max-lg:hidden" aria-hidden />
            <span className="oveja-grupo relative flex size-full items-end justify-center">
              <ImagenOpcional src={`assets/${p.img}.webp`} className="oveja-quieta max-h-full max-w-full object-contain drop-shadow-[0_6px_6px_rgba(33,20,2,0.22)]" />
              <span className="absolute inset-x-1 -bottom-0.5 h-1 rounded-sm bg-amarillo" />
            </span>
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 lg:flex-col lg:items-start">
              <span className="flex w-fit items-center gap-1 rounded-pill bg-amarillo px-2 py-[1px] text-[11px] font-bold text-cafe"><Icon name={p.icono} size={11} />PASO {i + 1}</span>
              <span className="text-[15px] font-bold leading-5 text-cafe lg:text-base"><Tx k={p.t} /></span>
            </p>
            <p className="text-[13px] leading-[17px] text-n60 lg:leading-[18px]">{conNegritas(tx(p.d))}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

const FAQS: [ClaveTexto, ClaveTexto][] = [
  ['faq.1.p', 'faq.1.r'], ['faq.2.p', 'faq.2.r'], ['faq.5.p', 'faq.5.r'],
  ['faq.6.p', 'faq.6.r'], ['faq.3.p', 'faq.3.r'], ['faq.4.p', 'faq.4.r'],
];

export const preguntasFaq = () => FAQS.map(([p, r]) => ({ pregunta: tx(p), respuesta: tx(r) }));

export function Faq({ max = 5 }: { max?: number }) {
  const [abierta, setAbierta] = useState(0);
  const lista = FAQS.slice(0, max);
  const actual = lista[Math.max(0, abierta)];
  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch">
      <div className="flex flex-1 flex-col gap-1 rounded-[24px] bg-n0 p-2.5 lg:p-3">
        {lista.map(([p, r], i) => (
          <div key={p}>
            <button onClick={() => setAbierta(abierta === i ? -1 : i)} aria-expanded={abierta === i}
              className={cx('flex w-full items-center justify-between gap-4 rounded-2xl px-4 py-3.5 text-left text-[15px] font-bold text-cafe transition', abierta === i ? 'bg-amarillo/25' : 'hover:bg-n5')}>
              <Tx k={p} />
              <Icon name="chevron" size={18} className={cx('shrink-0 transition-transform', abierta === i ? 'rotate-90 lg:rotate-0' : '')} />
            </button>
            {abierta === i && <p className="px-4 pb-3 pt-1 text-sm leading-5 text-n60 lg:hidden"><Tx k={r} /></p>}
          </div>
        ))}
      </div>
      <div className="hidden w-[440px] shrink-0 flex-col gap-3.5 rounded-[24px] bg-hero-brand p-8 lg:flex" aria-live="polite">
        <p className="text-xl font-black leading-7 text-amarillo"><Tx k={actual[0]} /></p>
        <p className="text-base leading-6 text-n0"><Tx k={actual[1]} /></p>
        <p className="mt-auto pt-4 text-sm font-bold text-n0/80"><Tx k="faq.contacto" /></p>
      </div>
      <p className="text-sm text-n60 lg:hidden"><Tx k="faq.contacto" /></p>
    </div>
  );
}

export function Banda({ color, children, className }: { color: 'rosa' | 'amarillo' | 'verde' | 'azul'; children: React.ReactNode; className?: string }) {
  const fondo = { rosa: 'bg-rosa', amarillo: 'bg-amarillo', verde: 'bg-verde', azul: 'bg-azul' }[color];
  return (
    <section className={cx('relative overflow-hidden px-6 py-12 lg:px-16 lg:py-16', fondo, className)}>
      <Nube className="-left-[72px] bottom-[-90px] w-[220px] text-fondo lg:w-[260px]" />
      <Nube className="-right-[90px] bottom-[-130px] w-[300px] text-fondo lg:w-[380px]" />
      <div className="relative mx-auto flex max-w-[1238px] flex-col gap-6 lg:gap-8">{children}</div>
    </section>
  );
}

export function CardCta({ titulo, bajada, boton, to = '/planes', imagen = 'assets/oveja-cta.webp' }: { titulo: React.ReactNode; bajada: React.ReactNode; boton: React.ReactNode; to?: string; imagen?: string }) {
  return (
    <section className="relative mt-12 flex flex-col gap-6 px-6 pb-7 pt-[168px] sm:mt-24 sm:flex-row sm:items-center sm:gap-10 sm:pb-10 sm:pl-[310px] sm:pr-12 sm:pt-10">
      <div className="absolute inset-0 overflow-hidden rounded-[28px] bg-yellow-cta" aria-hidden>
        <Nube className="left-1/2 top-3 w-[170px] -translate-x-1/2 text-fondo sm:bottom-[-40px] sm:left-12 sm:top-auto sm:w-[210px] sm:translate-x-0" />
      </div>
      <ImagenOpcional src={imagen} className="absolute left-1/2 top-[-56px] z-10 h-[190px] w-auto -translate-x-1/2 object-contain sm:bottom-0 sm:left-[40px] sm:top-auto sm:h-[260px] sm:max-w-[250px] sm:translate-x-0" />
      <div className="relative flex flex-1 flex-col gap-2 text-cafe">
        <h2 className="text-[24px] font-black uppercase leading-[1.1] tracking-[0.2px] lg:text-[34px] lg:leading-[1.05]">{titulo}</h2>
        <p className="mt-1 text-[16px] leading-6 opacity-90">{bajada}</p>
      </div>
      <Link to={to} className="relative inline-flex h-14 w-full items-center justify-center gap-2 whitespace-nowrap rounded-pill bg-cafe px-8 text-[15px] font-bold text-n0 transition hover:brightness-125 sm:w-auto">
        {boton}<Icon name="flecha" size={20} />
      </Link>
    </section>
  );
}

export function BandaSigueme() {
  return (
    <section className="relative overflow-hidden bg-azul">
      <Nube className="left-1/2 top-3 w-[600px] -translate-x-1/2 text-fondo lg:top-4 lg:w-[900px]" />
      <div className="relative z-10 flex flex-col items-center gap-3 px-6 pb-6 pt-[64px] text-center lg:gap-3 lg:pb-6 lg:pt-[80px]">
        <p className="text-[32px] font-black leading-none text-cafe lg:text-[52px]">¡SÍGUEME-E-E!</p>
        <p className="text-[15px] text-cafe lg:text-lg">Que no se te escape ningún premio.</p>
        <div className="flex gap-3.5">
          {REDES.map((r) => (
            <a key={r.nombre} href={r.href} aria-label={r.nombre} className="flex size-11 items-center justify-center rounded-pill bg-cafe text-n0 transition hover:scale-105">
              <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden><path d={r.d} /></svg>
            </a>
          ))}
        </div>
        <ImagenOpcional src="assets/oveja-ganadores.webp" className="mt-3 h-[110px] object-contain lg:h-[136px]" />
      </div>
    </section>
  );
}

export function TarjetaBeneficioPublica({ b, i, apilada }: { b: { titulo: string; comercio: string; uso: string; etiqueta: string; foto?: string; logo?: string }; i: number; apilada?: boolean }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl bg-n0">
      {!b.foto && b.logo ? (
        <div className={cx('relative flex items-center justify-center bg-rosa-claro p-6', apilada ? 'h-[118px] sm:h-[160px] lg:h-[180px]' : 'h-[180px]')}>
          <ImagenOpcional src={b.logo} alt={b.comercio} className="max-h-[60%] max-w-[70%] object-contain" />
          <span className="absolute left-2 top-2 rounded-md bg-verde px-[7px] py-[3px] text-xs font-black text-cafe">{b.etiqueta}</span>
        </div>
      ) : (
        <Foto src={b.foto} alt={b.titulo} tono={i + 1} className={apilada ? 'h-[118px] sm:h-[160px] lg:h-[180px]' : 'h-[180px]'}>
          <span className="absolute left-2 top-2 rounded-md bg-verde px-[7px] py-[3px] text-xs font-black text-cafe">{b.etiqueta}</span>
        </Foto>
      )}
      <div className={cx('flex flex-1 items-center justify-between gap-3', apilada ? 'p-3 max-lg:flex-col max-lg:items-stretch max-lg:gap-2 lg:p-4' : 'p-4')}>
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="text-[15px] font-bold leading-[18px] text-cafe">{b.titulo}</p>
          <p className="text-xs text-n60">{b.comercio} · {b.uso}</p>
        </div>
        <Link to="/planes" className={cx('inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-pill bg-cafe px-4 text-sm font-bold text-n0', apilada ? 'h-9 lg:h-10' : 'h-10')}>Ver planes</Link>
      </div>
    </article>
  );
}

export function MarcasAliadas({ marcas }: { marcas: { nombre: string; logo?: string }[] }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[15px] font-bold text-n60">Marcas aliadas</p>
      <FilaAuto className="no-scrollbar -mx-6 flex snap-x items-center gap-3 overflow-x-auto scroll-px-6 px-6 py-1 lg:mx-0 lg:justify-between lg:px-0 [&>*]:snap-start">
        {marcas.map((m, i) => (
          <div key={`${m.nombre}-${i}`} className="flex h-[64px] w-[132px] shrink-0 items-center justify-center rounded-2xl bg-n0 px-4 py-3 shadow-card lg:w-auto lg:min-w-[112px] lg:flex-1">
            {m.logo ? <ImagenOpcional src={m.logo} alt={m.nombre} className="max-h-full max-w-full object-contain" /> : <span className="text-xs font-bold text-n40">{m.nombre}</span>}
          </div>
        ))}
      </FilaAuto>
    </div>
  );
}

export function TituloSeccion({ titulo, bajada, accion, imagen, antetitulo }: { titulo: React.ReactNode; bajada?: React.ReactNode; accion?: React.ReactNode; imagen?: string; antetitulo?: string }) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-4 lg:gap-5">
      {imagen && <ImagenOpcional src={imagen} className="hidden size-[84px] shrink-0 object-contain sm:block lg:size-[110px]" />}
      <div className="flex flex-col gap-1.5">
        {antetitulo && <p className="text-[13px] font-bold tracking-[0.5px] text-verde-texto">{antetitulo}</p>}
        <h2 className="text-[26px] font-black uppercase leading-none text-cafe lg:text-[36px]">{titulo}</h2>
        {bajada && <p className="text-[15px] text-n60 lg:max-w-[720px]">{bajada}</p>}
      </div>
      </div>
      {accion && <div className="hidden shrink-0 sm:block">{accion}</div>}
    </div>
  );
}

export function EstadoVacio({ titulo, detalle }: { titulo: string; detalle?: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-[20px] border border-dashed border-cafe/20 bg-n0 px-6 py-8 text-center">
      <p className="text-[15px] font-bold text-cafe">{titulo}</p>
      {detalle && <p className="text-[13px] text-n60">{detalle}</p>}
    </div>
  );
}

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const DIAS = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
const isoLima = (d: Date) => d.toLocaleDateString('en-CA', { timeZone: 'America/Lima' });

type PremioVista = { categoria: string; premio: string; fecha: string; enDias: string; foto?: string; fechaIso?: string };

export function PremiosDelMes({ fechas: todas, premios, titulo, bajada, color }: { fechas: Date[]; premios: PremioVista[]; titulo?: React.ReactNode; bajada?: React.ReactNode; color?: boolean }) {
  const hoy = new Date();
  const fechas = todas.filter((d) => isoLima(d) >= isoLima(hoy));
  const desde = hoy.getFullYear() * 12 + hoy.getMonth();
  const meses = [...new Set(fechas.map((d) => d.getFullYear() * 12 + d.getMonth()))].filter((m) => m >= desde).sort((a, b) => a - b);
  const [mesSel, setMes] = useState<number>();
  const mes = mesSel ?? meses[0];
  const delMes = fechas.filter((d) => d.getFullYear() * 12 + d.getMonth() === mes);
  const [diaSel, setDia] = useState<number>();
  const dia = delMes.find((d) => d.getDate() === diaSel) ?? delMes[0];
  const lista = dia && premios.some((p) => p.fechaIso) ? premios.filter((p) => p.fechaIso === isoLima(dia)) : premios;
  const i = mes === undefined ? -1 : meses.indexOf(mes);
  const cambiarMes = (m: number) => { setMes(m); setDia(undefined); };
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        {titulo && (
          <div className="flex flex-col gap-2">
            <h2 className="text-[26px] font-black uppercase leading-[1.05] text-cafe lg:text-[32px]">{titulo}</h2>
            {bajada && <p className="text-[16px] text-cafe/80 lg:text-[17px]">{bajada}</p>}
          </div>
        )}
        {mes !== undefined && (
          <div className="flex flex-col items-stretch gap-3 lg:items-end">
            <div className="flex items-center justify-between gap-3 rounded-pill border border-n10 bg-n0 p-1.5 lg:w-fit">
              <button aria-label="Mes anterior" disabled={i <= 0} onClick={() => cambiarMes(meses[i - 1])} className="flex size-8 items-center justify-center rounded-2xl bg-n5 text-cafe disabled:opacity-30"><Icon name="chevron" size={16} className="rotate-180" /></button>
              <span className="px-2.5 text-[15px] font-bold text-cafe">{MESES[mes % 12]} {Math.floor(mes / 12)}</span>
              <button aria-label="Mes siguiente" disabled={i >= meses.length - 1} onClick={() => cambiarMes(meses[i + 1])} className="flex size-8 items-center justify-center rounded-2xl bg-n5 text-cafe disabled:opacity-30"><Icon name="chevron" size={16} /></button>
            </div>
            <div className="no-scrollbar flex gap-2 overflow-x-auto">
              {delMes.map((d) => {
                const activo = !!dia && d.getTime() === dia.getTime();
                return (
                  <button key={d.getTime()} onClick={() => setDia(d.getDate())} aria-pressed={activo}
                    className={cx('flex h-[62px] w-[60px] shrink-0 flex-col items-center justify-center rounded-[14px]', activo ? 'bg-cafe' : 'border border-n10 bg-n0')}>
                    <span className={cx('text-[11px] font-bold tracking-[0.8px]', activo ? 'text-amarillo' : 'text-n60')}>{DIAS[d.getDay()]}</span>
                    <span className={cx('text-[22px] font-extrabold leading-7', activo ? 'text-n0' : 'text-cafe')}>{d.getDate()}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
      {lista.length ? (
        <Carrusel ancho={298}>{lista.map((p, n) => <CardPremio key={`${p.premio}-${n}`} p={p} i={n} color={color} className="w-full" />)}</Carrusel>
      ) : (
        <EstadoVacio titulo="Pronto anunciaremos los premios" detalle="Vuelve en unos días para ver los próximos sorteos." />
      )}
    </div>
  );
}

export { Carrusel } from '../ui/Carrusel';

export function GanadoresUltimoSorteo() {
  const { fecha, ganadores } = useUltimosGanadores();
  if (!ganadores.length) return null;
  const sorteo = fecha ? `SORTEO ${DIAS[fecha.getDay()]} ${fecha.getDate()} ${MESES[fecha.getMonth()].slice(0, 3).toUpperCase()}` : undefined;
  return (
    <section className="flex flex-col gap-7 rounded-[32px] bg-n0 p-5 lg:p-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
        <ImagenOpcional src="assets/oveja-ganadores.webp" className="hidden size-[110px] object-contain sm:block" />
        <div className="flex flex-1 flex-col gap-1">
          <p className="text-[13px] font-bold text-verde-texto">¡TENEMOS GANADORES!</p>
          <h2 className="text-[26px] font-black leading-[1.1] text-cafe lg:text-[34px]">Ganadores del último sorteo</h2>
          <p className="text-base text-n60">{fecha ? `${DIAS[fecha.getDay()].charAt(0)}${DIAS[fecha.getDay()].slice(1).toLowerCase()} ${fecha.getDate()} ${MESES[fecha.getMonth()].slice(0, 3).toLowerCase()} · ` : ''}transmitido en vivo · nombres protegidos</p>
        </div>
        <Link to="/ganadores" className="inline-flex h-11 items-center gap-2 self-start whitespace-nowrap rounded-pill bg-cafe px-5 text-sm font-bold text-n0 sm:self-center">Ver todos los ganadores<Icon name="flecha" size={18} /></Link>
      </div>
      <Carrusel ancho={270} gap={24}>{ganadores.slice(0, 8).map((g, n) => <CardGanador key={`${g.usuario}-${n}`} g={g} i={n} sorteo={sorteo} className="h-full w-full" />)}</Carrusel>
    </section>
  );
}
