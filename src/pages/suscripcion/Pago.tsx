import { LogoYape, LogosTarjeta } from '../../components/ui/LogosPago';
import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Campo, CodigoPromoPlan, Confianza, Interruptor, LayoutCheckout, ResumenCompacto, ResumenPlan, usePlanElegido } from '../../components/suscripcion/Pasos';
import { Button, cx } from '../../components/ui/primitives';
import { Tx } from '../../data/revision';
import { useSesion, type Metodo } from '../../data/sesion';
import { tokenizarTarjeta } from '../../api/kushki';
import { mensajeError } from '../../api/client';
import { limpiar, validar } from '../../data/validacion';

export default function Pago() {
  const { suscripcion, actualizar, modoMock, logueado, pago } = useSesion();
  const { total } = usePlanElegido();
  const navigate = useNavigate();
  const mensual = suscripcion.periodo === 'mensual';
  const [metodo, setMetodo] = useState<Metodo>(mensual ? 'tarjeta' : suscripcion.metodo);
  const [renovacion, setRenovacion] = useState(suscripcion.renovacion);
  const [t, setT] = useState(modoMock ? { numero: '4111 1111 1111 1111', venc: '08/29', cvv: '', titular: 'CAMILA ROJAS' } : { numero: '', venc: '', cvv: '', titular: '' });
  const [yape, setYape] = useState({ celular: modoMock ? '987 654 321' : '', codigo: '' });
  const [intento, setIntento] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  const [tocado, setTocado] = useState<Record<string, boolean>>({});
  const tocar = (k: string) => () => setTocado((x) => ({ ...x, [k]: true }));
  const errores = {
    numero: validar.tarjeta(t.numero), venc: validar.vencimiento(t.venc), cvv: validar.cvv(t.cvv, t.numero), titular: validar.titular(t.titular),
    celular: validar.celular(yape.celular), codigo: validar.codigo6(yape.codigo),
  };
  const ver = (k: keyof typeof errores) => ((intento || tocado[k]) && errores[k]) || undefined;
  const tarjetaOk = !errores.numero && !errores.venc && !errores.cvv && !errores.titular;
  const yapeOk = !errores.celular && !errores.codigo;
  const ok = metodo === 'tarjeta' ? tarjetaOk : yapeOk;

  const opciones: { id: Metodo; titulo: 'sus.pago.tarjeta' | 'sus.pago.yape'; detalle: 'sus.pago.tarjeta.d' | 'sus.pago.yape.d' | 'sus.pago.yape.noMensual'; marca: string; deshabilitado?: boolean }[] = [
    { id: 'tarjeta', titulo: 'sus.pago.tarjeta', detalle: 'sus.pago.tarjeta.d', marca: 'VISA · MC' },
    { id: 'yape', titulo: 'sus.pago.yape', detalle: mensual ? 'sus.pago.yape.noMensual' : 'sus.pago.yape.d', marca: 'Yape', deshabilitado: mensual },
  ];

  const continuar = async () => {
    setIntento(true);
    setError('');
    if (!ok || enviando) return;
    if (!modoMock) {
      setEnviando(true);
      try {
        pago.current = metodo === 'tarjeta'
          ? { tipo: 'tarjeta', token: await tokenizarTarjeta(t, total, renovacion), tarjeta: `•••• ${t.numero.replace(/\s/g, '').slice(-4)}` }
          : { tipo: 'yape', celular: yape.celular.replace(/\D/g, ''), otp: yape.codigo };
        setT((x) => ({ ...x, numero: '', cvv: '' }));
      } catch (e) {
        setError(mensajeError(e));
        return;
      } finally {
        setEnviando(false);
      }
    }
    actualizar({ metodo, renovacion });
    navigate('/suscribirse/confirmar');
  };

  if (!modoMock && !logueado) return <Navigate to="/suscribirse/cuenta" replace />;

  const accion = (
    <>
      {error && <p role="alert" className="rounded-xl bg-rosa-claro px-3.5 py-2.5 text-[13px] font-semibold text-cafe">{error}</p>}
      <Button full onClick={continuar} disabled={enviando} className="disabled:opacity-60">{enviando ? 'Validando…' : <Tx k="sus.pago.cta" />}</Button>
    </>
  );
  return (
    <LayoutCheckout titulo="Método de pago" paso={3} volver="/suscribirse/cuenta"
      movil={<><ResumenCompacto /><CodigoPromoPlan /></>}
      lateral={<><ResumenPlan /><CodigoPromoPlan /><Confianza />{accion}</>}>
      <section className="flex flex-col gap-3">
        <p className="text-[15px] font-extrabold text-cafe"><Tx k="sus.pago.titulo" /></p>
        <div role="radiogroup" className="flex flex-col gap-2.5">
          {opciones.map((o) => (
            <button key={o.id} type="button" role="radio" aria-checked={metodo === o.id} disabled={o.deshabilitado} onClick={() => setMetodo(o.id)}
              className={cx('flex items-center gap-3 rounded-2xl border-2 bg-n0 p-4 text-left',
                o.deshabilitado ? 'cursor-not-allowed border-n10 bg-n5 opacity-70' : metodo === o.id ? 'border-cafe' : 'border-n10')}>
              <span className={cx('flex size-5 shrink-0 items-center justify-center rounded-pill border-2', metodo === o.id ? 'border-cafe' : 'border-n40')}>{metodo === o.id && <span className="size-2.5 rounded-pill bg-cafe" />}</span>
              <span className="flex flex-1 flex-col gap-0.5">
                <span className="text-[15px] font-bold text-cafe"><Tx k={o.titulo} /></span>
                <span className="text-xs text-n60"><Tx k={o.detalle} /></span>
              </span>
              {o.id === 'tarjeta' ? <LogosTarjeta size={24} /> : <LogoYape size={28} />}
            </button>
          ))}
        </div>
      </section>

      {metodo === 'tarjeta' ? (
        <section className="flex flex-col gap-4 rounded-[24px] bg-n0 p-5 lg:p-8">
          <p className="text-xl font-extrabold text-cafe">Datos de tu tarjeta</p>
          <Campo label="Número de tarjeta" inputMode="numeric" autoComplete="cc-number" placeholder="0000 0000 0000 0000" maxLength={19} value={t.numero}
            onChange={(e) => setT({ ...t, numero: limpiar.tarjeta(e.target.value), cvv: limpiar.cvv(t.cvv, e.target.value) })} onBlur={tocar('numero')} error={ver('numero')} />
          <div className="grid grid-cols-2 gap-3">
            <Campo label="Vencimiento" placeholder="MM/AA" inputMode="numeric" autoComplete="cc-exp" maxLength={5} value={t.venc} onChange={(e) => setT({ ...t, venc: limpiar.vencimiento(e.target.value) })} onBlur={tocar('venc')} error={ver('venc')} />
            <Campo label="CVV" type="password" inputMode="numeric" autoComplete="cc-csc" placeholder="123" maxLength={4} value={t.cvv} onChange={(e) => setT({ ...t, cvv: limpiar.cvv(e.target.value, t.numero) })} onBlur={tocar('cvv')} error={ver('cvv')} />
          </div>
          <Campo label="Nombre del titular" autoComplete="cc-name" maxLength={60} value={t.titular} onChange={(e) => setT({ ...t, titular: limpiar.nombre(e.target.value).toUpperCase() })} onBlur={tocar('titular')} error={ver('titular')} />
          <p className="rounded-xl bg-fondo px-4 py-3 text-xs text-cafe">
            {mensual ? 'Se cobrará automáticamente cada mes con esta tarjeta.' : 'Pagas el periodo completo hoy.'} <Tx k="sus.confianza.tarjeta" />
          </p>
        </section>
      ) : (
        <section className="flex flex-col gap-4 rounded-[24px] bg-n0 p-5 lg:p-8">
          <p className="text-xl font-extrabold text-cafe">Paga con Yape</p>
          <ol className="flex flex-col gap-1.5 text-sm text-cafe">
            <li>1. Abre tu app Yape.</li>
            <li>2. Toca «Código de aprobación» en el menú.</li>
            <li>3. Copia el código de 6 dígitos y pégalo aquí.</li>
          </ol>
          <div className="grid gap-3 sm:grid-cols-2">
            <Campo label="Celular de Yape" type="tel" inputMode="numeric" placeholder="987 654 321" maxLength={11} value={yape.celular} onChange={(e) => setYape({ ...yape, celular: limpiar.celular(e.target.value) })} onBlur={tocar('celular')} error={ver('celular')} />
            <Campo label="Código de aprobación" inputMode="numeric" maxLength={6} placeholder="000000" value={yape.codigo} onChange={(e) => setYape({ ...yape, codigo: limpiar.codigo6(e.target.value) })} onBlur={tocar('codigo')} error={ver('codigo')} />
          </div>
        </section>
      )}

      {!mensual && (
        <div className="flex items-center gap-4 rounded-2xl bg-n0 p-4">
          <div className="flex flex-1 flex-col gap-0.5">
            <p className="text-sm font-bold text-cafe"><Tx k="sus.pago.renovacion" /></p>
            <p className="text-xs text-n60"><Tx k="sus.pago.renovacion.d" /></p>
          </div>
          <Interruptor activo={renovacion} onChange={setRenovacion} label="Renovación automática" />
        </div>
      )}
      <div className="flex flex-col gap-4 lg:hidden"><Confianza />{accion}</div>
    </LayoutCheckout>
  );
}
