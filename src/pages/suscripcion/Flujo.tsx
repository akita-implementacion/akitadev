import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { LogoYape, LogosTarjeta } from '../../components/ui/LogosPago';
import { Hoja } from '../../components/ui/Hoja';
import { Icon } from '../../components/ui/Icon';
import { cx } from '../../components/ui/primitives';
import { BENEFICIOS_COMUNES, PERIODOS, PLANES, ahorro, chancesTexto, planPorId, soles, type Periodo } from '../../ref/planes';
import { usePerfil } from '../../ref/demo';
import { fechaNum, sumarMeses } from '../../ref/sorteos';
import { useSesion } from '../../data/sesion';
import { usePlanes } from '../../data/datos';
import { useRecurso, invalidar } from '../../data/recurso';
import { config } from '../../api/config';
import { ApiError, mensajeError } from '../../api/client';
import { authApi, misionesApi, promoApi, suscripcionApi, usuarioApi, utmDeLaUrl } from '../../api/servicios';
import type { ResultadoPago } from '../../api/tipos';
import { tokenizarTarjeta } from '../../api/kushki';
import { idDePlan } from '../../data/adaptadores';
import { asset } from '../../data/assets';
import { erroresTarjeta, erroresYape, formatoTarjeta, formatoVenc, sinTildes, soloDigitos, type DatosTarjeta } from '../../components/pago/validacion';

type Metodo = 'tarjeta' | 'yape';
type Datos = { nombres: string; apellidos: string; tipoDoc: 'DNI' | 'CE' | 'Pasaporte'; doc: string; nacimiento: string; celular: string; correo: string; clave: string };
const DATOS_VACIOS: Datos = { nombres: '', apellidos: '', tipoDoc: 'DNI', doc: '', nacimiento: '', celular: '', correo: '', clave: '' };
const DATOS_DEMO: Datos = { nombres: 'Camila Andrea', apellidos: 'Rojas Pérez', tipoDoc: 'DNI', doc: '45678912', nacimiento: '12/05/1994', celular: '987654321', correo: 'camila.r@correo.com', clave: 'Akita2026' };
const TIPO_DOC = { DNI: 'DNI', CE: 'FOREIGN_ID_CARD', Pasaporte: 'PASSPORT' } as const;
const DOC_DE_API: Record<string, Datos['tipoDoc']> = { DNI: 'DNI', FOREIGN_ID_CARD: 'CE', PASSPORT: 'Pasaporte' };

function useCondiciones() {
  const { suscripcion: s } = useSesion();
  const precios = usePlanes();
  const plan = PLANES.find((p) => p.nombre === s.plan) ?? PLANES[1];
  const per = PERIODOS.find((p) => p.id === s.periodo)!;
  const metodo: Metodo = s.periodo === 'mensual' ? 'tarjeta' : s.metodo;
  const precio = precios.find((p) => p.nombre === s.plan)?.precios[s.periodo] ?? plan.precios[s.periodo];
  const recurrente = s.periodo === 'mensual' || (metodo === 'tarjeta' && s.renovacion);
  const vence = sumarMeses(new Date(), per.meses);
  const meses = per.meses === 1 ? '1 mes' : `${per.meses} meses`;
  const textoRenovacion = s.periodo === 'mensual'
    ? 'Tu plan se renueva automáticamente cada mes. Puedes cancelar la renovación desde Mi cuenta.'
    : recurrente ? `Tu plan se renovará por otro periodo de ${meses}. Puedes cancelar la renovación desde Mi cuenta.`
      : `Pagas una sola vez por ${meses}. Tu plan estará activo hasta el ${fechaNum(vence)}.`;
  return { s, plan, per, metodo, precio, recurrente, vence, meses, textoRenovacion, total: soles(precio), sufijoPrecio: s.periodo === 'mensual' ? 'al mes' : `por ${meses}` };
}

function Pasos({ actual }: { actual: 1 | 2 | 3 | 4 }) {
  const nombres = ['Plan', 'Cuenta', 'Pago', 'Confirmar'];
  return (
    <div className="flex w-full flex-col gap-1.5">
      <p className="text-[13px] font-bold text-n60">Paso {actual} de 4</p>
      <div className="flex gap-1.5">{nombres.map((_, i) => <span key={i} className={cx('h-1.5 flex-1 rounded-[3px]', i < actual ? 'bg-amarillo' : 'bg-n10')} />)}</div>
      <div className="flex gap-1.5 text-xs font-semibold">{nombres.map((n, i) => <span key={n} className={cx('flex-1', i < actual ? 'text-cafe' : 'text-n60')}>{n}</span>)}</div>
    </div>
  );
}

export function Campo({ label, ayuda, error, derecha, ...rest }: { label: string; ayuda?: ReactNode; error?: ReactNode; derecha?: ReactNode } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex min-w-0 flex-1 flex-col gap-1.5">
      <span className="text-[13px] font-semibold text-cafe">{label}</span>
      <span className="relative flex">
        <input {...rest} aria-invalid={!!error}
          className={cx('h-14 w-full min-w-0 rounded-2xl border px-4 text-base text-cafe outline-none placeholder:text-n40 focus:border-cafe', !!derecha && 'pr-[92px]', error ? 'border-error bg-[#fee2e2]' : 'border-n10 bg-n0')} />
        {derecha && <span className="absolute inset-y-0 right-2 flex items-center">{derecha}</span>}
      </span>
      {(error || ayuda) && <span className={cx('text-xs font-medium leading-[17px]', error ? 'text-error' : 'text-n60')}>{error || ayuda}</span>}
    </label>
  );
}

const BtnPrimario = ({ children, onClick, disabled }: { children: ReactNode; onClick: () => void; disabled?: boolean }) => (
  <button onClick={onClick} disabled={disabled}
    className="inline-flex h-14 w-full items-center justify-center gap-2.5 whitespace-nowrap rounded-pill bg-amarillo px-6 text-[15px] font-bold text-cafe disabled:opacity-60">
    {children}
  </button>
);

function CambiarPlan({ etiqueta = 'Cambiar' }: { etiqueta?: string }) {
  const { suscripcion: s, actualizar } = useSesion();
  const precios = usePlanes();
  const [abierto, setAbierto] = useState(false);
  const cerrar = useCallback(() => setAbierto(false), []);
  return (
    <>
      <button onClick={() => setAbierto(true)} className="shrink-0 text-[14px] font-bold text-cafe underline underline-offset-2">{etiqueta}</button>
      <Hoja abierto={abierto} onCerrar={cerrar} titulo="Elige tu plan" subtitulo="Puedes cambiarlo sin perder tus datos.">
        <div className="flex gap-1.5 rounded-pill bg-n0 p-1.5" role="tablist">
          {PERIODOS.map((p) => (
            <button key={p.id} role="tab" aria-selected={s.periodo === p.id} onClick={() => actualizar({ periodo: p.id })}
              className={cx('h-10 flex-1 rounded-pill text-sm font-bold', s.periodo === p.id ? 'bg-cafe text-amarillo' : 'text-cafe')}>{p.label}</button>
          ))}
        </div>
        <div className="flex flex-col gap-2.5">
          {PLANES.map((pl) => {
            const pr = { ...pl, precios: precios.find((x) => x.nombre === pl.nombre)?.precios ?? pl.precios };
            const pct = ahorro(pr, s.periodo);
            return (
              <button key={pl.id} onClick={() => { actualizar({ plan: pl.nombre as 'LANITA' | 'LANOTA' | 'LANAZA' }); setAbierto(false); }} aria-pressed={s.plan === pl.nombre}
                className={cx('flex items-center gap-3 rounded-2xl border-2 bg-n0 p-4 text-left', s.plan === pl.nombre ? 'border-cafe' : 'border-transparent')}>
                <img src={asset(pl.imagen)} alt="" className="size-12 object-contain" />
                <span className="flex flex-1 flex-col">
                  <span className="text-[15px] font-extrabold">{pl.nombre} · {chancesTexto(pl.chances)}</span>
                  <span className="text-[13px] text-n60">{soles(pr.precios[s.periodo])} {PERIODOS.find((p) => p.id === s.periodo)!.sufijo}{pct ? ` · ahorras ${pct} %` : ''}</span>
                </span>
              </button>
            );
          })}
        </div>
      </Hoja>
    </>
  );
}

function ResumenCompacto({ pago }: { pago?: boolean }) {
  const c = useCondiciones();
  const renov = pago ? c.textoRenovacion : c.s.periodo === 'mensual' ? 'Renovación automática mensual' : 'Renovación automática opcional: la eliges al pagar';
  return (
    <div className="flex flex-col gap-1 rounded-2xl bg-n0 px-4 py-3 text-cafe shadow-card">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[15px] font-extrabold">{c.plan.nombre} · {c.per.label}</p>
        <CambiarPlan />
      </div>
      {pago
        ? <p className="flex items-baseline justify-between gap-2"><span className="text-[14px]">Total a pagar hoy</span><span className="whitespace-nowrap text-[22px] font-black">{c.total}</span></p>
        : <p className="whitespace-nowrap text-[22px] font-black leading-tight">{c.total} <span className="text-[14px] font-semibold text-n60">{c.sufijoPrecio}</span></p>}
      <p className="text-[13px] text-n60">{chancesTexto(c.plan.chances)} · Incluye IGV</p>
      <p className="flex items-start gap-1.5 text-[13px] font-semibold leading-[18px]"><Icon name="info" size={15} className="mt-[1px] shrink-0" />{renov}</p>
      {c.s.premio && <p className="flex items-center gap-1.5 text-[13px] leading-[18px] text-n60"><Icon name="premios" size={15} className="shrink-0" />Participas por la {c.s.premio.nombre}{c.s.premio.sorteo ? ` (${c.s.premio.sorteo})` : ''} y por todos los premios de cada miércoles</p>}
    </div>
  );
}

function Cabecera({ titulo, sub, oveja }: { titulo: string; sub?: ReactNode; oveja?: boolean }) {
  const navigate = useNavigate();
  return (
    <div className="relative flex items-start gap-2">
      <button onClick={() => navigate(-1)} aria-label="Volver" className="-ml-2 flex size-10 shrink-0 items-center justify-center text-cafe"><Icon name="chevron" className="rotate-180" /></button>
      <div className="flex min-w-0 flex-1 flex-col gap-1 pt-1">
        <h1 className="text-[26px] font-extrabold leading-tight text-cafe lg:text-[30px]">{titulo}</h1>
        {sub}
      </div>
      {oveja && <img src={asset('img/oveja-06.webp')} alt="" className="-mb-3 -mt-2 h-[84px] w-auto shrink-0 object-contain" />}
    </div>
  );
}

function Contenedor({ children }: { children: ReactNode }) {
  return <div className="mx-auto flex max-w-[600px] flex-col gap-[18px] px-6 pb-12 pt-5 lg:my-10 lg:rounded-[32px] lg:bg-n0/60 lg:p-10">{children}</div>;
}

const Aviso = ({ children }: { children: ReactNode }) => <p role="alert" className="rounded-xl bg-rosa-claro px-3.5 py-2.5 text-[13px] font-semibold text-cafe">{children}</p>;

const codigoValido = (c: string) => /^[A-Z0-9-]{4,20}$/i.test(c.trim());
function BloqueReferido({ enPago }: { enPago?: boolean }) {
  const { suscripcion: s, actualizar, logueado, modoMock } = useSesion();
  const [abierto, setAbierto] = useState(!enPago || !!s.referido);
  const [error, setError] = useState('');
  const [revisando, setRevisando] = useState(false);
  if (s.referidoAplicado && s.referido) return (
    <div className="flex flex-col gap-1 rounded-2xl bg-amarillo/20 px-4 py-3">
      <p className="flex items-center justify-between gap-2 text-[14px] font-bold text-cafe"><span className="flex items-center gap-2"><Icon name="check" size={18} />{enPago ? `Referido aplicado: ${s.referido}` : 'Código aplicado'}</span>
        <button onClick={() => actualizar({ referido: '', referidoAplicado: false })} className="text-[13px] font-semibold underline">Quitar</button></p>
      <p className="text-[13px] leading-[18px] text-cafe/80">{enPago ? 'Tú y quien te invitó recibirán la recompensa cuando actives tu plan.' : 'Activa tu plan para que ambos reciban la recompensa.'}</p>
    </div>
  );
  if (!abierto) return <button onClick={() => setAbierto(true)} className="self-start text-[14px] font-bold text-cafe underline underline-offset-2">¿Tienes un código de referido?</button>;
  const aplicar = async () => {
    const codigo = s.referido.trim().toUpperCase();
    if (!codigoValido(codigo)) { setError('No encontramos ese código. Revísalo o continúa sin código.'); return; }
    if (logueado && !modoMock) {
      setRevisando(true);
      const r = await misionesApi.validarReferido(codigo).catch(() => null);
      setRevisando(false);
      if (r && r.valid === false) { setError('No encontramos ese código. Revísalo o continúa sin código.'); return; }
    }
    setError(''); actualizar({ referido: codigo, referidoAplicado: true });
  };
  return (
    <div className="flex flex-col gap-2.5 rounded-2xl bg-amarillo/20 px-4 py-3.5">
      <p className="text-[15px] font-extrabold text-cafe">¿Te invitó alguien?</p>
      <div className="flex items-start gap-2">
        <Campo label="Código de referido (opcional)" placeholder="YK-…" autoCapitalize="characters" maxLength={20} value={s.referido} error={error || undefined}
          onChange={(e) => actualizar({ referido: e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ''), referidoAplicado: false })} />
        <button onClick={aplicar} disabled={revisando} className="mt-[27px] h-14 shrink-0 rounded-2xl bg-cafe px-4 text-sm font-bold text-fondo disabled:opacity-60">{revisando ? '…' : 'Aplicar'}</button>
      </div>
      <p className="text-[13px] leading-[18px] text-cafe/80">Tú y quien te invitó recibirán la recompensa cuando actives tu plan.</p>
    </div>
  );
}

const CONSENTIMIENTOS = [
  { t: '¡Sí! Acepto todo y quiero disfrutar sin interrupciones', info: 'Marca de una vez las cuatro autorizaciones de abajo.' },
  { t: '¡Sí! Quiero ser el primero en enterarme de ofertas irresistibles, novedades y beneficios exclusivos de Mall360 y sus marcas asociadas.', info: 'Te enviaremos novedades y ofertas por correo, SMS o WhatsApp. Puedes darte de baja cuando quieras.' },
  { t: '¡Sí! Acepto que MALL 360 comparta mis datos con sus aliados para más beneficios.', info: 'Tus datos se comparten con los aliados comerciales de Mall360 para ofrecerte beneficios. Es opcional.' },
  { t: '¡Sí! Quiero recibir promociones personalizadas de Mall360 adaptadas a mis intereses.', info: 'Usamos tus preferencias para mostrarte promociones relevantes. Es opcional.' },
  { t: '¡Sí! Acepto la Política de Privacidad y los Términos y Condiciones.', info: 'Es necesaria para crear tu cuenta.', obligatorio: true },
];

function Consentimientos({ error }: { error?: string }) {
  const { suscripcion: s, actualizar } = useSesion();
  const c = s.consentimientos;
  const [info, setInfo] = useState<number | null>(null);
  const marcar = (i: number, v: boolean) => {
    const n = [...c];
    if (i === 0) n.fill(v); else { n[i] = v; n[0] = n.slice(1).every(Boolean); }
    actualizar({ consentimientos: n });
  };
  return (
    <div className="flex flex-col gap-1 rounded-2xl bg-n0 p-3" id="consentimientos" tabIndex={-1}>
      {CONSENTIMIENTOS.map((k, i) => (
        <div key={k.t} className={cx('flex flex-col', i === 0 && 'mb-1 rounded-xl bg-amarillo/35 px-2.5 ring-1 ring-amarillo')}>
          <div className={cx('flex items-start gap-2.5', i === 0 ? 'py-3' : 'py-1.5')}>
            <input id={`cons-${i}`} type="checkbox" checked={c[i]} onChange={(e) => marcar(i, e.target.checked)} className="mt-0.5 size-5 shrink-0 accent-[#211402]" />
            <label htmlFor={`cons-${i}`} className={cx('flex-1', i === 0 ? 'text-[15px] font-extrabold leading-5 text-cafe' : k.obligatorio ? 'text-[13px] leading-[19px] text-cafe' : 'text-[12px] leading-[17px] text-n60')}>
              {k.obligatorio
                ? <>¡Sí! Acepto la <a href="#" onClick={(e) => e.preventDefault()} className="font-bold underline">Política de Privacidad</a> y los <a href="#" onClick={(e) => e.preventDefault()} className="font-bold underline">Términos y Condiciones</a>. <span className="text-error">*</span></>
                : k.t}
            </label>
            <button onClick={() => setInfo(info === i ? null : i)} aria-label="Más información" aria-expanded={info === i} className="flex size-7 shrink-0 items-center justify-center text-n60"><Icon name="info" size={18} /></button>
          </div>
          {info === i && <p className="mb-1 ml-[30px] rounded-xl bg-n5 px-3 py-2 text-[12px] leading-[17px] text-n60">{k.info}</p>}
        </div>
      ))}
      {error && <p className="px-1 pt-1 text-xs font-medium text-error">{error}</p>}
    </div>
  );
}

const formatoFecha = (v: string) => { const d = v.replace(/\D/g, '').slice(0, 8); return [d.slice(0, 2), d.slice(2, 4), d.slice(4)].filter(Boolean).join('/'); };
function edadDe(f: string) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(f); if (!m) return null;
  const d = new Date(+m[3], +m[2] - 1, +m[1]);
  if (d.getDate() !== +m[1] || d.getMonth() !== +m[2] - 1 || +m[3] < 1900) return null;
  const hoy = new Date(); let e = hoy.getFullYear() - d.getFullYear();
  if (hoy < new Date(hoy.getFullYear(), d.getMonth(), d.getDate())) e--;
  return e;
}
const fechaApi = (f: string) => { const [d, m, a] = f.split('/'); return `${a}-${m}-${d}T05:00:00.000Z`; };

function SelectorFecha({ valor, onElegir }: { valor: string; onElegir: (v: string) => void }) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(valor);
  const [d, setD] = useState(m?.[1] ?? ''); const [me, setMe] = useState(m?.[2] ?? ''); const [a, setA] = useState(m?.[3] ?? '');
  const anioMax = new Date().getFullYear() - 18;
  const anios = Array.from({ length: 83 }, (_, i) => String(anioMax - i));
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic'];
  const listo = (nd: string, nm: string, na: string) => { if (nd && nm && na) onElegir(`${nd}/${nm}/${na}`); };
  const sel = 'h-12 flex-1 rounded-xl border border-n10 bg-n0 px-2 text-[15px] text-cafe';
  return (
    <div className="flex gap-2 rounded-2xl bg-n5 p-2.5">
      <select aria-label="Día" value={d} onChange={(e) => { setD(e.target.value); listo(e.target.value, me, a); }} className={sel}><option value="">Día</option>{Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0')).map((x) => <option key={x}>{x}</option>)}</select>
      <select aria-label="Mes" value={me} onChange={(e) => { setMe(e.target.value); listo(d, e.target.value, a); }} className={sel}><option value="">Mes</option>{meses.map((x, i) => <option key={x} value={String(i + 1).padStart(2, '0')}>{x}</option>)}</select>
      <select aria-label="Año" value={a} onChange={(e) => { setA(e.target.value); listo(d, me, e.target.value); }} className={sel}><option value="">Año</option>{anios.map((x) => <option key={x}>{x}</option>)}</select>
    </div>
  );
}

function validarDatos(x: Datos, conCuenta: boolean) {
  const e: Partial<Record<keyof Datos, ReactNode>> = {};
  if (!x.nombres.trim()) e.nombres = 'Ingresa tus nombres.';
  if (!x.apellidos.trim()) e.apellidos = 'Ingresa tus apellidos.';
  if (x.tipoDoc === 'DNI' && !/^\d{8}$/.test(x.doc)) e.doc = 'Ingresa los 8 dígitos de tu DNI.';
  if (x.tipoDoc === 'CE' && !/^\d{9,12}$/.test(x.doc)) e.doc = 'El carné de extranjería tiene de 9 a 12 dígitos.';
  if (x.tipoDoc === 'Pasaporte' && !/^[A-Z0-9]{6,12}$/i.test(x.doc)) e.doc = 'El pasaporte tiene de 6 a 12 letras o números.';
  const edad = edadDe(x.nacimiento);
  if (!x.nacimiento) e.nacimiento = 'Ingresa tu fecha de nacimiento (DD/MM/AAAA).';
  else if (edad === null) e.nacimiento = 'Escribe una fecha válida (DD/MM/AAAA).'; else if (edad < 18) e.nacimiento = 'Debes ser mayor de 18 años.';
  if (!/^9\d{8}$/.test(x.celular)) e.celular = 'Ingresa los 9 dígitos de tu celular (empieza con 9).';
  if (conCuenta && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(x.correo)) e.correo = 'Ingresa un correo válido, por ejemplo nombre@correo.com.';
  if (conCuenta && (x.clave.length < 8 || !/[A-ZÁÉÍÓÚÑ]/.test(x.clave) || !/\d/.test(x.clave))) e.clave = 'Tu contraseña aún no cumple los requisitos.';
  return e;
}

function useParametrosDelPlan() {
  const [q] = useSearchParams();
  const { actualizar } = useSesion();
  const listo = useRef(false);
  useEffect(() => {
    if (listo.current) return; listo.current = true;
    const p: Parameters<typeof actualizar>[0] = {};
    if (q.get('plan')) p.plan = planPorId(q.get('plan')).nombre as 'LANITA' | 'LANOTA' | 'LANAZA';
    const per = q.get('periodo') as Periodo | null;
    if (per && PERIODOS.some((x) => x.id === per)) p.periodo = per;
    if (q.get('premio')) p.premio = { nombre: q.get('premio')!, sorteo: q.get('sorteo') ?? '' };
    if (q.get('ref')) p.referido = q.get('ref')!.toUpperCase();
    if (Object.keys(p).length) actualizar(p);
  }, [q, actualizar]);
}

export function Cuenta() {
  useParametrosDelPlan();
  const { logueado, perfilPendiente } = useSesion();
  const completarPerfil = !!(useLocation().state as { completarPerfil?: boolean } | null)?.completarPerfil || perfilPendiente;
  if (!logueado) return <Registro />;
  return completarPerfil ? <Registro conSesion /> : <CompletarDatos />;
}

function Registro({ conSesion }: { conSesion?: boolean }) {
  const { suscripcion: s, actualizar, modoMock, iniciarSesion, recargarMe } = useSesion();
  const navigate = useNavigate();
  const [datos, setDatos] = useState<Datos>(modoMock ? DATOS_DEMO : { ...DATOS_VACIOS, correo: s.correo });
  const [tocado, setTocado] = useState<Partial<Record<keyof Datos | 'cons', boolean>>>({});
  const [verClave, setVerClave] = useState(false);
  const [calendario, setCalendario] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [existe, setExiste] = useState(false);
  const [error, setError] = useState('');
  const errores = validarDatos(datos, !conSesion);
  const plan = PLANES.find((p) => p.nombre === s.plan)!;
  const volver = `/suscribirse/cuenta?plan=${plan.id}&periodo=${s.periodo}${s.referido ? `&ref=${s.referido}` : ''}`;
  const login = `/ingresar?volver=${encodeURIComponent(volver)}`;
  if (existe) errores.correo = <>Ya existe una cuenta con este correo. <Link to={login} className="font-bold underline">Inicia sesión</Link> o <Link to={`${login}&recuperar=1`} className="font-bold underline">recupera tu contraseña</Link>.</>;
  const errorCons = !conSesion && !s.consentimientos[4] ? 'Para continuar, acepta la Política de Privacidad y los Términos y Condiciones.' : undefined;
  const d = (k: keyof Datos, fmt?: (v: string) => string) => ({
    id: `campo-${k}`, value: datos[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => { setDatos({ ...datos, [k]: fmt ? fmt(e.target.value) : e.target.value }); if (k === 'correo') setExiste(false); },
    onBlur: () => setTocado((t) => ({ ...t, [k]: true })),
    error: tocado[k] ? errores[k] : undefined,
  });
  const reglas = [
    { t: 'Mínimo 8 caracteres', ok: datos.clave.length >= 8 },
    { t: 'Una mayúscula', ok: /[A-ZÁÉÍÓÚÑ]/.test(datos.clave) },
    { t: 'Un número', ok: /\d/.test(datos.clave) },
  ];
  const continuar = async () => {
    if (enviando) return;
    setError('');
    const orden: (keyof Datos)[] = ['nombres', 'apellidos', 'doc', 'nacimiento', 'celular', 'correo', 'clave'];
    const primero = orden.find((k) => errores[k]);
    if (primero || errorCons) {
      setTocado({ nombres: true, apellidos: true, doc: true, nacimiento: true, celular: true, correo: true, clave: true, cons: true });
      const el = document.getElementById(primero ? `campo-${primero}` : 'consentimientos');
      el?.focus(); el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setEnviando(true);
    try {
      if (!modoMock) {
        const utmParams = utmDeLaUrl();
        if (!conSesion) {
          const c = s.consentimientos;
          await authApi.registrar({
            email: datos.correo.trim(), password: datos.clave, utmParams,
            consentSubscribeOffers: c[1], consentShareDataWithPartners: c[2],
            consentReceivePersonalizedPromotions: c[3], consentAcceptedPrivacyPolicy: c[4],
          });
          await iniciarSesion(datos.correo.trim(), datos.clave);
        }
        if (s.referido) {
          const r = await misionesApi.validarReferido(s.referido).catch(() => null);
          if (r && r.valid === false) { actualizar({ referido: '', referidoAplicado: false }); setError('El código de referido no es válido: lo quitamos. Puedes continuar sin él.'); setEnviando(false); return; }
        }
        const [paterno, ...materno] = datos.apellidos.trim().split(/\s+/);
        await usuarioApi.datosPersonales({
          firstName: datos.nombres.trim(), paternalSurname: paterno, maternalSurname: materno.join(' '),
          documentType: TIPO_DOC[datos.tipoDoc], documentNumber: datos.doc, phone: datos.celular, utmParams,
          birthDate: fechaApi(datos.nacimiento),
        });
        await recargarMe().catch(() => {});
        invalidar('usuario'); invalidar('misiones');
      }
      actualizar({ nombre: datos.nombres.split(' ')[0], correo: datos.correo, referidoAplicado: !!s.referido });
      navigate('/suscribirse/pago');
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) { setExiste(true); setTocado((t) => ({ ...t, correo: true })); document.getElementById('campo-correo')?.focus(); }
      else setError(mensajeError(e));
      setEnviando(false);
    }
  };
  return (
    <Contenedor>
      <Cabecera titulo={conSesion ? 'Completa tus datos' : 'Crea tu cuenta'} oveja
        sub={conSesion ? <p className="text-[14px] text-n60">Para activar tu plan necesitamos tus datos personales.</p>
          : <p className="text-[14px] text-n60">¿Ya tienes cuenta? <Link to={login} className="font-bold text-cafe underline underline-offset-2">Inicia sesión</Link></p>} />
      <Pasos actual={2} />
      <ResumenCompacto />

      <p className="pt-1 text-base font-extrabold text-cafe">Datos personales</p>
      <div className="flex flex-col gap-3 sm:flex-row"><Campo label="Nombres" autoComplete="given-name" maxLength={60} {...d('nombres')} /><Campo label="Apellidos" autoComplete="family-name" maxLength={60} {...d('apellidos')} /></div>
      <div className="flex items-start gap-3">
        <label className="flex w-[124px] shrink-0 flex-col gap-1.5"><span className="text-[13px] font-semibold text-cafe">Documento</span>
          <select value={datos.tipoDoc} onChange={(e) => setDatos({ ...datos, tipoDoc: e.target.value as Datos['tipoDoc'], doc: '' })} className="h-14 rounded-2xl border border-n10 bg-n0 px-3 text-base text-cafe">
            <option value="DNI">DNI</option><option value="CE">CE</option><option value="Pasaporte">Pasaporte</option>
          </select></label>
        <Campo label="Número de documento" inputMode={datos.tipoDoc === 'Pasaporte' ? 'text' : 'numeric'} maxLength={datos.tipoDoc === 'DNI' ? 8 : 12}
          {...d('doc', (v) => datos.tipoDoc === 'Pasaporte' ? v.replace(/[^a-z0-9]/gi, '').toUpperCase() : v.replace(/\D/g, ''))} />
      </div>
      <div className="flex flex-col gap-2">
        <Campo label="Fecha de nacimiento" inputMode="numeric" placeholder="DD/MM/AAAA" autoComplete="bday" maxLength={10} ayuda="Debes ser mayor de 18 años."
          derecha={<button type="button" onClick={() => setCalendario((v) => !v)} aria-label="Elegir en el calendario" aria-expanded={calendario} className="flex size-11 items-center justify-center rounded-xl text-cafe"><Icon name="calendario" size={22} /></button>}
          {...d('nacimiento', formatoFecha)} />
        {calendario && <SelectorFecha valor={datos.nacimiento} onElegir={(v) => { setDatos({ ...datos, nacimiento: v }); setTocado((t) => ({ ...t, nacimiento: true })); }} />}
      </div>
      <p className="pt-1 text-base font-extrabold text-cafe">Contacto</p>
      <div className="flex items-start gap-2">
        <span className="mt-[27px] flex h-14 shrink-0 items-center rounded-2xl border border-n10 bg-n5 px-3.5 text-base font-semibold text-cafe">+51</span>
        <Campo label="Celular" type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="987 654 321" maxLength={9} {...d('celular', (v) => v.replace(/\D/g, ''))} />
      </div>
      {!conSesion && (
        <>
          <Campo label="Correo electrónico" type="email" inputMode="email" autoComplete="email" maxLength={80} ayuda="Aquí te llegará tu comprobante." {...d('correo', (v) => v.trim())}
            error={(tocado.correo || existe) ? errores.correo : undefined} />
          <p className="pt-1 text-base font-extrabold text-cafe">Seguridad</p>
          <Campo label="Contraseña" type={verClave ? 'text' : 'password'} autoComplete="new-password" maxLength={64} {...d('clave')}
            derecha={<button type="button" onClick={() => setVerClave((v) => !v)} className="h-10 rounded-xl px-3 text-[13px] font-bold text-cafe underline">{verClave ? 'Ocultar' : 'Mostrar'}</button>} />
          <div className="-mt-1.5 flex flex-wrap gap-x-4 gap-y-1 px-1 text-[13px]">
            {reglas.map((r) => <p key={r.t} className={cx('flex items-center gap-1.5', r.ok ? 'font-semibold text-verde-texto' : 'text-n60')}><Icon name="check" size={14} />{r.t}</p>)}
          </div>
        </>
      )}
      <BloqueReferido />
      {!conSesion && <Consentimientos error={tocado.cons ? errorCons : undefined} />}
      {error && <Aviso>{error}</Aviso>}
      <BtnPrimario onClick={continuar} disabled={enviando}>{enviando ? 'Continuando…' : <>Continuar al pago <Icon name="flecha" size={20} /></>}</BtnPrimario>
    </Contenedor>
  );
}

function CompletarDatos() {
  const { modoMock, logueado } = useSesion();
  const { vencido } = usePerfil();
  const navigate = useNavigate();
  const r = useRecurso('usuario:perfil', usuarioApi.perfil, null, null, logueado && !modoMock);
  const u = r.data;
  const [celular, setCelular] = useState('');
  const [tocado, setTocado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const falta = !modoMock && !!u && !/^9\d{8}$/.test((u.phone ?? '').replace(/\D/g, ''));
  const errCel = !/^9\d{8}$/.test(celular) ? 'Ingresa los 9 dígitos de tu celular (empieza con 9).' : undefined;
  if (r.cargando && !u) return <div className="min-h-[60vh]" aria-busy="true" />;
  if (vencido && !falta) return <Navigate to="/suscribirse/pago" replace />;
  const nombre = u?.firstName ?? '';
  const continuar = async () => {
    if (enviando) return;
    if (falta && errCel) { setTocado(true); document.getElementById('campo-celular')?.focus(); return; }
    setEnviando(true); setError('');
    try {
      if (falta && u) {
        await usuarioApi.datosPersonales({
          firstName: u.firstName ?? '', paternalSurname: u.paternalSurname ?? '', maternalSurname: u.maternalSurname ?? '',
          documentType: (u.documentType as 'DNI' | 'PASSPORT' | 'FOREIGN_ID_CARD') ?? 'DNI', documentNumber: u.documentNumber ?? '',
          phone: celular, birthDate: u.birthDate ?? '', utmParams: utmDeLaUrl(),
        });
        invalidar('usuario');
      }
      navigate('/suscribirse/pago');
    } catch (e) { setError(mensajeError(e)); setEnviando(false); }
  };
  return (
    <Contenedor>
      <Cabecera titulo="Completa tus datos" oveja sub={<div className="flex flex-col items-start gap-1.5">
        <span className="inline-flex items-center gap-1.5 rounded-pill bg-verde/30 px-2.5 py-1 text-[12px] font-bold text-cafe"><Icon name="check" size={14} />Sesión iniciada</span>
        <p className="text-[14px] leading-5 text-n60">{nombre ? `Hola, ${nombre}. ` : ''}Ya tienes una cuenta AKITÁ: usamos tus datos guardados y solo te pedimos lo que falta.</p></div>} />
      <Pasos actual={2} />
      <ResumenCompacto />
      {u && (
        <div className="flex flex-col gap-1 rounded-2xl bg-n0 px-4 py-3 text-[14px] text-cafe">
          <p className="text-[12px] font-bold tracking-[0.8px] text-n60">TU CUENTA</p>
          <p className="font-bold">{[u.firstName, u.paternalSurname, u.maternalSurname].filter(Boolean).join(' ')}</p>
          <p className="text-n60">{DOC_DE_API[u.documentType ?? ''] ?? u.documentType ?? ''} •••• {(u.documentNumber ?? '').slice(-4)} · {u.email}</p>
        </div>
      )}
      {falta && (
        <>
          <p className="text-base font-extrabold text-cafe">Nos falta un dato</p>
          <div className="flex items-start gap-2">
            <span className="mt-[27px] flex h-14 shrink-0 items-center rounded-2xl border border-n10 bg-n5 px-3.5 text-base font-semibold text-cafe">+51</span>
            <Campo id="campo-celular" label="Celular" type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="987 654 321" maxLength={9} value={celular}
              onChange={(e) => setCelular(e.target.value.replace(/\D/g, ''))} onBlur={() => setTocado(true)} error={tocado ? errCel : undefined} />
          </div>
        </>
      )}
      <BloqueReferido />
      {error && <Aviso>{error}</Aviso>}
      <BtnPrimario disabled={enviando} onClick={continuar}>{enviando ? 'Continuando…' : <>Continuar al pago <Icon name="flecha" size={20} /></>}</BtnPrimario>
    </Contenedor>
  );
}

function CodigoPromo() {
  const { suscripcion: s, actualizar, modoMock } = useSesion();
  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState('');
  const [revisando, setRevisando] = useState(false);
  if (s.promoId && s.promoTexto) return (
    <div className="flex flex-col gap-1 rounded-2xl bg-verde/25 px-4 py-3 text-cafe">
      <p className="flex items-center justify-between gap-2 text-[14px] font-bold"><span className="flex items-center gap-2"><Icon name="check" size={18} />Código {s.promoTexto} aplicado</span>
        <button onClick={() => actualizar({ promoId: undefined, promoTexto: undefined, promoDetalle: undefined })} className="text-[13px] font-semibold underline">Quitar</button></p>
      <p className="text-[13px] leading-[18px]">{s.promoDetalle || 'El beneficio del código se aplica cuando tu plan quede activo. El importe no cambia.'}</p>
    </div>
  );
  const aplicar = async () => {
    const k = codigo.trim().toUpperCase();
    if (!k) { setError('Escribe tu código.'); return; }
    if (modoMock) {
      if (k === 'CHANCES50') { actualizar({ promoId: 'demo', promoTexto: k, promoDetalle: 'Ganas +50 chances adicionales para los sorteos cuando tu plan quede activo. El importe no cambia.' }); setError(''); }
      else setError('Este código no es válido o ya venció. Revísalo e inténtalo otra vez.');
      return;
    }
    setRevisando(true);
    try {
      const r = await promoApi.validar({ code: k, applicationContext: 'SUBSCRIPTION' });
      if ((r.isValid ?? r.valid) !== false && r.promoCode?.id) { actualizar({ promoId: r.promoCode.id, promoTexto: k, promoDetalle: r.message }); setError(''); }
      else setError(r.message || 'Este código no es válido o ya venció. Revísalo e inténtalo otra vez.');
    } catch (e) { setError(mensajeError(e)); } finally { setRevisando(false); }
  };
  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-n0 px-4 py-3.5 shadow-card">
      <p className="flex items-center gap-2 text-[15px] font-extrabold text-cafe"><Icon name="cupon" size={20} />¿Tienes un código promocional?</p>
      <div className="flex items-start gap-2">
        <Campo label="Código (opcional)" placeholder="Ej. CHANCES50" autoCapitalize="characters" maxLength={20} value={codigo} onChange={(e) => setCodigo(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ''))} error={error || undefined} />
        <button onClick={aplicar} disabled={revisando} className="mt-[27px] h-14 shrink-0 rounded-2xl bg-cafe px-4 text-sm font-bold text-fondo disabled:opacity-60">{revisando ? '…' : 'Aplicar'}</button>
      </div>
    </div>
  );
}

type Tarjeta = DatosTarjeta;

export function Pago() {
  const c = useCondiciones();
  const { actualizar, modoMock, logueado, pago } = useSesion();
  const navigate = useNavigate();
  const { periodo, renovacion } = c.s;
  const [tarjeta, setTarjeta] = useState<Tarjeta>({ numero: '', venc: '', cvv: '', nombre: '' });
  const [yape, setYape] = useState({ celular: '', codigo: '' });
  const [tocado, setTocado] = useState<Record<string, boolean>>({});
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const et = erroresTarjeta(tarjeta); const ey = erroresYape(yape);
  const yapeDisponible = periodo !== 'mensual';
  const pruebas = modoMock || config.kushki.test;
  if (!modoMock && !logueado) return <Navigate to="/suscribirse/cuenta" replace />;
  const opcion = (id: Metodo, titulo: string, detalle: string, disponible: boolean) => (
    <button key={id} onClick={() => disponible && actualizar({ metodo: id })} disabled={!disponible} aria-pressed={c.metodo === id}
      className={cx('flex items-center gap-3 rounded-2xl border bg-n0 px-4 py-3.5 text-left', c.metodo === id ? 'border-2 border-cafe' : 'border-n10', !disponible && 'opacity-60')}>
      <span className={cx('flex size-[22px] shrink-0 items-center justify-center rounded-full border-2', c.metodo === id ? 'border-cafe' : 'border-n40')}>{c.metodo === id && <span className="size-2.5 rounded-full bg-cafe" />}</span>
      <span className="flex-1"><span className="block text-[15px] font-bold text-cafe">{titulo}</span><span className="text-[13px] leading-[18px] text-n60">{detalle}</span></span>
      {id === 'tarjeta' ? <LogosTarjeta size={24} /> : <LogoYape size={28} />}
    </button>
  );
  const t = (k: keyof Tarjeta, fmt: (v: string) => string) => ({
    id: `tarjeta-${k}`, value: tarjeta[k], onChange: (e: React.ChangeEvent<HTMLInputElement>) => setTarjeta({ ...tarjeta, [k]: fmt(e.target.value) }),
    onBlur: () => setTocado((x) => ({ ...x, [k]: true })), error: tocado[k] ? et[k] : undefined,
  });
  const y = (k: 'celular' | 'codigo') => ({
    id: `yape-${k}`, value: yape[k], onChange: (e: React.ChangeEvent<HTMLInputElement>) => setYape({ ...yape, [k]: soloDigitos(e.target.value).slice(0, k === 'codigo' ? 6 : 9) }),
    onBlur: () => setTocado((x) => ({ ...x, [`y${k}`]: true })), error: tocado[`y${k}`] ? ey[k] : undefined,
  });
  const revisar = async () => {
    if (enviando) return;
    const errs = c.metodo === 'tarjeta' ? Object.keys(et).map((k) => `tarjeta-${k}`) : Object.keys(ey).map((k) => `yape-${k}`);
    if (errs.length) {
      setTocado({ numero: true, venc: true, cvv: true, nombre: true, ycelular: true, ycodigo: true });
      document.getElementById(errs[0])?.focus();
      return;
    }
    setError('');
    if (!modoMock) {
      setEnviando(true);
      try {
        pago.current = c.metodo === 'tarjeta'
          ? { tipo: 'tarjeta', token: await tokenizarTarjeta({ numero: tarjeta.numero, venc: tarjeta.venc, cvv: tarjeta.cvv, titular: tarjeta.nombre }, c.precio, c.recurrente), tarjeta: `•••• ${soloDigitos(tarjeta.numero).slice(-4)}` }
          : { tipo: 'yape', celular: yape.celular, otp: yape.codigo };
        setTarjeta((x) => ({ ...x, numero: '', cvv: '' }));
      } catch (e) { setError(mensajeError(e)); setEnviando(false); return; }
      setEnviando(false);
    } else {
      pago.current = c.metodo === 'tarjeta' ? { tipo: 'tarjeta', token: 'demo', tarjeta: `•••• ${soloDigitos(tarjeta.numero).slice(-4)}` } : { tipo: 'yape', celular: yape.celular, otp: yape.codigo };
    }
    navigate('/suscribirse/confirmar');
  };
  return (
    <Contenedor>
      <Cabecera titulo="Método de pago" />
      <Pasos actual={3} />
      <ResumenCompacto pago />
      <CodigoPromo />
      <div className="flex flex-col gap-2.5">
        <p className="text-base font-extrabold text-cafe">Elige cómo pagar</p>
        {opcion('tarjeta', 'Tarjeta de crédito o débito', periodo === 'mensual' ? 'Cobro automático cada mes.' : `Pagas hoy el total por ${c.meses}.`, true)}
        {opcion('yape', 'Yape', yapeDisponible ? `Pago único por ${c.meses}, sin renovación automática.` : 'Disponible en los planes semestral y anual. El mensual se paga con tarjeta.', yapeDisponible)}
      </div>

      {c.metodo === 'tarjeta' ? (
        <>
          {periodo !== 'mensual' && (
            <label className="flex items-start gap-3.5 rounded-2xl bg-n0 px-4 py-3.5">
              <span className="flex-1"><span className="block text-[15px] font-bold text-cafe">Renovar automáticamente al vencer</span>
                <span className="text-[13px] leading-[18px] text-n60">{renovacion ? <>Se renueva el <b className="text-cafe">{fechaNum(c.vence)}</b> por {c.total}. Puedes cancelar la renovación desde Mi cuenta.</> : <>Pagas una sola vez. Tu plan estará activo hasta el <b className="text-cafe">{fechaNum(c.vence)}</b>; al vencer, podrás renovarlo.</>}</span></span>
              <span className="relative mt-0.5 inline-flex shrink-0">
                <input type="checkbox" role="switch" checked={renovacion} onChange={(e) => actualizar({ renovacion: e.target.checked })} className="peer sr-only" />
                <span className="h-7 w-12 rounded-pill bg-n40 transition peer-checked:bg-verde peer-focus-visible:ring-2 peer-focus-visible:ring-cafe" />
                <span className="absolute left-1 top-1 size-5 rounded-full bg-n0 shadow transition peer-checked:translate-x-5" />
              </span>
            </label>
          )}
          <div className="flex flex-col gap-4 rounded-[24px] bg-n0 p-5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-base font-extrabold text-cafe">Datos de tu tarjeta</p>
              {pruebas && <button onClick={() => setTarjeta({ numero: '4456 5400 0000 0063', venc: '12/29', cvv: '123', nombre: 'CAMILA ROJAS' })} className="text-[12px] font-semibold text-n60 underline">Datos de prueba</button>}
            </div>
            <Campo label="Número de tarjeta" inputMode="numeric" autoComplete="cc-number" placeholder="0000 0000 0000 0000" maxLength={19} {...t('numero', formatoTarjeta)} />
            <div className="flex items-start gap-3">
              <Campo label="Vencimiento" inputMode="numeric" autoComplete="cc-exp" placeholder="MM/AA" maxLength={5} {...t('venc', formatoVenc)} />
              <Campo label="CVV" inputMode="numeric" autoComplete="cc-csc" placeholder="123" maxLength={3} {...t('cvv', (v) => soloDigitos(v).slice(0, 3))} />
            </div>
            <Campo label="Nombre del titular" autoComplete="cc-name" autoCapitalize="characters" placeholder="Como aparece en tu tarjeta" ayuda="Sin tildes, como aparece en tu tarjeta." {...t('nombre', sinTildes)} />
          </div>
        </>
      ) : (
        <div className="flex flex-col gap-3.5 rounded-[24px] bg-n0 p-5">
          <p className="text-base font-extrabold text-cafe">Paga con Yape</p>
          <ol className="flex flex-col gap-1.5 rounded-xl bg-n5 px-3.5 py-3 text-[14px] text-cafe">
            <li>1. Abre tu app Yape.</li><li>2. Toca «Código de aprobación» en el menú.</li><li>3. Escribe aquí el código que te muestra.</li>
          </ol>
          <Campo label="Celular registrado en Yape" type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="987 654 321" maxLength={9} {...y('celular')} />
          <Campo label="Código de aprobación" inputMode="numeric" autoComplete="one-time-code" placeholder="000000" maxLength={6} ayuda="Lo encuentras en tu app Yape, en «Código de aprobación»." {...y('codigo')} />
        </div>
      )}
      <BloqueReferido enPago />
      <div className="flex flex-col gap-0.5 text-center text-[13px] text-n60">
        <p>Revisa el detalle antes de pagar.</p><p>Podrás confirmar el importe en el siguiente paso.</p>
      </div>
      {error && <Aviso>{error}</Aviso>}
      <BtnPrimario onClick={revisar} disabled={enviando}>{enviando ? 'Validando…' : <>Revisar y confirmar <Icon name="flecha" size={20} /></>}</BtnPrimario>
    </Contenedor>
  );
}

type FasePago = 'listo' | 'procesando' | 'rechazado' | 'pendiente' | 'codigoVencido';
export function Confirmar() {
  const c = useCondiciones();
  const { modoMock, pago, recargarMe } = useSesion();
  const navigate = useNavigate();
  const [fase, setFase] = useState<FasePago>('listo');
  const [motivo, setMotivo] = useState('');
  const [nuevoCodigo, setNuevoCodigo] = useState('');
  const resultado = useRef<ResultadoPago | null>(null);
  const p = pago.current;
  if (!p && fase === 'listo') return <Navigate to="/suscribirse/pago" replace />;
  const metodoTxt = p?.tipo === 'yape' ? 'Yape' : `Tarjeta ${p?.tarjeta ?? ''}`;
  const exito = (r: ResultadoPago | null) => navigate('/suscribirse/listo', { state: { resultado: r, metodo: metodoTxt } });

  const cobrar = async () => {
    if (fase === 'procesando' || !p) return;
    setFase('procesando'); setMotivo('');
    if (modoMock) { window.setTimeout(() => exito(null), 1200); return; }
    try {
      const planId = idDePlan(await suscripcionApi.planes(), c.plan.nombre, c.s.periodo);
      if (!planId) throw new ApiError(0, 'PLAN_NO_ENCONTRADO', 'No encontramos este plan. Inténtalo de nuevo en unos minutos.');
      const referralCode = c.s.referido || undefined;
      const r = p.tipo === 'tarjeta'
        ? await suscripcionApi.pagarConTarjeta({ token: p.token, planId, referralCode, isConcurrent: c.recurrente, promoCodeId: c.s.promoId })
        : await suscripcionApi.pagarConYape({ planId, phoneNumber: p.celular, otp: fase === 'codigoVencido' ? nuevoCodigo : p.otp, referralCode, promoCodeId: c.s.promoId });
      pago.current = null;
      resultado.current = r;
      invalidar('usuario'); invalidar('lanas');
      await recargarMe().catch(() => {});
      if (r.paymentPendingValidation) { setFase('pendiente'); return; }
      exito(r);
    } catch (e) {
      setMotivo(mensajeError(e));
      if (p.tipo === 'yape') { setNuevoCodigo(''); setFase('codigoVencido'); }
      else { pago.current = null; setFase('rechazado'); }
    }
  };
  const consultar = async () => {
    await recargarMe().catch(() => {});
    invalidar('usuario');
    exito(resultado.current);
  };
  const fila = (k: string, v: ReactNode, editar?: ReactNode) => (
    <div className="flex items-start gap-2 border-b border-n10 py-2.5 text-[14px] last:border-0">
      <span className="w-[104px] shrink-0 text-n60 min-[380px]:w-[124px]">{k}</span><span className="min-w-0 flex-1 font-semibold text-cafe">{v}</span>{editar}
    </div>
  );
  const autorizacion = !c.recurrente
    ? `Al tocar «Confirmar y pagar» autorizas el pago único de ${c.total} por tu plan ${c.per.label.toLowerCase()}.`
    : `Al tocar «Confirmar y pagar» autorizas el cobro de ${c.total} hoy y su renovación automática ${c.s.periodo === 'mensual' ? 'cada mes' : `cada ${c.meses}`} por ${c.total}, hasta que la canceles desde Mi cuenta.`;
  return (
    <Contenedor>
      <Cabecera titulo="Confirma tu suscripción" />
      <Pasos actual={4} />
      <div className="flex flex-col rounded-[20px] bg-n0 px-4 pb-2 pt-3">
        <div className="flex items-center gap-3 border-b border-n10 pb-3">
          <img src={asset(c.plan.imagen)} alt="" className="size-14 object-contain" />
          <div className="min-w-0 flex-1"><p className="text-[17px] font-extrabold text-cafe">{c.plan.nombre} · {c.per.label}</p>
            <p className="text-[13px] text-n60">{chancesTexto(c.plan.chances)}</p></div>
          <CambiarPlan etiqueta="Editar" />
        </div>
        {fila('Método', metodoTxt, <Link to="/suscribirse/pago" className="text-[14px] font-bold text-cafe underline">Editar</Link>)}
        {c.metodo === 'yape' && fila('Tipo de pago', 'Único')}
        {c.s.periodo !== 'mensual' && fila('Duración', c.meses)}
        {fila('Renovación', c.s.periodo === 'mensual' ? 'Automática cada mes' : c.recurrente ? `Automática cada ${c.meses}` : 'Sin renovación automática')}
        {c.recurrente ? fila('Próxima renovación', `${fechaNum(c.vence)} · ${c.total}`) : fila('Activo hasta', fechaNum(c.vence))}
        {c.s.promoTexto && fila('Promoción', c.s.promoDetalle ? `${c.s.promoTexto}: ${c.s.promoDetalle}` : c.s.promoTexto)}
        {c.s.referidoAplicado && c.s.referido && fila('Referido', c.s.referido)}
        <div className="flex items-center justify-between pt-3"><span className="text-[15px] font-bold text-cafe">Total a pagar hoy</span><span className="text-2xl font-black text-cafe">{c.total}</span></div>
      </div>

      {fase === 'rechazado' && (
        <div className="flex flex-col gap-2 rounded-2xl border-2 border-error bg-[#fee2e2] p-4 text-cafe" role="alert">
          <p className="text-[15px] font-extrabold">No pudimos realizar el cobro</p>
          <p className="text-[13px] leading-[18px]">No se hizo ningún cargo. Revisa tus datos o inténtalo más tarde. Tu plan, tu referido y tu promoción se mantienen.</p>
          <Link to="/suscribirse/pago" className="self-start text-[14px] font-bold underline">Volver a ingresar el pago</Link>
        </div>
      )}
      {fase === 'pendiente' && (
        <div className="flex flex-col gap-2 rounded-2xl bg-amarillo/25 p-4 text-cafe" role="status">
          <p className="text-[15px] font-extrabold">Estamos confirmando tu pago</p>
          <p className="text-[13px] leading-[18px]">Puede tardar unos minutos. No vuelvas a pagar: revisamos el estado de la operación y te avisamos por correo cuando se confirme.</p>
          <button onClick={consultar} className="self-start text-[14px] font-bold underline">Consultar el estado</button>
        </div>
      )}
      {fase === 'codigoVencido' && (
        <div className="flex flex-col gap-2.5 rounded-2xl bg-amarillo/25 p-4 text-cafe" role="alert">
          <p className="text-[15px] font-extrabold">Obtén un código nuevo en Yape para continuar</p>
          <p className="text-[13px] leading-[18px]">{motivo ? `${motivo} ` : ''}Conservamos tu plan, tu celular, tu referido y tu promoción. No se hizo ningún cargo.</p>
          <Campo label="Nuevo código de aprobación" inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="000000" value={nuevoCodigo} onChange={(e) => setNuevoCodigo(soloDigitos(e.target.value).slice(0, 6))} />
        </div>
      )}

      {fase !== 'pendiente' && fase !== 'rechazado' && (
        <>
          <p className="text-[13px] leading-[18px] text-n60">{autorizacion}</p>
          <p className="flex items-center gap-2 text-[13px] text-n60"><Icon name="alerta" size={16} />Te enviaremos el comprobante a tu correo.</p>
          <BtnPrimario disabled={fase === 'procesando' || (fase === 'codigoVencido' && nuevoCodigo.length !== 6)} onClick={cobrar}>
            {fase === 'procesando' ? <><span className="size-5 animate-spin rounded-full border-2 border-cafe border-t-transparent" />Procesando tu pago…</>
              : fase === 'codigoVencido' ? <>Reintentar el pago de {c.total}</> : <><Icon name="candado" size={20} />Confirmar y pagar {c.total}</>}
          </BtnPrimario>
        </>
      )}
    </Contenedor>
  );
}

export function Listo() {
  const c = useCondiciones();
  const { iniciar, modoMock } = useSesion();
  const navigate = useNavigate();
  const { resultado: r } = (useLocation().state ?? {}) as { resultado?: ResultadoPago | null };
  if (!modoMock && r === undefined) return <Navigate to="/" replace />;
  const nombre = (c.s.nombre || '').split(' ')[0];
  return (
    <div className="mx-auto flex max-w-[560px] flex-col items-center gap-3 px-6 pb-12 pt-4 text-center lg:gap-4 lg:py-14">
      <img src={asset('img/oveja-ganadores.webp')} alt="" className="h-[96px] w-auto object-contain lg:h-[150px]" />
      <h1 className="text-[32px] font-black leading-[1.05] text-cafe lg:text-[44px]">¡Empieza a <span className="whitespace-nowrap rounded-xl bg-amarillo px-2">VIVIR GANANDO</span>!</h1>
      <p className="text-[17px] font-bold text-cafe">{nombre ? `${nombre}, tu` : 'Tu'} plan {c.plan.nombre} ya está activo</p>
      <button onClick={() => { if (modoMock) iniciar(); navigate('/'); }} className="inline-flex h-14 w-full items-center justify-center gap-2.5 whitespace-nowrap rounded-pill bg-amarillo px-8 text-[15px] font-bold text-cafe sm:w-auto">Empezar a vivir ganando <Icon name="flecha" size={20} /></button>
      <div className="mt-2 flex w-full flex-col gap-2 rounded-2xl bg-n0 p-4 text-left">
        <p className="text-[14px] font-extrabold text-cafe">Esto tienes con tu plan:</p>
        {[chancesTexto(c.plan.chances), ...BENEFICIOS_COMUNES].map((t) => (
          <p key={t} className="flex items-start gap-2.5 text-[14px] text-cafe"><span className="flex size-6 shrink-0 items-center justify-center rounded-pill bg-amarillo"><Icon name="check" size={14} /></span>{t}</p>
        ))}
      </div>
      <p className="text-[13px] leading-[18px] text-n60">
        {c.recurrente ? <>Próxima renovación: <b className="text-cafe">{fechaNum(c.vence)}</b> · {c.total}{c.s.periodo === 'mensual' ? ' al mes' : ` por ${c.meses}`}.</> : <>Tu plan está activo hasta el <b className="text-cafe">{fechaNum(c.vence)}</b>. Sin renovación automática.</>}
        {' '}Participas en los sorteos cuyo cierre de lista (miércoles 11:59 a. m.) aún no pasó.
        {r?.operationCode && <> Operación {r.operationCode}.</>}
      </p>
    </div>
  );
}
