import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '../components/ui/Icon';
import { IconoMarca, IconoRed } from './MarcaIconos';
import { Nube } from '../components/ui/Brand';
import { Badge, ChipFiltro, MonedaLana, cx } from '../components/ui/primitives';
import { Carrusel, useDesplazarSolo } from '../components/ui/Carrusel';
import { BENEFICIOS_COMUNES, PERIODOS, PLANES, ahorro, chancesTexto, reglaRenovacion, soles, type Periodo, type Plan } from './planes';
import type { Beneficio, Canje, Ganador, Marca, Premio, Pregunta, Slide } from './publico';
import { proximaFecha, redes } from './publico';
import { useFuenteSorteos } from './sitio';
import { useDetallePublico, type DetallePremio } from '../components/sorteos/DetallePremio';
import { CERRADO, rutaPlanesConPremio, textoCierre, useDetallePremio, usePremioMes, type PremioDetalle } from './premio';
import { usePerfil } from './demo';
import { LogoMarca, type MarcaId } from './LogoMarca';

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

export function SliderHero({ slides: base }: { slides: Slide[] }) {
  const [i, setI] = useState(0);
  const [pausa, setPausa] = useState(false);
  const toque = useRef<number | null>(null);
  const mes = usePremioMes();
  const { elegirMiPlan, participa } = usePerfil();
  const slides = base.map((sl) => sl.premioMes
    ? { ...sl, bajada: `${sl.bajada} Sorteo: ${mes.sorteo}.`, nota: mes.cerrado ? CERRADO : textoCierre(mes.fecha),
      cta: mes.cerrado ? elegirMiPlan : participa, to: mes.cerrado ? '/planes' : rutaPlanesConPremio(mes.p) }
    : { ...sl, nota: undefined, cta: sl.cta === 'Elegir mi plan' ? elegirMiPlan : sl.cta });
  useEffect(() => {
    if (pausa || slides.length < 2) return;
    const t = window.setTimeout(() => setI((x) => (x + 1) % slides.length), 5000);
    return () => window.clearTimeout(t);
  }, [pausa, slides.length, i]);
  const s = slides[i];
  return (
    <section className="vista relative h-[clamp(480px,calc(100svh-300px),556px)] scroll-mt-[92px] overflow-hidden transition-colors duration-700 lg:h-[calc(var(--alto-vista)-92px)] lg:min-h-[440px] lg:scroll-mt-0"
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
            <div className="mx-auto flex h-full max-w-[1366px] flex-col px-6 pb-8 pt-4 lg:flex-row lg:items-center lg:gap-10 lg:px-[100px] lg:pb-[76px] lg:pt-6">
              <div className="relative z-10 flex shrink-0 flex-col items-start gap-2 lg:order-1 lg:w-[520px] lg:gap-4">
                <span className="flex items-center gap-1 rounded-pill bg-cafe px-3 py-1 text-[11px] font-bold tracking-[0.8px] text-amarillo"><span aria-hidden>★</span>{sl.etiqueta}</span>
                <h1 className="text-[clamp(34px,10vw,44px)] font-black leading-[0.95] text-cafe lg:text-[clamp(48px,9dvh,84px)]">{sl.titulo.map((l) => <span key={l} className="block">{l}</span>)}</h1>
                <p className="text-[14px] leading-[19px] text-cafe lg:max-w-[480px] lg:text-[clamp(16px,2.6dvh,20px)] lg:leading-[1.4]">{sl.bajada}</p>
                {sl.nota && <p className="text-[13px] font-bold leading-[18px] text-cafe lg:text-base">{sl.nota}</p>}
                {sl.precio && <p className="text-[17px] font-extrabold leading-tight text-cafe lg:text-[22px]">{sl.precio}</p>}
                <Link to={sl.to} tabIndex={k === i ? 0 : -1}
                  className={cx('mt-0.5 inline-flex h-[50px] items-center whitespace-nowrap rounded-pill px-7 text-[16px] font-bold lg:h-[58px] lg:px-9 lg:text-xl', amarillo ? 'bg-cafe text-n0' : 'bg-amarillo text-cafe')}>
                  {sl.cta}
                </Link>
              </div>
              <div className="min-h-0 flex-1 pt-2 lg:order-2 lg:h-full lg:flex-[1.15] lg:pt-0"><ImagenSlide s={sl} /></div>
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
    <section className="relative z-10 hidden bg-fondo lg:-mt-12 lg:block lg:bg-transparent lg:px-16 lg:pb-6 lg:pt-0">
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

export const premioADetalle = (p: Premio): PremioDetalle => {
  const d = detalleDePremio(p);
  return { id: p.id, nombre: p.nombre, foto: p.foto, descripcion: d.descripcion ?? '', specs: d.specs ?? [], terminos: d.terminos, fecha: p.fecha ?? new Date(), etiqueta: p.categoria };
};

export function TarjetaPremio({ p, color, grande, destacado, cerradoForzado }: { p: Premio; color?: boolean; grande?: boolean; destacado?: boolean; cerradoForzado?: boolean }) {
  const pasado = p.enDias === 'Ya se sorteó';
  const cerrado = !!cerradoForzado || pasado || p.enDias === 'Participación cerrada';
  const d = useDetallePremio({ ...premioADetalle(p), etiqueta: destacado ? 'PREMIO GRANDE DEL MES' : p.categoria }, cerrado);
  const textoEtiqueta = destacado ? 'Premio grande del mes' : cerradoForzado ? 'Participación cerrada' : p.enDias;
  const etiqueta = <span className={cx('whitespace-nowrap rounded-pill px-2.5 py-1 text-xs font-bold', pasado || (cerrado && !destacado) ? 'bg-n10 text-n60' : destacado ? 'bg-cafe text-amarillo' : 'bg-amarillo text-cafe')}>{textoEtiqueta}</span>;
  if (grande) {
    return (
      <article className={cx('flex h-full flex-col overflow-hidden rounded-2xl bg-n0 shadow-card lg:flex-row', destacado && 'ring-2 ring-inset ring-cafe')}>
        <div className="relative h-[clamp(140px,24svh,250px)] overflow-hidden lg:order-2 lg:flex lg:h-auto lg:w-[54%] lg:flex-col lg:items-center lg:justify-center lg:gap-1.5 lg:bg-transparent lg:py-[3px] lg:pr-[3px]">
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
        <img src={p.foto} alt={p.nombre} className={cx('absolute bottom-[4%] right-[5%] z-10 h-[96%] w-auto max-w-[80%] object-contain object-bottom drop-shadow-[0_8px_10px_rgba(33,20,3,0.18)]', (pasado || cerrado) && 'opacity-60 grayscale')} loading="lazy" draggable={false} />
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
  const { meses: mesesSorteos } = useFuenteSorteos();
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
  const { meses: mesesSorteos, premiosDe: premiosDeFecha } = useFuenteSorteos();
  const ini = proximaFecha(undefined, mesesSorteos);
  const [mSel, setM] = useState<number>();
  const [diaSel, setDia] = useState<number>();
  const m = mSel !== undefined && mSel < mesesSorteos.length ? mSel : ini.m;
  const dia = diaSel !== undefined && mesesSorteos[m].fechas.includes(diaSel) ? diaSel : ini.dia;
  const onMes = (nm: number) => {
    setM(nm);
    const mes = mesesSorteos[nm]; const hoy = new Date();
    setDia(mes.fechas.find((f) => new Date(mes.anio, mes.indice, f, 23, 59) >= hoy) ?? mes.fechas[0]);
  };
  const premios = premiosDeFecha(mesesSorteos[m], dia);
  return { m, dia, onMes, onDia: setDia, premios };
}

export function usePremioMesComoTarjeta() {
  const mes = usePremioMes();
  const tarjeta: Premio = { id: 'mes-kia', categoria: 'MOVILIDAD', nombre: mes.p.nombre, foto: mes.p.foto!, fondo: 'amarillo',
    fechaSorteo: `Sorteo ${mes.sorteo}`, enDias: mes.cerrado ? 'Participación cerrada' : 'Premio grande del mes', fecha: mes.fecha,
    descripcion: mes.p.descripcion, specs: mes.p.specs };
  return { mes, tarjeta };
}

export function PremiosDelMes() {
  const { mes, tarjeta } = usePremioMesComoTarjeta();
  const { meses: mesesSorteos, premiosDe: premiosDeFecha } = useFuenteSorteos();
  const prox = proximaFecha(undefined, mesesSorteos);
  const semanales = premiosDeFecha(mesesSorteos[prox.m], prox.dia);
  return (
    <section className="vista-m relative mt-2 overflow-hidden bg-rosa px-6 pb-10 pt-7 lg:mt-0 lg:px-16 lg:py-[clamp(20px,3.4dvh,40px)]">
      <Nube className="-left-[72px] bottom-[-80px] w-[240px] text-fondo" />
      <Nube className="-right-[90px] bottom-[-120px] w-[360px] text-fondo" />
      <div className="relative mx-auto flex w-full max-w-[1238px] flex-col gap-4 lg:gap-[clamp(6px,1.2dvh,16px)]">
        <div className="flex items-end justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h2 className="text-[26px] font-black uppercase leading-[1.05] text-cafe lg:text-[clamp(22px,3.8dvh,34px)]">Premios que puedes ganar</h2>
            <p className="text-[14px] leading-5 text-cafe/80 lg:text-[15px]">El premio grande del mes y los del próximo sorteo. En vivo cada miércoles.</p>
          </div>
          <Link to="/premios" className="hidden shrink-0 items-center gap-1 whitespace-nowrap text-[15px] font-bold text-cafe underline underline-offset-2 lg:inline-flex">Ver todos los premios <Icon name="flecha" size={16} /></Link>
        </div>
        <Carrusel anchoClase="w-[78vw] max-w-[330px] lg:w-[calc((100%-40px)/3)] lg:max-w-none" gap={20} tonoPuntos="cafe">
          {[<TarjetaPremio key={tarjeta.id} p={tarjeta} grande destacado cerradoForzado={mes.cerrado} />,
            ...semanales.map((p) => <TarjetaPremio key={p.id} p={p} grande />)]}
        </Carrusel>
        <Link to="/premios" className="inline-flex items-center gap-1 self-start whitespace-nowrap text-[15px] font-bold text-cafe underline underline-offset-2 lg:hidden">Ver todos los premios <Icon name="flecha" size={16} /></Link>
      </div>
    </section>
  );
}

export function CondicionesPago({ periodo, className }: { periodo: Periodo; className?: string }) {
  const [info, setInfo] = useState(false);
  return (
    <span className={cx('relative inline-flex flex-col', className)}>
      <span className="flex flex-wrap items-center gap-x-1.5 text-[13px] font-semibold text-cafe lg:text-sm">
        <Icon name="info" size={16} />{reglaRenovacion(periodo)} ·
        <button onClick={() => setInfo((v) => !v)} aria-expanded={info} className="underline underline-offset-2">Ver condiciones</button>
      </span>
      {info && (
        <span className="z-20 mt-1 block max-w-[420px] rounded-xl bg-n0 p-3 text-[13px] leading-5 text-cafe shadow-card lg:absolute lg:left-0 lg:top-full lg:w-[400px]">
          <b>Mensual:</b> cobro automático cada mes con tarjeta. Puedes cancelar la renovación desde Mi cuenta.<br />
          <b>Semestral y anual:</b> pagas el periodo completo. Con tarjeta eliges si se renueva al vencer; con Yape es un pago único, sin renovación automática.
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
      {!sinCondiciones && <CondicionesPago periodo={periodo} className={cx('self-start', !izquierda && 'lg:self-end')} />}
    </div>
  );
}

export function rutaElegir(plan: Plan, periodo: Periodo, extra = '') {
  return `/suscribirse/cuenta?plan=${plan.id}&periodo=${periodo}${extra}`;
}

export function TarjetaPlan({ plan, periodo, compacta, apretada, extra = '' }: { plan: Plan; periodo: Periodo; compacta?: boolean; apretada?: boolean; extra?: string }) {
  const navigate = useNavigate();
  const per = PERIODOS.find((p) => p.id === periodo)!;
  const pct = ahorro(plan, periodo);
  const osc = plan.oscuro;
  const botonColor = { verde: 'bg-verde', amarillo: 'bg-amarillo', rosa: 'bg-rosa' }[plan.color];
  return (
    <article className={cx('relative flex h-full flex-col rounded-[24px]', compacta ? 'gap-3 p-6 lg:p-7' : 'gap-3.5 p-6 lg:p-8',
      osc ? 'bg-hero-brand text-n0' : 'bg-n0 text-cafe', plan.id === 'lanota' && !osc && 'ring-2 ring-inset ring-cafe')}>
      {compacta && (
        <Link to={`/planes?plan=${plan.id}&periodo=${periodo}#comparar`} className={cx('absolute right-5 top-5 inline-flex items-center gap-1 text-[13px] font-semibold underline underline-offset-2 lg:right-[clamp(16px,2.2dvh,24px)] lg:top-[clamp(14px,2.2dvh,24px)] lg:text-sm', osc ? 'text-n0' : 'text-cafe')}>
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
            {[chancesTexto(plan.chances), ...BENEFICIOS_COMUNES].map((t) => (
              <li key={t} className={cx('flex items-start gap-2 font-medium', compacta ? 'text-sm lg:text-[clamp(12.5px,1.9dvh,14px)]' : 'text-[15px]')}><Icon name="check" size={compacta ? 16 : 18} className="mt-0.5 shrink-0" />{t}</li>
            ))}
          </ul>
        );
        if (apretada) return (
          <>
            <div className="flex items-start gap-2"><div className="min-w-0 flex-1">{cabecera}</div>
              <img src={`${base}${plan.imagen}`} alt="" className="mt-6 size-[76px] shrink-0 object-contain" loading="lazy" draggable={false} /></div>
            {lista}
          </>
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
      <button onClick={() => navigate(rutaElegir(plan, periodo, extra))}
        className={cx('inline-flex w-full items-center justify-center gap-2.5 whitespace-nowrap rounded-pill text-[15px] font-bold text-cafe', compacta ? 'h-12 lg:h-[clamp(38px,5.8dvh,46px)] lg:text-sm' : 'h-14', botonColor)}>
        Elegir {plan.nombre} <Icon name="flecha" size={20} />
      </button>
    </article>
  );
}

function FilaPlan({ plan, periodo }: { plan: Plan; periodo: Periodo }) {
  const navigate = useNavigate();
  const per = PERIODOS.find((p) => p.id === periodo)!;
  const pct = ahorro(plan, periodo);
  const tono = plan.color === 'verde' ? 'verde' : plan.color === 'rosa' ? 'rosa' : 'amarillo';
  return (
    <div className={cx('flex items-center gap-3 rounded-[20px] bg-n0 p-3.5 pl-4', plan.id === 'lanota' && 'ring-2 ring-inset ring-cafe')}>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-[18px] font-extrabold leading-none text-cafe">{plan.nombre}</span>
          <Badge tone={tono} small>{plan.etiqueta}</Badge>
        </div>
        <p className="flex flex-wrap items-baseline gap-x-1.5 text-cafe">
          <span className="whitespace-nowrap text-[20px] font-black leading-none">{soles(plan.precios[periodo])}</span>
          <span className="whitespace-nowrap text-[13px] text-n60">{per.sufijo}</span>
          {pct > 0 && <span className="whitespace-nowrap rounded-md bg-verde px-1.5 py-0.5 text-[11px] font-bold">Ahorras {pct} %</span>}
        </p>
        <p className="text-[13px] font-semibold text-cafe">{chancesTexto(plan.chances)}</p>
      </div>
      <button onClick={() => navigate(rutaElegir(plan, periodo))} className={cx('inline-flex h-11 shrink-0 items-center gap-1 whitespace-nowrap rounded-pill px-4 text-[14px] font-bold text-cafe', { verde: 'bg-verde', amarillo: 'bg-amarillo', rosa: 'bg-rosa' }[plan.color])}>
        Elegir<Icon name="flecha" size={16} />
      </button>
    </div>
  );
}

export function BandaPlanes({ titulo = 'Elige tu plan' }: { titulo?: string; conComparar?: boolean }) {
  const [periodo, setPeriodo] = useState<Periodo>('mensual');
  return (
    <section className="vista-m relative overflow-hidden bg-amarillo px-6 pb-8 pt-7 lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:px-16 lg:py-[clamp(20px,3.4dvh,40px)]">
      <Nube className="-left-16 bottom-[-120px] hidden w-[220px] text-fondo lg:block" />
      <Nube className="-right-24 bottom-[-160px] hidden w-[300px] text-fondo lg:block" />
      <div className="relative mx-auto flex w-full max-w-[1238px] flex-col gap-3 lg:gap-[clamp(6px,1.2dvh,18px)]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4 lg:gap-6">
            <img src={img('oveja-planes-titulo.webp')} alt="" className="hidden w-[96px] shrink-0 lg:block lg:w-[clamp(84px,14dvh,150px)]" />
            <div className="flex w-full items-end justify-between gap-3 lg:block">
              <div>
                <h2 className="text-[24px] font-black uppercase leading-[1.05] text-cafe lg:max-w-[620px] lg:text-[clamp(26px,5dvh,44px)]">{titulo}</h2>
                <p className="mt-1 hidden text-[14px] text-n60 lg:block lg:text-[clamp(14px,2.2dvh,17px)]">Todos incluyen sorteos, beneficios y recompensas.</p>
              </div>
              <Link to={`/planes?periodo=${periodo}#comparar`} className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap pb-0.5 text-[14px] font-bold text-cafe underline underline-offset-2 lg:hidden">Comparar planes <Icon name="flecha" size={14} /></Link>
            </div>
          </div>
          <SelectorPeriodo periodo={periodo} onChange={setPeriodo} compacto />
        </div>
        <div className="hidden grid-cols-3 gap-6 lg:grid">
          {PLANES.map((p) => <TarjetaPlan key={p.id} plan={p} periodo={periodo} compacta />)}
        </div>
        <div className="flex flex-col gap-2 lg:hidden">
          {PLANES.map((p) => <FilaPlan key={p.id} plan={p} periodo={periodo} />)}
        </div>
        <p className="flex items-start gap-2 rounded-2xl bg-n0/60 px-3.5 py-2.5 text-[13px] leading-[18px] text-cafe lg:hidden">
          <Icon name="check" size={16} className="mt-0.5 shrink-0" /><span><b>Todos incluyen:</b> {BENEFICIOS_COMUNES.join(' · ')}.</span>
        </p>
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

export function PasosPlegables({ pasos }: { pasos: { titulo: string; texto: string }[] }) {
  const [abierto, setAbierto] = useState<number | null>(null);
  return (
    <section className="flex flex-col gap-3 lg:gap-[clamp(10px,2dvh,20px)]">
      <div className="flex items-end justify-between gap-3">
        <h2 className="text-[24px] font-black uppercase leading-[1.05] text-cafe lg:text-[clamp(26px,4.6dvh,34px)]">¿Cómo funciona AKITÁ?</h2>
        <Link to="/como-funciona" className="hidden shrink-0 items-center gap-1 whitespace-nowrap text-[15px] font-bold text-cafe underline underline-offset-2 lg:inline-flex">Conoce más de AKITÁ <Icon name="flecha" size={16} /></Link>
      </div>
      <div className="grid grid-cols-1 gap-1.5 lg:grid-cols-2 lg:gap-3">
        {pasos.map((p, i) => {
          const on = abierto === i;
          return (
            <div key={p.titulo} className="rounded-2xl bg-n0">
              <button onClick={() => setAbierto(on ? null : i)} aria-expanded={on} className="flex min-h-[52px] w-full items-center gap-3 px-3.5 text-left">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-pill bg-amarillo text-[16px] font-black text-cafe">{i + 1}</span>
                <span className="flex-1 text-[16px] font-bold text-cafe">{p.titulo}</span>
                <Icon name="chevron-abajo" size={20} className={cx('shrink-0 text-cafe transition-transform', on && 'rotate-180')} />
              </button>
              {on && <p className="px-3.5 pb-3.5 pl-[58px] text-[14px] leading-5 text-n60">{conNegritas(p.texto)}</p>}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function TarjetaBeneficio({ b, compacta, apilada }: { b: Beneficio; compacta?: boolean; apilada?: boolean }) {
  const boton = usePerfil().elegirMiPlan;
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl bg-n0">
      <div className={cx('relative overflow-hidden', compacta ? 'h-[clamp(76px,11svh,150px)] lg:h-[clamp(96px,calc(var(--alto-vista)*0.2),180px)]' : apilada ? 'h-[118px] sm:h-[160px] lg:h-[clamp(128px,calc(var(--alto-vista)*0.22),180px)]' : 'h-[180px]')}>
        {b.foto ? <img src={b.foto} alt={b.titulo} className="size-full object-cover" loading="lazy" draggable={false} />
          : <div className="flex size-full items-center justify-center bg-rosa-claro p-6"><img src={b.logo} alt={b.comercio} className="max-h-[60%] max-w-[70%] object-contain" loading="lazy" draggable={false} /></div>}
        <span className="absolute left-2 top-2 rounded-md bg-verde px-[7px] py-[3px] text-xs font-black text-cafe">{b.etiqueta}</span>
        {b.foto && (b.marca
          ? <LogoMarca marca={b.marca as MarcaId} tamano="sm" className="absolute bottom-2 right-2" />
          : b.logo ? <span className="absolute bottom-2 right-2 inline-flex h-8 w-[72px] items-center justify-center rounded-xl bg-n0 p-1 shadow-[0_1px_4px_rgba(33,20,2,0.12)]"><img src={b.logo} alt={b.comercio} className="max-h-full max-w-full object-contain" loading="lazy" draggable={false} /></span>
          : <span className="absolute bottom-2 right-2 inline-flex h-8 items-center rounded-xl bg-n0 px-2.5 text-[11px] font-black text-cafe shadow-[0_1px_4px_rgba(33,20,2,0.12)]">{b.comercio}</span>)}
      </div>
      <div className={cx('flex flex-1 items-center justify-between gap-3', compacta ? 'px-4 py-3 max-lg:flex-col max-lg:items-stretch max-lg:gap-2.5' : apilada ? 'p-3 max-lg:flex-col max-lg:items-stretch max-lg:gap-2 lg:p-4' : 'p-4')}>
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="text-[15px] font-bold leading-[18px] text-cafe">{b.titulo}</p>
          <p className="text-xs text-n60">{b.comercio} · {b.uso}</p>
        </div>
        <Link to="/planes" className={cx('inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-pill bg-cafe px-4 text-sm font-bold text-n0', apilada ? 'h-9 lg:h-10' : 'h-10')}>{boton}</Link>
      </div>
    </article>
  );
}

export function BeneficiosADiario({ beneficios }: { beneficios: Beneficio[] }) {
  return (
    <section className="flex flex-col gap-3 lg:gap-[clamp(10px,2dvh,18px)] [&_.carrusel-puntos]:mb-0">
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

export function GanadoresCompactos({ ganadores, fecha }: { ganadores: Ganador[]; fecha: string }) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-0.5">
        <h2 className="text-[24px] font-black leading-[1.1] text-cafe lg:text-[clamp(24px,4.4dvh,32px)]">Ganadores del último sorteo</h2>
        <p className="text-[14px] text-n60">Sorteo del {fecha.toLowerCase()} · nombres protegidos</p>
      </div>
      <Carrusel anchoClase="w-[76vw] max-w-[300px] lg:w-[calc((100%-60px)/4)] lg:max-w-none" gap={12} tonoPuntos="cafe">
        {ganadores.map((g) => (
          <article key={g.id} className="flex h-full items-center gap-3 rounded-[18px] bg-cafe p-2.5">
            <img src={g.foto} alt="" className="size-20 shrink-0 rounded-[12px] object-cover object-top" loading="lazy" draggable={false} />
            <div className="flex min-w-0 flex-1 flex-col gap-0.5 pr-1">
              <p className="text-[15px] font-black leading-5 text-amarillo [overflow-wrap:anywhere]">{g.nombre}</p>
              <p className="line-clamp-2 text-[14px] font-bold leading-[18px] text-n0" title={g.premio}>{g.premio}</p>
            </div>
          </article>
        ))}
      </Carrusel>
      <Link to="/ganadores" className="inline-flex items-center gap-1 self-start whitespace-nowrap text-[15px] font-bold text-cafe underline underline-offset-2">Ver todos los ganadores <Icon name="flecha" size={16} /></Link>
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

export function CtaCompacto() {
  const { elegirMiPlan } = usePerfil();
  return (
    <section className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2.5 rounded-[22px] bg-yellow-cta px-4 py-4 sm:px-8 lg:py-6">
      <div className="flex min-w-0 flex-col gap-0.5 text-cafe">
        <p className="text-[18px] font-extrabold leading-[22px] lg:text-[28px] lg:leading-tight">Empieza a vivir ganando</p>
        <p className="text-[14px] leading-5 lg:text-base">Desde S/7.50 al mes</p>
      </div>
      <Boton to="/planes" tono="cafe" chico className="shrink-0 px-4 lg:h-12 lg:px-7 lg:text-[15px]">{elegirMiPlan}</Boton>
    </section>
  );
}

export function CierreSuscripcion() {
  const { eligeTuPlan } = usePerfil();
  return (
    <section className="relative flex items-center gap-3 overflow-hidden rounded-[24px] bg-yellow-cta p-4 sm:gap-6 sm:px-8 sm:py-5">
      <img src={img('oveja-cta.webp')} alt="" className="h-[96px] w-auto shrink-0 object-contain sm:h-[120px]" />
      <div className="flex min-w-0 flex-1 flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-8">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5 text-cafe">
          <p className="text-[19px] font-extrabold leading-[23px] lg:text-[28px] lg:leading-tight">Empieza a vivir ganando</p>
          <p className="text-[14px] leading-5 lg:text-base">Planes desde S/7.50 al mes</p>
        </div>
        <Boton to="/planes" tono="cafe" chico icono className="self-start sm:h-12 sm:self-center sm:px-7 sm:text-[15px]">{eligeTuPlan}</Boton>
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
