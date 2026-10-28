import { useEffect, useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import { Button, ImagenOpcional, MonedaLana, cx } from '../ui/primitives';
import { LogoMarca } from '../ui/LogoMarca';
import { Bloque, CodigoCopiable, Hoja, OpcionElegible } from '../ui/Hoja';
import { cofreSemana, flashSemana, flashSemana2, formatoLanas, type OpcionRecompensa } from '../../data/mock';
import { useDemo, type Eleccion } from '../../data/revision';
import { useBilletera, useCofreApi, useFlash as useFlashApi } from '../../data/datos';
import { useSesion } from '../../data/sesion';
import { ApiError, mensajeError } from '../../api/client';
import { beneficiosApi, cofreApi } from '../../api/servicios';
import { invalidar } from '../../data/recurso';
import { aApertura } from '../../data/adaptadores';
import { asset } from '../../data/assets';

export function Modal({ abierto, onCerrar, children, blanco }: { abierto: boolean; onCerrar: () => void; children: ReactNode; blanco?: boolean }) {
  useEffect(() => {
    if (!abierto) return;
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onCerrar();
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [abierto, onCerrar]);
  if (!abierto) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-cafe/60 lg:items-center" onClick={onCerrar}>
      <div role="dialog" aria-modal className={cx('relative max-h-[92vh] w-full overflow-y-auto rounded-t-[28px] p-6 lg:max-w-[480px] lg:rounded-[28px]', blanco ? 'bg-n0' : 'bg-fondo')} onClick={(e) => e.stopPropagation()}>
        <span className="mx-auto -mt-2 mb-3 block h-1 w-10 rounded-pill bg-n10 lg:hidden" aria-hidden />
        <button onClick={onCerrar} aria-label="Cerrar" className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-pill text-2xl font-bold text-cafe hover:bg-n5">×</button>
        {children}
      </div>
    </div>
  );
}

const agotada = (o: OpcionRecompensa) => o.quedan !== null && o.quedan <= 0;
const punto = (t: string) => (t.endsWith('.') ? t : `${t}.`);
const quedanTexto = (o: OpcionRecompensa) => (o.quedan === null ? '' : o.total ? `Quedan ${o.quedan} de ${o.total}` : `Quedan ${o.quedan}`);

function Aviso({ titulo, detalle }: { titulo: string; detalle: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-crema p-4">
      <span className="mt-0.5 text-[#E0A800]"><Icon name="alerta" size={18} /></span>
      <span className="flex flex-col gap-0.5"><span className="text-sm font-bold text-cafe">{titulo}</span><span className="text-[13px] leading-[18px] text-cafe">{detalle}</span></span>
    </div>
  );
}

function Nota({ children }: { children: ReactNode }) {
  return <p className="flex items-center gap-2 text-[13px] font-semibold text-cafe"><Icon name="alerta" size={16} />{children}</p>;
}

function Cofre3D({ vacio, className }: { vacio?: boolean; abierto?: boolean; className?: string }) {
  return <img src={asset('assets/3d/cofre-3d.webp')} alt="" draggable={false} className={cx('w-auto max-w-full object-contain', vacio && 'opacity-60 grayscale', className)} />;
}

const MUESCAS = {
  WebkitMask: 'radial-gradient(circle 11px at 0 50%, transparent 97%, #000) left / 51% 100% no-repeat, radial-gradient(circle 11px at 100% 50%, transparent 97%, #000) right / 51% 100% no-repeat',
  mask: 'radial-gradient(circle 11px at 0 50%, transparent 97%, #000) left / 51% 100% no-repeat, radial-gradient(circle 11px at 100% 50%, transparent 97%, #000) right / 51% 100% no-repeat',
} as const;
const FONDO_FLASH = { background: 'linear-gradient(140deg, #FF88F7 0%, #FF88F7 40%, #B5179E 135%)' };
const FONDO_COFRE = 'bg-[radial-gradient(120%_100%_at_50%_35%,#3D2A08_0%,#211402_65%)]';

function LanasObtenidas({ lanas }: { lanas: string }) {
  const billetera = useBilletera();
  return (
    <div className="flex items-center gap-4 overflow-hidden rounded-[24px] bg-hero-brand px-6 py-6 text-n0">
      <div className="flex flex-1 flex-col items-start gap-2">
        <MonedaLana size={40} />
        <p className="text-[34px] font-black leading-none text-amarillo">{lanas}</p>
        <p className="text-sm text-n0/80">Ya están en tu billetera · saldo {formatoLanas(billetera.saldo)} Lanas.</p>
      </div>
      <img src={asset('assets/oveja-ganadores.webp')} alt="" className="oveja-quieta -mb-6 h-[130px] w-auto shrink-0 object-contain" />
    </div>
  );
}

function Volver({ texto }: { texto: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-amarillo/25 px-4 py-3">
      <Icon name="calendario" size={22} />
      <p className="flex-1 text-sm font-bold leading-5">{texto}</p>
    </div>
  );
}

function Entregados({ lista }: { lista: { titulo: string; logo?: string; cantidad: number }[] }) {
  if (!lista.length) return null;
  return (
    <ul className="flex flex-col gap-2">
      {lista.map((e) => (
        <li key={e.titulo} className="flex items-center gap-3 rounded-xl bg-n0 px-3 py-2.5">
          {e.logo ? <LogoMarca src={e.logo} nombre={e.titulo} tamano="sm" /> : <span className="flex h-8 w-[72px] items-center justify-center"><MonedaLana size={24} /></span>}
          <span className="flex-1 text-sm font-semibold">{e.titulo}</span>
          <span className="text-xs font-bold text-n60">{e.cantidad} entregados</span>
        </li>
      ))}
    </ul>
  );
}

type Resultado = 'ok' | 'agotada' | 'error';
type Obtenido = { opcion: OpcionRecompensa; codigo?: string | null };

type Recompensa = {
  oculto: boolean;
  estado: 'disponible' | 'abierto' | 'elegido' | 'agotado';
  opciones: OpcionRecompensa[];
  detalles: [string, string][];
  obtenido: Obtenido | null;
  confirmar: (id: OpcionRecompensa['id']) => Promise<Resultado>;
  enviando: boolean;
  error: string;
};

function Eleccion({ r, textoOpcion, detalleOpcion, nota, intro, pie, logo }: {
  r: Recompensa; textoOpcion: (o: OpcionRecompensa) => string; detalleOpcion: (o: OpcionRecompensa) => string; nota: string; intro?: string; pie?: ReactNode; logo?: string;
}) {
  const primera = r.opciones.find((o) => !agotada(o));
  const [sel, setSel] = useState<OpcionRecompensa['id'] | null>(primera?.id ?? null);
  const [carrera, setCarrera] = useState('');
  const disponibles = r.opciones.filter((o) => !agotada(o));
  const unaAgotada = disponibles.length === 1 && r.opciones.length === 2 ? r.opciones.find(agotada) : undefined;
  const elegida = r.opciones.find((o) => o.id === sel && !agotada(o));
  return (
    <>
      {carrera
        ? <Aviso titulo={`Se agotó ${carrera}`} detalle="Alguien confirmó antes. No cambiamos tu elección: escoge la opción disponible." />
        : unaAgotada
          ? <Aviso titulo={unaAgotada.id === 'lanas' ? 'Las Lanas se agotaron' : `${unaAgotada.etiqueta === 'BENEFICIO' ? 'El beneficio' : 'El premio'} se agotó`}
              detalle={unaAgotada.id === 'lanas' ? 'Todavía puedes quedarte con el premio.' : 'Todavía puedes llevarte las Lanas.'} />
          : intro && <p className="text-sm">{intro}</p>}
      <div role="radiogroup" className="flex flex-col gap-2.5">
        {r.opciones.map((o) => (
          <OpcionElegible key={o.id} activa={sel === o.id} agotada={agotada(o)} onClick={() => setSel(o.id)}
            icono={o.id === 'lanas' ? <MonedaLana size={22} /> : logo ? <LogoMarca src={logo} nombre={o.titulo} tamano="sm" className="!h-10 !w-10 !p-1" /> : <Icon name={o.etiqueta === 'BENEFICIO' ? 'cupon' : 'regalo'} size={22} />}
            titulo={textoOpcion(o)} detalle={detalleOpcion(o)} />
        ))}
      </div>
      {pie}
      <Nota>{nota}</Nota>
      {r.error && <p role="alert" className="text-xs font-semibold text-error">{r.error}</p>}
      <Button full disabled={!elegida || r.enviando} className="disabled:opacity-40"
        onClick={async () => {
          if (!elegida) return;
          const res = await r.confirmar(elegida.id);
          if (res === 'agotada') { setCarrera(elegida.titulo); setSel(null); }
        }}>
        {r.enviando ? 'Confirmando…' : 'Confirmar elección'}
      </Button>
    </>
  );
}

let aperturaEnCurso: (ReturnType<typeof aApertura> & { codigo?: string }) | null = null;
let cofreAbiertoDemo = false;

function useCofre() {
  const demo = useDemo();
  const { modoMock, me } = useSesion();
  const api = useCofreApi();
  const [, refrescar] = useState(0);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  if (modoMock || api.ejemplo) {
    const premio = cofreSemana.opciones.find((o) => o.id === 'premio')!;
    const opciones = cofreSemana.opciones;
    const elegida = opciones.find((o) => o.id === demo.eleccionCofre);
    const r: Recompensa = {
      oculto: false,
      estado: elegida ? 'elegido' : demo.cofre === 'agotado' ? 'agotado' : cofreAbiertoDemo ? 'abierto' : 'disponible',
      opciones,
      detalles: cofreSemana.detalles,
      obtenido: elegida ? { opcion: elegida, codigo: elegida.id === 'premio' ? cofreSemana.codigo : null } : null,
      confirmar: async (id) => { demo.setEleccionCofre(id as Eleccion); return 'ok'; },
      enviando: false, error: '',
    };
    return {
      r, abrir: async () => { cofreAbiertoDemo = true; refrescar((n) => n + 1); return true; },
      info: { cierra: 'mar 11:59 p. m.', proximo: cofreSemana.proximo, quedan: premio.quedan, total: premio.total, uso: cofreSemana.usoCorto, logo: cofreSemana.logo as string | undefined, entregados: cofreSemana.entregadosLista },
    };
  }

  const c = api.data;
  const ap = aperturaEnCurso ?? c?.apertura ?? null;
  const opciones: OpcionRecompensa[] = ap ? [
    { id: 'premio', etiqueta: ap.esLanas ? 'LANAS' : 'PREMIO', titulo: ap.titulo, lugar: '', quedan: null, total: null },
    ...(!ap.esLanas && ap.alternativaLanas ? [{ id: 'lanas' as const, etiqueta: 'LANAS', titulo: `+${ap.alternativaLanas} Lanas`, lugar: 'Se suman a tu billetera al instante', quedan: null, total: null, lanas: ap.alternativaLanas }] : []),
  ] : [];
  const yaEligio = ap && (ap.esLanas || ['APPLIED', 'EXCHANGED'].includes(ap.estado)) ? (ap.estado === 'EXCHANGED' ? 'lanas' : 'premio') : null;
  const elegida = opciones.find((o) => o.id === yaEligio);
  const conError = async (fn: () => Promise<void>): Promise<Resultado> => {
    setEnviando(true); setError('');
    try { await fn(); return 'ok'; } catch (e) {
      if (e instanceof ApiError && (e.status === 409 || /SOLD_OUT|AGOTAD/i.test(e.code))) return 'agotada';
      setError(mensajeError(e)); return 'error';
    } finally { setEnviando(false); }
  };
  const r: Recompensa = {
    oculto: !me?.hasSubscription || !c || c.oculto,
    estado: elegida ? 'elegido' : ap ? 'abierto' : c?.agotado ? 'agotado' : 'disponible',
    opciones,
    detalles: ap?.detalle ? [['Úsalo hasta', ap.detalle.replace(/^Vence /, '')]] : [],
    obtenido: elegida ? { opcion: elegida, codigo: aperturaEnCurso?.codigo ?? null } : null,
    confirmar: (id) => conError(async () => {
      if (!ap?.id) throw new Error('Sin apertura');
      if (id === 'premio') {
        const res = await cofreApi.aplicar(ap.id);
        aperturaEnCurso = { ...ap, estado: 'APPLIED', codigo: res.shownCode ?? res.instructions ?? undefined };
      } else {
        await cofreApi.cambiarPorLanas(ap.id);
        aperturaEnCurso = { ...ap, estado: 'EXCHANGED' };
        invalidar('lanas');
      }
      invalidar('cofre'); invalidar('misiones'); invalidar('recompensas');
    }),
    enviando, error,
  };
  return {
    r,
    abrir: async () => {
      if (ap) return true;
      const res = await conError(async () => {
        const o = await cofreApi.abrir();
        aperturaEnCurso = o?.id ? aApertura(o) : (await cofreApi.estado().then((x) => (x.opening ? aApertura(x.opening) : null)));
        if (!aperturaEnCurso) throw new Error('No pudimos abrir tu cofre. Intenta de nuevo.');
        if (aperturaEnCurso.esLanas) invalidar('lanas');
        invalidar('misiones');
        refrescar((n) => n + 1);
      });
      return res === 'ok';
    },
    info: { cierra: c?.cierra ?? '', proximo: c?.abre ?? '', quedan: c?.quedan ?? null, total: c?.premios.cupo || null, uso: ap?.detalle ?? '', logo: ap?.logo, entregados: [] as { titulo: string; logo?: string; cantidad: number }[] },
  };
}

export function CardCofre({ variante = 'normal' }: { variante?: 'normal' | 'compacta' | 'hoyWeb' }) {
  const { r, abrir, info } = useCofre();
  const [hoja, setHoja] = useState(false);
  if (r.oculto) return null;
  const agotado = r.estado === 'agotado';
  const listo = r.estado === 'elegido';
  const texto = agotado ? 'Ver qué se entregó' : listo ? 'Ver lo que obtuve' : r.estado === 'abierto' ? 'Elegir mi premio' : r.enviando ? 'Abriendo…' : 'Abrir cofre';
  const linea = agotado ? `Se agotaron los premios de esta semana.${info.proximo ? ` Nuevo cofre el ${punto(info.proximo)}` : ''}`
    : listo ? `Ya abriste tu cofre.${info.proximo ? ` Nuevo cofre el ${punto(info.proximo)}` : ''}`
      : r.estado === 'abierto' ? 'Ya abriste tu cofre: elige con qué te quedas.'
        : `${info.quedan !== null && info.total ? `Quedan ${info.quedan} de ${info.total} premios` : 'Nunca sabes qué sale'}${info.cierra ? ` · hasta el ${info.cierra}` : ''}`;
  const onBoton = async () => { if (r.estado === 'disponible') { if (await abrir()) setHoja(true); } else setHoja(true); };
  const ilustracion = (clase: string) => <Cofre3D vacio={agotado} abierto={r.estado !== 'disponible' && !agotado} className={clase} />;
  const hojaCofre = <HojaCofre r={r} info={info} abierto={hoja} onCerrar={() => setHoja(false)} />;

  if (variante === 'compacta') {
    return (
      <div className={cx('flex min-h-60 min-w-0 flex-1 flex-col items-center gap-1 rounded-[20px] p-3.5 text-n0', FONDO_COFRE)}>
        <span className="whitespace-nowrap rounded-md bg-rosa px-1.5 py-1 text-[9.5px] font-black tracking-[0.6px] text-cafe">COFRE SORPRESA</span>
        {ilustracion('h-[86px]')}
        <p className="text-center text-[15px] font-extrabold leading-[18px] text-amarillo">{agotado ? '¡Se agotó!' : 'Tu cofre de la semana'}</p>
        <p className="text-center text-[11px] font-medium leading-[14px] text-n0/80">
          {agotado || listo ? (info.proximo ? `Nuevo: ${info.proximo}` : 'Vuelve el miércoles') : info.quedan !== null && info.total ? `Quedan ${info.quedan} de ${info.total}` : 'Nunca sabes qué sale'}
        </p>
        <div className="flex-1" />
        <button type="button" disabled={r.enviando} onClick={onBoton} className="w-full whitespace-nowrap rounded-pill bg-n0 py-[9px] text-[13px] font-bold text-cafe">
          {agotado ? 'Ver premios' : r.estado === 'disponible' ? (r.enviando ? 'Abriendo…' : 'Abrir') : r.estado === 'abierto' ? 'Elegir' : 'Ver'}
        </button>
        {hojaCofre}
      </div>
    );
  }

  return (
    <>
      <div className={cx('relative flex flex-col gap-4 overflow-hidden rounded-[24px] p-6 text-n0', FONDO_COFRE, variante === 'hoyWeb' ? 'min-h-[400px] min-w-0 flex-1' : 'lg:flex-row lg:items-center lg:gap-8')}>
        <span className={cx('w-fit rounded-md bg-rosa px-2.5 py-1 text-[11px] font-black tracking-[1px] text-cafe', variante !== 'hoyWeb' && 'lg:hidden')}>COFRE SORPRESA · CADA MIÉRCOLES</span>
        <div className={cx('flex items-center justify-center', variante === 'hoyWeb' ? 'flex-1' : 'py-2 lg:w-[240px] lg:shrink-0')}>{ilustracion(variante === 'hoyWeb' ? 'h-[190px]' : 'h-[150px] lg:h-[170px]')}</div>
        <div className="flex flex-1 flex-col gap-3">
          {variante !== 'hoyWeb' && <span className="hidden w-fit rounded-md bg-rosa px-2.5 py-1 text-[11px] font-black tracking-[1px] text-cafe lg:block">COFRE SORPRESA · CADA MIÉRCOLES</span>}
          <div className="flex flex-col gap-1.5">
            <p className="text-[26px] font-black leading-7 text-amarillo lg:text-[28px]">{agotado ? '¡Se agotó esta semana!' : 'Tu cofre de la semana'}</p>
            <p className="text-sm leading-[19px] text-n0/85">{linea}</p>
          </div>
          {r.error && <p role="alert" className="text-xs font-semibold text-amarillo">{r.error}</p>}
          <button type="button" disabled={r.enviando} onClick={onBoton}
            className="flex h-12 w-full items-center justify-center gap-1.5 rounded-pill bg-n0 text-[15px] font-bold text-cafe transition hover:brightness-95">
            <Icon name="cofre" size={16} />{texto}
          </button>
        </div>
      </div>
      {hojaCofre}
    </>
  );
}

function HojaCofre({ r, info, abierto, onCerrar }: { r: Recompensa; info: ReturnType<typeof useCofre>['info']; abierto: boolean; onCerrar: () => void }) {
  const hayAlternativa = r.opciones.some((o) => o.id === 'lanas');
  const premio = r.opciones.find((o) => o.id === 'premio');
  const agotado = r.estado === 'agotado';
  const volver = info.proximo ? `Vuelve el ${info.proximo}: tu nuevo cofre te espera.` : 'Vuelve el miércoles: tu nuevo cofre te espera.';
  const titulo = agotado ? 'Se agotaron los premios' : r.estado === 'elegido' ? 'Tu cofre de esta semana' : premio?.etiqueta === 'LANAS' ? '¡Te tocaron Lanas!' : '¡Te tocó un premio!';
  return (
    <Hoja abierto={abierto} onCerrar={onCerrar} titulo={titulo} subtitulo={r.estado === 'abierto' && hayAlternativa ? 'Elige con qué te quedas. Cada opción tiene su propio stock.' : undefined}>
      {agotado ? (
        <>
          <p className="text-sm">{info.entregados.length ? 'Esta semana se entregaron todos los premios del cofre:' : 'Esta semana se entregaron todos los premios del cofre.'}</p>
          <Entregados lista={info.entregados} />
          <Volver texto={volver} />
        </>
      ) : r.estado === 'elegido' && r.obtenido ? (
        <>
          {r.obtenido.opcion.id === 'lanas' || r.obtenido.opcion.etiqueta === 'LANAS' ? <LanasObtenidas lanas={r.obtenido.opcion.titulo} /> : (
            <Bloque>
              <div className="flex items-center gap-3">
                <LogoMarca src={info.logo} nombre={r.obtenido.opcion.titulo} />
                <p className="flex-1 text-[15px] font-extrabold">{r.obtenido.opcion.titulo}</p>
              </div>
              {info.uso && <p className="text-[13px] text-n60">{info.uso}</p>}
              {r.obtenido.codigo && <CodigoCopiable codigo={r.obtenido.codigo} />}
              <p className="text-[13px] text-n60">Tu premio también está en Mis Cupones.</p>
            </Bloque>
          )}
          <Volver texto={volver} />
          <Button full onClick={onCerrar}>Listo</Button>
        </>
      ) : r.estado === 'abierto' ? (
        <>
          <div className="flex justify-center rounded-2xl bg-cafe"><Cofre3D abierto className="h-32" /></div>
          <Eleccion r={r} logo={info.logo}
            textoOpcion={(o) => (o.id === 'lanas' ? `Cambiar por ${o.titulo.replace(/^\+/, '')}` : hayAlternativa ? `Quedarme con el premio: ${o.titulo}` : o.titulo)}
            detalleOpcion={(o) => [quedanTexto(o), o.id === 'lanas' ? o.lugar : info.uso || o.lugar].filter(Boolean).join(' · ') || 'Lo aplicas desde aquí'}
            nota={`Solo puedes elegir una. La elección es definitiva.${info.cierra ? ` Puedes decidir hasta el ${punto(info.cierra)}` : ''}`} />
        </>
      ) : null}
    </Hoja>
  );
}

let eleccionFlash: 'premio' | 'lanas' | null = null;
let codigoFlash: string | null = null;

let eleccionFlash2: Eleccion | null = null;
const oyentesFlash2 = new Set<() => void>();

function useFlash(ejemplo2 = false) {
  const ej = ejemplo2 ? flashSemana2 : flashSemana;
  const [, refrescar2] = useState(0);
  useEffect(() => {
    if (!ejemplo2) return;
    const f = () => refrescar2((n) => n + 1);
    oyentesFlash2.add(f);
    return () => { oyentesFlash2.delete(f); };
  }, [ejemplo2]);
  const demo = useDemo();
  const { modoMock, me } = useSesion();
  const { data, ejemplo } = useFlashApi();
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  if (modoMock || ejemplo) {
    const opciones = demo.flash === 'agotado' ? ej.opciones.map((o) => ({ ...o, quedan: 0 })) : ej.opciones;
    const eleccion = ejemplo2 ? eleccionFlash2 : demo.eleccionFlash;
    const elegida = opciones.find((o) => o.id === eleccion);
    const r: Recompensa = {
      oculto: false,
      estado: elegida ? 'elegido' : opciones.every(agotada) ? 'agotado' : 'disponible',
      opciones, detalles: ej.detalles,
      obtenido: elegida ? { opcion: elegida, codigo: elegida.id === 'premio' ? ej.codigo : null } : null,
      confirmar: async (id) => {
        if (ejemplo2) { eleccionFlash2 = id as Eleccion; oyentesFlash2.forEach((f) => f()); } else demo.setEleccionFlash(id as Eleccion);
        return 'ok';
      },
      enviando: false, error: '',
    };
    return { r, proximamente: false, f: { descuento: ej.descuento, oferta: ej.oferta.replace(/^OFF /, ''), marca: ej.marca, logo: ej.logo as string | undefined, imagen: ej.imagen as string | undefined, proximo: ej.proximo, eligeHasta: ej.eligeHasta, usoCorto: ej.usoCorto, terminos: ej.terminos, terminosUrl: '' } };
  }

  const quedan = data ? (data.beneficioAgotado ? 0 : data.cupo ? Math.max(0, data.cupo - data.usados) : null) : null;
  const opciones: OpcionRecompensa[] = data ? [
    { id: 'premio' as const, etiqueta: 'BENEFICIO', titulo: `${data.descuento} ${data.detalleCorto}`.trim(), lugar: data.comercio, quedan, total: data.cupo || null },
    ...(data.lanas ? [{ id: 'lanas' as const, etiqueta: 'LANAS', titulo: `+${data.lanas.cantidad} Lanas`, lugar: 'Se acreditan en tu billetera',
      quedan: data.lanas.agotado ? 0 : data.lanas.cupo ? Math.max(0, data.lanas.cupo - data.lanas.entregadas) : null, total: data.lanas.cupo || null }] : []),
  ] : [];
  const elegidaId = eleccionFlash ?? data?.eleccion ?? null;
  const codigo = codigoFlash ?? data?.codigo ?? null;
  const elegido = !!data && (data.yaUsado || !!eleccionFlash);
  const opcionElegida = opciones.find((o) => o.id === elegidaId) ?? opciones[0];
  const r: Recompensa = {
    oculto: !data,
    estado: elegido ? 'elegido' : data?.agotado ? 'agotado' : 'disponible',
    opciones,
    detalles: data?.vence ? [['Elige hasta', data.vence]] : [],
    obtenido: elegido && opcionElegida ? { opcion: opcionElegida, codigo: opcionElegida.id === 'lanas' ? null : codigo } : null,
    confirmar: async (id) => {
      if (!data?.id) return 'error';
      setEnviando(true); setError('');
      try {
        const res = await beneficiosApi.obtenerCodigoFlash(data.id, id === 'lanas' ? 'LANAS' : 'BENEFIT');
        codigoFlash = res.code ?? res.dniInstructions ?? '';
        eleccionFlash = id === 'lanas' ? 'lanas' : 'premio';
        invalidar('beneficios:flash'); invalidar('misiones'); if (id === 'lanas') invalidar('lanas');
        return 'ok';
      } catch (e) {
        if (e instanceof ApiError && e.code === 'FLASH_BENEFIT_ALREADY_CLAIMED') { invalidar('beneficios:flash'); setError(mensajeError(e)); return 'error'; }
        if (e instanceof ApiError && /SOLD_OUT|LANAS_NOT_AVAILABLE|AGOTAD/i.test(e.code)) return 'agotada';
        setError(mensajeError(e)); return 'error';
      } finally { setEnviando(false); }
    },
    enviando, error,
  };
  return { r, proximamente: !data && !!me?.hasSubscription, f: { descuento: data?.descuento ?? '', oferta: data?.detalle ?? '', marca: data?.comercio ?? '', logo: data?.logo, imagen: data?.imagen, proximo: '', eligeHasta: data?.terminaEn ?? '', usoCorto: data?.vence ?? '', terminos: data?.terminos ?? '', terminosUrl: data?.terminosUrl ?? '' } };
}

function Terminos({ texto, url }: { texto: string; url?: string }) {
  const [ver, setVer] = useState(false);
  if (!texto && !url) return null;
  return (
    <div className="flex flex-col gap-1.5">
      {url && !texto
        ? <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 self-start text-[13px] font-bold underline"><Icon name="info" size={16} />Términos y condiciones</a>
        : <button type="button" onClick={() => setVer((v) => !v)} aria-expanded={ver} className="flex items-center gap-1.5 self-start text-[13px] font-bold underline"><Icon name="info" size={16} />Términos y condiciones</button>}
      {ver && <p className="rounded-xl bg-n0 p-3 text-[13px] leading-[19px] text-n60">{texto}</p>}
    </div>
  );
}

export function CardFlash({ className, variante = 'normal', ejemplo2 }: { className?: string; variante?: 'normal' | 'compacta' | 'hoyWeb'; ejemplo2?: boolean }) {
  const { r, f, proximamente } = useFlash(ejemplo2);
  const [hoja, setHoja] = useState(false);
  if (r.oculto && !proximamente) return null;
  const beneficio = r.opciones.find((o) => o.id === 'premio');
  const lanas = r.opciones.find((o) => o.id === 'lanas');
  const total = r.opciones.reduce((n, o) => n + (o.total ?? 0), 0);
  const quedanTodas = r.opciones.reduce((n, o) => n + (o.quedan ?? 0), 0);
  const disfrutando = total ? total - quedanTodas : 0;
  const agotado = !proximamente && r.estado === 'agotado';
  const elegido = r.estado === 'elegido' && r.obtenido;
  const volver = f.proximo ? `Vuelve el ${f.proximo}: llega un nuevo Beneficio Flash.` : 'Vuelve el miércoles: llega un nuevo Beneficio Flash.';
  const texto = elegido ? (r.obtenido!.opcion.id === 'lanas' ? `${r.obtenido!.opcion.titulo} obtenidas` : 'Ver mi código') : 'Elegir';
  const corto = (beneficio?.titulo ?? '').replace(f.descuento, '').trim() || `OFF ${f.oferta}`;

  const hojaFlash = (
    <Hoja abierto={hoja} onCerrar={() => setHoja(false)} titulo={elegido ? '¡Listo! Ya elegiste' : 'Elige tu Beneficio Flash'}
      subtitulo={`${f.descuento} OFF ${f.oferta}`}>
      {(f.logo || f.eligeHasta) && (
        <div className="flex items-center gap-3"><LogoMarca src={f.logo} nombre={f.marca} tamano="lg" /><p className="text-[13px] text-n60">{f.eligeHasta ? `Termina en ${f.eligeHasta} · ` : ''}uno por persona</p></div>
      )}
      {elegido ? (
        <>
          {r.obtenido!.opcion.id === 'lanas' ? <LanasObtenidas lanas={r.obtenido!.opcion.titulo} /> : (
            <Bloque>
              <p className="text-sm font-bold">Tu código</p>
              {r.obtenido!.codigo ? <CodigoCopiable codigo={r.obtenido!.codigo} /> : <p className="text-sm">Muestra tu DNI en el comercio para usar este beneficio.</p>}
              <p className="text-[13px] text-n60">{f.marca ? `Úsalo en ${f.marca}. ` : ''}También está en Mis Cupones.</p>
              {f.usoCorto && <p className="text-[13px] font-semibold text-cafe">{f.usoCorto}</p>}
            </Bloque>
          )}
          <Volver texto={volver} />
          <Terminos texto={f.terminos} url={f.terminosUrl} />
        </>
      ) : (
        <Eleccion r={r}
          intro={lanas ? `Elige el beneficio o ${lanas.titulo.replace(/^\+/, '')}. Solo puedes elegir una opción y cada una tiene su propio stock.` : 'Obtén tu código. El stock es limitado.'}
          textoOpcion={(o) => o.titulo} detalleOpcion={(o) => quedanTexto(o) || o.lugar}
          pie={<Terminos texto={f.terminos} url={f.terminosUrl} />}
          nota="La elección es definitiva. Uno por persona." />
      )}
    </Hoja>
  );

  const stockBarra = total > 0 && (
    <div className="flex flex-col gap-1.5">
      <div className="h-1.5 overflow-hidden rounded-pill bg-n0/40"><div className="h-full rounded-pill bg-success" style={{ width: `${Math.min(100, (disfrutando / total) * 100)}%` }} /></div>
      <p className="text-xs font-medium text-cafe">{disfrutando} personas ya lo disfrutan</p>
      <div className="flex flex-wrap gap-1.5">
        <span className="inline-flex items-center gap-1 rounded-pill bg-n0 px-2.5 py-1 text-[12px] font-extrabold text-cafe"><span className="size-2 rounded-full bg-rosa-fuerte" />Quedan {beneficio?.quedan ?? 0} beneficios</span>
        {lanas && <span className="inline-flex items-center gap-1 rounded-pill bg-n0 px-2.5 py-1 text-[12px] font-extrabold text-cafe"><span className="size-2 rounded-full bg-rosa-fuerte" />Quedan {lanas.quedan ?? 0} cupos de {lanas.titulo.replace(/^\+/, '')}</span>}
      </div>
    </div>
  );

  const cabecera = (grande?: boolean) => (
    <div className={cx('flex flex-wrap items-center justify-between', grande ? 'gap-2' : 'gap-x-1.5 gap-y-1')}>
      <span className={cx('inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-md bg-amarillo font-black text-cafe', grande ? 'px-2.5 py-1 text-[11px] tracking-[1px]' : 'gap-0.5 px-[5px] py-1 text-[9.5px] tracking-[0.4px]')}>
        <Icon name="rayo" size={grande ? 11 : 9} />{grande ? 'BENEFICIO FLASH' : 'FLASH'}
      </span>
      {!agotado && !proximamente && f.eligeHasta && (grande
        ? <span className="inline-flex min-w-0 items-center gap-1 whitespace-nowrap rounded-pill bg-cafe px-2.5 py-1 text-xs font-bold tabular-nums text-amarillo"><Icon name="reloj" size={12} />Termina en {f.eligeHasta}</span>
        : <span className="flex items-center gap-0.5 whitespace-nowrap rounded-pill bg-cafe px-1.5 py-0.5 text-[10px] font-bold text-amarillo"><Icon name="reloj" size={10} />{f.eligeHasta}</span>)}
    </div>
  );

  const sinStock = (grande: boolean) => proximamente ? (
    grande ? (
      <div className="flex flex-1 flex-col justify-center gap-3">
        <div className="flex flex-col items-center gap-2 rounded-[20px] bg-n0/70 px-5 py-8 text-center">
          <Icon name="reloj" size={36} />
          <p className="text-[34px] font-black leading-none text-cafe">Próximamente</p>
          <p className="text-sm text-cafe">Cada miércoles, una oferta especial por pocas horas.</p>
        </div>
        <Volver texto={f.proximo ? `El nuevo Beneficio Flash llega el ${f.proximo}` : 'El nuevo Beneficio Flash llega el miércoles'} />
      </div>
    ) : (
      <div className="flex flex-1 flex-col justify-center gap-1.5">
        <p className="text-[22px] font-black leading-none text-cafe">Próximamente</p>
        <p className="text-[12px] font-semibold leading-4 text-cafe">{f.proximo ? `Nuevo Flash el ${f.proximo}` : 'Nuevo Flash el miércoles'}</p>
      </div>
    )
  ) : grande ? (
    <div className="flex flex-1 flex-col justify-center gap-3">
      <div className="relative flex flex-col gap-1 rounded-[20px] bg-n0/70 p-5">
        <LogoMarca src={f.logo} nombre={f.marca} className="opacity-70 !shadow-none" />
        <p className="text-[48px] font-black leading-none text-cafe/35 line-through lg:text-[56px]">{f.descuento} OFF</p>
        <p className="text-base font-bold text-cafe/60">{f.oferta}</p>
        <span className="absolute right-4 top-4 rotate-6 rounded-lg bg-cafe px-3 py-1.5 text-base font-black text-amarillo">¡SE AGOTÓ!</span>
      </div>
      {disfrutando > 0 && <p className="text-sm font-bold text-cafe">{disfrutando} personas lo aprovecharon. Te lo perdiste esta vez.</p>}
      <Volver texto={f.proximo ? `El próximo Beneficio Flash llega el ${f.proximo}` : 'El próximo Beneficio Flash llega el miércoles'} />
    </div>
  ) : (
    <div className="flex flex-1 flex-col justify-center gap-1.5">
      <span className="w-fit -rotate-3 rounded-md bg-cafe px-2 py-1 text-[12px] font-black text-amarillo">¡SE AGOTÓ!</span>
      <p className="text-[24px] font-black leading-none text-cafe/40 line-through">{f.descuento}</p>
      <p className="text-[11px] font-semibold leading-4 text-cafe">{disfrutando > 0 ? `${disfrutando} lo aprovecharon. ` : ''}{f.proximo ? `Próximo: ${f.proximo}` : 'Vuelve el miércoles'}</p>
    </div>
  );

  const boton = (compacto?: boolean) => !agotado && !proximamente && (
    <button type="button" onClick={() => setHoja(true)}
      className={cx('w-full whitespace-nowrap rounded-pill bg-n0 font-bold text-morado transition hover:brightness-95', compacto ? 'py-[9px] text-[13px]' : 'h-12 text-[15px]')}>
      {compacto && elegido && r.obtenido!.opcion.id === 'lanas' ? 'Ver mis Lanas' : texto}
    </button>
  );

  if (variante === 'compacta') {
    return (
      <>
        <div className="flex min-h-60 min-w-0 flex-1 flex-col gap-1.5 rounded-[20px] bg-rosa p-3.5">
          {cabecera()}
          {agotado || proximamente ? sinStock(false) : (
            <>
              <LogoMarca src={f.logo} nombre={f.marca} tamano="sm" />
              <p className="text-[34px] font-black leading-9 tracking-[-1.5px] text-cafe">{f.descuento}</p>
              <p className="line-clamp-2 text-[14px] font-extrabold leading-[17px] text-cafe">{corto}</p>
              <p className="truncate text-[11px] font-medium text-cafe">{lanas ? `o ${lanas.titulo}` : f.marca}</p>
              {beneficio?.quedan != null && <span className="mt-0.5 inline-flex w-fit items-center gap-1 rounded-pill bg-n0 px-2 py-0.5 text-[11px] font-extrabold text-cafe"><span className="size-1.5 rounded-full bg-rosa-fuerte" />Quedan {beneficio.quedan}</span>}
              <div className="flex-1" />
            </>
          )}
          {boton(true)}
        </div>
        {hojaFlash}
      </>
    );
  }

  if (variante === 'hoyWeb') {
    return (
      <>
        <div className="flex min-h-[400px] min-w-0 flex-1 flex-col gap-4 rounded-[24px] bg-rosa p-6">
          {cabecera(true)}
          {agotado || proximamente ? sinStock(true) : (
            <>
              <div className="relative flex flex-1 flex-col justify-center gap-1 overflow-hidden rounded-[20px] bg-n0 p-5">
                {f.imagen && <ImagenOpcional src={f.imagen} className="absolute right-2 top-2 h-[46%] w-auto object-contain" />}
                <LogoMarca src={f.logo} nombre={f.marca} tamano="lg" className="relative !shadow-none" />
                {!f.logo && f.marca && <p className="relative text-[13px] font-medium text-cafe/70">{f.marca}</p>}
                <p className="relative flex items-end gap-1.5">
                  <span className="text-[72px] font-black leading-none tracking-[-2px] text-cafe">{f.descuento}</span>
                  {f.descuento.includes('%') && <span className="pb-2.5 text-[28px] font-black leading-[22px] text-rosa-fuerte">OFF</span>}
                </p>
                <p className="relative text-lg font-extrabold leading-5 text-cafe">{f.oferta}</p>
                {lanas && <p className="relative text-[13px] font-bold text-cafe">o {lanas.titulo}</p>}
              </div>
              {elegido ? <Volver texto={volver} /> : stockBarra}
            </>
          )}
          {boton()}
        </div>
        {hojaFlash}
      </>
    );
  }

  return (
    <>
      <div className={cx('flex h-full flex-col gap-4 rounded-[24px] p-5 lg:p-6', className)} style={FONDO_FLASH}>
        {cabecera(true)}
        {agotado || proximamente ? sinStock(true) : (
          <>
            <div className="flex min-h-0 flex-1 items-center gap-2 rounded-[18px] bg-rosa-claro py-3 pl-5 pr-3 lg:pl-7" style={MUESCAS}>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                {f.imagen && f.logo ? <LogoMarca src={f.logo} nombre={f.marca} tamano="md" className="!justify-start !bg-transparent !shadow-none" />
                  : f.marca && <p className="text-[12px] font-bold uppercase tracking-[1px] text-cafe/70">{f.marca}</p>}
                <p className="flex items-end gap-x-1.5 whitespace-nowrap leading-none">
                  <span className="text-[52px] font-black tracking-[-2px] text-cafe lg:text-[56px] xl:text-[64px]">{f.descuento}</span>
                  {f.descuento.includes('%') && <span className="pb-1.5 text-[22px] font-black text-rosa-fuerte lg:text-[26px]">OFF</span>}
                </p>
                <p className="text-[15px] font-extrabold leading-5 text-cafe">{f.oferta}{lanas && ` · o ${lanas.titulo}`}</p>
              </div>
              {(f.imagen || f.logo) && (
                <div className="relative h-[120px] w-[36%] max-w-[200px] shrink-0 lg:h-[150px]">
                  {f.imagen
                    ? <ImagenOpcional src={f.imagen} respaldo={f.logo} className="absolute inset-0 m-auto max-h-full max-w-full object-contain" />
                    : <span className="absolute inset-0 m-auto flex size-[86%] items-center justify-center rounded-2xl bg-n0 p-3 shadow-card"><ImagenOpcional src={f.logo!} alt={f.marca} className="max-h-full max-w-full object-contain" /></span>}
                </div>
              )}
            </div>
            {stockBarra}
            {elegido && <Volver texto={volver} />}
          </>
        )}
        {r.error && <p role="alert" className="text-xs font-semibold text-cafe">{r.error}</p>}
        {agotado ? <Link to="/beneficios" className="flex h-12 w-full items-center justify-center rounded-pill bg-n0 text-[15px] font-bold text-cafe">Ver otros beneficios</Link> : boton()}
      </div>
      {hojaFlash}
    </>
  );
}

export function CardFlashCompacta() {
  return <CardFlash variante="compacta" />;
}

export function CardCofreVisitante() {
  const navigate = useNavigate();
  const [hoja, setHoja] = useState(false);
  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-[24px] bg-[radial-gradient(120%_100%_at_78%_45%,#3D2A08_0%,#211402_62%)] text-n0 lg:min-h-[300px] lg:flex-row">
      <div className="relative flex flex-col items-center gap-1 px-5 pt-4 lg:order-2 lg:flex-1 lg:p-0">
        <span className="w-fit rounded-md bg-rosa px-2.5 py-1 text-[11px] font-black tracking-[1px] text-cafe lg:hidden">COFRE SORPRESA · CADA MIÉRCOLES</span>
        <img src={asset('assets/3d/cofre-3d.webp')} alt="Cofre sorpresa abierto con premios" className="h-[150px] w-auto max-w-full object-contain lg:absolute lg:inset-0 lg:m-auto lg:h-auto lg:max-h-[90%] lg:max-w-[96%]" />
      </div>
      <div className="flex flex-col items-center gap-2 px-5 pb-5 pt-1 text-center lg:order-1 lg:w-[56%] lg:shrink-0 lg:items-start lg:justify-center lg:gap-3 lg:py-6 lg:pl-7 lg:pr-2 lg:text-left">
        <span className="hidden w-fit rounded-md bg-rosa px-2.5 py-1 text-[11px] font-black tracking-[1px] text-cafe lg:inline-flex">COFRE SORPRESA · CADA MIÉRCOLES</span>
        <p className="text-[24px] font-black leading-[1.05] lg:text-[34px]">Un cofre nuevo <span className="text-amarillo">cada semana</span></p>
        <p className="text-[13px] leading-[18px] text-n0/85 lg:text-[15px] lg:leading-[21px]">Ábrelo y descubre tu premio: entradas, descuentos o Lanas. Nunca sabes qué sale.</p>
        <button type="button" onClick={() => setHoja(true)} className="mt-1 flex h-12 w-full items-center justify-center gap-1.5 whitespace-nowrap rounded-pill bg-amarillo px-7 text-[15px] font-bold text-cafe lg:w-auto">
          <Icon name="cofre" size={18} />Abrir cofre<Icon name="chevron" size={16} />
        </button>
      </div>
      <Hoja abierto={hoja} onCerrar={() => setHoja(false)} titulo="Tu cofre está cerrado" subtitulo="Solo los suscriptores pueden abrirlo.">
        <div className="flex justify-center rounded-2xl bg-cafe"><Cofre3D className="h-36" /></div>
        <p className="text-sm">Esta semana el cofre trae premios como estos. Suscríbete y abre tu cofre cada miércoles:</p>
        <Entregados lista={cofreSemana.entregadosLista} />
        <Button full onClick={() => navigate('/planes')}>Suscríbete y ábrelo</Button>
      </Hoja>
    </div>
  );
}

export function CardFlashVisitante() {
  const navigate = useNavigate();
  const usados = flashSemana.opciones.reduce((n, o) => n + ((o.total ?? 0) - (o.quedan ?? 0)), 0);
  return (
    <div className="flex h-full flex-col gap-2.5 overflow-hidden rounded-[24px] p-3.5 lg:gap-3 lg:p-6" style={FONDO_FLASH}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-md bg-amarillo px-2.5 py-1 text-[11px] font-black tracking-[1px] text-cafe"><Icon name="rayo" size={11} />BENEFICIO FLASH</span>
        <span className="flex items-center gap-1 whitespace-nowrap rounded-pill bg-cafe px-2.5 py-1 text-xs font-bold tabular-nums text-amarillo"><Icon name="reloj" size={14} />Termina en {flashSemana.eligeHasta}</span>
      </div>
      <div className="flex min-h-0 flex-1 items-center gap-2 rounded-[18px] bg-rosa-claro py-2.5 pl-5 pr-3 lg:pl-7" style={MUESCAS}>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <LogoMarca src={flashSemana.logo} nombre={flashSemana.marca} tamano="md" className="!justify-start !bg-transparent !shadow-none" />
          <p className="flex flex-wrap items-end gap-x-1.5 leading-none">
            <span className="text-[44px] font-black tracking-[-2px] text-cafe lg:text-[72px]">{flashSemana.descuento}</span>
            <span className="pb-1.5 text-[22px] font-black text-rosa-fuerte lg:text-[30px]">OFF</span>
          </p>
          <p className="text-[15px] font-extrabold leading-5 text-cafe lg:text-lg">{flashSemana.oferta.replace(/^OFF /, '')}</p>
        </div>
        <div className="relative h-[104px] w-[38%] max-w-[150px] shrink-0 lg:h-auto lg:max-w-[230px] lg:self-stretch">
          <img src={asset('assets/3d/flash-lentes-3d.webp')} alt="Lentes y monturas" className="absolute inset-0 m-auto max-h-full max-w-full object-contain" />
        </div>
      </div>
      <p className="text-[13px] font-semibold leading-[18px] text-cafe lg:text-sm">Una oferta por pocas horas, cada miércoles. {usados} suscriptores ya lo están usando.</p>
      <button type="button" onClick={() => navigate('/planes')} className="flex h-11 w-full shrink-0 items-center justify-center gap-1 rounded-pill bg-n0 text-[15px] font-bold text-morado lg:h-12">Suscríbete para usarlo<Icon name="chevron" size={16} /></button>
    </div>
  );
}
