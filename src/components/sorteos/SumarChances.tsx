import { LogoYape, LogosTarjeta } from '../ui/LogosPago';
import { useState } from 'react';
import { Icon } from '../ui/Icon';
import { Button, MonedaLana, cx } from '../ui/primitives';
import { Bloque, Hoja, OpcionElegible } from '../ui/Hoja';
import { FLAGS, PRECIO_CHANCE, soles } from '../../data/reglas';
import { formatoLanas } from '../../data/mock';
import { useBilletera } from '../../data/datos';
import { useSesion } from '../../data/sesion';
import { promoApi, sorteosApi } from '../../api/servicios';
import { tokenizarTarjeta } from '../../api/kushki';
import { ApiError, mensajeError } from '../../api/client';
import { invalidar } from '../../data/recurso';
import { limpiar } from '../../data/validacion';

type Metodo = 'lanas' | 'soles';
type Paso = 'elegir' | 'pago' | 'listo';

export type SorteoParaChances = { id: string; premio: string; fecha: string; corte: string; chancesActuales: number; puedeComprar?: boolean };

export function SumarChances({ sorteo, abierto, onCerrar }: { sorteo: SorteoParaChances; abierto: boolean; onCerrar: () => void }) {
  const { modoMock } = useSesion();
  const billetera = useBilletera();
  const [paso, setPaso] = useState<Paso>('elegir');
  const [cantidad, setCantidad] = useState(3);
  const [metodo, setMetodo] = useState<Metodo>('soles');
  const [medio, setMedio] = useState<'tarjeta' | 'yape'>('tarjeta');
  const [pago, setPago] = useState({ tarjeta: '', vence: '', cvv: '', celular: '', codigo: '', promo: '' });
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [total, setTotal] = useState<number | null>(null);

  const precioLanas = modoMock ? PRECIO_CHANCE.lanas : billetera.precioChance;
  const sinPrecioLanas = precioLanas == null;
  const costoLanas = cantidad * (precioLanas ?? 0);
  const costoSoles = cantidad * PRECIO_CHANCE.soles;
  const faltan = Math.max(0, costoLanas - billetera.saldo);
  const cerrar = () => { setPaso('elegir'); setError(''); setTotal(null); onCerrar(); };

  const usarLanas = async () => {
    setError('');
    if (modoMock) { setTotal(sorteo.chancesActuales + cantidad); setPaso('listo'); return; }
    setEnviando(true);
    try {
      const r = await sorteosApi.comprarChancesConLanas(sorteo.id, cantidad);
      setTotal(r?.userChances ?? sorteo.chancesActuales + cantidad);
      invalidar('lanas'); invalidar('sorteos'); invalidar('misiones');
      setPaso('listo');
    } catch (e) { setError(mensajeError(e)); } finally { setEnviando(false); }
  };

  const pagarConSoles = async () => {
    setError('');
    if (modoMock) { setTotal(sorteo.chancesActuales + cantidad); setPaso('listo'); return; }
    setEnviando(true);
    try {
      const promoCode = pago.promo || undefined;
      const r = medio === 'tarjeta'
        ? await sorteosApi.comprarChancesConTarjeta({ token: await tokenizarTarjeta({ numero: pago.tarjeta, venc: pago.vence, cvv: pago.cvv, titular: '' }, costoSoles, false),
          raffleId: sorteo.id, opportunities: cantidad, promoCode })
        : await sorteosApi.comprarChancesConYape({ raffleId: sorteo.id, opportunities: cantidad, phoneNumber: pago.celular.replace(/\D/g, ''), otp: pago.codigo, promoCode });
      void r;
      setPago((x) => ({ ...x, tarjeta: '', cvv: '', codigo: '' }));
      setTotal(sorteo.chancesActuales + cantidad);
      invalidar('sorteos'); invalidar('misiones');
      setPaso('listo');
    } catch (e) {
      setError(e instanceof ApiError && e.code === 'KUSHKI_NO_CONFIGURADO' ? 'El pago con tarjeta se activa cuando backend entregue la credencial pública de Kushki.' : mensajeError(e));
    } finally { setEnviando(false); }
  };
  const validarPromo = async (code: string): Promise<{ error?: string; detalle?: string }> => {
    if (modoMock) return code === 'CHANCES50' ? { detalle: 'Ganas +50 chances adicionales para este sorteo. El importe no cambia.' } : { error: 'Este código no es válido o ya venció.' };
    try {
      const r = await promoApi.validar({ code, raffleId: sorteo.id, applicationContext: 'CHANCES', opportunities: cantidad });
      if ((r?.isValid ?? r?.valid) === false) return { error: r.message || 'Este código no es válido o ya venció.' };
      const extra = r?.bonusChances ?? r?.potentialBonus;
      return { detalle: extra ? `Ganas +${extra} chances adicionales para este sorteo. El importe no cambia.` : r?.message };
    } catch (e) { return { error: mensajeError(e) }; }
  };

  const titulo = paso === 'listo' ? '¡Chances sumadas!' : paso === 'pago' ? 'Paga tus chances' : 'Suma chances';
  const pagoCompleto = medio === 'tarjeta'
    ? pago.tarjeta.replace(/\s/g, '').length >= 15 && pago.vence.length === 5 && pago.cvv.length >= 3
    : pago.celular.replace(/\s/g, '').length === 9 && pago.codigo.length === 6;

  return (
    <Hoja abierto={abierto} onCerrar={cerrar} titulo={titulo} subtitulo={`${sorteo.premio} · ${sorteo.fecha}`} onVolver={paso === 'pago' ? () => setPaso('elegir') : undefined}>
      {paso === 'elegir' && (
        <>
          <Bloque>
            <p className="text-sm font-bold">¿Cuántas chances quieres sumar?</p>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button aria-label="Quitar una chance" disabled={cantidad <= 1} onClick={() => setCantidad(Math.max(1, cantidad - 1))} className="flex size-10 items-center justify-center rounded-pill bg-n5 text-xl font-bold disabled:opacity-40">−</button>
                <input aria-label="Cantidad de chances" inputMode="numeric" value={cantidad}
                  onChange={(e) => setCantidad(Math.min(999, Math.max(1, Number(e.target.value.replace(/\D/g, '')) || 1)))}
                  className="h-11 w-16 rounded-xl border border-n10 bg-n0 text-center text-[26px] font-black outline-none focus:border-cafe" />
                <button aria-label="Sumar una chance" onClick={() => setCantidad(Math.min(999, cantidad + 1))} className="flex size-10 items-center justify-center rounded-pill bg-n5 text-xl font-bold">+</button>
              </div>
              <p className="text-[13px] text-n60">Hoy tienes {sorteo.chancesActuales}</p>
            </div>
            <div className="flex gap-2">
              {[1, 3, 5, 10].map((n) => (
                <button key={n} onClick={() => setCantidad(n)}
                  className={cx('h-9 flex-1 rounded-pill text-sm font-bold', n === cantidad ? 'bg-cafe text-amarillo' : 'border border-n10 bg-n0 text-cafe')}>+{n}</button>
              ))}
            </div>
          </Bloque>

          <div role="radiogroup" className="flex flex-col gap-2.5">
            <p className="text-sm font-bold">¿Cómo quieres pagar?</p>
            <OpcionElegible activa={metodo === 'soles'} onClick={() => setMetodo('soles')} icono={<Icon name="tarjeta" size={22} />}
              titulo={`Con soles · ${soles(costoSoles)}`} detalle="Tarjeta o Yape. Te enviamos tu boleta por correo." />
            <OpcionElegible activa={metodo === 'lanas'} onClick={() => setMetodo('lanas')} icono={<MonedaLana size={22} />} agotada={sinPrecioLanas}
              titulo={sinPrecioLanas ? 'Con Lanas · no disponible' : `Con Lanas · ${formatoLanas(costoLanas)} Lanas`}
              detalle={sinPrecioLanas ? 'Pronto podrás sumar chances con tus Lanas.' : `Tu saldo: ${formatoLanas(billetera.saldo)} Lanas`} />
          </div>

          {metodo === 'lanas' && !billetera.puedeGastar && (
            <p className="rounded-2xl bg-rosa-claro p-4 text-[13px] font-semibold text-cafe">Necesitas una suscripción vigente para usar tus Lanas. Puedes pagar estas chances con soles.</p>
          )}
          {metodo === 'lanas' && billetera.puedeGastar && faltan > 0 && (
            <div className="flex flex-col gap-2 rounded-2xl border border-error/30 bg-error/[.06] p-4">
              <p className="text-sm font-semibold text-error">Te faltan {formatoLanas(faltan)} Lanas.</p>
              <p className="text-[13px] text-cafe">Puedes pagar estas {cantidad} chances con soles o sumar menos chances con tus Lanas.</p>
              <button onClick={() => setMetodo('soles')} className="self-start text-sm font-bold text-cafe underline">Pagar con soles</button>
            </div>
          )}

          <p className="text-xs text-n60">Valen solo para este sorteo.{sorteo.corte ? ` Puedes sumarlas hasta ${/^\d/.test(sorteo.corte) ? 'las' : 'el'} ${sorteo.corte}${sorteo.corte.endsWith('.') ? '' : '.'}` : ''}</p>
          {error && <p role="alert" className="text-xs font-semibold text-error">{error}</p>}

          {metodo === 'lanas' ? (
            <Button full disabled={sinPrecioLanas || faltan > 0 || !billetera.puedeGastar || enviando || sorteo.puedeComprar === false} className="disabled:opacity-40" onClick={usarLanas}>
              {enviando ? 'Sumando…' : `Usar ${formatoLanas(costoLanas)} ${costoLanas === 1 ? 'Lana' : 'Lanas'}`}
            </Button>
          ) : (
            <Button full disabled={sorteo.puedeComprar === false} className="disabled:opacity-40" onClick={() => setPaso('pago')}>Continuar · {soles(costoSoles)}</Button>
          )}
        </>
      )}

      {paso === 'pago' && (
        <>
          <Bloque>
            <Fila k="Chances" v={`+${cantidad} para este sorteo`} />
            <Fila k="Total" v={soles(costoSoles)} fuerte />
            <p className="text-xs text-n60">Precio con IGV. Te enviamos la boleta a tu correo.</p>
            {FLAGS.codigoChances && <CodigoPromo valor={pago.promo} onCambio={(v) => setPago({ ...pago, promo: v })} validar={validarPromo} />}
          </Bloque>

          <div className="flex gap-2 rounded-pill bg-n0 p-1.5" role="tablist">
            {(['tarjeta', 'yape'] as const).map((m) => (
              <button key={m} role="tab" aria-selected={medio === m} onClick={() => setMedio(m)}
                className={cx('flex h-12 flex-1 items-center justify-center gap-2 rounded-pill text-sm font-bold', medio === m ? 'bg-cafe text-amarillo' : 'text-cafe')}>
                {m === 'tarjeta' ? <><LogosTarjeta size={22} />Tarjeta</> : <><LogoYape size={24} />Yape</>}</button>
            ))}
          </div>

          {medio === 'tarjeta' ? (
            <Bloque>
              <Campo label="Número de tarjeta" placeholder="•••• •••• •••• ••••" inputMode="numeric" value={pago.tarjeta} onChange={(v) => setPago({ ...pago, tarjeta: limpiar.tarjeta(v) })} />
              <div className="flex gap-3">
                <Campo label="Vence" placeholder="MM/AA" inputMode="numeric" value={pago.vence} onChange={(v) => setPago({ ...pago, vence: limpiar.vencimiento(v) })} />
                <Campo label="CVV" placeholder="•••" inputMode="numeric" value={pago.cvv} onChange={(v) => setPago({ ...pago, cvv: limpiar.cvv(v, pago.tarjeta) })} />
              </div>
            </Bloque>
          ) : (
            <Bloque>
              <Campo label="Celular registrado en Yape" placeholder="987 654 321" inputMode="numeric" value={pago.celular} onChange={(v) => setPago({ ...pago, celular: limpiar.celular(v) })} />
              <Campo label="Código de aprobación" placeholder="______" inputMode="numeric" value={pago.codigo} onChange={(v) => setPago({ ...pago, codigo: limpiar.codigo6(v) })} ayuda="Lo encuentras en tu app Yape. Vence en 2 minutos." />
            </Bloque>
          )}

          {error && <p role="alert" className="text-xs font-semibold text-error">{error}</p>}
          <Button full disabled={!pagoCompleto || enviando} className="disabled:opacity-40" onClick={pagarConSoles}>{enviando ? 'Procesando…' : `Pagar ${soles(costoSoles)}`}</Button>
        </>
      )}

      {paso === 'listo' && (
        <>
          <div className="flex flex-col items-center gap-3 rounded-[24px] bg-hero-brand px-5 py-7 text-center text-n0">
            <span className="flex size-14 items-center justify-center rounded-pill bg-verde text-cafe"><Icon name="check" size={28} /></span>
            <p className="text-[34px] font-black leading-none text-amarillo">+{cantidad} chances</p>
            <p className="text-sm text-n0/80">Ahora tienes {total ?? sorteo.chancesActuales + cantidad} chances para {sorteo.premio}.</p>
          </div>
          <p className="text-center text-[13px] text-n60">
            {metodo === 'lanas' ? `Usaste ${formatoLanas(costoLanas)} Lanas. Lo ves en tus movimientos.` : `Pagaste ${soles(costoSoles)}. Te enviamos la boleta a tu correo.`}
          </p>
          <Button full onClick={cerrar}>Listo</Button>
        </>
      )}
    </Hoja>
  );
}

function Fila({ k, v, fuerte }: { k: string; v: string; fuerte?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-n60">{k}</span>
      <span className={cx('font-bold', fuerte && 'text-lg font-black')}>{v}</span>
    </div>
  );
}

function Campo({ label, ayuda, value, onChange, placeholder, inputMode }: {
  label: string; ayuda?: string; value: string; onChange: (v: string) => void; placeholder?: string; inputMode?: 'numeric' | 'text';
}) {
  return (
    <label className="flex min-w-0 flex-1 flex-col gap-1.5">
      <span className="text-[13px] font-bold">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} inputMode={inputMode}
        className="h-12 w-full min-w-0 rounded-xl border border-n10 bg-n0 px-4 text-[15px] outline-none focus:border-cafe" />
      {ayuda && <span className="text-xs text-n60">{ayuda}</span>}
    </label>
  );
}

function CodigoPromo({ valor, onCambio, validar }: { valor: string; onCambio: (v: string) => void; validar: (code: string) => Promise<{ error?: string; detalle?: string }> }) {
  const [aplicado, setAplicado] = useState(false);
  const [detalle, setDetalle] = useState('');
  const [revisando, setRevisando] = useState(false);
  const [aviso, setAviso] = useState('');
  const aplicar = async () => {
    setAviso('');
    if (!valor) { setAviso('Escribe tu código.'); return; }
    setRevisando(true);
    const r = await validar(valor);
    setRevisando(false);
    if (r.error) setAviso(r.error); else { setDetalle(r.detalle ?? ''); setAplicado(true); }
  };
  if (aplicado && valor) {
    return (
      <div className="flex flex-col gap-0.5 rounded-xl bg-verde/25 px-3 py-2.5 text-cafe">
        <p className="flex items-center justify-between gap-2 text-[13px] font-bold"><span className="flex items-center gap-2"><Icon name="check" size={16} />Código {valor} aplicado</span>
          <button type="button" onClick={() => { setAplicado(false); onCambio(''); }} className="text-[12px] font-semibold underline">Quitar</button></p>
        {detalle && <p className="text-[12px] leading-[17px]">{detalle}</p>}
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-1.5">
      <p className="flex items-center gap-1.5 text-[14px] font-extrabold"><Icon name="cupon" size={18} />¿Tienes un código promocional?</p>
      <div className="flex items-end gap-2">
        <Campo label="Código (opcional)" placeholder="Ej. CHANCES50" value={valor} onChange={(v) => onCambio(v.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 20))} />
        <button type="button" disabled={revisando} onClick={aplicar} className="h-12 shrink-0 rounded-xl bg-cafe px-4 text-sm font-bold text-fondo disabled:opacity-40">{revisando ? '…' : 'Aplicar'}</button>
      </div>
      {aviso && <p role="alert" className="text-xs font-medium text-error">{aviso}</p>}
    </div>
  );
}
