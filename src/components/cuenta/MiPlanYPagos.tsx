import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useHistorialPagos, useMiPlan, useOfertasUpgrade } from '../../data/datos';
import { useSesion } from '../../data/sesion';
import { invalidar } from '../../data/recurso';
import { suscripcionApi } from '../../api/servicios';
import { ApiError, mensajeError } from '../../api/client';
import { LogoYape, LogosTarjeta } from '../ui/LogosPago';
import { tokenizarTarjeta } from '../../api/kushki';
import { limpiar } from '../../data/validacion';
import { Icon } from '../ui/Icon';
import { cx } from '../ui/primitives';

function Dato({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl bg-n5 px-4 py-3">
      <dt className="text-[12px] text-n60">{k}</dt>
      <dd className="whitespace-nowrap text-[16px] font-extrabold text-cafe min-[380px]:text-[17px]">{v || '—'}</dd>
    </div>
  );
}

function Estado({ activo, cancelada }: { activo: boolean; cancelada: boolean }) {
  return cancelada
    ? <span className="rounded-md bg-rosa px-2 py-1 text-[11px] font-bold text-cafe">● Cancelada</span>
    : <span className={cx('rounded-md px-2 py-1 text-[11px] font-bold text-cafe', activo ? 'bg-verde' : 'bg-n10')}>● {activo ? 'Activo' : 'Inactivo'}</span>;
}

export function TarjetaPlanActual({ className }: { className?: string }) {
  const p = useMiPlan();
  if (!p.plan) return null;
  return (
    <section className={cx('flex flex-col gap-3 rounded-[24px] border-2 border-amarillo bg-n0 p-5 lg:flex-row lg:items-center lg:gap-6 lg:p-6', className)}>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-cafe px-2.5 py-1 text-[11px] font-bold tracking-[0.6px] text-amarillo">TU PLAN ACTUAL</span>
          <Estado activo={p.activo} cancelada={p.cancelada} />
          {p.yoki && <span className="rounded-md bg-rosa px-2 py-1 text-[11px] font-bold text-cafe">Plan YOKI</span>}
        </div>
        <p className="text-[22px] font-black leading-tight text-cafe">{p.plan} {p.periodo && <span className="text-[15px] font-bold text-n60">· {p.periodo}</span>}</p>
        <p className="text-[13px] leading-[18px] text-n60">{p.cancelada ? `No se renovará. Sigues participando hasta el ${p.vence}.` : 'Puedes subir a un plan con más chances cuando quieras.'}</p>
      </div>
      <dl className="grid grid-cols-2 gap-2.5 text-cafe sm:grid-cols-3 lg:w-[420px] lg:shrink-0 lg:gap-3">
        <div className="rounded-xl bg-n5 px-3 py-2.5"><dt className="text-[11px] text-n60">Monto</dt><dd className="whitespace-nowrap text-[16px] font-extrabold">{p.monto || '—'}</dd></div>
        <div className="rounded-xl bg-n5 px-3 py-2.5"><dt className="text-[11px] text-n60">Vence</dt><dd className="whitespace-nowrap text-[16px] font-extrabold">{p.vence || '—'}</dd></div>
        <div className="col-span-2 flex items-center justify-between rounded-xl bg-n5 px-3 py-2.5 sm:col-span-1 sm:block"><dt className="whitespace-nowrap text-[11px] text-n60">Chances x sorteo</dt><dd className="whitespace-nowrap text-[16px] font-extrabold">{p.chances}</dd></div>
      </dl>
    </section>
  );
}

function SubirDePlan() {
  const { data, cargando } = useOfertasUpgrade();
  const p = useMiPlan();
  const { modoMock } = useSesion();
  const [abierto, setAbierto] = useState(false);
  const [elegido, setElegido] = useState<string>();
  const [medio, setMedio] = useState<string>('');
  const [yape, setYape] = useState({ celular: '', otp: '' });
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [listo, setListo] = useState<string | null>(null);
  if (cargando || p.cancelada) return null;
  if (!data.ofertas.length) return null;
  const plan = data.ofertas.find((o) => o.planId === elegido) ?? data.ofertas[0];
  const yapePermitido = !(data.actual?.recurrente ?? p.recurrente);
  const metodo = medio || (p.tarjetas.find((t) => t.principal) ?? p.tarjetas[0])?.id || (yapePermitido ? 'yape' : '');
  const listoPago = metodo === 'yape' ? yape.celular.replace(/\D/g, '').length === 9 && yape.otp.length === 6 : !!metodo;

  const subir = async () => {
    setError('');
    if (modoMock) { setListo(plan.plan); setAbierto(false); return; }
    setEnviando(true);
    try {
      await suscripcionApi.subirDePlan(metodo === 'yape'
        ? { gateway: 'yape', planId: plan.planId, phoneNumber: yape.celular.replace(/\D/g, ''), otp: yape.otp }
        : { gateway: 'kushki', planId: plan.planId, userPaymentMethodId: metodo });
      invalidar('usuario'); invalidar('suscripcion'); invalidar('pagos');
      setListo(plan.plan); setAbierto(false);
    } catch (e) {
      setError(e instanceof ApiError && e.code === 'UPGRADE_YAPE_NOT_ALLOWED_RECURRING' ? 'Tu plan se renueva solo: sube de plan con tarjeta.' : mensajeError(e));
      setYape((y) => ({ ...y, otp: '' }));
    } finally { setEnviando(false); }
  };

  if (listo) return (
    <div className="flex items-start gap-3 rounded-2xl bg-verde/40 px-4 py-3 text-[14px] text-cafe">
      <Icon name="check" size={20} className="mt-0.5 shrink-0" />
      <p>¡Listo! Desde hoy tu plan es <b>{listo}</b>. Te enviamos la boleta a tu correo.</p>
    </div>
  );
  if (!abierto) return <button onClick={() => setAbierto(true)} className="inline-flex h-12 w-fit items-center gap-2 rounded-pill bg-amarillo px-6 text-[15px] font-bold text-cafe">Subir de plan<Icon name="flecha" size={18} /></button>;
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-n10 p-4">
      <p className="text-[15px] font-bold text-cafe">Elige tu nuevo plan</p>
      {data.ofertas.map((x) => (
        <button key={x.planId} onClick={() => setElegido(x.planId)} className={cx('flex items-center gap-3 rounded-2xl border-[1.5px] px-4 py-3 text-left', plan.planId === x.planId ? 'border-cafe bg-crema' : 'border-n10')}>
          <span className={cx('flex size-5 shrink-0 items-center justify-center rounded-full border-2', plan.planId === x.planId ? 'border-cafe' : 'border-n40')}>{plan.planId === x.planId && <span className="size-2.5 rounded-full bg-cafe" />}</span>
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="text-[16px] font-extrabold text-cafe">{x.plan}{x.tipo && <span className="ml-2 align-middle text-[11px] font-bold text-n60">· {x.tipo}</span>}</span>
            <span className="text-[13px] text-n60">{x.chances} chances por sorteo{x.bonus ? ` · +${x.bonus} chances de regalo` : ''}{x.hasta ? ` · hasta el ${x.hasta}` : ''}</span>
          </span>
          <span className="whitespace-nowrap text-[15px] font-extrabold text-cafe">{x.totalTexto}</span>
        </button>
      ))}

      <p className="pt-1 text-[14px] font-bold text-cafe">¿Cómo quieres pagar?</p>
      <div className="flex flex-col gap-2">
        {p.tarjetas.map((t) => (
          <button key={t.id} onClick={() => setMedio(t.id)} className={cx('flex items-center gap-3 rounded-2xl border-[1.5px] px-4 py-3 text-left', metodo === t.id ? 'border-cafe bg-crema' : 'border-n10')}>
            <LogosTarjeta size={22} /><span className="flex-1 text-[14px] font-bold text-cafe">{t.marca} ···{t.ultimos}</span>
          </button>
        ))}
        {yapePermitido && (
          <button onClick={() => setMedio('yape')} className={cx('flex items-center gap-3 rounded-2xl border-[1.5px] px-4 py-3 text-left', metodo === 'yape' ? 'border-cafe bg-crema' : 'border-n10')}>
            <LogoYape size={24} /><span className="flex-1 text-[14px] font-bold text-cafe">Yape</span>
          </button>
        )}
        {!p.tarjetas.length && !yapePermitido && <p className="text-[13px] text-n60">Agrega una tarjeta para subir de plan.</p>}
      </div>
      {metodo === 'yape' && (
        <div className="flex flex-col gap-2 sm:flex-row">
          <input inputMode="numeric" placeholder="Celular de Yape" value={yape.celular} onChange={(e) => setYape({ ...yape, celular: e.target.value.replace(/[^\d ]/g, '').slice(0, 11) })}
            className="h-12 flex-1 rounded-2xl border-[1.5px] border-n10 bg-n0 px-4 text-[15px] outline-none focus:border-cafe" />
          <input inputMode="numeric" placeholder="Código de aprobación" value={yape.otp} onChange={(e) => setYape({ ...yape, otp: e.target.value.replace(/\D/g, '').slice(0, 6) })}
            className="h-12 flex-1 rounded-2xl border-[1.5px] border-n10 bg-n0 px-4 text-[15px] outline-none focus:border-cafe" />
        </div>
      )}
      <p className="text-[12px] leading-[17px] text-n60">El cambio es inmediato: hoy se cobra <b className="text-cafe">{plan.totalTexto}</b> y tu plan nuevo empieza al momento. Solo puedes subir de plan, no bajar.</p>
      {error && <p role="alert" className="text-xs font-semibold text-error">{error}</p>}
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={subir} disabled={!listoPago || enviando} className="inline-flex h-12 items-center gap-2 rounded-pill bg-amarillo px-6 text-[15px] font-bold text-cafe disabled:opacity-40">{enviando ? 'Procesando…' : `Pagar y subir a ${plan.plan}`}</button>
        <button onClick={() => setAbierto(false)} className="h-12 px-2 text-[14px] font-bold text-cafe underline underline-offset-2">Cancelar</button>
      </div>
    </div>
  );
}

function CancelarSuscripcion() {
  const p = useMiPlan();
  const { modoMock } = useSesion();
  const [abierto, setAbierto] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [hecho, setHecho] = useState(false);
  if (p.cancelada || hecho) {
    return <p className="rounded-2xl bg-n5 px-4 py-3 text-[13px] text-cafe">Cancelaste la renovación. Sigues participando{p.vence ? <> hasta el <b>{p.vence}</b></> : ''} y no se te volverá a cobrar.</p>;
  }
  const cancelar = async () => {
    setError('');
    if (modoMock) { setHecho(true); return; }
    if (!p.idSuscripcion) { setError('No encontramos tu suscripción. Escríbenos a contacto@akita.pe.'); return; }
    setEnviando(true);
    try { await suscripcionApi.cancelar(p.idSuscripcion); invalidar('usuario'); setHecho(true); }
    catch (e) { setError(mensajeError(e)); } finally { setEnviando(false); }
  };
  return (
    <>
      <button onClick={() => setAbierto((v) => !v)} className="inline-flex h-10 w-fit items-center px-1 text-[14px] font-bold text-error underline underline-offset-2">Cancelar suscripción</button>
      {abierto && (
        <div className="flex flex-col gap-3 rounded-2xl bg-n5 px-4 py-3 text-[13px] text-cafe">
          <p>Si cancelas, sigues participando{p.vence ? <> hasta el <b>{p.vence}</b></> : ''} y no se te volverá a cobrar.</p>
          {error && <p role="alert" className="font-semibold text-error">{error}</p>}
          <div className="flex flex-wrap gap-3">
            <button onClick={cancelar} disabled={enviando} className="inline-flex h-10 items-center rounded-pill bg-error px-5 text-[14px] font-bold text-n0 disabled:opacity-50">{enviando ? 'Cancelando…' : 'Sí, cancelar'}</button>
            <button onClick={() => setAbierto(false)} className="h-10 px-2 text-[14px] font-bold underline">Mantener mi plan</button>
          </div>
        </div>
      )}
    </>
  );
}

function Tarjetas() {
  const p = useMiPlan();
  const { modoMock } = useSesion();
  const [quitar, setQuitar] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const accion = async (fn: () => Promise<unknown>) => {
    setError('');
    if (modoMock) { setQuitar(null); return; }
    setEnviando(true);
    try { await fn(); invalidar('usuario'); setQuitar(null); } catch (e) { setError(mensajeError(e)); } finally { setEnviando(false); }
  };
  return (
    <section className="flex flex-col gap-4 rounded-[24px] bg-n0 p-5 lg:p-7">
      <h3 className="text-[20px] font-extrabold text-cafe">Método de pago</h3>
      {p.tarjetas.length ? p.tarjetas.map((t) => (
        <div key={t.id} className="flex flex-col gap-2 rounded-2xl border border-n10 px-4 py-3.5">
          <div className="flex items-center gap-4">
            <LogosTarjeta size={24} />
            <div className="flex min-w-0 flex-1 flex-col"><span className="text-[15px] font-bold text-cafe">{t.marca} ···{t.ultimos}</span><span className="text-[12px] text-n60">{t.principal ? 'Tarjeta principal' : 'Tarjeta guardada'}</span></div>
            {!t.principal && <button disabled={enviando} onClick={() => accion(() => suscripcionApi.tarjetaPrincipal(t.id))} className="hidden whitespace-nowrap text-[13px] font-bold text-cafe underline sm:inline">Usar como principal</button>}
            <button aria-label="Eliminar tarjeta" onClick={() => setQuitar(quitar === t.id ? null : t.id)} className="flex size-9 shrink-0 items-center justify-center rounded-full text-error hover:bg-n5"><Icon name="cerrar" size={18} /></button>
          </div>
          {!t.principal && <button disabled={enviando} onClick={() => accion(() => suscripcionApi.tarjetaPrincipal(t.id))} className="self-start text-[13px] font-bold text-cafe underline sm:hidden">Usar como principal</button>}
          {quitar === t.id && (
            <div className="flex flex-col gap-2 rounded-xl bg-n5 p-3 text-[13px] text-cafe">
              <p>{p.tarjetas.length === 1 ? 'Es tu única tarjeta: si la eliminas, se cancela la renovación de tu plan.' : '¿Eliminar esta tarjeta?'}</p>
              <div className="flex gap-3">
                <button disabled={enviando} onClick={() => accion(() => suscripcionApi.eliminarTarjeta(t.id))} className="inline-flex h-9 items-center rounded-pill bg-error px-4 text-[13px] font-bold text-n0 disabled:opacity-50">Eliminar</button>
                <button onClick={() => setQuitar(null)} className="text-[13px] font-bold underline">No</button>
              </div>
            </div>
          )}
        </div>
      )) : <p className="text-[13px] text-n60">Aún no tienes tarjetas guardadas.</p>}
      {error && <p role="alert" className="text-xs font-semibold text-error">{error}</p>}
      <AgregarTarjeta />
      <p className="flex items-center gap-1.5 text-[12px] text-n60"><Icon name="candado" size={14} />No guardamos los datos de tu tarjeta: los procesa la pasarela de pago.</p>
    </section>
  );
}

function AgregarTarjeta() {
  const { modoMock } = useSesion();
  const [abierto, setAbierto] = useState(false);
  const [t, setT] = useState({ numero: '', venc: '', cvv: '', titular: '' });
  const [enviando, setEnviando] = useState(false);
  const [aviso, setAviso] = useState<{ ok: boolean; texto: string } | null>(null);
  const digitos = t.numero.replace(/\D/g, '');
  const completo = digitos.length >= 15 && /^\d{2}\/\d{2}$/.test(t.venc) && t.cvv.length >= 3 && t.titular.trim().length >= 3;
  const guardar = async () => {
    setAviso(null);
    if (modoMock) { setAviso({ ok: true, texto: 'Tarjeta agregada.' }); setAbierto(false); return; }
    setEnviando(true);
    try {
      const bin = digitos.slice(0, 6); const ultimos = digitos.slice(-4);
      const ya = await suscripcionApi.tarjetaYaGuardada(bin, ultimos);
      if (ya?.alreadySaved) { setAviso({ ok: false, texto: 'Esa tarjeta ya está guardada.' }); return; }
      const token = await tokenizarTarjeta({ numero: t.numero, venc: t.venc, cvv: t.cvv, titular: t.titular.trim() }, 0, true);
      await suscripcionApi.guardarTarjeta(token, bin, ultimos);
      invalidar('usuario');
      setT({ numero: '', venc: '', cvv: '', titular: '' });
      setAviso({ ok: true, texto: 'Tarjeta agregada.' }); setAbierto(false);
    } catch (e) {
      setAviso({ ok: false, texto: e instanceof ApiError && e.status === 409 ? 'Esa tarjeta ya está guardada.' : mensajeError(e) });
    } finally { setEnviando(false); setT((x) => ({ ...x, cvv: '' })); }
  };
  const campo = 'h-14 w-full min-w-0 rounded-2xl border border-n10 bg-n0 px-4 text-base outline-none focus:border-cafe';
  return (
    <div className="flex flex-col gap-3">
      {aviso && <p className={cx('text-[13px] font-semibold', aviso.ok ? 'text-verde-texto' : 'text-error')}>{aviso.texto}</p>}
      {!abierto ? (
        <button onClick={() => { setAbierto(true); setAviso(null); }} className="flex w-fit items-center gap-1.5 text-[14px] font-bold text-cafe underline underline-offset-2">+ Agregar nueva tarjeta</button>
      ) : (
        <div className="flex flex-col gap-2.5 rounded-2xl border border-n10 p-4">
          <p className="text-[14px] font-bold text-cafe">Nueva tarjeta</p>
          <input inputMode="numeric" autoComplete="cc-number" placeholder="Número de tarjeta" value={t.numero} onChange={(e) => setT({ ...t, numero: limpiar.tarjeta(e.target.value) })} className={campo} />
          <div className="flex gap-2.5">
            <input inputMode="numeric" autoComplete="cc-exp" placeholder="MM/AA" value={t.venc} onChange={(e) => setT({ ...t, venc: limpiar.vencimiento(e.target.value) })} className={campo} />
            <input inputMode="numeric" autoComplete="cc-csc" placeholder="CVV" value={t.cvv} onChange={(e) => setT({ ...t, cvv: limpiar.cvv(e.target.value, t.numero) })} className={campo} />
          </div>
          <input autoComplete="cc-name" placeholder="Nombre como figura en la tarjeta" value={t.titular} onChange={(e) => setT({ ...t, titular: e.target.value.slice(0, 60) })} className={campo} />
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={guardar} disabled={!completo || enviando} className="inline-flex h-11 items-center rounded-pill bg-cafe px-5 text-[14px] font-bold text-fondo disabled:opacity-40">{enviando ? 'Guardando…' : 'Guardar tarjeta'}</button>
            <button onClick={() => setAbierto(false)} className="text-[14px] font-bold text-cafe underline">Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}

function BotonBoleta({ invoiceId }: { invoiceId?: string }) {
  const [estado, setEstado] = useState<'' | 'bajando' | 'proceso' | 'error'>('');
  if (!invoiceId) return null;
  const bajar = async () => {
    setEstado('bajando');
    try {
      const blob = await suscripcionApi.boleta(invoiceId);
      const u = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = u; a.download = `boleta-${invoiceId}.pdf`; a.click();
      setTimeout(() => URL.revokeObjectURL(u), 2000);
      setEstado('');
    } catch (e) { setEstado(e instanceof ApiError && e.status === 409 ? 'proceso' : 'error'); }
  };
  return (
    <button onClick={bajar} disabled={estado === 'bajando'} className="whitespace-nowrap text-[12px] font-bold text-cafe underline disabled:opacity-50">
      {estado === 'bajando' ? 'Bajando…' : estado === 'proceso' ? 'En proceso' : estado === 'error' ? 'No disponible' : 'Boleta'}
    </button>
  );
}

export function MiPlanYPagos() {
  const p = useMiPlan();
  const pagos = useHistorialPagos();
  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-5 rounded-[24px] bg-n0 p-5 lg:p-7">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <span className="flex flex-wrap gap-2"><span className="w-fit rounded-md bg-cafe px-2.5 py-1 text-[11px] font-bold tracking-[0.6px] text-amarillo">TU PLAN ACTUAL</span>{p.yoki && <span className="rounded-md bg-rosa px-2 py-1 text-[11px] font-bold text-cafe">Plan YOKI</span>}</span>
            <p className="text-[28px] font-black leading-tight text-cafe">{p.plan || 'Sin plan activo'} {p.periodo && <span className="text-[16px] font-bold text-n60">· {p.periodo}</span>}</p>
          </div>
          {p.plan && <Estado activo={p.activo} cancelada={p.cancelada} />}
        </div>
        {p.plan ? (
          <>
            <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Dato k="Fecha de inicio" v={p.inicio} />
              <Dato k={p.cancelada ? 'Vigente hasta' : 'Próximo cobro'} v={p.vence} />
              <Dato k="Chances x sorteo" v={String(p.chances)} />
              <Dato k="Monto" v={p.monto} />
            </dl>
            <SubirDePlan />
            <CancelarSuscripcion />
          </>
        ) : <Link to="/planes" className="inline-flex h-12 w-fit items-center gap-2 rounded-pill bg-amarillo px-6 text-[15px] font-bold text-cafe">Ver planes<Icon name="flecha" size={18} /></Link>}
      </section>

      <Tarjetas />

      <section className="flex flex-col gap-3 rounded-[24px] bg-n0 p-5 lg:p-7">
        <h3 className="text-[20px] font-extrabold text-cafe">Historial de pagos</h3>
        {pagos.data.length ? (
          <ul className="flex flex-col">
            {pagos.data.map((x, i) => (
              <li key={`${x.id}-${i}`} className="flex items-center gap-3 border-b border-n10 py-3 last:border-0">
                <span className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-3">
                  <span className="text-[14px] font-semibold text-cafe sm:order-2 sm:flex-1">{x.concepto}</span>
                  <span className="whitespace-nowrap text-[12px] text-n60 sm:order-1 sm:w-[86px] sm:shrink-0 sm:text-[13px]">{x.fecha}</span>
                </span>
                <span className="whitespace-nowrap text-[14px] font-extrabold text-cafe">{x.monto}</span>
                {x.estado && <span className={cx('hidden rounded-md px-2 py-0.5 text-[11px] font-bold text-cafe sm:inline', x.estado === 'Pagado' ? 'bg-verde' : 'bg-n10')}>{x.estado}</span>}
                <BotonBoleta invoiceId={x.invoiceId} />
              </li>
            ))}
          </ul>
        ) : <p className="text-[13px] text-n60">{pagos.cargando ? 'Cargando…' : 'Todavía no hay pagos registrados.'}</p>}
        <p className="text-[12px] text-n60">Te enviamos la boleta de cada pago a tu correo.</p>
      </section>
    </div>
  );
}
