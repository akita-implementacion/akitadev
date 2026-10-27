import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import type { ResultadoPago } from '../../api/tipos';
import { usePlanElegido } from '../../components/suscripcion/Pasos';
import { Icon } from '../../components/ui/Icon';
import { Button, Oveja } from '../../components/ui/primitives';
import { checkout } from '../../data/mock';
import { Tx } from '../../data/revision';
import { useSesion } from '../../data/sesion';

export default function Listo() {
  const e = usePlanElegido();
  const { iniciar, modoMock } = useSesion();
  const navigate = useNavigate();
  const { resultado: r, metodo } = (useLocation().state ?? {}) as { resultado?: ResultadoPago; metodo?: string };
  if (!modoMock && !r) return <Navigate to="/" replace />;
  const sorteo = r?.raffles?.[0];
  const primerSorteo = typeof sorteo === 'object' ? sorteo : undefined;
  const datos: [string, string][] = modoMock || !r ? [
    ['Plan', `${e.plan.nombre} · ${e.periodoTxt}`],
    ['Pagaste', `${e.totalTxt} · ${e.metodo === 'tarjeta' ? checkout.tarjeta : 'Yape'}`],
    [e.renovacion ? 'Próximo cobro' : 'Vence', `${checkout.proximoCobro[e.periodo]}${e.renovacion ? ' · te avisamos antes' : ''}`],
    ['Tu primer sorteo', checkout.primerSorteo],
  ] : [
    ['Plan', `${e.plan.nombre} · ${e.periodoTxt}`],
    ['Pagaste', `${r.amountTotal ?? e.totalTxt} · ${metodo ?? r.paymentMethod ?? ''}`],
    ['Operación', `${r.operationCode ?? '—'}${r.paymentPendingValidation ? ' · en validación' : ''}`],
    ['Tu primer sorteo', primerSorteo ? `${primerSorteo.name ?? ''}${primerSorteo.drawDate ? ` · ${primerSorteo.drawDate}` : ''}` : 'Te avisamos por correo'],
  ];
  return (
    <div className="mx-auto max-w-[640px] px-6 py-8 lg:py-16">
    <div className="flex flex-col items-center gap-5 rounded-[28px] bg-n0 px-5 py-8 text-center lg:px-10">
      <Oveja pose="vip" className="size-36" />
      <h1 className="text-[28px] font-black leading-tight text-cafe lg:text-[36px]"><Tx k="sus.listo.titulo" v={{ nombre: e.nombre, plan: e.plan.nombre }} /></h1>
      <p className="text-base text-n60"><Tx k="sus.listo.bajada" v={{ plan: e.plan.nombre, n: e.chancesTxt }} /></p>
      <div className="flex w-full flex-col gap-3 rounded-[20px] bg-n5 p-5 text-left">
        <dl className="grid grid-cols-2 gap-4">
          {datos.map(([k, v]) => <div key={k} className="flex flex-col gap-0.5"><dt className="text-xs text-n60">{k}</dt><dd className="text-sm font-bold text-cafe">{v}</dd></div>)}
        </dl>
        <p className="text-xs text-n60">Te avisamos por correo antes de cada cobro. <Tx k="sus.listo.cierre" /></p>
      </div>
      <p className="flex items-center gap-2 text-sm text-n60"><Icon name="campana" size={16} /><Tx k="sus.comprobante" v={{ correo: e.correo }} /></p>
      <Button full iconRight="flecha" onClick={() => { if (modoMock) iniciar(); navigate('/'); }}><Tx k="sus.listo.cta" /></Button>
      <p className="text-xs text-n60">AKITÁ no guarda los datos de tu tarjeta. Cancela cuando quieras desde Mi cuenta.</p>
    </div>
    </div>
  );
}
