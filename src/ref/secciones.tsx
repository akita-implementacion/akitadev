import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '../components/ui/Icon';
import { IconoMarca, IconoRed } from './MarcaIconos';
import { Nube } from '../components/ui/Brand';
import { Badge, ChipFiltro, MonedaLana, cx } from '../components/ui/primitives';
import { Carrusel, useDesplazarSolo } from '../components/ui/Carrusel';
import { PERIODOS, PLANES, ahorro, soles, type Periodo, type Plan } from './planes';
import type { Beneficio, Canje, Ganador, Marca, Premio, Pregunta, Slide } from './publico';
import { mesesSorteos, premiosDeFecha, proximaFecha, redes } from './publico';
import { useDetallePublico, type DetallePremio } from '../components/sorteos/DetallePremio';
import { useSesion } from '../data/sesion';

export { Carrusel };

const base = import.meta.env.BASE_URL;
const img = (f: string) => `${base}img/${f}`;

const NUBE_MASK = `url("data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 183"><path d="M199.93 91.48C199.93 76.14 190.80 62.94 177.70 57.06C179.67 45.44 176.17 33.04 167.21 24.05C157.04 13.86 142.55 10.72 129.72 14.63C122.82 5.71 112.06 0 99.96 0C87.87 0 77.07 5.74 70.20 14.63C57.38 10.75 42.85 13.89 32.72 24.05C23.75 33.04 20.25 45.44 22.22 57.06C9.13 62.98 0 76.14 0 91.48C0 106.82 9.09 119.98 22.19 125.89C20.22 137.52 23.72 149.92 32.68 158.91C42.85 169.1 57.34 172.24 70.20 168.33C77.07 177.25 87.87 183 100 183C112.12 183 122.89 177.25 129.79 168.33C142.65 172.24 157.14 169.06 167.31 158.91C176.27 149.92 179.77 137.52 177.80 125.89C190.90 119.98 200 106.82 200 91.48H199.93Z"/></svg>')}")`;

type Tono = 'amarillo' | 'cafe' | 'verde' | 'rosa' | 'outline';
const tonos: Record<Tono, string> = {
  amarillo: 'bg-amarillo text-cafe', cafe: 'bg-cafe text-fondo', verde: 'bg-verde text-cafe', rosa: 'bg-rosa text-cafe',
  outline: 'border-[1.5px] border-cafe text-cafe',
};
export function Boton({ to, onClick, tono = 'amarillo', icono, iconoIzq, full, chico, children, className }: {
  to?: string; onClick?: () => void; tono?: Tono; icono?: boolean; iconoIzq?: ReactNode; full?: boolean; chico?: boolean; children: ReactNode; className?: string;
}) {
  const cls = cx('inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded-pill font-bold transition hover:brightness-95 active:scale-[.98]',
    chico ? 'h-11 px-5 text-sm' : 'h-14 px-8 text-[15px]', tonos[tono], full && 'w-full', className);
  const inner = <>{iconoIzq}{children}{icono && <Icon name="flecha" size={chico ? 18 : 20} />}</>;
  return to ? <Link to={to} className={cls}>{inner}</Link> : <button type="button" onClick={onClick} className={cls}>{inner}</button>;
}

export function TituloSeccion({ titulo, bajada, accion, imagen, claro }: { titulo: string; bajada?: string; accion?: ReactNode; imagen?: string; claro?: boolean }) {
  return (
    <div className="flex items-center gap-3 lg:gap-4">
      {imagen && <img src={imagen} alt="" className="hidden size-[64px] shrink-0 object-contain sm:block lg:size-[clamp(56px,10dvh,84px)]" />}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <h2 className={cx('text-[24px] font-black uppercase leading-[1.05] lg:text-[clamp(26px,4.6dvh,34px)]', claro ? 'text-fondo' : 'text-cafe')}>{titulo}</h2>
        {bajada && <p className={cx('text-[14px] leading-[20px] lg:text-[15px]', claro ? 'text-fondo/80' : 'text-n60')}>{bajada}</p>}
      </div>
      {accion && <div className="hidden shrink-0 sm:block">{accion}</div>}
    </div>
  );
}

function ImagenSlide({ s }: { s: Slide }) {
  return (
    <div className="flex size-full items-center justify-center [container-type:size]">
      <div className="relative aspect-[640/585] w-[min(100cqw,calc(100cqh*1.094))]">
        <Nube className="inset-0 size-full text-fondo" />
        {s.tipo === 'personas' ? (
          <div className="absolute inset-0" style={{ WebkitMaskImage: NUBE_MASK, maskImage: NUBE_MASK, WebkitMaskSize: '100% 100%', maskSize: '100% 100%' }}>
            <img src={s.foto} alt="" className="absolute -left-[6%] top-[15%] w-[112%] max-w-none" />
          </div>
        ) : (
          <img src={s.foto} alt={s.titulo.join(' ')} className="absolute bottom-[6%] left-[-4%] w-[108%] max-w-none object-contain drop-shadow-[0_18px_18px_rgba(33,20,2,0.25)]" />
        )}
      </div>
    </div>
  );
}

export function SliderHero({ slides }: { slides: Slide[] }) {
  const [i, setI] = useState(0);
  const [pausa, setPausa] = useState(false);
  const toque = useRef<number | null>(null);
  useEffect(() => {
    if (pausa || slides.length < 2) return;
    const t = window.setTimeout(() => setI((x) => (x + 1) % slides.length), 5000);
    return () => window.clearTimeout(t);
  }, [pausa, slides.length, i]);
  const s = slides[i];
  return (
    <section className="vista relative h-[calc(100svh-172px)] min-h-[440px] scroll-mt-[92px] overflow-hidden transition-colors duration-700 lg:h-[calc(var(--alto-vista)-92px)] lg:min-h-[440px] lg:scroll-mt-0"
      style={{ background: s.fondo }} aria-roledescription="carrusel"
      onTouchStart={(e) => { toque.current = e.touches[0].clientX; setPausa(true); }}
      onTouchEnd={(e) => {
        const x0 = toque.current; toque.current = null; setPausa(false);
        if (x0 == null) return; const dx = e.changedTouches[0].clientX - x0;
        if (Math.abs(dx) > 50) setI((x) => (x + (dx < 0 ? 1 : slides.length - 1)) % slides.length);
      }}>
      {slides.map((sl, k) => {
        const amarillo = sl.fondo.toUpperCase() === '#FFD400';
        return (
          <div key={sl.id} aria-hidden={k !== i} className={cx('absolute inset-0 transition-opacity duration-700', k === i ? 'opacity-100' : 'pointer-events-none opacity-0')}>
            <div className="mx-auto flex h-full max-w-[1366px] flex-col px-6 pb-9 pt-3 lg:flex-row lg:items-center lg:gap-10 lg:px-[100px] lg:pb-[76px] lg:pt-6">
              <div className="min-h-0 flex-1 lg:order-2 lg:h-full lg:flex-[1.15]"><ImagenSlide s={sl} /></div>
              <div className="relative z-10 flex shrink-0 flex-col items-start gap-2.5 pt-2 lg:order-1 lg:w-[520px] lg:gap-4 lg:pt-0">
                <span className="flex items-center gap-1 rounded-pill bg-cafe px-3 py-1 text-[11px] font-bold tracking-[0.8px] text-amarillo"><span aria-hidden>★</span>{sl.etiqueta}</span>
                <h1 className="text-[clamp(34px,10.5vw,46px)] font-black leading-[0.95] text-cafe lg:text-[clamp(48px,9dvh,84px)]">{sl.titulo.map((l) => <span key={l} className="block">{l}</span>)}</h1>
                <p className="text-[15px] leading-[21px] text-cafe lg:max-w-[480px] lg:text-[clamp(16px,2.6dvh,20px)] lg:leading-[1.4]">{sl.bajada}</p>
                <Link to={sl.to} tabIndex={k === i ? 0 : -1}
                  className={cx('mt-1 inline-flex h-[52px] items-center whitespace-nowrap rounded-pill px-8 text-[17px] font-bold lg:h-[58px] lg:px-9 lg:text-xl', amarillo ? 'bg-cafe text-n0' : 'bg-amarillo text-cafe')}>
                  {sl.cta}
                </Link>
              </div>
            </div>
          </div>
        );
      })}
      {slides.length > 1 && (
        <div className="absolute inset-x-0 bottom-3 z-10 lg:bottom-[66px]">
          <div className="mx-auto flex max-w-[1366px] justify-center gap-2 px-6 lg:justify-start lg:px-[100px]">
            {slides.map((_, k) => (
              <button key={k} onClick={() => setI(k)} aria-label={`Ver slide ${k + 1}`} aria-current={k === i}
                className={cx('h-2.5 rounded-[5px] transition-all', k === i ? 'w-7 bg-cafe' : 'w-2.5 bg-cafe/30')} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export function PropuestaValor({ items }: { items: { icono: 'estrella' | 'regalo' | 'buscar' | 'oveja'; titulo: string; texto: string }[] }) {
  const sello = (v: (typeof items)[number], card?: boolean) => (
    <div key={v.titulo} className={cx('flex items-center gap-3', card && 'h-full rounded-2xl bg-n0 px-4 py-3.5 shadow-card')}>
      <span className="flex size-11 shrink-0 items-center justify-center rounded-[22px] bg-cafe"><IconoMarca nombre={v.icono} /></span>
      <div className="flex min-w-0 flex-col gap-0.5">
        <p className="text-[15px] font-bold leading-5 text-cafe">{v.titulo}</p>
        <p className="text-[13px] leading-[18px] text-n60">{v.texto}</p>
      </div>
    </div>
  );
  return (
    <section className="vista-m relative z-10 bg-fondo px-6 pt-4 lg:-mt-12 lg:bg-transparent lg:px-16 lg:pb-6 lg:pt-0">
      <div className="mx-auto hidden max-w-[1238px] grid-cols-4 gap-8 rounded-[24px] bg-n0 px-8 py-[clamp(16px,2.6dvh,24px)] shadow-[0_16px_40px_rgba(33,20,3,0.18)] lg:grid">
        {items.map((v) => sello(v))}
      </div>
      <div className="lg:hidden">
        <Carrusel anchoClase="w-[248px]" gap={12} puntos={false}>{items.map((v) => sello(v, true))}</Carrusel>
      </div>
    </section>
  );
}

const fondoFoto: Record<Premio['fondo'], string> = { amarillo: 'bg-amarillo', rosa: 'bg-rosa', azul: 'bg-azul', verde: 'bg-verde' };

export const detalleDePremio = (p: Premio): DetallePremio => ({
  premio: p.nombre, fecha: p.fechaSorteo, foto: p.foto,
  terminos: p.categoria === 'MOVILIDAD' ? ['El premio se entrega a nombre del ganador, que debe ser mayor de edad y presentar su DNI.', 'Incluye SOAT y placa.', 'El ganador tiene 30 días para reclamar el premio desde la publicación de resultados.', 'La imagen es referencial.'] : undefined,
  descripcion: p.descripcion ?? 'Premio nuevo, sorteado en vivo el miércoles por nuestras redes.',
  specs: p.specs ?? ['Participan todos los suscriptores con plan vigente', 'Te contactamos si ganas'],
});

export function TarjetaPremio({ p, color, grande }: { p: Premio; color?: boolean; grande?: boolean }) {
  const d = useDetallePublico(detalleDePremio(p));
  const pasado = p.enDias === 'Ya se sorteó';
  const etiqueta = <span className={cx('rounded-pill px-2.5 py-1 text-xs font-bold', pasado ? 'bg-n10 text-n60' : 'bg-amarillo text-cafe')}>{p.enDias}</span>;
  if (grande) {
    return (
      <article className="flex h-full flex-col overflow-hidden rounded-2xl bg-n0 shadow-card lg:flex-row">
        <div className="relative h-[clamp(150px,30svh,270px)] overflow-hidden lg:order-2 lg:flex lg:h-auto lg:w-[54%] lg:flex-col lg:items-center lg:justify-center lg:gap-1.5 lg:bg-transparent lg:py-[3px] lg:pr-[3px]">
          <div className="relative size-full lg:h-[clamp(84px,calc(var(--alto-vista)*0.135),190px)] lg:w-full">
            <img src={p.foto} alt={p.nombre} className={cx('absolute inset-0 z-10 m-auto max-h-full max-w-full object-contain p-2 lg:p-[3px]', pasado && 'opacity-60 grayscale')} loading="lazy" draggable={false} />
          </div>
          <span className="absolute left-2.5 top-2.5 z-20 lg:hidden">{etiqueta}</span>
          <button onClick={d.abrir} className="mb-2 hidden h-9 w-[calc(100%-12px)] items-center justify-center whitespace-nowrap rounded-pill bg-cafe px-4 text-sm font-bold text-fondo lg:inline-flex">Ver detalle</button>
        </div>
        <div className="flex flex-1 items-center justify-between gap-3 px-4 py-3 lg:order-1 lg:flex-col lg:items-start lg:justify-center lg:gap-1.5 lg:py-4 lg:pl-5 lg:pr-2">
          <span className="hidden lg:block">{etiqueta}</span>
          <div className="flex min-w-0 flex-col gap-0.5 lg:gap-1">
            <p className="text-[9px] font-bold tracking-[1px] text-n60 lg:text-[10px]">{p.categoria}</p>
            <p className="text-sm font-bold leading-[18px] text-cafe lg:text-[clamp(15px,2.6dvh,19px)] lg:leading-tight">{p.nombre}</p>
            <p className="text-xs font-medium text-n60 lg:text-[13px]">{p.fechaSorteo}</p>
          </div>
          <button onClick={d.abrir} className="inline-flex h-10 shrink-0 items-center whitespace-nowrap rounded-pill bg-cafe px-3.5 text-sm font-bold text-fondo lg:hidden">Ver detalle</button>
        </div>
        {d.modal}
      </article>
    );
  }
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl bg-n0 shadow-card">
      <div className={cx('relative h-[150px] overflow-hidden lg:h-[clamp(120px,calc(var(--alto-vista)*0.22),190px)]', color ? fondoFoto[p.fondo] : 'bg-fondo')}>
        {color && <><Nube className="-left-[26px] bottom-[-46px] w-[100px] text-fondo" /><Nube className="-right-[30px] bottom-[-58px] w-[124px] text-fondo" /></>}
        <img src={p.foto} alt={p.nombre} className={cx('absolute bottom-[4%] right-[5%] z-10 h-[96%] w-auto max-w-[80%] object-contain object-bottom drop-shadow-[0_8px_10px_rgba(33,20,3,0.18)]', pasado && 'opacity-60 grayscale')} loading="lazy" draggable={false} />
        <span className="absolute left-2.5 top-2.5 z-20">{etiqueta}</span>
      </div>
      <div className="flex flex-1 items-center justify-between gap-3 px-4 py-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="text-[9px] font-bold tracking-[1px] text-n60">{p.categoria}</p>
          <p className="text-sm font-bold leading-[18px] text-cafe">{p.nombre}</p>
          <p className="text-xs font-medium text-n60">{p.fechaSorteo}</p>
        </div>
        <button onClick={d.abrir} className="inline-flex h-10 shrink-0 items-center whitespace-nowrap rounded-pill bg-cafe px-3.5 text-sm font-bold text-fondo">Ver detalle</button>
        {d.modal}
      </div>
    </article>
  );
}

export function SelectorFechas({ m, dia, onMes, onDia, claro }: { m: number; dia: number; onMes: (m: number) => void; onDia: (d: number) => void; claro?: boolean }) {
  const mes = mesesSorteos[m];
  const hoy = new Date();
  return (
    <div className="flex w-fit max-w-full flex-col items-stretch gap-2">
      <div className="flex items-center justify-between gap-2 rounded-pill border border-n10 bg-n0 p-1">
        <button aria-label="Mes anterior" disabled={m === 0} onClick={() => onMes(m - 1)} className="flex size-7 items-center justify-center rounded-2xl bg-n5 text-base font-bold text-cafe disabled:opacity-30">‹</button>
        <span className="px-1 text-center text-[14px] font-bold text-cafe">{mes.mes}</span>
        <button aria-label="Mes siguiente" disabled={m === mesesSorteos.length - 1} onClick={() => onMes(m + 1)} className="flex size-7 items-center justify-center rounded-2xl bg-n5 text-base font-bold text-cafe disabled:opacity-30">›</button>
      </div>
      <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
        {mes.fechas.map((f) => {
          const pasado = new Date(mes.anio, mes.indice, f, 23, 59) < hoy;
          const activa = f === dia;
          return (
            <button key={f} onClick={() => onDia(f)} aria-pressed={activa} aria-label={`Miércoles ${f} de ${mes.mes}${pasado ? ' (ya se sorteó)' : ''}`}
              className={cx('flex h-[40px] w-[44px] shrink-0 flex-col items-center justify-center rounded-[12px]', activa ? 'bg-cafe' : cx('border border-n10', claro ? 'bg-n0/70' : 'bg-n0'), pasado && !activa && 'opacity-50')}>
              <span className={cx('text-[9px] font-bold leading-3 tracking-[0.8px]', activa ? 'text-amarillo' : 'text-n60')}>MIÉ</span>
              <span className={cx('text-[16px] font-extrabold leading-5', activa ? 'text-n0' : 'text-cafe')}>{f}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function useFechasSorteo() {
  const ini = useMemo(() => proximaFecha(), []);
  const [m, setM] = useState(ini.m);
  const [dia, setDia] = useState(ini.dia);
  const onMes = (nm: number) => {
    setM(nm);
    const mes = mesesSorteos[nm]; const hoy = new Date();
    setDia(mes.fechas.find((f) => new Date(mes.anio, mes.indice, f, 23, 59) >= hoy) ?? mes.fechas[0]);
  };
  const premios = useMemo(() => premiosDeFecha(mesesSorteos[m], dia), [m, dia]);
  return { m, dia, onMes, onDia: setDia, premios };
}

export function PremiosDelMes() {
  const f = useFechasSorteo();
  return (
    <section className="vista-m relative mt-4 overflow-hidden bg-rosa px-6 pb-12 pt-8 lg:mt-0 lg:px-16 lg:py-[clamp(20px,3.4dvh,40px)]">
      <Nube className="-left-[72px] bottom-[-80px] w-[240px] text-fondo" />
      <Nube className="-right-[90px] bottom-[-120px] w-[360px] text-fondo" />
      <div className="relative mx-auto flex w-full max-w-[1238px] flex-col gap-4 lg:gap-[clamp(6px,1.2dvh,16px)]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between lg:gap-6">
          <div className="flex flex-col gap-1 lg:pb-1">
            <h2 className="text-[26px] font-black uppercase leading-[1.05] text-cafe lg:text-[clamp(22px,3.8dvh,34px)]">{"Premios de este me\u2060-\u2060e\u2060-\u2060es"}</h2>
            <p className="text-[14px] leading-5 text-cafe/80 lg:text-[15px]">Cada miércoles sorteamos premios en vivo. Elige la fecha y mira qué puedes ganar.</p>
          </div>
          <SelectorFechas m={f.m} dia={f.dia} onMes={f.onMes} onDia={f.onDia} />
        </div>
        <Carrusel anchoClase="w-[78vw] max-w-[330px] lg:w-[calc((100%-40px)/3)] lg:max-w-none" gap={20} tonoPuntos="cafe">
          {f.premios.map((p) => <TarjetaPremio key={p.id} p={p} grande />)}
        </Carrusel>
      </div>
    </section>
  );
}

export function CondicionesPago({ className }: { className?: string }) {
  const [info, setInfo] = useState(false);
  return (
    <span className={cx('relative inline-flex flex-col', className)}>
      <button onClick={() => setInfo((v) => !v)} aria-expanded={info} className="flex items-center gap-1.5 text-[13px] font-semibold text-cafe underline underline-offset-2 lg:text-sm">
        <Icon name="info" size={16} /> Condiciones de pago y renovación
      </button>
      {info && (
        <span className="z-20 mt-1 block max-w-[420px] rounded-xl bg-n0 p-3 text-[13px] leading-5 text-cafe shadow-card lg:absolute lg:left-0 lg:top-full lg:w-[400px]">
          Mensual: cobro automático con tarjeta. Semestral y anual: pagas con tarjeta o Yape y decides si se renueva solo. Ahorras hasta {Math.max(...PLANES.map((p) => ahorro(p, 'anual')))} % según el plan.
        </span>
      )}
    </span>
  );
}

export function SelectorPeriodo({ periodo, onChange, compacto, sinCondiciones, izquierda }: { periodo: Periodo; onChange: (p: Periodo) => void; compacto?: boolean; sinCondiciones?: boolean; izquierda?: boolean }) {
  return (
    <div className={cx('relative flex flex-col gap-2', izquierda ? 'items-start' : 'lg:items-end')}>
      <div className="flex rounded-pill bg-n0 p-1.5" role="radiogroup" aria-label="Elige cada cuánto pagar">
        {PERIODOS.map((p) => (
          <button key={p.id} role="radio" aria-checked={periodo === p.id} onClick={() => onChange(p.id)}
            className={cx('flex-1 whitespace-nowrap rounded-pill px-5 font-bold lg:px-7', compacto ? 'h-11 text-[15px] lg:h-[46px] lg:text-base' : 'h-[51px] text-[16px] lg:text-lg', periodo === p.id ? 'bg-cafe text-n0' : 'text-cafe')}>
            {p.label}
          </button>
        ))}
      </div>
      {!sinCondiciones && <CondicionesPago className={cx('self-start', !izquierda && 'lg:self-end')} />}
    </div>
  );
}

export function TarjetaPlan({ plan, periodo, compacta }: { plan: Plan; periodo: Periodo; compacta?: boolean }) {
  const navigate = useNavigate();
  const { actualizar } = useSesion();
  const per = PERIODOS.find((p) => p.id === periodo)!;
  const pct = ahorro(plan, periodo);
  const osc = plan.oscuro;
  const botonColor = { verde: 'bg-verde', amarillo: 'bg-amarillo', rosa: 'bg-rosa' }[plan.color];
  return (
    <article className={cx('relative flex h-full flex-col rounded-[24px]', compacta ? 'gap-3 p-6 lg:p-7' : 'gap-3.5 p-6 lg:p-8',
      osc ? 'bg-hero-brand text-n0' : 'bg-n0 text-cafe', plan.id === 'lanota' && !osc && 'ring-2 ring-inset ring-cafe')}>
      {compacta && (
        <Link to="/planes#comparar" className={cx('absolute right-5 top-5 inline-flex items-center gap-1 text-[13px] font-semibold underline underline-offset-2 lg:right-[clamp(16px,2.2dvh,24px)] lg:top-[clamp(14px,2.2dvh,24px)] lg:text-sm', osc ? 'text-n0' : 'text-cafe')}>
          Comparar <Icon name="flecha" size={14} />
        </Link>
      )}
      {(() => {
        const cabecera = (
          <div className="flex min-w-0 flex-col gap-1">
            <div className={cx('flex', 'flex-col items-start gap-1.5')}>
              <Badge tone={plan.color === 'verde' ? 'verde' : plan.color === 'rosa' ? 'rosa' : 'amarillo'} className="self-start">{plan.etiqueta}</Badge>
              <h3 className={cx('font-extrabold', compacta ? 'text-[24px] leading-7 lg:text-[clamp(18px,3dvh,22px)] lg:leading-tight' : 'text-[26px]', osc && 'text-amarillo')}>{plan.nombre}</h3>
            </div>
            <p className={cx('text-sm font-medium', compacta && 'lg:text-[13px]', osc ? 'text-n0/80' : 'text-[#5c544a]')}>{plan.subtitulo}</p>
            <div className={cx('flex flex-wrap gap-x-2 gap-y-1', compacta ? 'mt-0.5 items-baseline' : 'flex-col items-start')}>
              <p className={cx('whitespace-nowrap font-bold leading-none', compacta ? 'text-[32px] lg:text-[clamp(24px,4dvh,36px)]' : 'mt-1 text-[40px] lg:text-[44px]', osc && 'text-amarillo')}>{soles(plan.precios[periodo])}</p>
              <span className={cx('text-sm', compacta && 'lg:text-[13px]', osc ? 'text-n0/70' : 'text-n60')}>{per.sufijo}</span>
            </div>
            {pct > 0 && <span className="w-fit rounded-md bg-verde px-2 py-0.5 text-xs font-bold text-cafe">Ahorras {pct} %</span>}
          </div>
        );
        const lista = (
          <ul className={cx('flex flex-col', compacta ? 'gap-1.5 lg:gap-0.5' : 'gap-2.5')}>
            {[`${plan.chances} ${plan.chances === 1 ? 'chance' : 'chances'} por sorteo regular`, 'Beneficios del catálogo', 'Misiones, cofre y Lanas'].map((t) => (
              <li key={t} className={cx('flex items-center gap-2 font-medium', compacta ? 'text-sm lg:text-[clamp(12.5px,1.9dvh,14px)]' : 'text-[15px]')}><Icon name="check" size={compacta ? 16 : 18} />{t}</li>
            ))}
          </ul>
        );
        return compacta ? (
          <div className="flex items-stretch gap-1">
            <div className="flex min-w-0 flex-1 flex-col gap-2.5 lg:gap-[clamp(5px,1dvh,12px)]">{cabecera}{lista}</div>
            <img src={`${base}${plan.imagen}`} alt="" className="size-[96px] shrink-0 self-end object-contain lg:size-[clamp(84px,11dvh,118px)]" loading="lazy" draggable={false} />
          </div>
        ) : (
          <>
            <div className="flex items-start gap-2">
              <div className="flex-1">{cabecera}</div>
              <img src={`${base}${plan.imagen}`} alt="" className="size-[110px] shrink-0 object-contain lg:size-[136px]" loading="lazy" draggable={false} />
            </div>
            {lista}
          </>
        );
      })()}
      <div className="flex-1" />
      <button onClick={() => { actualizar({ plan: plan.nombre as 'LANITA' | 'LANOTA' | 'LANAZA', periodo }); navigate('/suscribirse/cuenta'); }}
        className={cx('inline-flex w-full items-center justify-center gap-2.5 whitespace-nowrap rounded-pill text-[15px] font-bold text-cafe', compacta ? 'h-12 lg:h-[clamp(38px,5.8dvh,46px)] lg:text-sm' : 'h-14', botonColor)}>
        Elegir {plan.nombre} <Icon name="flecha" size={20} />
      </button>
    </article>
  );
}

export function BandaPlanes({ titulo = 'Elige el plan que va contigo', conComparar = true }: { titulo?: string; conComparar?: boolean }) {
  const [periodo, setPeriodo] = useState<Periodo>('mensual');
  return (
    <section className="vista-m relative overflow-hidden bg-amarillo px-6 pb-14 pt-8 lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:px-16 lg:py-[clamp(20px,3.4dvh,40px)]">
      <Nube className="-left-16 bottom-[-120px] w-[220px] text-fondo" />
      <Nube className="-right-24 bottom-[-160px] w-[300px] text-fondo" />
      <div className="relative mx-auto flex w-full max-w-[1238px] flex-col gap-4 lg:gap-[clamp(6px,1.2dvh,18px)]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4 lg:gap-6">
            <img src={img('oveja-planes-titulo.webp')} alt="" className="hidden w-[96px] shrink-0 sm:block lg:w-[clamp(84px,14dvh,150px)]" />
            <div>
              <h2 className="text-[24px] font-black uppercase leading-[1.05] text-cafe lg:max-w-[620px] lg:text-[clamp(26px,5dvh,44px)]">{titulo}</h2>
              <p className="mt-1 text-[14px] text-n60 lg:text-[clamp(14px,2.2dvh,17px)]">Más chances, más beneficios, más premios.</p>
            </div>
          </div>
          <SelectorPeriodo periodo={periodo} onChange={setPeriodo} compacto />
        </div>
        <div className="hidden grid-cols-3 gap-6 lg:grid">
          {PLANES.map((p) => <TarjetaPlan key={p.id} plan={p} periodo={periodo} compacta />)}
        </div>
        <div className="lg:hidden">
          <Carrusel anchoClase="w-[82vw] max-w-[340px]" gap={12} tonoPuntos="cafe">
            {PLANES.map((p) => <TarjetaPlan key={p.id} plan={p} periodo={periodo} compacta />)}
          </Carrusel>
        </div>
        {conComparar && <div className="flex justify-center lg:hidden"><Boton to="/planes#comparar" tono="cafe" chico icono>Comparar planes</Boton></div>}
      </div>
    </section>
  );
}

function conNegritas(t: string) {
  return t.split(/(\*\*[^*]+\*\*)/).map((x, k) => x.startsWith('**') ? <strong key={k} className="font-bold text-cafe">{x.slice(2, -2)}</strong> : x);
}

function TarjetaPaso({ p, i }: { p: { titulo: string; texto: string; img: string }; i: number }) {
  return (
    <div className="flex h-full items-center gap-3 rounded-[18px] bg-n0 px-3 py-2 lg:rounded-[20px] lg:p-4">
      <div className="relative flex size-[46px] shrink-0 items-end justify-center lg:size-[clamp(64px,13dvh,96px)]">
        <span className="absolute inset-[6%] rounded-full bg-crema ring-2 ring-amarillo/60 max-lg:hidden" aria-hidden />
        <span className="oveja-grupo relative flex size-full items-end justify-center">
          <img src={p.img} alt="" className="oveja-quieta max-h-full max-w-full object-contain drop-shadow-[0_6px_6px_rgba(33,20,2,0.22)]" loading="lazy" draggable={false} />
          <span className="absolute inset-x-1 -bottom-0.5 h-1 rounded-sm bg-amarillo" />
        </span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 lg:flex-col lg:items-start">
          <span className="w-fit rounded-pill bg-amarillo px-2 py-[1px] text-[11px] font-bold text-cafe">PASO {i + 1}</span>
          <span className="text-[15px] font-bold leading-5 text-cafe lg:text-base">{p.titulo}</span>
        </p>
        <p className="text-[13px] leading-[17px] text-n60 lg:leading-[18px]">{conNegritas(p.texto)}</p>
      </div>
    </div>
  );
}

export function PasosComoFunciona({ pasos, conBoton = true, titulo = '¿Cómo funciona AKITÁ?' }: { pasos: { titulo: string; texto: string; img: string }[]; conBoton?: boolean; titulo?: string }) {
  return (
    <section className="flex flex-col gap-3 lg:gap-[clamp(10px,2dvh,20px)]">
      <TituloSeccion titulo={titulo} bajada="Participar es muy sencillo. Sigue estos pasos y empieza a ganar."
        accion={conBoton ? <Boton to="/como-funciona" tono="outline" chico icono>Conoce más de AKITÁ</Boton> : undefined} />
      <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
        {pasos.map((p, i) => <TarjetaPaso key={p.titulo} p={p} i={i} />)}
      </div>
    </section>
  );
}

export function TarjetaBeneficio({ b, compacta, apilada }: { b: Beneficio; compacta?: boolean; apilada?: boolean }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl bg-n0">
      <div className={cx('relative overflow-hidden', compacta ? 'h-[clamp(76px,11svh,150px)] lg:h-[clamp(96px,calc(var(--alto-vista)*0.2),180px)]' : apilada ? 'h-[118px] sm:h-[160px] lg:h-[clamp(128px,calc(var(--alto-vista)*0.22),180px)]' : 'h-[180px]')}>
        {b.foto ? <img src={b.foto} alt={b.titulo} className="size-full object-cover" loading="lazy" draggable={false} />
          : <div className="flex size-full items-center justify-center bg-rosa-claro p-6"><img src={b.logo} alt={b.comercio} className="max-h-[60%] max-w-[70%] object-contain" loading="lazy" draggable={false} /></div>}
        <span className="absolute left-2 top-2 rounded-md bg-verde px-[7px] py-[3px] text-xs font-black text-cafe">{b.etiqueta}</span>
      </div>
      <div className={cx('flex flex-1 items-center justify-between gap-3', compacta ? 'px-4 py-3' : apilada ? 'p-3 max-lg:flex-col max-lg:items-stretch max-lg:gap-2 lg:p-4' : 'p-4')}>
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="text-[15px] font-bold leading-[18px] text-cafe">{b.titulo}</p>
          <p className="text-xs text-n60">{b.comercio} · {b.uso}</p>
        </div>
        <Link to="/planes" className={cx('inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-pill bg-cafe px-4 text-sm font-bold text-n0', apilada ? 'h-9 lg:h-10' : 'h-10')}>Ver planes</Link>
      </div>
    </article>
  );
}

export function BeneficiosADiario({ beneficios }: { beneficios: Beneficio[] }) {
  return (
    <section className="flex flex-col gap-3 lg:gap-[clamp(10px,2dvh,18px)]">
      <TituloSeccion titulo="Beneficios a diario" bajada="Descuentos en restaurantes, salud, belleza y más, ganes o no el sorteo."
        accion={<Boton to="/beneficios" tono="outline" chico icono>Ver todos los beneficios</Boton>} />
      <Carrusel anchoClase="w-[74vw] max-w-[300px] lg:w-[calc((100%-60px)/4)] lg:max-w-none" gap={20}>
        {beneficios.map((b) => <TarjetaBeneficio key={b.id} b={b} compacta />)}
      </Carrusel>
    </section>
  );
}

export function FiltroCategorias({ categorias, activa, onChange }: { categorias: string[]; activa: string; onChange: (c: string) => void }) {
  return (
    <div className="no-scrollbar -mx-6 flex gap-2 overflow-x-auto px-6 lg:mx-0 lg:px-0">
      {categorias.map((c) => <ChipFiltro key={c} activo={c === activa} onClick={() => onChange(c)}>{c}</ChipFiltro>)}
    </div>
  );
}

const LOGOS_CUADRADOS = ['barba negra', 'repsol'];
export function MarcasAliadas({ marcas }: { marcas: Marca[] }) {
  const filaMarcas = useDesplazarSolo<HTMLDivElement>(5000);
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[15px] font-bold text-n60">Marcas aliadas</p>
      <div ref={filaMarcas} className="no-scrollbar -mx-6 flex snap-x items-center gap-3 overflow-x-auto scroll-px-6 px-6 py-1 lg:mx-0 lg:justify-between lg:gap-3 lg:px-0">
        {marcas.map((m) => {
          const cuadrado = LOGOS_CUADRADOS.includes(m.nombre);
          return (
            <div key={m.nombre} className={cx('flex h-[64px] shrink-0 snap-start items-center justify-center rounded-2xl bg-n0 shadow-card', cuadrado ? 'w-[64px] p-2' : 'w-[132px] px-4 py-3 lg:w-[clamp(112px,9.6vw,132px)]')}>
              <img src={m.logo} alt={m.nombre} className="max-h-full max-w-full object-contain" loading="lazy" draggable={false} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function CanjesConLanas({ canjes }: { canjes: Canje[] }) {
  return (
    <div className="relative flex flex-col gap-3 overflow-hidden rounded-[24px] bg-hero-brand p-5 lg:p-7">
      <img src={img('oveja-08.webp')} alt="" className="absolute right-6 top-4 z-10 hidden w-[72px] lg:block" />
      <h3 className="text-[22px] font-extrabold text-amarillo lg:text-[26px]">Y además, Lanas</h3>
      <p className="max-w-[760px] text-[15px] text-n10">Ganas Lanas con misiones, referidos y el cofre semanal. Las usas para sumar chances o canjear beneficios. 1 Lana = 1 chance.</p>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {canjes.map((c) => (
          <div key={c.id} className="flex flex-col gap-1 rounded-2xl bg-n0 p-3">
            <div className="flex items-center gap-1.5"><MonedaLana size={22} /><span className="text-lg font-extrabold text-cafe">{c.costo.toLocaleString('es-PE')}</span></div>
            <p className="text-sm font-bold leading-[18px] text-cafe">{c.titulo}</p>
            <p className="text-xs text-n60">{c.detalle}</p>
          </div>
        ))}
      </div>
    </div>
  );
}


export function TarjetaGanador({ g, compacta }: { g: Ganador; compacta?: boolean }) {
  return (
    <article className="flex h-full flex-col rounded-[20px] bg-cafe p-2.5">
      <div className={cx('relative h-[clamp(110px,18svh,150px)] overflow-hidden rounded-[14px]', compacta ? 'lg:h-[clamp(96px,calc(var(--alto-vista)*0.18),170px)]' : 'lg:h-[clamp(88px,calc(var(--alto-vista)*0.17),170px)]')}>
        <img src={g.foto} alt="" className="size-full object-cover object-top" loading="lazy" draggable={false} />
        <span className="absolute bottom-2 left-2 rounded-md bg-amarillo px-2 py-[3px] text-[10px] font-bold text-cafe">★ GANADOR</span>
      </div>
      <div className="flex flex-1 flex-col gap-1 px-1.5 pb-1 pt-2.5">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-[11px] font-bold text-amarillo">{g.fechaSorteo}</p>
          <span className="shrink-0 rounded-pill bg-n0/10 px-2 py-0.5 text-[11px] font-bold text-n0">{g.chances} {g.chances === 1 ? 'chance' : 'chances'}</span>
        </div>
        <p className="truncate text-[16px] font-black leading-6 text-amarillo" title={g.nombre}>{g.nombre}</p>
        <p className="truncate text-[14px] font-bold leading-5 text-n0" title={g.premio}>{g.premio}</p>
        <p className="whitespace-nowrap text-[12px] text-n0/70">Usuario {g.usuario}</p>
        <div className="mt-1 border-t border-n0/10 pt-2">
          <Link to="/ganadores" className="inline-flex items-center gap-1 whitespace-nowrap text-[13px] font-bold text-n0">Ver participantes <Icon name="flecha" size={14} /></Link>
        </div>
      </div>
    </article>
  );
}

export function SeccionGanadores({ ganadores, fecha, detalle, compacta }: { ganadores: Ganador[]; fecha: string; detalle: string; compacta?: boolean }) {
  return (
    <section className={cx('flex flex-col gap-4 rounded-[28px] bg-n0 p-4', compacta ? 'lg:gap-[clamp(8px,1.6dvh,18px)] lg:px-6 lg:py-[clamp(14px,2.4dvh,26px)]' : 'lg:gap-[clamp(12px,2.4dvh,24px)] lg:p-[clamp(20px,3.4dvh,36px)]')}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
        <img src={img('oveja-ganadores.webp')} alt="" className={cx('hidden object-contain sm:block', compacta ? 'size-[clamp(48px,8dvh,76px)]' : 'size-[clamp(64px,12dvh,100px)]')} />
        <div className="flex flex-1 flex-col gap-0.5">
          <p className="text-[12px] font-bold text-verde-texto">¡TENEMOS GANADORES!</p>
          <h2 className={cx('text-[24px] font-black leading-[1.1] text-cafe', compacta ? 'lg:text-[clamp(20px,3.4dvh,28px)]' : 'lg:text-[clamp(24px,4.4dvh,32px)]')}>Ganadores del último sorteo</h2>
          <p className="text-[14px] text-n60">{fecha} · {detalle}</p>
        </div>
        <Boton to="/ganadores" tono="cafe" chico icono className="self-start sm:self-center">Ver todos los ganadores</Boton>
      </div>
      <Carrusel anchoClase="w-[62vw] max-w-[260px] lg:w-[calc((100%-60px)/4)] lg:max-w-none" gap={20} tonoPuntos="cafe">
        {ganadores.map((g) => <TarjetaGanador key={g.id} g={g} compacta={compacta} />)}
      </Carrusel>
    </section>
  );
}

export function PreguntasFrecuentes({ preguntas, max = 5 }: { preguntas: Pregunta[]; max?: number }) {
  const [activa, setActiva] = useState(0);
  const lista = preguntas.slice(0, max);
  return (
    <section className="flex flex-col gap-3">
      <TituloSeccion titulo="Preguntas frecuentes" bajada="Todo lo que necesitas saber antes de suscribirte." imagen={img('oveja-preguntas.webp')}
        accion={<Boton to="/como-funciona" tono="outline" chico icono>Ver todos</Boton>} />
      <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
        <div className="flex flex-1 flex-col gap-0.5 rounded-2xl bg-n0 p-2">
          {lista.map((q, i) => (
            <div key={q.pregunta}>
              <button onClick={() => setActiva(i)} aria-expanded={i === activa}
                className={cx('flex w-full items-center gap-3 rounded-xl px-3.5 py-[clamp(9px,1.5dvh,13px)] text-left text-[14px] font-bold leading-5 text-cafe lg:text-[15px]', i === activa && 'bg-amarillo/20')}>
                <span className="flex-1">{q.pregunta}</span>
                <Icon name="chevron" size={18} className={cx('shrink-0 transition-transform', i === activa ? 'rotate-90 lg:rotate-0' : '')} />
              </button>
              {i === activa && <p className="px-3.5 pb-2.5 text-[14px] leading-[21px] text-cafe/80 lg:hidden">{q.respuesta}</p>}
            </div>
          ))}
        </div>
        <div className="hidden w-[460px] shrink-0 flex-col gap-3 rounded-[24px] bg-cafe p-6 lg:flex">
          <p className="text-xl font-black text-amarillo">{lista[activa].pregunta}</p>
          <p className="text-base leading-6 text-n0">{lista[activa].respuesta}</p>
          <p className="mt-auto text-sm font-bold text-n0">¿Otra duda? Escríbenos a contacto@akita.pe</p>
        </div>
      </div>
      <p className="text-[13px] text-n60 lg:hidden">¿Otra duda? Escríbenos a <a href="mailto:contacto@akita.pe" className="font-bold text-cafe underline">contacto@akita.pe</a></p>
    </section>
  );
}

export function CardCta({ titulo, bajada, boton, to = '/planes', imagen = img('oveja-cta.webp'), iconoIzq }: { titulo: string; bajada: string; boton: string; to?: string; imagen?: string; iconoIzq?: boolean }) {
  return (
    <section className="relative flex items-center gap-3 overflow-hidden rounded-[24px] bg-yellow-cta p-4 sm:gap-6 sm:px-8 sm:py-[clamp(14px,2.6dvh,24px)]">
      <div className="relative flex size-[92px] shrink-0 items-center justify-center sm:size-[clamp(96px,16dvh,140px)]">
        <Nube className="inset-[6%] size-[88%] text-fondo" />
        <img src={imagen} alt="" className="relative z-10 max-h-full max-w-full object-contain" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-8">
        <div className="flex min-w-0 flex-1 flex-col gap-1 text-cafe">
          <p className="text-[19px] font-extrabold leading-[23px] lg:text-[clamp(22px,4dvh,30px)] lg:leading-[1.15]">{titulo}</p>
          <p className="text-[14px] leading-5 opacity-85 lg:text-base">{bajada}</p>
        </div>
        <Boton to={to} tono="cafe" chico icono={!iconoIzq} iconoIzq={iconoIzq ? <Icon name="chispa" size={18} /> : undefined} className="self-start sm:h-12 sm:self-center sm:px-7 sm:text-[15px]">{boton}</Boton>
      </div>
    </section>
  );
}

export function BandaSigueme() {
  return (
    <section className="relative overflow-hidden bg-azul">
      <Nube className="left-1/2 top-4 w-[560px] -translate-x-1/2 text-fondo lg:top-5 lg:w-[880px]" />
      <div className="relative z-10 flex flex-col items-center gap-2 px-6 pb-3 pt-[34px] text-center lg:gap-[clamp(4px,0.9dvh,8px)] lg:pb-4 lg:pt-[clamp(48px,7.5dvh,72px)]">
        <p className="text-[30px] font-black leading-none text-cafe lg:text-[clamp(34px,6dvh,52px)]">¡SÍGUEME-E-E!</p>
        <p className="text-[15px] text-cafe lg:text-[clamp(15px,2.4dvh,18px)]">Que no se te escape ningún premio.</p>
        <div className="flex gap-3">
          {redes.map((r) => (
            <a key={r.id} href={r.href} aria-label={r.label} className="flex size-10 items-center justify-center rounded-[20px] bg-cafe text-fondo"><IconoRed red={r.id} /></a>
          ))}
        </div>
        <img src={img('oveja-ganadores.webp')} alt="" className="mt-1 h-[104px] object-contain lg:mt-0.5 lg:h-[clamp(92px,14dvh,136px)]" />
      </div>
    </section>
  );
}

export function Bloque({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx('mx-auto flex max-w-[1366px] flex-col gap-10 px-6 py-10 lg:gap-14 lg:px-16 lg:py-14', className)}>{children}</div>;
}

export function Vista({ children, className, id }: { children: ReactNode; className?: string; id?: string }) {
  return (
    <div id={id} className={cx('vista mx-auto flex w-full max-w-[1366px] flex-col gap-10 px-6 py-10 lg:gap-14 lg:px-16 lg:py-14', className)}>
      {children}
    </div>
  );
}

const MESES_TXT = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const isoLima = (d: Date) => d.toLocaleDateString('en-CA', { timeZone: 'America/Lima' });
const FONDOS: Premio['fondo'][] = ['amarillo', 'rosa', 'azul', 'verde'];
export type PremioDatos = { id?: string; categoria: string; premio: string; fecha: string; enDias: string; foto?: string; fechaIso?: string; descripcion?: string; specs?: string[] };
export function PremiosDelMesDatos({ fechas: todas, premios, titulo = 'Premios de este me⁠-⁠e⁠-⁠es',
  bajada = 'Cada miércoles sorteamos premios en vivo. Elige la fecha y mira qué puedes ganar.', color, enBanda = true }: {
  fechas: Date[]; premios: PremioDatos[]; titulo?: string; bajada?: string; color?: boolean; enBanda?: boolean }) {
  const hoy = isoLima(new Date());
  const fechas = todas.filter((d) => isoLima(d) >= hoy);
  const meses = [...new Set(fechas.map((d) => d.getFullYear() * 12 + d.getMonth()))].sort((a, b) => a - b);
  const [mesSel, setMes] = useState<number>();
  const mes = mesSel !== undefined && meses.includes(mesSel) ? mesSel : meses[0];
  const delMes = fechas.filter((d) => d.getFullYear() * 12 + d.getMonth() === mes);
  const [diaSel, setDia] = useState<number>();
  const dia = delMes.find((d) => d.getDate() === diaSel) ?? delMes[0];
  const lista = dia && premios.some((p) => p.fechaIso) ? premios.filter((p) => p.fechaIso === isoLima(dia)) : premios;
  const i = mes === undefined ? -1 : meses.indexOf(mes);
  const tarjetas = lista.map((p, k): Premio => ({ id: p.id ?? `${p.premio}-${k}`, categoria: p.categoria, nombre: p.premio, fechaSorteo: p.fecha, enDias: p.enDias,
    foto: p.foto ? (/^(https?:|\/|data:)/.test(p.foto) ? p.foto : `${base}${p.foto}`) : '', fondo: FONDOS[k % FONDOS.length], descripcion: p.descripcion, specs: p.specs }));
  const contenido = (
    <div className="relative mx-auto flex w-full max-w-[1238px] flex-col gap-4 lg:gap-[clamp(6px,1.2dvh,16px)]">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between lg:gap-6">
        <div className="flex flex-col gap-1 lg:pb-1">
          <h2 className={enBanda ? 'text-[26px] font-black uppercase leading-[1.05] text-cafe lg:text-[clamp(22px,3.8dvh,34px)]' : 'text-[26px] font-extrabold text-cafe lg:text-[clamp(24px,4dvh,32px)]'}>{titulo}</h2>
          {bajada && <p className="text-[14px] leading-5 text-cafe/80 lg:text-[15px]">{bajada}</p>}
        </div>
        {mes !== undefined && (
          <div className="flex w-fit max-w-full flex-col items-stretch gap-2">
            <div className="flex items-center justify-between gap-2 rounded-pill border border-n10 bg-n0 p-1">
              <button aria-label="Mes anterior" disabled={i <= 0} onClick={() => { setMes(meses[i - 1]); setDia(undefined); }} className="flex size-7 items-center justify-center rounded-2xl bg-n5 text-base font-bold text-cafe disabled:opacity-30">‹</button>
              <span className="px-1 text-center text-[14px] font-bold text-cafe">{MESES_TXT[mes % 12]} {Math.floor(mes / 12)}</span>
              <button aria-label="Mes siguiente" disabled={i >= meses.length - 1} onClick={() => { setMes(meses[i + 1]); setDia(undefined); }} className="flex size-7 items-center justify-center rounded-2xl bg-n5 text-base font-bold text-cafe disabled:opacity-30">›</button>
            </div>
            <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
              {delMes.map((d) => {
                const activa = !!dia && d.getTime() === dia.getTime();
                return (
                  <button key={d.getTime()} onClick={() => setDia(d.getDate())} aria-pressed={activa}
                    className={cx('flex h-[40px] w-[44px] shrink-0 flex-col items-center justify-center rounded-[12px]', activa ? 'bg-cafe' : 'border border-n10 bg-n0')}>
                    <span className={cx('text-[9px] font-bold leading-3 tracking-[0.8px]', activa ? 'text-amarillo' : 'text-n60')}>MIÉ</span>
                    <span className={cx('text-[16px] font-extrabold leading-5', activa ? 'text-n0' : 'text-cafe')}>{d.getDate()}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
      {tarjetas.length ? (
        color
          ? <Carrusel anchoClase="w-[74vw] max-w-[300px] lg:w-[calc((100%-60px)/4)] lg:max-w-none" gap={20}>{tarjetas.map((p) => <TarjetaPremio key={p.id} p={p} color />)}</Carrusel>
          : <Carrusel anchoClase="w-[78vw] max-w-[330px] lg:w-[calc((100%-40px)/3)] lg:max-w-none" gap={20} tonoPuntos="cafe">{tarjetas.map((p) => <TarjetaPremio key={p.id} p={p} grande />)}</Carrusel>
      ) : (
        <div className="flex flex-col items-center gap-1 rounded-[20px] border border-dashed border-cafe/20 bg-n0 px-6 py-8 text-center">
          <p className="text-[15px] font-bold text-cafe">Pronto anunciaremos los premios</p>
          <p className="text-[13px] text-n60">Vuelve en unos días para ver los próximos sorteos.</p>
        </div>
      )}
    </div>
  );
  if (!enBanda) return contenido;
  return (
    <section className="relative mt-4 overflow-hidden bg-rosa px-6 pb-12 pt-8 lg:mt-0 lg:px-16 lg:py-[clamp(20px,3.4dvh,40px)]">
      <Nube className="-left-[72px] bottom-[-80px] w-[240px] text-fondo" />
      <Nube className="-right-[90px] bottom-[-120px] w-[360px] text-fondo" />
      {contenido}
    </section>
  );
}
