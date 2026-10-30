import { LogoYape, LogosTarjeta } from '../ui/LogosPago';
import { useEffect, useState, type ReactNode } from 'react';
import { erroresTarjeta, erroresYape, formatoCelular, formatoCodigoYape, formatoCvv, formatoTarjeta, formatoVenc, sinTildes, type DatosTarjeta, type DatosYape } from '../pago/validacion';
import { FLAGS, PRECIO_CHANCE, soles } from '../../data/reglas';
import { formatoLanas } from '../../data/mock';
import { useBilletera } from '../../data/datos';
import { useSesion } from '../../data/sesion';
import { useDemoOpcional } from '../../data/revision';
import { promoApi, sorteosApi } from '../../api/servicios';
import { tokenizarTarjeta } from '../../api/kushki';
import { config } from '../../api/config';
import { ApiError, mensajeError } from '../../api/client';
import { invalidar } from '../../data/recurso';
import { Icon } from '../ui/Icon';
import { LogoAkita, LogoJockeyPlaza } from '../ui/Brand';
import { MonedaLana, cx } from '../ui/primitives';

type Metodo = 'soles' | 'lanas';
type MedioSoles = 'tarjeta' | 'yape';
type Paso = 'elegir' | 'pago' | 'listo';
type Codigo = { texto: string; regalo: number };

export type SorteoParaChances = { id: string; premio: string; fecha: string; corte: string; chancesActuales: number; puedeComprar?: boolean };

const SUGERIDOS = [10, 20, 30, 50];
const RECOMENDADO = 30;
const CODIGOS_DEMO: Record<string, number> = { CHANCES50: 50, DEMO10: 10 };

const solesCorto = (n: number) => soles(n).replace(/\.00$/, '').replace(' ', '');

export function FranjaCreadoPor({ className }: { className?: string }) {
  return (
    <div className={cx('flex items-center justify-between gap-3 bg-cafe px-5 py-2.5 text-n0', className)}>
      <LogoAkita width={70} className="text-amarillo" />
      <span className="flex items-center gap-2 text-[11px] font-semibold leading-tight text-n0/80">Creado por<LogoJockeyPlaza width={92} className="text-n0" /></span>
    </div>
  );
}

export function SumarChances({ sorteo, abierto, onCerrar }: { sorteo: SorteoParaChances; abierto: boolean; onCerrar: () => void }) {
  const { modoMock } = useSesion();
  const billetera = useBilletera();
  const [paso, setPaso] = useState<Paso>('elegir');
  const [cantidad, setCantidad] = useState(RECOMENDADO);
  const [metodo, setMetodo] = useState<Metodo>('soles');
  const [medio, setMedio] = useState<MedioSoles>('tarjeta');
  const [codigo, setCodigo] = useState<Codigo | null>(null);
  const [tarjeta, setTarjeta] = useState<DatosTarjeta>({ numero: '', venc: '', cvv: '', nombre: '' });
  const [yape, setYape] = useState<DatosYape>({ celular: '', codigo: '' });
  const [tocado, setTocado] = useState<Record<string, boolean>>({});
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [totalApi, setTotalApi] = useState<number | null>(null);
  const demo = useDemoOpcional();
  const [actuales, setActuales] = useState(sorteo.chancesActuales);
  const [saldoTras, setSaldoTras] = useState(0);
  const et = erroresTarjeta(tarjeta); const ey = erroresYape(yape);
  const err = (k: string, m?: string) => (tocado[k] ? m : undefined);
  const campoT = (k: keyof DatosTarjeta, fmt: (v: string) => string) => ({
    id: `ch-tarjeta-${k}`, value: tarjeta[k], onChange: (e: React.ChangeEvent<HTMLInputElement>) => setTarjeta({ ...tarjeta, [k]: fmt(e.target.value) }),
    onBlur: () => setTocado((x) => ({ ...x, [`t${k}`]: true })), error: err(`t${k}`, et[k]),
  });
  const campoY = (k: keyof DatosYape, fmt: (v: string) => string) => ({
    id: `ch-yape-${k}`, value: yape[k], onChange: (e: React.ChangeEvent<HTMLInputElement>) => setYape({ ...yape, [k]: fmt(e.target.value) }),
    onBlur: () => setTocado((x) => ({ ...x, [`y${k}`]: true })), error: err(`y${k}`, ey[k]),
  });

  const precioLanas = modoMock ? PRECIO_CHANCE.lanas : billetera.precioChance;
  const sinPrecioLanas = precioLanas == null;
  const costoLanas = cantidad * (precioLanas ?? 0);
  const costoSoles = cantidad * PRECIO_CHANCE.soles;
  const faltan = Math.max(0, costoLanas - billetera.saldo);
  const regalo = codigo?.regalo ?? 0;
  const total = totalApi ?? actuales + cantidad + regalo;
  const limite = sorteo.corte ? `${/^\d/.test(sorteo.corte) ? 'las' : 'el'} ${sorteo.corte}` : '';

  useEffect(() => {
    if (abierto) { setPaso('elegir'); setError(''); setTotalApi(null); setActuales(sorteo.chancesActuales); }
  }, [abierto]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!abierto) return;
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onCerrar();
    window.addEventListener('keydown', esc);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', esc); document.body.style.overflow = ''; };
  }, [abierto, onCerrar]);

  const usarLanas = async () => {
    setError('');
    setSaldoTras(Math.max(0, billetera.saldo - costoLanas));
    if (modoMock) { demo?.sumarChances(sorteo.premio, cantidad + regalo); setPaso('listo'); return; }
    setEnviando(true);
    try {
      const r = await sorteosApi.comprarChancesConLanas(sorteo.id, cantidad);
      if (r?.userChances != null) setTotalApi(r.userChances);
      if (r?.lanasBalance != null) setSaldoTras(r.lanasBalance);
      invalidar('lanas'); invalidar('sorteos'); invalidar('misiones');
      setPaso('listo');
    } catch (e) { setError(mensajeError(e)); } finally { setEnviando(false); }
  };

  const pagar = async () => {
    const errs = medio === 'tarjeta' ? Object.keys(et).map((k) => `ch-tarjeta-${k}`) : Object.keys(ey).map((k) => `ch-yape-${k}`);
    if (errs.length) {
      setTocado({ tnumero: true, tvenc: true, tcvv: true, tnombre: true, ycelular: true, ycodigo: true });
      document.getElementById(errs[0])?.focus();
      return;
    }
    setError('');
    if (modoMock) { demo?.sumarChances(sorteo.premio, cantidad + regalo); setPaso('listo'); return; }
    setEnviando(true);
    try {
      const promoCode = codigo?.texto;
      if (medio === 'tarjeta') {
        const token = await tokenizarTarjeta({ numero: tarjeta.numero, venc: tarjeta.venc, cvv: tarjeta.cvv, titular: tarjeta.nombre }, costoSoles, false);
        await sorteosApi.comprarChancesConTarjeta({ token, raffleId: sorteo.id, opportunities: cantidad, promoCode });
      } else {
        await sorteosApi.comprarChancesConYape({ raffleId: sorteo.id, opportunities: cantidad, phoneNumber: yape.celular, otp: yape.codigo, promoCode });
      }
      setTarjeta((x) => ({ ...x, numero: '', cvv: '' })); setYape((x) => ({ ...x, codigo: '' }));
      invalidar('sorteos'); invalidar('misiones');
      setPaso('listo');
    } catch (e) {
      setError(e instanceof ApiError && e.code === 'KUSHKI_NO_CONFIGURADO' ? 'El pago con tarjeta se activa cuando backend entregue la credencial pública de Kushki.' : mensajeError(e));
    } finally { setEnviando(false); }
  };

  const validarCodigo = async (texto: string): Promise<{ codigo?: Codigo; error?: string }> => {
    if (modoMock) return CODIGOS_DEMO[texto] ? { codigo: { texto, regalo: CODIGOS_DEMO[texto] } } : { error: 'Este código no es válido o ya venció.' };
    try {
      const r = await promoApi.validar({ code: texto, raffleId: sorteo.id, applicationContext: 'CHANCES', opportunities: cantidad });
      if ((r?.isValid ?? r?.valid) === false) return { error: r.message || 'Este código no es válido o ya venció.' };
      return { codigo: { texto, regalo: r?.bonusChances ?? r?.potentialBonus ?? 0 } };
    } catch (e) { return { error: mensajeError(e) }; }
  };

  if (!abierto) return null;
  const titulo = paso === 'listo' ? '¡Chances sumadas!' : paso === 'pago' ? 'Paga tus chances' : 'Suma chances';
  const pruebas = modoMock || config.kushki.test;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-cafe/60 lg:items-center" role="dialog" aria-modal="true" aria-label={titulo} onClick={onCerrar}>
      <div className="flex max-h-[94vh] w-full flex-col overflow-hidden rounded-t-[28px] bg-fondo text-cafe lg:w-[480px] lg:rounded-[28px]" onClick={(e) => e.stopPropagation()}>
        <FranjaCreadoPor />
        <div className="flex flex-col gap-4 overflow-y-auto p-5 pb-6">
          <div className="flex items-start gap-3">
            {paso === 'pago' && (
              <button aria-label="Volver" onClick={() => setPaso('elegir')} className="flex size-10 shrink-0 items-center justify-center rounded-pill bg-n0">
                <Icon name="flecha" size={18} className="rotate-180" />
              </button>
            )}
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <p className="text-[24px] font-black leading-7">{titulo}</p>
              <p className="text-[14px] font-bold text-cafe">{sorteo.premio}</p>
              {sorteo.fecha && <p className="text-[13px] text-n60">{/^Sorteo/i.test(sorteo.fecha) ? sorteo.fecha : `Sorteo: ${sorteo.fecha}`}</p>}
            </div>
            <button aria-label="Cerrar" onClick={onCerrar} className="flex size-10 shrink-0 items-center justify-center rounded-pill bg-n0"><Icon name="cerrar" size={18} /></button>
          </div>
          {paso !== 'listo' && limite && (
            <p className="flex items-center gap-2 rounded-xl bg-amarillo/35 px-3 py-2 text-[13px] font-bold text-cafe"><Icon name="reloj" size={16} className="shrink-0" />Compra hasta {limite}</p>
          )}

          {paso === 'elegir' && (
            <>
              <div className="flex flex-col gap-2.5">
                <p className="text-sm font-bold">¿Cuántas chances quieres sumar?</p>
                <div className="flex items-center justify-between gap-2">
                  <Contador valor={cantidad} onCambio={setCantidad} />
                  <p className="text-[13px] text-n60">Ya tienes {actuales} chances</p>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {SUGERIDOS.map((n) => (
                    <button key={n} onClick={() => setCantidad(n)} aria-pressed={n === cantidad}
                      className={cx('flex min-w-0 flex-col items-center gap-0.5 rounded-2xl border px-1 py-2 text-center', n === cantidad ? 'border-cafe bg-cafe text-n0' : 'border-n10 bg-n0 text-cafe')}>
                      <span className="text-[11px] font-semibold">{n} chances</span>
                      <span className="text-[16px] font-black leading-tight">{solesCorto(n * PRECIO_CHANCE.soles)}</span>
                      {n === RECOMENDADO && <span className="rounded-pill bg-amarillo px-1.5 text-[9px] font-extrabold text-cafe">Recomendado</span>}
                    </button>
                  ))}
                </div>
              </div>

              {FLAGS.codigoChances && <CodigoPromo codigo={codigo} onCambio={setCodigo} validar={validarCodigo} />}
              <Total total={total} actuales={actuales} cantidad={cantidad} regalo={regalo} />

              <div className="flex flex-col gap-2.5">
                <p className="text-sm font-bold">¿Cómo quieres sumar tus chances?</p>
                <Opcion activa={metodo === 'soles'} onClick={() => setMetodo('soles')}
                  icono={<Icon name="tarjeta" size={22} />} titulo={`Comprar chances · ${soles(costoSoles)}`} detalle="Tarjeta o Yape" />
                <Opcion activa={metodo === 'lanas'} onClick={() => !sinPrecioLanas && setMetodo('lanas')} deshabilitada={sinPrecioLanas}
                  icono={<MonedaLana size={22} />} titulo={sinPrecioLanas ? 'Canjear Lanas · no disponible' : `Canjear Lanas · ${formatoLanas(costoLanas)} Lanas`}
                  detalle={sinPrecioLanas ? 'Pronto podrás sumar chances con tus Lanas.' : `Tu saldo: ${formatoLanas(billetera.saldo)} Lanas`}
                  extra={metodo === 'lanas' && billetera.puedeGastar && faltan > 0 ? (
                    <div className="flex flex-col gap-1.5 rounded-xl bg-error/[.08] px-3 py-2.5">
                      <p className="flex items-center gap-2 text-[13px] font-semibold text-error"><Icon name="alerta" size={18} className="shrink-0" />Te faltan {formatoLanas(faltan)} Lanas para este canje.</p>
                      <button onClick={() => setMetodo('soles')} className="self-start pl-[26px] text-[13px] font-bold text-cafe underline">Compra con soles · {soles(costoSoles)}</button>
                    </div>
                  ) : undefined} />
              </div>
              {metodo === 'lanas' && !billetera.puedeGastar && (
                <p className="rounded-2xl bg-rosa-claro p-3.5 text-[13px] font-semibold text-cafe">Necesitas una suscripción vigente para usar tus Lanas. Puedes comprar estas chances con soles.</p>
              )}
              <p className="text-xs text-n60">Precios con IGV incluido. Las chances valen solo para este sorteo.</p>
              {error && <p role="alert" className="text-xs font-semibold text-error">{error}</p>}
              <BotonPrincipal disabled={sorteo.puedeComprar === false || enviando || (metodo === 'lanas' && (faltan > 0 || !billetera.puedeGastar || sinPrecioLanas))}
                onClick={() => (metodo === 'lanas' ? usarLanas() : setPaso('pago'))}>
                {enviando ? 'Sumando…' : metodo === 'lanas' ? `Usar ${formatoLanas(costoLanas)} Lanas` : `Continuar · ${soles(costoSoles)}`}
              </BotonPrincipal>
            </>
          )}

          {paso === 'pago' && (
            <>
              <Bloque>
                <Fila k="Chances a comprar" v={String(cantidad)} />
                {codigo && codigo.regalo > 0 && <Fila k={`Código ${codigo.texto}`} v={`+${codigo.regalo} de regalo`} verde />}
                <Fila k="Ya tienes" v={String(actuales)} />
                <div className="border-t border-n10 pt-2">
                  <p className="text-[15px] font-extrabold">Tu total será de {total} chances</p>
                  <p className="text-xs text-n60">Para este premio y sorteo.</p>
                </div>
              </Bloque>
              <div className="flex items-start justify-between rounded-2xl bg-amarillo/35 px-4 py-3">
                <span className="text-[15px] font-extrabold">Total a pagar</span>
                <span className="flex flex-col items-end"><span className="text-[24px] font-black leading-none">{soles(costoSoles)}</span><span className="text-[11px] text-n60">IGV incluido</span></span>
              </div>
              <div className="flex gap-2 rounded-pill bg-n0 p-1.5" role="tablist">
                {(['tarjeta', 'yape'] as const).map((m) => (
                  <button key={m} role="tab" aria-selected={medio === m} onClick={() => setMedio(m)}
                    className={cx('flex h-12 flex-1 items-center justify-center gap-2 rounded-pill text-sm font-bold', medio === m ? 'bg-cafe text-amarillo' : 'text-cafe')}>
                    {m === 'tarjeta' ? <><LogosTarjeta size={22} />Tarjeta</> : <><LogoYape size={24} />Yape</>}
                  </button>
                ))}
              </div>
              {medio === 'tarjeta' ? (
                <Bloque>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[15px] font-extrabold">Datos de tu tarjeta</p>
                    {pruebas && <button type="button" onClick={() => setTarjeta({ numero: '4456 5400 0000 0063', venc: '12/29', cvv: '123', nombre: 'CAMILA ROJAS' })} className="text-[12px] font-semibold text-n60 underline">Datos de prueba</button>}
                  </div>
                  <Campo label="Número de tarjeta" placeholder="0000 0000 0000 0000" inputMode="numeric" autoComplete="cc-number" {...campoT('numero', formatoTarjeta)} />
                  <div className="flex gap-3">
                    <Campo label="Vencimiento" placeholder="MM/AA" inputMode="numeric" autoComplete="cc-exp" {...campoT('venc', formatoVenc)} />
                    <Campo label="CVV" placeholder="123" inputMode="numeric" autoComplete="cc-csc" {...campoT('cvv', formatoCvv)} />
                  </div>
                  <Campo label="Nombre del titular" placeholder="Como aparece en tu tarjeta" autoComplete="cc-name" autoCapitalize="characters" ayuda="Sin tildes, como aparece en tu tarjeta." {...campoT('nombre', sinTildes)} />
                </Bloque>
              ) : (
                <Bloque>
                  <Campo label="Celular registrado en Yape" type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="987654321" {...campoY('celular', formatoCelular)} />
                  <Campo label="Código de aprobación" inputMode="numeric" placeholder="000000" ayuda="Lo encuentras en tu app Yape, en «Código de aprobación»." {...campoY('codigo', formatoCodigoYape)} />
                </Bloque>
              )}
              <p className="text-xs text-n60">Te enviaremos la boleta a tu correo.</p>
              {error && <p role="alert" className="text-xs font-semibold text-error">{error}</p>}
              <BotonPrincipal onClick={pagar} disabled={enviando}>{enviando ? 'Procesando…' : `Pagar ${soles(costoSoles)}`}</BotonPrincipal>
            </>
          )}

          {paso === 'listo' && (
            <>
              <div className="flex flex-col items-center gap-1.5 rounded-[24px] bg-cafe px-5 py-6 text-center text-n0">
                <span className="flex size-12 items-center justify-center rounded-pill bg-verde text-cafe"><Icon name="check" size={26} /></span>
                <p className="mt-1 text-[15px] font-bold">Ahora tienes</p>
                <p className="text-[38px] font-black leading-none text-amarillo">{total} chances</p>
                <p className="text-sm text-n0/80">Para este premio y sorteo.</p>
              </div>
              <Bloque>
                <Fila k="Ya tenías" v={`${actuales} chances`} />
                <Fila k={metodo === 'lanas' ? 'Canjeaste' : 'Compraste'} v={`${cantidad} chances`} />
                {codigo && codigo.regalo > 0 && <Fila k={`Tu código ${codigo.texto} te dio`} v={`${codigo.regalo} chances de regalo`} verde />}
                <div className="flex items-center justify-between border-t border-n10 pt-2 text-[15px] font-extrabold"><span>Total ahora</span><span>{total} chances</span></div>
              </Bloque>
              <div className="flex items-center gap-3 rounded-2xl bg-n0 px-4 py-3">
                {metodo === 'lanas' ? <MonedaLana size={26} /> : <Icon name="tarjeta" size={24} />}
                <div className="flex flex-col">
                  <p className="text-[15px] font-extrabold">{metodo === 'lanas' ? `Usaste ${formatoLanas(costoLanas)} Lanas` : `Pagaste ${soles(costoSoles)}`}</p>
                  <p className="text-xs text-n60">{metodo === 'lanas' ? `Te quedan ${formatoLanas(saldoTras)} Lanas.` : 'Te enviamos la boleta a tu correo.'}</p>
                </div>
              </div>
              <BotonPrincipal onClick={onCerrar}>Listo</BotonPrincipal>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function CodigoPromo({ codigo, onCambio, validar }: { codigo: Codigo | null; onCambio: (c: Codigo | null) => void; validar: (t: string) => Promise<{ codigo?: Codigo; error?: string }> }) {
  const [texto, setTexto] = useState(codigo?.texto ?? '');
  const [error, setError] = useState('');
  const [revisando, setRevisando] = useState(false);
  const aplicar = async () => {
    const k = texto.trim().toUpperCase();
    if (!k) { setError('Escribe tu código.'); return; }
    setRevisando(true);
    const r = await validar(k);
    setRevisando(false);
    if (r.codigo) { onCambio(r.codigo); setError(''); } else setError(r.error ?? 'Este código no es válido o ya venció.');
  };
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-bold">Código promocional (opcional)</p>
      <div className="flex items-stretch gap-2">
        <input value={texto} onChange={(e) => { setTexto(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 20)); if (codigo) onCambio(null); }} placeholder="Ingresa tu código" autoCapitalize="characters" aria-label="Código promocional"
          className="h-12 w-full min-w-0 flex-1 rounded-xl border border-n10 bg-n0 px-4 text-[15px] uppercase outline-none placeholder:normal-case focus:border-cafe" />
        {codigo
          ? <button onClick={() => { onCambio(null); setTexto(''); }} className="h-12 shrink-0 rounded-xl border border-n10 bg-n0 px-4 text-sm font-bold text-cafe">Cambiar</button>
          : <button onClick={aplicar} disabled={revisando} className="h-12 shrink-0 rounded-xl bg-cafe px-4 text-sm font-bold text-fondo disabled:opacity-60">{revisando ? '…' : 'Aplicar'}</button>}
      </div>
      {error && <p className="text-xs font-medium text-error">{error}</p>}
      {codigo
        ? <div className="flex items-center gap-3 rounded-2xl bg-verde/30 px-3.5 py-2.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-pill bg-verde"><Icon name="check" size={18} /></span>
            <p className="flex flex-col text-[13px] leading-[18px]"><b className="text-[14px]">Código aplicado</b>{codigo.regalo > 0 ? `Tu código te da ${codigo.regalo} chances de regalo.` : 'El beneficio se aplica al pagar.'}</p>
          </div>
        : !error && <p className="text-xs text-n60">Aplica tu código para ver tu beneficio.</p>}
    </div>
  );
}

function Total({ total, actuales, cantidad, regalo }: { total: number; actuales: number; cantidad: number; regalo: number }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-n0 px-4 py-3">
      <Icon name="ticket" size={26} className="shrink-0" />
      <div className="flex flex-col">
        <p className="text-[15px] font-extrabold">Tu total será de {total} chances</p>
        <p className="text-xs text-n60">{actuales} actuales + {cantidad} seleccionadas{regalo ? ` + ${regalo} de regalo` : ''}</p>
        <p className="text-xs text-n60">Para este premio y sorteo.</p>
      </div>
    </div>
  );
}

function BotonPrincipal({ children, onClick, disabled }: { children: ReactNode; onClick: () => void; disabled?: boolean }) {
  return <button onClick={onClick} disabled={disabled} className="inline-flex h-14 w-full shrink-0 items-center justify-center rounded-pill bg-amarillo text-[16px] font-extrabold text-cafe disabled:opacity-40">{children}</button>;
}

function Bloque({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-2.5 rounded-2xl bg-n0 p-4">{children}</div>;
}

function Fila({ k, v, verde }: { k: string; v: string; verde?: boolean }) {
  return (
    <div className={cx('flex items-center justify-between gap-3 text-sm', verde && 'font-bold text-verde-texto')}>
      <span className={verde ? '' : 'text-n60'}>{k}</span>
      <span className="text-right font-bold">{v}</span>
    </div>
  );
}

function Contador({ valor, onCambio }: { valor: number; onCambio: (n: number) => void }) {
  const btn = 'flex size-10 items-center justify-center rounded-pill bg-n0 text-xl font-bold disabled:opacity-40';
  return (
    <div className="flex items-center gap-3">
      <button aria-label="Quitar una chance" className={btn} disabled={valor <= 1} onClick={() => onCambio(Math.max(1, valor - 1))}>−</button>
      <span className="w-12 text-center text-[30px] font-black" aria-live="polite">{valor}</span>
      <button aria-label="Sumar una chance" className={btn} onClick={() => onCambio(Math.min(999, valor + 1))}>+</button>
    </div>
  );
}

function Opcion({ activa, onClick, icono, titulo, detalle, deshabilitada, extra }: { activa: boolean; onClick: () => void; icono: ReactNode; titulo: string; detalle: string; deshabilitada?: boolean; extra?: ReactNode }) {
  return (
    <div className={cx('flex flex-col gap-2 rounded-2xl border-2 bg-n0 p-3.5', activa ? 'border-cafe' : 'border-transparent', deshabilitada && 'opacity-60')}>
    <button onClick={onClick} aria-pressed={activa} disabled={deshabilitada} className="flex items-center gap-3 text-left">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-pill bg-n5">{icono}</span>
      <span className="flex flex-1 flex-col gap-0.5">
        <span className="text-[15px] font-extrabold">{titulo}</span>
        <span className="text-[13px] text-n60">{detalle}</span>
      </span>
      <span className={cx('flex size-5 items-center justify-center rounded-pill border-2', activa ? 'border-cafe bg-cafe' : 'border-n40')}>
        {activa && <span className="size-2 rounded-pill bg-amarillo" />}
      </span>
    </button>
    {extra}
    </div>
  );
}

function Campo({ label, ayuda, error, ...rest }: { label: string; ayuda?: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex min-w-0 flex-1 flex-col gap-1.5">
      <span className="text-[13px] font-bold">{label}</span>
      <input {...rest} aria-invalid={!!error} className={cx('h-12 w-full min-w-0 rounded-xl border bg-n0 px-4 text-[15px] tabular-nums outline-none focus:border-cafe', error ? 'border-error' : 'border-n10')} />
      {error ? <span role="alert" className="text-xs font-semibold text-error">{error}</span> : ayuda && <span className="text-xs text-n60">{ayuda}</span>}
    </label>
  );
}
