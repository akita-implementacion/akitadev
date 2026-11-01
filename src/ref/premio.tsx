import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/ui/Icon';
import { Nube } from '../components/ui/Brand';
import { cx } from '../components/ui/primitives';
import { useDemo, usePerfil } from './demo';
import { cierreDe, fechaCorta, fechaPremioMes } from './sorteos';
import { premioMes } from './publico';
import { useFuenteSorteos } from './sitio';

export type PremioDetalle = {
  id: string; nombre: string; foto?: string; descripcion: string; specs: string[]; terminos?: string[];
  fecha: Date;
  etiqueta?: string;
  basesUrl?: string;
};

export function usePremioMes() {
  const demo = useDemo();
  const api = useFuenteSorteos().mes;
  const fecha = useMemo(() => fechaPremioMes(), []);
  const cerrado = demo.sorteoMes === 'cerrado' || new Date() > cierreDe(fecha);
  const p: PremioDetalle = { ...premioMes, ...(api?.nombre && { nombre: api.nombre }), ...(api?.foto && { foto: api.foto }),
    ...(api?.descripcion && { descripcion: api.descripcion }), ...(api?.basesUrl && { basesUrl: api.basesUrl }),
    ...(api?.nombre && api.nombre !== premioMes.nombre && { specs: [], terminos: undefined }), fecha, etiqueta: 'PREMIO GRANDE DEL MES' };
  return { p, fecha, cerrado, sorteo: fechaCorta(fecha), cierre: `${fechaCorta(fecha)}, 11:59 a. m.` };
}

export const textoCierre = (fecha: Date) => `Activa tu plan antes del ${fechaCorta(fecha)}, 11:59 a. m.`;
export const textoCierreCorto = (fecha: Date) => `Cierra: ${fechaCorta(fecha)}, 11:59 a. m.`;
export const CERRADO = 'La participación en este sorteo ya cerró';
export const NOTA_CERRADO = 'Con tu plan participas en los próximos sorteos.';

export const rutaPlanesConPremio = (p: PremioDetalle) => `/planes?premio=${encodeURIComponent(p.nombre)}&sorteo=${encodeURIComponent(fechaCorta(p.fecha))}`;

function TerminosDesplegables({ terminos, basesUrl }: { terminos: string[]; basesUrl?: string }) {
  const [ver, setVer] = useState(false);
  return (
    <div className="rounded-2xl bg-n0">
      <button onClick={() => setVer((v) => !v)} aria-expanded={ver} className="flex min-h-[56px] w-full items-center justify-between gap-3 px-4 text-left text-[15px] font-bold text-cafe">
        <span className="flex items-center gap-2.5"><Icon name="info" size={20} />Términos y condiciones del premio</span>
        <Icon name="chevron-abajo" size={18} className={cx('shrink-0 transition', ver && 'rotate-180')} />
      </button>
      {ver && (
        <ul className="flex flex-col gap-1.5 px-4 pb-4 text-[13px] leading-[19px] text-n60">
          {terminos.map((t) => <li key={t} className="flex gap-2"><span className="mt-[7px] size-1 shrink-0 rounded-pill bg-n60" />{t}</li>)}
        </ul>
      )}
      {basesUrl && <a href={basesUrl} target="_blank" rel="noreferrer" className="flex w-fit items-center gap-1.5 mx-4 mb-4 text-[13px] font-bold text-cafe underline">Ver bases completas del sorteo (PDF)<Icon name="compartir" size={14} /></a>}
    </div>
  );
}

export function DetallePremioPublico({ p, abierto, onCerrar, cerrado }: { p: PremioDetalle; abierto: boolean; onCerrar: () => void; cerrado: boolean }) {
  const navigate = useNavigate();
  const { participa, eligeTuPlan } = usePerfil();
  useEffect(() => {
    if (!abierto) return;
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onCerrar();
    window.addEventListener('keydown', esc);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', esc); document.body.style.overflow = ''; };
  }, [abierto, onCerrar]);
  if (!abierto) return null;
  const ir = () => { onCerrar(); navigate(cerrado ? '/planes' : rutaPlanesConPremio(p)); };
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-cafe/60 lg:items-center" role="dialog" aria-modal="true" aria-label={p.nombre} onClick={onCerrar}>
      <div className="flex max-h-[94dvh] w-full flex-col overflow-hidden rounded-t-[28px] bg-fondo text-cafe lg:max-h-[90vh] lg:w-[520px] lg:rounded-[28px]" onClick={(e) => e.stopPropagation()}>
        <div className="flex shrink-0 items-start gap-3 bg-cafe px-5 pb-4 pt-5">
          <div className="flex min-w-0 flex-1 flex-col items-start gap-2">
            {p.etiqueta && <span className="rounded-pill bg-amarillo px-3 py-1 text-[11px] font-bold tracking-[0.6px] text-cafe">{p.etiqueta}</span>}
            <h2 className="text-[24px] font-black leading-[1.1] text-n0">{p.nombre}</h2>
          </div>
          <button aria-label="Cerrar" onClick={onCerrar} className="flex size-11 shrink-0 items-center justify-center rounded-pill bg-n0 text-cafe"><Icon name="cerrar" size={18} /></button>
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pb-4">
          <div className="relative h-[200px] shrink-0 overflow-hidden bg-amarillo lg:h-[220px]">
            <Nube className="-right-10 bottom-[-70px] w-[200px] text-n0/50" />
            {p.foto && <img src={p.foto} alt={p.nombre} className="absolute inset-0 z-10 m-auto max-h-[92%] max-w-[92%] object-contain" />}
          </div>
          <div className="mx-4 flex items-center gap-3 rounded-2xl bg-n0 p-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-pill bg-amarillo/30"><Icon name="calendario" size={22} /></span>
            <div className="flex min-w-0 flex-col gap-0.5">
              <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[16px] font-extrabold">Sorteo: {fechaCorta(p.fecha)} · <span className="rounded-pill bg-amarillo px-2.5 py-0.5 text-[13px] font-bold">En vivo</span></p>
              {cerrado
                ? <p className="text-[14px] font-bold text-error">{CERRADO}</p>
                : <p className="text-[14px] text-n60">{textoCierre(p.fecha)}</p>}
            </div>
          </div>
          <div className="mx-4 flex flex-col gap-2.5 rounded-2xl bg-n0 p-4">
            <p className="text-[19px] font-black">Lo que incluye</p>
            <p className="text-[15px] leading-[22px]">{p.descripcion}</p>
            <ul className="flex flex-col gap-2">
              {p.specs.map((s) => (
                <li key={s} className="flex items-center gap-2.5 text-[15px]"><span className="flex size-6 shrink-0 items-center justify-center rounded-pill bg-amarillo"><Icon name="check" size={14} /></span>{s}</li>
              ))}
            </ul>
          </div>
          {p.terminos && p.terminos.length > 0 && <div className="mx-4"><TerminosDesplegables terminos={p.terminos} basesUrl={p.basesUrl} /></div>}
        </div>
        <div className="shrink-0 bg-cafe px-5 pb-[max(16px,env(safe-area-inset-bottom))] pt-4">
          <button onClick={ir} className="flex h-14 w-full items-center justify-center gap-2 whitespace-nowrap rounded-pill bg-amarillo px-5 text-[16px] font-bold text-cafe">
            {cerrado ? eligeTuPlan : participa}<Icon name="flecha" size={20} />
          </button>
          <p className="mt-2 text-center text-[13px] text-n0/85">{cerrado ? NOTA_CERRADO : 'Todos los planes incluyen chances para este sorteo.'}</p>
        </div>
      </div>
    </div>
  );
}

export function useDetallePremio(p: PremioDetalle, cerrado: boolean) {
  const [abierto, setAbierto] = useState(false);
  const cerrar = useCallback(() => setAbierto(false), []);
  return { abrir: () => setAbierto(true), modal: <DetallePremioPublico p={p} abierto={abierto} onCerrar={cerrar} cerrado={cerrado} /> };
}
