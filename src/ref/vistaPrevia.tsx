import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { cofre, flash } from './mockRef';
import { useDemo, usePerfil } from './demo';
import { Icon } from '../components/ui/Icon';
import { LogoMarca } from './LogoMarca';
import { Badge, Button, MonedaLana, cx } from '../components/ui/primitives';
import { Hoja, TerminosPremio } from '../components/ui/Hoja';

const IMG3D = (f: string) => `${import.meta.env.BASE_URL}img/3d/${f}`;

function proximoMiercoles8(hoy = new Date(), dia = 4) {
  const d = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 8);
  do d.setDate(d.getDate() + 1); while (d.getDay() !== dia);
  return d;
}
function useAhora(ms = 1000) {
  const [t, setT] = useState(() => Date.now());
  useEffect(() => { const i = window.setInterval(() => setT(Date.now()), ms); return () => window.clearInterval(i); }, [ms]);
  return t;
}
function formatoRestante(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60), x = s % 60;
  if (d > 0) return `${d} d ${h} h ${m} min`;
  return [h, m, x].map((n) => String(n).padStart(2, '0')).join(':');
}
const finFlash = () => { const d = new Date(); d.setHours(23, 59, 0, 0); return d; };

function Opcion({ icono, titulo, lineas, stock, agotada, terminos }: { icono: ReactNode; titulo: string; lineas: string[]; stock: string; agotada: boolean; terminos?: string | string[] }) {
  return (
    <div className={cx('flex gap-3 rounded-2xl bg-n0 p-3.5', agotada && 'opacity-70')}>
      <span className="flex w-[72px] shrink-0 items-start justify-center pt-0.5">{icono}</span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="text-[15px] font-extrabold leading-5">{titulo}</p>
        {lineas.map((l) => <p key={l} className="text-[13px] leading-[18px] text-n60">{l}</p>)}
        {agotada
          ? <span className="mt-0.5 w-fit rounded-pill bg-n10 px-2.5 py-0.5 text-[12px] font-bold text-n60">{titulo.includes('Lanas') ? 'Agotadas' : 'Agotado'}</span>
          : <span className="mt-0.5 w-fit rounded-pill bg-rosa px-2.5 py-0.5 text-[12px] font-bold text-cafe">{stock}</span>}
        {terminos && <div className="mt-1"><TerminosPremio texto={terminos} etiqueta="Términos y condiciones" /></div>}
      </div>
    </div>
  );
}

function AccionPlan({ onIr }: { onIr: () => void }) {
  const { elegirMiPlan } = usePerfil();
  return <Button full onClick={onIr}>{elegirMiPlan}</Button>;
}

export function CardCofreVisitante() {
  const [hoja, setHoja] = useState(false);
  const cerrar = useCallback(() => setHoja(false), []);
  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-[24px] bg-[radial-gradient(120%_100%_at_78%_45%,#3D2A08_0%,#211402_62%)] text-n0 lg:flex-row">
      <div className="relative flex flex-col items-center gap-1 px-5 pt-4 lg:order-2 lg:flex-1 lg:p-0">
        <Badge tone="rosa" className="!w-fit !px-2.5 !py-1 !text-[11px] lg:hidden">COFRE · CADA JUEVES</Badge>
        <img src={IMG3D('cofre-3d.webp')} alt="Cofre con premios" className="h-[clamp(104px,16svh,170px)] w-auto max-w-full object-contain lg:absolute lg:inset-0 lg:m-auto lg:h-auto lg:max-h-[94%] lg:max-w-[96%]" />
      </div>
      <div className="flex flex-col items-center gap-2 px-5 pb-5 pt-1 text-center lg:order-1 lg:w-[56%] lg:shrink-0 lg:items-start lg:justify-center lg:gap-[clamp(6px,1.4dvh,12px)] lg:py-5 lg:pl-7 lg:pr-2 lg:text-left">
        <Badge tone="rosa" className="!hidden !w-fit !px-2.5 !py-1 !text-[11px] lg:!inline-flex">COFRE · CADA JUEVES</Badge>
        <p className="text-[24px] font-black leading-[1.05] lg:text-[clamp(26px,4.4dvh,42px)]">Un cofre nuevo <span className="text-amarillo">cada semana</span></p>
        <p className="text-[13px] leading-[18px] text-n0/85 lg:text-[15px] lg:leading-[21px]">Con tu suscripción, cada jueves puedes elegir un premio o Lanas, según disponibilidad. ¡Ambos tienen stock limitado!</p>
        <button onClick={() => setHoja(true)} className="mt-1 flex h-12 w-full items-center justify-center gap-1.5 whitespace-nowrap rounded-pill bg-amarillo px-7 text-[15px] font-bold text-cafe lg:w-auto">
          <Icon name="cofre" size={18} />Ver Cofre de esta semana
        </button>
      </div>
      <HojaCofreVistaPrevia abierto={hoja} onCerrar={cerrar} />
    </div>
  );
}

function HojaCofreVistaPrevia({ abierto, onCerrar }: { abierto: boolean; onCerrar: () => void }) {
  const navigate = useNavigate();
  const { stockCofre } = useDemo();
  const ahora = useAhora();
  const sinPremio = stockCofre === 'sinPremio' || stockCofre === 'agotado';
  const sinLanas = stockCofre === 'sinLanas' || stockCofre === 'agotado';
  const premio = cofre.premio.titulo; const lanas = cofre.alternativa.lanas;
  const quedanP = cofre.premio.quedan; const quedanL = cofre.alternativa.quedan;
  const mensaje = stockCofre === 'agotado'
    ? null
    : sinPremio ? `El premio ya se agotó. Aún puedes elegir ${lanas} Lanas. Hasta agotar stock.`
      : sinLanas ? `Las Lanas ya se agotaron. Aún puedes elegir ${premio}. Hasta agotar stock.`
        : `${premio} o ${lanas} Lanas: tú eliges. Activa tu plan y elige una opción antes de que se agote.`;
  return (
    <Hoja abierto={abierto} onCerrar={onCerrar} titulo={stockCofre === 'agotado' ? '¡El Cofre de esta semana se agotó!' : '¡Que no se te escape!'}>
      <span className="-mt-2 w-fit rounded-pill bg-cafe px-3 py-1 text-[11px] font-bold tracking-[0.8px] text-amarillo">COFRE DE ESTA SEMANA</span>
      {mensaje
        ? <p className="text-[15px] leading-[22px]">{mensaje}</p>
        : <p className="text-[15px] leading-[22px]">El próximo abre en <b className="whitespace-nowrap">{formatoRestante(proximoMiercoles8().getTime() - ahora)}</b>. Suscríbete y prepárate para elegir tu próxima recompensa.</p>}
      <div className="flex flex-col gap-2.5">
        <Opcion icono={<LogoMarca marca={cofre.premio.marca} tamano="sm" />} titulo={premio}
          lineas={cofre.premio.lineas}
          stock="Hasta agotar stock" agotada={sinPremio} terminos={cofre.premio.terminos} />
        <Opcion icono={<MonedaLana size={34} />} titulo={`${lanas} Lanas`}
          lineas={['Van a tu billetera al elegirlas', 'Canjéalas por chances o beneficios']}
          stock="Hasta agotar stock" agotada={sinLanas} />
      </div>
      <p className="text-[13px] leading-[18px] text-n60">
        {stockCofre === 'agotado' ? 'Con tu plan accedes a los próximos cofres. ' : ''}Necesitas un plan activo para elegir tu recompensa. Las recompensas están sujetas a stock.
      </p>
      <AccionPlan onIr={() => { onCerrar(); navigate('/planes'); }} />
    </Hoja>
  );
}

const MUESCAS = {
  WebkitMask: 'radial-gradient(circle 11px at 0 50%, transparent 97%, #000) left / 51% 100% no-repeat, radial-gradient(circle 11px at 100% 50%, transparent 97%, #000) right / 51% 100% no-repeat',
  mask: 'radial-gradient(circle 11px at 0 50%, transparent 97%, #000) left / 51% 100% no-repeat, radial-gradient(circle 11px at 100% 50%, transparent 97%, #000) right / 51% 100% no-repeat',
} as const;

function useStockFlash() {
  const { stockFlash } = useDemo();
  const finalizado = stockFlash === 'finalizado';
  const sinBeneficio = stockFlash === 'sinPremio' || stockFlash === 'agotado';
  const sinLanas = stockFlash === 'sinLanas' || stockFlash === 'agotado';
  return { finalizado, sinBeneficio, sinLanas, agotado: stockFlash === 'agotado', quedanB: flash.cupo - flash.usados, quedanL: flash.lanasStock };
}

export function CardFlashVisitante() {
  const [hoja, setHoja] = useState(false);
  const cerrar = useCallback(() => setHoja(false), []);
  const st = useStockFlash();
  const ahora = useAhora();
  return (
    <div className="flex h-full flex-col gap-2.5 overflow-hidden rounded-[24px] p-3.5 lg:gap-[clamp(6px,1.4dvh,14px)] lg:p-[clamp(14px,2.6dvh,24px)]" style={{ background: 'linear-gradient(140deg, #FF88F7 0%, #FF88F7 40%, #B5179E 135%)' }}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Badge className="!px-2.5 !text-[11px]">⚡ FLASH · CADA VIERNES</Badge>
        <span className={cx('flex items-center gap-1 rounded-pill px-2.5 py-1 text-xs font-bold tabular-nums', st.finalizado ? 'bg-n0 text-cafe' : 'bg-cafe text-amarillo')}>
          <Icon name="reloj" size={14} />{st.finalizado ? 'Flash finalizado' : `Disponible por ${formatoRestante(finFlash().getTime() - ahora)}`}
        </span>
      </div>
      <div className="flex min-h-0 flex-1 items-center gap-2 rounded-[18px] bg-rosa-claro py-2.5 pl-5 pr-3 lg:py-2 lg:pl-7" style={MUESCAS}>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <LogoMarca marca={flash.marca} tamano="md" className="!bg-transparent !shadow-none !justify-start" />
          <p className="flex flex-wrap items-end gap-x-1.5 leading-none">
            <span className="text-[44px] font-black tracking-[-2px] text-cafe lg:text-[clamp(48px,8.4dvh,84px)]">{flash.descuento}</span>
            <span className="pb-1.5 text-[22px] font-black text-rosa-fuerte lg:text-[clamp(22px,3.6dvh,34px)]">OFF</span>
          </p>
          <p className="text-[15px] font-extrabold leading-5 text-cafe lg:text-lg">{flash.detalle}</p>
        </div>
        <div className="relative h-[96px] w-[36%] max-w-[150px] shrink-0 lg:h-auto lg:max-w-[230px] lg:self-stretch">
          <img src={IMG3D('flash-farmacia-3d.webp')} alt="Productos de farmacia" className="absolute inset-0 m-auto max-h-full max-w-full object-contain" />
        </div>
      </div>
      <div className="flex flex-col gap-0.5 text-cafe">
        <p className="text-[13px] font-semibold leading-[18px] lg:text-sm">Con tu suscripción, elige este beneficio o {flash.lanas} Lanas. ¡Cupos limitados!</p>
        {st.finalizado ? <p className="text-[13px] font-bold leading-[18px] lg:text-sm">Llega un nuevo Flash el próximo viernes.</p>
          : <div className="mt-1 flex flex-wrap gap-1.5">
              {(st.sinBeneficio || st.sinLanas ? [[st.sinBeneficio, 'Beneficio agotado', 'Beneficio: hasta agotar stock'], [st.sinLanas, 'Lanas agotadas', 'Lanas: hasta agotar stock']] : [[false, '', 'Hasta agotar stock']]).map(([agot, t1, t2]) => (
                <span key={String(t2)} className={cx('inline-flex items-center gap-1 rounded-pill px-2.5 py-1 text-[12px] font-extrabold', agot ? 'bg-n0/60 text-n60 line-through' : 'bg-n0 text-cafe')}>
                  {!agot && <span className="size-2 rounded-full bg-rosa-fuerte" />}{agot ? t1 : t2}</span>))}
            </div>}
      </div>
      <button onClick={() => setHoja(true)} className="flex h-11 w-full shrink-0 items-center justify-center gap-1 rounded-pill bg-n0 text-[15px] font-bold text-morado lg:h-12">Ver Flash de esta semana<Icon name="chevron" size={16} /></button>
      <HojaFlashVistaPrevia abierto={hoja} onCerrar={cerrar} />
    </div>
  );
}

function HojaFlashVistaPrevia({ abierto, onCerrar }: { abierto: boolean; onCerrar: () => void }) {
  const navigate = useNavigate();
  const st = useStockFlash();
  const ahora = useAhora();
  const fin = finFlash();
  const sinNada = st.finalizado || st.agotado;
  const titulo = st.finalizado ? 'Flash finalizado' : st.agotado ? '¡Este Flash se agotó!' : '¡Que no se te pase este Flash!';
  const proximo = 'vie 6 nov, 8:00 a. m.';
  return (
    <Hoja abierto={abierto} onCerrar={onCerrar} titulo={titulo}>
      <span className="-mt-2 w-fit rounded-pill bg-cafe px-3 py-1 text-[11px] font-bold tracking-[0.8px] text-amarillo">⚡ BENEFICIO FLASH DE ESTA SEMANA</span>
      {!st.finalizado && (
        <div className="flex flex-col gap-2 rounded-2xl border-2 border-amarillo bg-amarillo/35 p-3.5">
          <p className="flex items-start gap-2.5 text-[14px] leading-5"><Icon name="reloj" size={20} className="shrink-0" />
            <span><b>Disponible para elegir hasta</b> hoy, 11:59 p. m.{!sinNada && <> · quedan <b className="whitespace-nowrap">{formatoRestante(fin.getTime() - ahora)}</b></>}</span></p>
          <p className="flex items-start gap-2.5 text-[14px] leading-5"><Icon name="calendario" size={20} className="shrink-0" />
            <span><b>Puedes usar el beneficio hasta</b> el lun 30 nov, 11:59 p. m.</span></p>
        </div>
      )}
      {sinNada
        ? <p className="text-[15px] leading-[22px]">{st.finalizado ? 'Terminó el plazo para elegir este Flash.' : 'Se agotaron el beneficio y las Lanas.'} Llega un nuevo Flash el <b>{proximo}</b> Suscríbete y no te pierdas el próximo.</p>
        : (st.sinBeneficio || st.sinLanas) && <p className="text-[15px] font-bold leading-[22px]">
            {st.sinBeneficio ? `El beneficio ya se agotó. Aún puedes elegir ${flash.lanas} Lanas.` : 'Las Lanas ya se agotaron. Aún puedes elegir el beneficio.'}
          </p>}
      <div className="flex flex-col gap-2.5">
        <Opcion icono={<LogoMarca marca={flash.marca} tamano="sm" />} titulo={`${flash.descuento} OFF ${flash.detalle}`}
          lineas={['Locales de Botica Bienestar en Lima', 'Se usa con código en caja. No aplica a productos con receta médica. Un uso por persona.']}
          stock="Hasta agotar stock" agotada={st.sinBeneficio || st.finalizado} terminos={flash.terminos} />
        <Opcion icono={<MonedaLana size={34} />} titulo={`${flash.lanas} Lanas`}
          lineas={['Van a tu billetera al elegirlas', 'Canjéalas por chances o beneficios']}
          stock="Hasta agotar stock" agotada={st.sinLanas || st.finalizado} />
      </div>
      <p className="text-[13px] leading-[18px] text-n60">{sinNada ? 'Con tu plan accedes a los próximos Beneficios Flash. ' : ''}Necesitas un plan activo para elegir. Sujeto a stock.</p>
      <AccionPlan onIr={() => { onCerrar(); navigate('/planes'); }} />
    </Hoja>
  );
}
