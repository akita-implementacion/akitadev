import { useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import { cx } from '../ui/primitives';
import { ahorro, meses, soles, type Periodo } from '../../data/mock';
import { usePlanes } from '../../data/datos';
import { Hoja } from '../ui/Hoja';
import { promoApi } from '../../api/servicios';
import { mensajeError } from '../../api/client';
import { Tx } from '../../data/revision';
import { useSesion } from '../../data/sesion';


const NOMBRES = ['Plan', 'Cuenta', 'Pago', 'Confirmar'];

export function Pasos({ actual }: { actual: 1 | 2 | 3 | 4 }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-bold text-cafe"><Tx k="sus.paso" v={{ n: actual }} /></p>
      <ol className="grid grid-cols-4 gap-1.5">
        {NOMBRES.map((n, i) => (
          <li key={n} className="flex flex-col gap-1.5" aria-current={i + 1 === actual ? 'step' : undefined}>
            <span className={cx('h-1.5 rounded-pill', i < actual ? 'bg-amarillo' : 'bg-n10')} />
            <span className={cx('text-xs', i + 1 === actual ? 'font-bold text-cafe' : 'text-n60')}>{n}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function usePlanElegido() {
  const { suscripcion } = useSesion();
  const planes = usePlanes();
  const plan = planes.find((p) => p.nombre === suscripcion.plan)!;
  const total = plan.precios[suscripcion.periodo];
  const periodoTxt = { mensual: 'Mensual', semestral: 'Semestral', anual: 'Anual' }[suscripcion.periodo];
  const chancesTxt = plan.chances === 1 ? '1 chance' : `${plan.chances} chances`;
  return { ...suscripcion, plan, total, totalTxt: `S/ ${soles(total)}`, periodoTxt, chancesTxt, meses: meses[suscripcion.periodo] };
}

export function ResumenPlan({ cambiar }: { cambiar?: boolean }) {
  const e = usePlanElegido();
  const [elegir, setElegir] = useState(false);
  return (
    <>
    <div className="flex flex-col gap-3 rounded-[24px] bg-hero-brand p-5 text-n0 lg:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <p className="text-[10px] font-bold tracking-[1.4px] text-amarillo">TU PLAN</p>
          <p className="text-lg font-extrabold">{e.plan.nombre} · {e.periodoTxt}</p>
        </div>
        {cambiar && <button type="button" onClick={() => setElegir(true)} className="flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-pill border-[1.5px] border-n0 px-3.5 text-xs font-bold">Cambiar plan<Icon name="flecha" size={14} /></button>}
      </div>
      <p className="flex items-baseline gap-1.5"><span className="text-[40px] font-black leading-none text-amarillo">{e.totalTxt}</span><span className="text-sm text-n0/70">{e.periodo === 'mensual' ? 'al mes' : `por ${e.meses} meses`}</span></p>
      <p className="text-[13px] text-n0/70">{e.chancesTxt} por sorteo regular · precio con IGV</p>
    </div>
    {cambiar && <HojaPlanes abierto={elegir} onCerrar={() => setElegir(false)} />}
    </>
  );
}

const PERIODOS: { id: Periodo; t: string }[] = [{ id: 'mensual', t: 'Mensual' }, { id: 'semestral', t: 'Semestral' }, { id: 'anual', t: 'Anual' }];

function HojaPlanes({ abierto, onCerrar }: { abierto: boolean; onCerrar: () => void }) {
  const { suscripcion, actualizar } = useSesion();
  const [periodo, setPeriodo] = useState<Periodo>(suscripcion.periodo);
  const planesApi = usePlanes();
  return (
    <Hoja abierto={abierto} onCerrar={onCerrar} titulo="Elige tu plan" subtitulo="Puedes cambiarlo o cancelarlo cuando quieras.">
      <div role="tablist" className="grid grid-cols-3 gap-1 rounded-pill bg-n5 p-1">
        {PERIODOS.map((x) => (
          <button key={x.id} type="button" role="tab" aria-selected={periodo === x.id} onClick={() => setPeriodo(x.id)}
            className={cx('h-10 rounded-pill text-sm font-bold', periodo === x.id ? 'bg-cafe text-fondo' : 'text-cafe')}>{x.t}</button>
        ))}
      </div>
      <div className="flex flex-col gap-2.5">
        {planesApi.map((p) => {
          const total = p.precios[periodo];
          const ahorra = ahorro(p.precios.mensual, total, periodo);
          const activo = suscripcion.plan === p.nombre && suscripcion.periodo === periodo;
          return (
            <button key={p.nombre} type="button" onClick={() => { actualizar({ plan: p.nombre, periodo }); onCerrar(); }}
              className={cx('flex items-center gap-3 rounded-2xl border-2 bg-n0 p-4 text-left', activo ? 'border-cafe' : 'border-n10')}>
              <span className={cx('flex size-5 shrink-0 items-center justify-center rounded-pill border-2', activo ? 'border-cafe' : 'border-n40')}>{activo && <span className="size-2.5 rounded-pill bg-cafe" />}</span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="flex flex-wrap items-center gap-2 text-[15px] font-extrabold text-cafe">{p.nombre}
                  {'recomendado' in p && p.recomendado && <span className="rounded-pill bg-amarillo px-2 py-0.5 text-[10px] font-bold">RECOMENDADO</span>}</span>
                <span className="text-xs text-n60">{p.chances === 1 ? '1 chance' : `${p.chances} chances`} por sorteo regular</span>
              </span>
              <span className="flex shrink-0 flex-col items-end">
                <span className="text-lg font-black text-cafe">S/ {soles(total)}</span>
                <span className="text-[11px] text-n60">{periodo === 'mensual' ? 'al mes' : ahorra > 0 ? `ahorras S/ ${soles(ahorra)}` : `${meses[periodo]} meses`}</span>
              </span>
            </button>
          );
        })}
      </div>
    </Hoja>
  );
}

export function CodigoPromoPlan() {
  const { modoMock, suscripcion, actualizar } = useSesion();
  const [abierto, setAbierto] = useState(!!suscripcion.promoTexto);
  const [codigo, setCodigo] = useState(suscripcion.promoTexto ?? '');
  const [aviso, setAviso] = useState<string | undefined>(suscripcion.promoTexto ? `Código ${suscripcion.promoTexto} aplicado.` : undefined);
  const [revisando, setRevisando] = useState(false);
  const aplicar = async () => {
    if (modoMock) { actualizar({ promoTexto: codigo, promoId: 'demo' }); setAviso(`Código ${codigo} aplicado. El descuento se verá en la confirmación.`); return; }
    setRevisando(true);
    try {
      const r = await promoApi.validar({ code: codigo, applicationContext: 'SUBSCRIPTION' });
      const valido = (r.isValid ?? r.valid) !== false && !!r.promoCode?.id;
      if (valido) { actualizar({ promoId: r.promoCode!.id, promoTexto: codigo }); setAviso(r.message || `Código ${codigo} aplicado.`); }
      else { actualizar({ promoId: undefined, promoTexto: undefined }); setAviso(r.message || 'Este código no es válido.'); }
    } catch (e) { actualizar({ promoId: undefined, promoTexto: undefined }); setAviso(mensajeError(e)); } finally { setRevisando(false); }
  };
  if (!abierto) return <button type="button" onClick={() => setAbierto(true)} className="flex items-center gap-1.5 self-start text-[13px] font-bold text-cafe underline"><Icon name="cupon" size={16} />¿Tienes un código promocional?</button>;
  return (
    <div className="flex flex-col gap-1.5 rounded-[20px] bg-n0 p-4">
      <div className="flex items-end gap-2">
        <Campo label="Código promocional" placeholder="Ej. AKITA10" value={codigo} onChange={(e) => { setCodigo(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 20)); setAviso(undefined); actualizar({ promoId: undefined, promoTexto: undefined }); }} />
        <button type="button" disabled={!codigo || revisando} onClick={aplicar}
          className="h-12 shrink-0 rounded-2xl bg-cafe px-4 text-sm font-bold text-fondo disabled:opacity-40">{revisando ? '…' : 'Aplicar'}</button>
      </div>
      {aviso && <p className="text-xs font-semibold text-cafe">{aviso}</p>}
    </div>
  );
}

export function Confianza() {
  return (
    <ul className="flex flex-col gap-3 rounded-[20px] bg-n0 p-5 text-[13px] leading-[18px] text-cafe">
      <li className="flex gap-2.5"><Icon name="campana" size={18} className="shrink-0" /><Tx k="sus.confianza.aviso" /></li>
      <li className="flex gap-2.5"><Icon name="candado" size={18} className="shrink-0" /><Tx k="sus.confianza.tarjeta" /></li>
      <li className="flex gap-2.5"><Icon name="cuenta" size={18} className="shrink-0" /><Tx k="sus.confianza.cancelar" /></li>
    </ul>
  );
}

export function Campo({ label, ayuda, error, className, ...rest }: { label: ReactNode; ayuda?: ReactNode; error?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={cx('flex min-w-0 flex-col gap-1.5', className)}>
      <span className="text-[13px] font-semibold text-cafe">{label}</span>
      <input {...rest}
        className={cx('h-14 w-full min-w-0 rounded-2xl border px-4 text-base text-cafe outline-none placeholder:text-n40 focus:border-cafe', error ? 'border-error bg-[#fee2e2]' : 'border-n10 bg-n0')} />
      {error ? <span className="text-xs font-semibold text-error">{error}</span> : ayuda && <span className="text-xs text-n60">{ayuda}</span>}
    </label>
  );
}

export function Interruptor({ activo, onChange, disabled, label }: { activo: boolean; onChange: (v: boolean) => void; disabled?: boolean; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={activo} aria-label={label} disabled={disabled} onClick={() => onChange(!activo)}
      className={cx('relative h-7 w-12 shrink-0 rounded-pill transition', activo ? 'bg-verde' : 'bg-n10', disabled && 'opacity-60')}>
      <span className={cx('absolute top-1 size-5 rounded-pill bg-n0 shadow transition-all', activo ? 'left-6' : 'left-1')} />
    </button>
  );
}

export function LayoutCheckout({ titulo, paso, volver, children, lateral, movil }: { titulo: ReactNode; paso: 1 | 2 | 3 | 4; volver?: string; children: ReactNode; lateral?: ReactNode; movil?: ReactNode }) {
  return (
    <div className="mx-auto flex max-w-[1366px] flex-col gap-6 px-6 pb-12 pt-6 lg:px-16 lg:pb-20 lg:pt-10">
      <div className="flex items-center gap-2">
        {volver && <Link to={volver} aria-label="Volver" className="-ml-2 flex size-10 items-center justify-center rounded-pill text-cafe hover:bg-n5"><Icon name="chevron" size={22} className="rotate-180" /></Link>}
        <h1 className="text-[28px] font-black leading-tight text-cafe lg:text-[40px]">{titulo}</h1>
      </div>
      <div className="lg:w-[560px]"><Pasos actual={paso} /></div>
      {movil && <div className="flex flex-col gap-4 lg:hidden">{movil}</div>}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="flex min-w-0 flex-1 flex-col gap-5">{children}</div>
        {lateral && <aside className={cx('flex-col gap-4 lg:sticky lg:top-[140px] lg:flex lg:w-[420px] lg:shrink-0', movil ? 'hidden' : 'flex')}>{lateral}</aside>}
      </div>
    </div>
  );
}

export function ResumenCompacto() {
  const e = usePlanElegido();
  const renueva = e.periodo === 'mensual' ? 'se renueva cada mes' : `vence en ${e.meses} meses`;
  return (
    <div className="flex flex-col gap-1 rounded-2xl bg-n0 p-4">
      <p className="flex items-center justify-between gap-3 text-[15px] font-bold text-cafe"><span>{e.plan.nombre} · {e.periodoTxt}</span><span>{e.totalTxt}</span></p>
      <p className="text-xs text-n60">{e.chancesTxt} en cada sorteo · {renueva}</p>
    </div>
  );
}
