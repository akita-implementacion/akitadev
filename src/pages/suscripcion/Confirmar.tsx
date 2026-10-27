import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Confianza, LayoutCheckout, ResumenPlan, usePlanElegido } from '../../components/suscripcion/Pasos';
import { Icon } from '../../components/ui/Icon';
import { Button } from '../../components/ui/primitives';
import { checkout, soles } from '../../data/mock';
import { Tx } from '../../data/revision';
import { useSesion } from '../../data/sesion';
import { ApiError, mensajeError } from '../../api/client';
import { suscripcionApi } from '../../api/servicios';
import { idDePlan } from '../../data/adaptadores';
import { invalidar } from '../../data/recurso';

export default function Confirmar() {
  const e = usePlanElegido();
  const { modoMock, pago, recargarMe } = useSesion();
  const navigate = useNavigate();
  const [autoriza, setAutoriza] = useState(false);
  const [intento, setIntento] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const p = pago.current;
  const metodoTxt = modoMock ? (e.metodo === 'tarjeta' ? checkout.tarjeta : 'Yape') : p?.tipo === 'tarjeta' ? `Tarjeta ${p.tarjeta}` : 'Yape';

  const pagar = async () => {
    setIntento(true);
    setError('');
    if (!autoriza || enviando) return;
    if (modoMock) { navigate('/suscribirse/listo'); return; }
    if (!p) { navigate('/suscribirse/pago'); return; }
    setEnviando(true);
    try {
      const planId = idDePlan(await suscripcionApi.planes(), e.plan.nombre, e.periodo);
      if (!planId) throw new ApiError(0, 'PLAN_NO_ENCONTRADO', 'Plan no encontrado');
      const referralCode = e.referido || undefined;
      const resultado = p.tipo === 'tarjeta'
        ? await suscripcionApi.pagarConTarjeta({ token: p.token, planId, referralCode, isConcurrent: e.renovacion, promoCodeId: e.promoId })
        : await suscripcionApi.pagarConYape({ planId, phoneNumber: p.celular, otp: p.otp, referralCode, promoCodeId: e.promoId });
      pago.current = null;
      invalidar('usuario');
      invalidar('lanas');
      await recargarMe().catch(() => {});
      navigate('/suscribirse/listo', { state: { resultado, metodo: metodoTxt } });
    } catch (err) {
      if (p.tipo === 'yape') pago.current = null;
      setError(mensajeError(err));
    } finally {
      setEnviando(false);
    }
  };
  const filas: [string, React.ReactNode, string?][] = [
    ['Plan', `${e.plan.nombre} · ${e.chancesTxt} por sorteo regular`, '/planes'],
    ['Periodo', e.periodoTxt, '/planes'],
    ['Método', metodoTxt, '/suscribirse/pago'],
    ['Primer cobro', checkout.primerCobro],
    [e.renovacion ? 'Próximo cobro' : 'Vence', checkout.proximoCobro[e.periodo]],
    ['Renovación automática', e.renovacion ? (e.periodo === 'mensual' ? 'Sí, cada mes con tu tarjeta' : `Sí, cada ${e.meses} meses`) : 'No: te avisamos antes de que venza'],
  ];

  return (
    <LayoutCheckout titulo={<Tx k="sus.confirmar.titulo" />} paso={4} volver="/suscribirse/pago" lateral={<><ResumenPlan /><Confianza /></>}>
      <section className="flex flex-col rounded-[24px] bg-n0 p-5 lg:p-8">
        {filas.map(([k, v, editar]) => (
          <div key={k} className="flex items-center justify-between gap-4 border-b border-n10 py-3.5 text-sm">
            <span className="text-n60">{k}</span>
            <span className="flex items-center gap-3 text-right font-bold text-cafe">{v}{editar && <Link to={editar} className="flex items-center gap-1 text-xs text-error">Editar<Icon name="flecha" size={12} /></Link>}</span>
          </div>
        ))}
        <div className="flex items-baseline justify-between pt-5">
          <span className="text-base font-extrabold text-cafe"><Tx k="sus.confirmar.total" /></span>
          <span className="text-[32px] font-black text-cafe">{e.totalTxt}</span>
        </div>
        <p className="text-right text-xs text-n60">Incluye IGV</p>
      </section>

      <label className="flex items-start gap-3 rounded-2xl bg-n0 p-4 text-sm text-cafe">
        <input type="checkbox" checked={autoriza} onChange={(ev) => setAutoriza(ev.target.checked)} className="mt-0.5 size-5 shrink-0 accent-cafe" />
        <span>
          {e.periodo === 'mensual'
            ? <Tx k="sus.autoriza.mensual" v={{ monto: soles(e.total) }} />
            : <><Tx k="sus.autoriza.periodo" v={{ monto: soles(e.total), meses: e.meses }} />{e.renovacion && <> <Tx k="sus.autoriza.renueva" /></>}</>}
        </span>
      </label>
      {intento && !autoriza && <p className="-mt-3 text-xs font-semibold text-error">Para continuar, marca la autorización.</p>}
      <p className="flex items-center gap-2 text-sm text-n60"><Icon name="campana" size={16} /><Tx k="sus.comprobante" v={{ correo: e.correo }} /></p>
      {error && (
        <p role="alert" className="rounded-xl bg-rosa-claro px-3.5 py-2.5 text-[13px] font-semibold text-cafe">
          {error} {!pago.current && <Link to="/suscribirse/pago" className="underline">Volver a ingresar el pago</Link>}
        </p>
      )}
      <Button full onClick={pagar} disabled={enviando} className="disabled:opacity-60">{enviando ? 'Procesando pago…' : <><Tx k="sus.confirmar.cta" /> · {e.totalTxt}</>}</Button>
    </LayoutCheckout>
  );
}
