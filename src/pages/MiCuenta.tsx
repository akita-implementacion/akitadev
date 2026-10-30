import { FLAGS } from '../data/reglas';
import { useEffect, useState, type ReactNode } from 'react';
import { Contenido, Hero } from '../components/layout/Hero';
import { CardBilletera, CardProgresoMisiones, CodigoReferido } from '../components/cards/cards';
import { Badge, Barra, ButtonCompacto, ChipFiltro, ImagenOpcional, MonedaLana, cx } from '../components/ui/primitives';
import { Icon, type IconName } from '../components/ui/Icon';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { formatoLanas, menuCuenta, miAnio } from '../data/mock';
import { Tx } from '../data/revision';
import { useSesion } from '../data/sesion';
import {
  useBilletera, useMisCupones, useMisiones, useMovimientosLanas, useParticipaciones, usePerfilEditable,
  useRecompensas, useReferidos, useUbigeo, useUsuario,
} from '../data/datos';
import { invalidar } from '../data/recurso';
import { config } from '../api/config';
import { mensajeError } from '../api/client';
import { usuarioApi } from '../api/servicios';
import { MiPlanYPagos, TarjetaPlanActual } from '../components/cuenta/MiPlanYPagos';
import { limpiar, validar } from '../data/validacion';
import { GENEROS, type Genero, type PerfilOpcionalDTO } from '../api/tipos';
import type { Cupon, Movimiento, PerfilEditable } from '../data/adaptadores';
import { Hoja } from '../components/ui/Hoja';
import { EntregaPremio, tituloResultado } from '../components/cards/entrega';
import { LogoComercio } from '../components/beneficios/catalogo';
import { asset } from '../data/assets';

const SECCIONES = ['Mi plan y pagos', 'Mis Lanas', 'Mis Cupones', 'Historial de recompensas', 'Mis participaciones', 'Mi perfil'] as const;
type Seccion = (typeof SECCIONES)[number];
const esSeccion = (s: unknown): s is Seccion => SECCIONES.includes(s as Seccion);

function Perfil() {
  const usuario = useUsuario();
  return (
    <div className="flex items-center gap-3.5 lg:flex-col lg:items-start lg:gap-4 lg:rounded-[24px] lg:bg-n0 lg:p-6">
      <span className="flex size-14 shrink-0 items-center justify-center rounded-pill bg-azul text-2xl font-black lg:size-16">{usuario.inicial}</span>
      <div className="flex flex-col gap-0.5">
        <p className="text-[28px] font-extrabold leading-8">{usuario.nombreCompleto}</p>
        {usuario.plan
          ? <p className="text-[13px] text-n60"><Tx k="cuenta.plan" v={{ plan: usuario.plan, n: usuario.chancesPorPlan }} /></p>
          : <><p className="text-[13px] text-n60">Sin plan activo</p><Link to="/planes" className="text-[13px] font-bold text-error">Ver planes</Link></>}
      </div>
    </div>
  );
}

function MiAnio() {
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-n0 p-5 lg:rounded-[24px] lg:p-6">
      <p className="text-[10px] font-bold tracking-[1.4px] text-n60">MI AÑO EN AKITÁ</p>
      <div className="flex justify-between gap-4">
        <div className="flex w-[110px] flex-col gap-0.5 lg:w-auto lg:flex-1"><p className="text-2xl font-black">{miAnio.cupones}</p><p className="text-xs leading-4 text-n60">cupones generados</p></div>
        <div className="flex w-[110px] flex-col gap-0.5 lg:w-auto lg:flex-1"><p className="text-2xl font-black">{miAnio.sorteos}</p><p className="text-xs leading-4 text-n60">sorteos en los que participaste</p></div>
      </div>
    </div>
  );
}

function PerfilIncompleto({ onCompletar }: { onCompletar: () => void }) {
  const usuario = useUsuario();
  if (usuario.perfilPct >= 100) return null;
  return (
    <div className="relative flex flex-col gap-3 overflow-hidden rounded-2xl bg-n0 p-5 lg:rounded-[24px]">
      <ImagenOpcional src="assets/oveja-pose.webp" className="pointer-events-none absolute -bottom-2 right-3 hidden h-[52%] max-h-[110px] w-auto object-contain lg:block" />
      <div className="flex items-center justify-between">
        <p className="text-base font-extrabold">Tu perfil está al {usuario.perfilPct} %</p>
        <ButtonCompacto variant="link" iconRight="flecha" className="self-start" onClick={onCompletar}>Completar</ButtonCompacto>
      </div>
      <Barra valor={usuario.perfilPct} total={100} />
      <p className="text-xs text-n60"><Tx k="cuenta.perfil.falta" v={{ n: 150 }} /></p>
    </div>
  );
}

function MiRebano() {
  const r = useReferidos();
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-n0 p-5 lg:rounded-[24px]">
      <h2 className="text-xl font-extrabold">Mi rebaño</h2>
      <p className="text-sm font-bold"><Tx k="cuenta.rebano.avance" v={{ n: r.recompensa, avance: r.avance, meta: r.meta, faltan: Math.max(0, r.meta - r.avance) }} /></p>
      <CodigoReferido />
      <p className="text-xs leading-[17px] text-n60"><Tx k="cuenta.rebano.condicion" /></p>
    </div>
  );
}

function Lista({ children }: { children: ReactNode }) {
  return <div className="flex flex-col overflow-hidden rounded-2xl bg-n0 lg:rounded-[24px]">{children}</div>;
}
function Fila({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx('flex items-center gap-3 border-b border-n10 px-5 py-4 last:border-b-0', className)}>{children}</div>;
}

function Estado({ cargando, error, vacio, recargar }: { cargando?: boolean; error?: unknown; vacio: string; recargar?: () => void }) {
  return (
    <div className="flex flex-col items-start gap-2 rounded-2xl bg-n0 p-5 text-sm lg:rounded-[24px]">
      {cargando ? <p className="text-n60">Cargando…</p> : error ? (
        <>
          <p className="font-semibold text-error">{mensajeError(error)}</p>
          {recargar && <ButtonCompacto variant="link" onClick={recargar}>Reintentar</ButtonCompacto>}
        </>
      ) : <p className="text-n60">{vacio}</p>}
    </div>
  );
}

function CantidadLanas({ n }: { n: number }) {
  return (
    <span className={cx('flex shrink-0 items-center gap-1 text-base font-extrabold', n < 0 ? 'text-cafe' : 'text-verde-texto')}>
      {n > 0 ? '+' : n < 0 ? '−' : ''}{formatoLanas(Math.abs(n))}
      <MonedaLana size={18} />
    </span>
  );
}

function useAccion<R>(fn: () => Promise<R>, simulado: R) {
  const { modoMock } = useSesion();
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const ejecutar = async (): Promise<R | undefined> => {
    if (enviando) return;
    setError('');
    if (modoMock) return simulado;
    setEnviando(true);
    try { return await fn(); } catch (e) { setError(mensajeError(e)); } finally { setEnviando(false); }
  };
  return { ejecutar, enviando, error };
}

function BloqueLanas({ onMovimientos }: { onMovimientos: () => void }) {
  const billetera = useBilletera();
  return (
    <section className="grid grid-cols-1 overflow-hidden rounded-[24px] bg-n0 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <div className="flex flex-col gap-3 bg-hero-brand p-6 text-n0">
        <p className="text-[11px] font-bold tracking-[1.4px] text-n0/80">MIS LANAS</p>
        <div className="flex items-center gap-3">
          <MonedaLana size={48} />
          <p className="text-[56px] font-black leading-none text-amarillo">{formatoLanas(billetera.saldo)}</p>
        </div>
        <p className="text-sm text-n0/85">Equivalen a {formatoLanas(billetera.saldo)} chances{billetera.porVencer.lanas > 0 ? ` · ${formatoLanas(billetera.porVencer.lanas)} Lanas vencen el ${billetera.porVencer.fecha}` : ''}</p>
        {!billetera.puedeGastar && <p className="text-xs font-semibold text-amarillo">Reactiva tu plan para usar tus Lanas.</p>}
        <div className="mt-auto grid grid-cols-2 gap-2 pt-2 lg:gap-2.5">
          <Link to="/beneficios" className="inline-flex h-11 min-w-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-pill bg-n0 px-2 text-[13px] font-bold text-cafe min-[380px]:text-sm lg:gap-2 lg:px-4"><Icon name="regalo" size={16} />Usar mis Lanas</Link>
          <button type="button" onClick={onMovimientos} className="inline-flex h-11 min-w-0 items-center justify-center whitespace-nowrap rounded-pill border-[1.5px] border-n0 px-2 text-[13px] font-bold text-n0 min-[380px]:text-sm lg:px-4">Movimientos</button>
        </div>
      </div>
      <div className="flex flex-col gap-4 p-6">
        <p className="text-lg font-extrabold">¿Cómo funcionan las Lanas?</p>
        {([
          { icono: 'misiones', t: 'Gánalas', d: 'Con misiones, referidos, el cofre de la semana y el Beneficio Flash. No se compran.' },
          { icono: 'ticket', t: 'Úsalas', d: 'Cámbialas por chances en cualquier sorteo (1 Lana = 1 chance), por sorteos VIP o por beneficios.' },
          { icono: 'reloj', t: 'No las dejes vencer', d: 'Vencen 3 meses después de recibirlas, al cierre del mes. Usamos primero las que vencen antes.' },
        ] as const).map((x) => (
          <div key={x.t} className="flex gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-pill bg-amarillo"><Icon name={x.icono} size={20} /></span>
            <div className="flex flex-col gap-0.5"><p className="text-[15px] font-bold">{x.t}</p><p className="text-[13px] leading-[19px] text-n60">{x.d}</p></div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Pestanas<T extends string>({ opciones, activa, onCambio }: { opciones: [T, string][]; activa: T; onCambio: (v: T) => void }) {
  return (
    <div className="no-scrollbar -mx-6 flex gap-2 overflow-x-auto px-6 lg:mx-0 lg:px-0">
      {opciones.map(([v, t]) => <ChipFiltro key={v} activo={activa === v} onClick={() => onCambio(v)}>{t}</ChipFiltro>)}
    </div>
  );
}

function Vacio({ titulo, texto, accion }: { titulo: string; texto: string; accion?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl bg-n0 px-6 py-8 text-center">
      <ImagenOpcional src="img/oveja-preguntas.webp" className="h-24 w-auto object-contain" />
      <p className="text-[17px] font-extrabold">{titulo}</p>
      <p className="max-w-[320px] text-sm text-n60">{texto}</p>
      {accion}
    </div>
  );
}

const Chip = ({ children, tono = 'n5' }: { children: ReactNode; tono?: 'n5' | 'amarillo' | 'verde' | 'rosa' | 'error' }) => (
  <span className={cx('w-fit rounded-pill px-2.5 py-0.5 text-[12px] font-bold', {
    n5: 'bg-n5 text-n60', amarillo: 'bg-amarillo text-cafe', verde: 'bg-verde/30 text-verde-texto', rosa: 'bg-rosa text-cafe', error: 'bg-error/10 text-error',
  }[tono])}>{children}</span>
);

const iconoMovimiento = (m: Movimiento): IconName =>
  m.lanas < 0 ? 'ticket' : /cofre/i.test(m.titulo + m.origen) ? 'cofre' : /flash/i.test(m.titulo + m.origen) ? 'rayo' : /misi|refer|visita|perfil|datos/i.test(m.titulo + m.origen) ? 'misiones' : 'regalo';

function PaginaMovimientos({ page, ultima, filtro, onMas }: { page: number; ultima: boolean; filtro: 'todos' | 'ganadas' | 'usadas'; onMas: () => void }) {
  const r = useMovimientosLanas(page);
  const anterior = useMovimientosLanas(Math.max(1, page - 1));
  const mesPrevio = page > 1 ? anterior.data.items[anterior.data.items.length - 1]?.mes : undefined;
  if (page === 1 && !r.data.items.length) return <Estado cargando={r.cargando} error={r.error} recargar={r.recargar} vacio="Aún no tienes movimientos de Lanas." />;
  const items = r.data.items.filter((m) => filtro === 'todos' || (filtro === 'ganadas' ? m.lanas > 0 : m.lanas < 0));
  const grupos: { mes: string; items: Movimiento[] }[] = [];
  items.forEach((m) => { const g = grupos[grupos.length - 1]; if (g && g.mes === m.mes) g.items.push(m); else grupos.push({ mes: m.mes, items: [m] }); });
  return (
    <>
      {grupos.map((g, gi) => (
        <section key={`${g.mes}-${gi}`} className="flex flex-col gap-2">
          {!(gi === 0 && g.mes === mesPrevio) && g.mes && <p className="text-[13px] font-bold text-n60">{g.mes}</p>}
          <ul className="overflow-hidden rounded-2xl bg-n0">
            {g.items.map((m, i) => (
              <li key={`${m.id}-${i}`} className="flex items-center gap-3 border-b border-n10 px-4 py-3 last:border-0">
                <span className={cx('flex size-10 shrink-0 items-center justify-center rounded-pill', m.lanas > 0 ? 'bg-amarillo' : 'bg-n5')}><Icon name={iconoMovimiento(m)} size={18} /></span>
                <div className="flex min-w-0 flex-1 flex-col">
                  <p className="truncate text-[14px] font-bold">{m.titulo}</p>
                  <p className="text-[12px] text-n60">{[m.origen !== m.titulo && m.origen, m.fecha, m.vence && `vence ${m.vence}`].filter(Boolean).join(' · ')}</p>
                </div>
                <span className={cx('shrink-0 text-[15px] font-black tabular-nums', m.lanas > 0 ? 'text-verde-texto' : 'text-cafe')}>{m.lanas > 0 ? '+' : '−'}{formatoLanas(Math.abs(m.lanas))}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
      {ultima && (r.cargando ? <p className="text-sm text-n60">Cargando…</p>
        : r.data.hayMas && <ButtonCompacto variant="link" className="self-center" onClick={onMas}>Ver más movimientos</ButtonCompacto>)}
    </>
  );
}

function MisLanas() {
  const billetera = useBilletera();
  const primera = useMovimientosLanas(1);
  const [paginas, setPaginas] = useState(1);
  const [filtro, setFiltro] = useState<'todos' | 'ganadas' | 'usadas'>('todos');
  const sinLanas = billetera.saldo === 0 && !primera.cargando && !primera.data.items.length;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-2xl bg-hero-brand p-5 text-n0 lg:rounded-[24px] lg:p-6">
        <p className="text-[11px] font-bold tracking-[1.4px] text-n0/80">TU SALDO</p>
        <div className="flex items-center gap-3"><MonedaLana size={42} /><p className="text-[44px] font-black leading-none text-amarillo">{formatoLanas(billetera.saldo)}</p></div>
        <p className="text-sm text-n0/85">1 Lana = 1 chance en cualquier sorteo.</p>
        {billetera.porVencer.lanas > 0 && (
          <p className="flex items-center gap-2 rounded-xl bg-n0/10 px-3 py-2 text-[13px]"><Icon name="reloj" size={16} />{formatoLanas(billetera.porVencer.lanas)} Lanas vencen el {billetera.porVencer.fecha}. Usamos primero las que vencen antes.</p>
        )}
        {!billetera.puedeGastar && <p className="text-xs font-semibold text-amarillo">Reactiva tu plan para usar tus Lanas.</p>}
        <Link to="/sorteos" className="inline-flex h-11 w-fit items-center gap-1.5 rounded-pill bg-n0 px-5 text-sm font-bold text-cafe"><Icon name="ticket" size={16} />Úsalas en un sorteo</Link>
      </div>
      {sinLanas ? (
        <Vacio titulo="Aún no tienes Lanas" texto="Gánalas con tus misiones, el Cofre de cada jueves y el Flash de cada viernes. Aquí verás cada movimiento."
          accion={<Link to="/misiones" className="mt-1 text-sm font-bold underline">Ver mis misiones</Link>} />
      ) : (
        <>
          <Pestanas opciones={[['todos', 'Todos'], ['ganadas', 'Ganadas'], ['usadas', 'Usadas']]} activa={filtro} onCambio={setFiltro} />
          {Array.from({ length: paginas }, (_, i) => (
            <PaginaMovimientos key={i} page={i + 1} ultima={i + 1 === paginas} filtro={filtro} onMas={() => setPaginas(paginas + 1)} />
          ))}
        </>
      )}
    </div>
  );
}

function HojaCupon({ c, onCerrar }: { c: Cupon; onCerrar: () => void }) {
  const idUsuario = useUsuario().idUsuario;
  const entrega = { tipo: c.tipo, codigo: c.codigo || undefined, enlace: c.enlace, qrUrl: c.qr, instrucciones: c.tipo === 'dni' ? undefined : c.instrucciones || undefined,
    idUsuario: /cofre/i.test(c.origen) && c.instrucciones ? idUsuario || undefined : undefined };
  return (
    <Hoja abierto onCerrar={onCerrar} titulo={tituloResultado(c.tipo)} subtitulo={[c.titulo, c.comercio].filter(Boolean).join(' · ')}
      pie={<button onClick={onCerrar} className="inline-flex h-14 w-full items-center justify-center rounded-pill bg-amarillo text-[16px] font-extrabold text-cafe">Listo</button>}>
      <EntregaPremio entrega={entrega} comercio={c.comercio || 'el comercio'} hasta={c.vence} />
    </Hoja>
  );
}

function MisCupones() {
  const r = useMisCupones();
  const [tab, setTab] = useState<Cupon['estado']>('disponible');
  const [ver, setVer] = useState<Cupon | null>(null);
  const lista = r.data.filter((c) => c.estado === tab);
  const cuenta = (e: Cupon['estado']) => r.data.filter((c) => c.estado === e).length;
  const tono = (o: string) => (/cofre|flash/i.test(o) ? 'rosa' : /canje/i.test(o) ? 'amarillo' : 'n5') as 'rosa' | 'amarillo' | 'n5';
  if (!r.data.length && (r.cargando || r.error)) return <Estado cargando={r.cargando} error={r.error} recargar={r.recargar} vacio="" />;
  return (
    <div className="flex flex-col gap-4">
      <Pestanas opciones={[['disponible', `Disponibles (${cuenta('disponible')})`], ['usado', `Usados (${cuenta('usado')})`], ['vencido', `Vencidos (${cuenta('vencido')})`]]} activa={tab} onCambio={setTab} />
      {!lista.length ? <Vacio titulo="No tienes cupones aquí" texto="Lo que obtengas en el Cofre, el Flash, los beneficios y los canjes de Lanas aparecerá en esta sección." /> : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {lista.map((c, i) => (
            <article key={`${c.id}-${i}`} className={cx('flex flex-col gap-3 rounded-2xl bg-n0 p-4', c.estado !== 'disponible' && 'opacity-75')}>
              <div className="flex items-start gap-3">
                {c.logo ? <LogoComercio logo={asset(c.logo)} nombre={c.comercio || c.titulo} tamano="sm" className="!shadow-none ring-1 ring-n10" />
                  : <span className="flex size-10 shrink-0 items-center justify-center rounded-pill bg-amarillo"><Icon name="regalo" size={20} /></span>}
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <p className="text-[15px] font-extrabold leading-5">{c.titulo}</p>
                  {c.comercio && <p className="text-[12.5px] text-n60">{c.comercio}</p>}
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(c.origen || c.conLanas) && <Chip tono={tono(c.origen || 'Canje')}>{c.conLanas ? `Canje de ${formatoLanas(c.lanas)} Lanas` : c.origen}</Chip>}
                {c.vence && <Chip tono={c.estado === 'vencido' ? 'error' : 'n5'}>{c.estado === 'vencido' ? `Venció el ${c.vence}` : c.estado === 'usado' ? `Usado${c.fecha ? ` · obtenido el ${c.fecha}` : ''}` : `Vence el ${c.vence}`}</Chip>}
              </div>
              {c.estado === 'disponible' && (
                <button onClick={() => setVer(c)} className="inline-flex h-11 items-center justify-center gap-1.5 rounded-pill bg-cafe text-sm font-bold text-n0"><Icon name="cupon" size={16} />Ver cupón</button>
              )}
            </article>
          ))}
        </div>
      )}
      {ver && <HojaCupon c={ver} onCerrar={() => setVer(null)} />}
    </div>
  );
}

function HistorialRecompensas({ onCupones }: { onCupones: () => void }) {
  const r = useRecompensas();
  const [tab, setTab] = useState<'todos' | 'Cofre' | 'Flash'>('todos');
  if (!r.data.length) return <Estado cargando={r.cargando} error={r.error} recargar={r.recargar} vacio="Aún no tienes recompensas. Abre tu cofre del jueves y elige tu Flash del viernes." />;
  const tipo = (o: string) => (/cofre/i.test(o) ? 'Cofre' : /flash/i.test(o) ? 'Flash' : '');
  const lista = r.data.filter((h) => tab === 'todos' || tipo(h.origen) === tab);
  return (
    <div className="flex flex-col gap-4">
      <Pestanas opciones={[['todos', 'Todo'], ['Cofre', 'Cofre'], ['Flash', 'Flash']]} activa={tab} onCambio={setTab} />
      {!lista.length ? <Vacio titulo="Nada por aquí todavía" texto="Cuando elijas un premio o Lanas en el Cofre o el Flash, lo verás en esta lista." /> : (
        <ul className="overflow-hidden rounded-2xl bg-n0">
          {lista.map((h, i) => {
            const t = tipo(h.origen);
            return (
              <li key={`${h.id}-${i}`} className="flex items-start gap-3 border-b border-n10 px-4 py-3.5 last:border-0">
                <span className={cx('flex size-10 shrink-0 items-center justify-center rounded-pill', t === 'Cofre' ? 'bg-cafe text-amarillo' : t === 'Flash' ? 'bg-rosa text-cafe' : 'bg-amarillo text-cafe')}>
                  <Icon name={t === 'Cofre' ? 'cofre' : t === 'Flash' ? 'rayo' : 'misiones'} size={18} />
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <p className="text-[12px] font-bold text-n60">{[h.origen, h.fecha].filter(Boolean).join(' · ')}</p>
                  <p className="text-[14px] font-extrabold">{h.titulo}</p>
                  <p className="text-[12.5px] text-n60">{h.lanas > 0 ? `Se sumaron a tu billetera${h.vence ? ` · vencen el ${h.vence}` : ''}.` : 'Está en Mis Cupones.'}</p>
                </div>
                {h.lanas > 0 ? <span className="shrink-0 self-center"><MonedaLana size={22} /></span>
                  : <button onClick={onCupones} className="shrink-0 self-center text-[13px] font-bold underline">Ver cupón</button>}
              </li>
            );
          })}
        </ul>
      )}
      <p className="text-[12.5px] text-n60">El Cofre llega cada jueves y el Flash cada viernes. En cada uno eliges un premio o Lanas.</p>
    </div>
  );
}

function MisParticipaciones() {
  const [tipo, setTipo] = useState<'activas' | 'historicas'>('activas');
  const r = useParticipaciones(tipo);
  const proximos = useParticipaciones('activas');
  const sorteos = r.data.flatMap((g) => g.sorteos.map((s) => ({ ...s, fecha: g.fecha })));
  const nProximos = proximos.data.reduce((n, g) => n + g.sorteos.length, 0);
  return (
    <div className="flex flex-col gap-4">
      <Pestanas opciones={[['activas', `Próximos${nProximos ? ` (${nProximos})` : ''}`], ['historicas', 'Sorteos pasados']]} activa={tipo} onCambio={setTipo} />
      {!sorteos.length ? (
        r.cargando || r.error ? <Estado cargando={r.cargando} error={r.error} recargar={r.recargar} vacio="" />
          : <Vacio titulo={tipo === 'activas' ? 'Aún no participas en próximos sorteos' : 'Aún no tienes sorteos pasados'}
              texto={tipo === 'activas' ? 'Con tu plan activo participas cada miércoles. También puedes sumar chances con tus Lanas.' : 'Aquí verás el resultado de cada sorteo en el que participaste.'}
              accion={<Link to="/sorteos" className="mt-1 text-sm font-bold underline">Ver sorteos</Link>} />
      ) : tipo === 'activas' ? sorteos.map((s, i) => (
        <article key={`${s.id}-${i}`} className="flex flex-col gap-3 rounded-2xl bg-n0 p-4">
          <div className="flex items-center gap-3.5">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-amarillo/40"><Icon name="premios" size={26} /></span>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <p className="text-[16px] font-extrabold leading-5">{s.premio}</p>
              <p className="flex items-center gap-1 text-[12.5px] text-n60"><Icon name="calendario" size={14} />Sorteo {s.fecha}</p>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-xl bg-cafe px-4 py-3 text-n0">
            <div className="flex flex-col">
              <span className="text-[12px] text-n0/75">Tienes</span>
              <span className="text-[24px] font-black leading-none text-amarillo">{s.chances} {s.chances === 1 ? 'chance' : 'chances'}</span>
            </div>
            {(s.plan > 0 || s.sumadas > 0 || s.regalo > 0) && (
              <span className="text-right text-[12px] leading-4 text-n0/80">{s.plan} de tu plan{s.sumadas ? <><br />{s.sumadas} sumadas</> : null}{s.regalo ? <><br />{s.regalo} de regalo</> : null}</span>
            )}
          </div>
          {s.renovacion && <p className="text-[12.5px] text-n60">Las chances de tu plan están sujetas a la renovación.</p>}
          <div className="flex justify-end">
            <Link to="/sorteos" className="inline-flex h-10 items-center gap-1.5 rounded-pill bg-cafe px-4 text-[13px] font-bold text-n0"><Icon name="ticket" size={16} />Sumar chances</Link>
          </div>
        </article>
      )) : sorteos.map((s, i) => (
        <article key={`${s.id}-${i}`} className={cx('flex flex-col gap-2 rounded-2xl p-4', s.ganador ? 'bg-amarillo' : 'bg-n0')}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-0.5">
              <p className="text-[15px] font-extrabold">{s.premio}</p>
              <p className="text-[12.5px] text-n60">Sorteo del {s.fecha} · participaste con {s.chances} {s.chances === 1 ? 'chance' : 'chances'}</p>
            </div>
            {s.ganador ? <Chip tono="verde">¡Ganaste!</Chip> : <Chip>No ganaste</Chip>}
          </div>
          <p className="text-[13px]">{s.ganador ? 'Te contactamos por correo y WhatsApp para coordinar la entrega de tu premio.' : '¡El próximo puede ser tuyo!'}</p>
          <Link to="/sorteos" state={{ vista: 'ganadores' }} className="w-fit text-[13px] font-bold underline">Ver ganadores y transmisión</Link>
        </article>
      ))}
    </div>
  );
}

const campo = 'h-12 w-full rounded-xl border border-n10 bg-n0 px-4 text-[15px] font-semibold text-cafe outline-none focus:border-cafe disabled:bg-n5 disabled:text-n40';

function Etiqueta({ texto, children }: { texto: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-bold text-n60">{texto}</span>
      {children}
    </label>
  );
}

function SelectorDistrito({ valor, onChange }: { valor: string; onChange: (codigo: string) => void }) {
  const [dep, setDep] = useState(valor.slice(0, 2));
  const [prov, setProv] = useState(valor.slice(0, 4));
  useEffect(() => { if (valor) { setDep(valor.slice(0, 2)); setProv(valor.slice(0, 4)); } }, [valor]);
  const u = useUbigeo(dep, prov);
  return (
    <div className="grid gap-3 lg:grid-cols-3">
      <Etiqueta texto="Departamento">
        <select className={campo} value={dep} onChange={(e) => { setDep(e.target.value); setProv(''); onChange(''); }}>
          <option value="">Elige…</option>
          {u.departamentos.map((d) => <option key={d.codigo} value={d.codigo}>{d.nombre}</option>)}
        </select>
      </Etiqueta>
      <Etiqueta texto="Provincia">
        <select className={campo} value={prov} disabled={!dep} onChange={(e) => { setProv(e.target.value); onChange(''); }}>
          <option value="">Elige…</option>
          {u.provincias.map((d) => <option key={d.codigo} value={d.codigo}>{d.nombre}</option>)}
        </select>
      </Etiqueta>
      <Etiqueta texto="Distrito">
        <select className={campo} value={valor} disabled={!prov} onChange={(e) => onChange(e.target.value)}>
          <option value="">Elige…</option>
          {u.distritos.map((d) => <option key={d.codigo} value={d.codigo}>{d.nombre}</option>)}
        </select>
      </Etiqueta>
    </div>
  );
}

function MisionDistrito({ distritoActual }: { distritoActual: string }) {
  const mision = useMisiones().find((m) => m.id === 'perfil' || !!m.cta.to?.startsWith('/mi-cuenta'));
  const [distrito, setDistrito] = useState(distritoActual);
  const [lanas, setLanas] = useState<number | null>(null);
  const recompensa = Number((mision?.recompensa ?? '').replace(/\D/g, '')) || 0;
  const confirmar = useAccion(() => usuarioApi.confirmarDistrito(distrito), { completed: true, rewardLanas: recompensa });
  useEffect(() => { if (distritoActual) setDistrito(distritoActual); }, [distritoActual]);
  if (!mision || (mision.avance >= mision.meta && lanas === null)) return null;

  const enviar = async () => {
    const r = await confirmar.ejecutar();
    if (!r) return;
    setLanas(r.rewardLanas ?? recompensa);
    invalidar('misiones');
    invalidar('usuario');
    invalidar('lanas');
    invalidar('recompensas');
  };
  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-crema p-5 lg:rounded-[24px] lg:p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-bold tracking-[1.4px] text-n60">MISIÓN · {mision.ciclo}</p>
        {mision.recompensa && <Badge small>{mision.recompensa} Lanas</Badge>}
      </div>
      {lanas !== null ? (
        <p role="status" className="flex items-center gap-2 text-[14px] font-bold text-verde-texto"><Icon name="check" size={18} />¡Listo! Completaste tu perfil{lanas ? ` y ganaste +${formatoLanas(lanas)} Lanas` : ''}.</p>
      ) : (
        <>
          <div className="flex flex-col gap-1">
            <p className="text-xl font-extrabold">Confirma tu distrito</p>
            <p className="text-sm text-n60">Es lo único que falta para completar tu perfil.</p>
          </div>
          <SelectorDistrito valor={distrito} onChange={setDistrito} />
          {confirmar.error && <p className="text-sm font-semibold text-error">{confirmar.error}</p>}
          <ButtonCompacto variant="oscuro" className="self-start disabled:cursor-not-allowed disabled:opacity-40" disabled={!distrito || confirmar.enviando} onClick={enviar}>
            {confirmar.enviando ? 'Confirmando…' : 'Confirmar distrito'}
          </ButtonCompacto>
        </>
      )}
    </div>
  );
}

const aDTO = (p: PerfilEditable): PerfilOpcionalDTO => ({
  address: p.direccion.trim() || undefined,
  gender: (GENEROS as readonly string[]).includes(p.genero) ? (p.genero as Genero) : undefined,
  districtUbigeoCode: p.distrito || undefined,
  carPlate: p.placa.trim().toUpperCase() || undefined,
});

function MiPerfil() {
  const { perfil, cargando } = usePerfilEditable();
  const usuario = useUsuario();
  const [form, setForm] = useState(perfil);
  const [guardado, setGuardado] = useState(false);
  const firma = JSON.stringify(perfil);
  useEffect(() => { setForm(perfil); }, [firma]); // eslint-disable-line react-hooks/exhaustive-deps
  const cambios = JSON.stringify(aDTO(form)) !== JSON.stringify(aDTO(perfil));
  const placaValida = !validar.placa(form.placa);
  const guardar = useAccion(() => usuarioApi.perfilOpcional(aDTO(form)), aDTO(form));
  const set = (k: keyof PerfilEditable) => (v: string) => { setForm((f) => ({ ...f, [k]: v })); setGuardado(false); };

  const enviar = async () => {
    if (!cambios || !placaValida) return;
    if (!(await guardar.ejecutar())) return;
    setGuardado(true);
    invalidar('usuario');
    invalidar('misiones');
    invalidar('lanas');
    invalidar('recompensas');
  };
  return (
    <div className="flex flex-col gap-4 lg:gap-6">
      <div className="flex flex-col gap-2 rounded-2xl bg-n0 p-4 lg:rounded-[24px] lg:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-[15px] font-extrabold">Tu perfil está al {usuario.perfilPct} %</p>{usuario.perfilPct < 100 && <Chip tono="amarillo">Falta tu distrito · +150 Lanas</Chip>}</div>
        <Barra valor={usuario.perfilPct} total={100} />
      </div>
      <MisionDistrito distritoActual={perfil.distrito} />

      <div className="flex flex-col gap-4 rounded-2xl bg-n0 p-5 lg:rounded-[24px] lg:p-6">
        <p className="text-[10px] font-bold tracking-[1.4px] text-n60">DATOS PERSONALES</p>
        <dl className="grid gap-3 text-sm lg:grid-cols-2">
          {([['Nombre', perfil.nombre], ['ID de usuario', usuario.idUsuario], ['Documento', perfil.documento], ['Correo', perfil.correo], ['Celular', perfil.telefono]] as const).map(([t, v]) => (
            <div key={t} className="flex flex-col gap-0.5"><dt className="text-xs font-bold text-n60">{t}</dt><dd className="font-semibold">{v || (cargando ? '…' : '—')}</dd></div>
          ))}
        </dl>
        <p className="text-xs text-n60">Tu ID de usuario lo pedimos junto con el código para canjear los premios del Cofre. Para cambiar tus datos escríbenos desde Ayuda.</p>
      </div>

      <form className="flex flex-col gap-4 rounded-2xl bg-n0 p-5 lg:rounded-[24px] lg:p-6" onSubmit={(e) => { e.preventDefault(); enviar(); }}>
        <p className="text-[10px] font-bold tracking-[1.4px] text-n60">DATOS OPCIONALES</p>
        <div className="grid gap-3 lg:grid-cols-2">
          <Etiqueta texto="Dirección">
            <input className={campo} value={form.direccion} maxLength={150} autoComplete="street-address" onChange={(e) => set('direccion')(e.target.value)} />
          </Etiqueta>
          <Etiqueta texto="Género">
            <select className={campo} value={form.genero} onChange={(e) => set('genero')(e.target.value)}>
              <option value="">Elige…</option>
              {[...GENEROS, ...(form.genero && !(GENEROS as readonly string[]).includes(form.genero) ? [form.genero] : [])].map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </Etiqueta>
        </div>
        <SelectorDistrito valor={form.distrito} onChange={set('distrito')} />
        <Etiqueta texto="Placa de tu auto (opcional)">
          <input className={cx(campo, 'uppercase lg:max-w-[240px]')} value={form.placa} maxLength={7} placeholder="ABC-123" onChange={(e) => set('placa')(limpiar.placa(e.target.value))} />
        </Etiqueta>
        {!placaValida && <p className="text-sm font-semibold text-error">Revisa la placa: usa el formato ABC-123.</p>}
        {guardar.error && <p className="text-sm font-semibold text-error">{guardar.error}</p>}
        {guardado && <p className="text-sm font-semibold text-verde-texto">Guardamos tus cambios.</p>}
        <ButtonCompacto type="submit" variant="oscuro" className="self-start disabled:cursor-not-allowed disabled:opacity-40" disabled={!cambios || !placaValida || guardar.enviando}>
          {guardar.enviando ? 'Guardando…' : 'Guardar cambios'}
        </ButtonCompacto>
      </form>
    </div>
  );
}

function ContenidoSeccion({ s, onAbrir }: { s: Seccion; onAbrir: (s: Seccion) => void }) {
  switch (s) {
    case 'Mi plan y pagos': return <MiPlanYPagos />;
    case 'Mis Lanas': return <MisLanas />;
    case 'Mis Cupones': return <MisCupones />;
    case 'Historial de recompensas': return <HistorialRecompensas onCupones={() => onAbrir('Mis Cupones')} />;
    case 'Mis participaciones': return <MisParticipaciones />;
    case 'Mi perfil': return <MiPerfil />;
  }
}

export default function MiCuenta() {
  const navigate = useNavigate();
  const location = useLocation();
  const pedida = (location.state as { seccion?: unknown } | null)?.seccion ?? new URLSearchParams(location.search).get('s');
  const seccion = esSeccion(pedida) ? pedida : null;
  const { cerrar } = useSesion();
  const billetera = useBilletera();
  const salir = async () => { await cerrar(); navigate('/'); };

  const abrir = (s: Seccion | null, reemplazar = false) => navigate('/mi-cuenta', { state: s ? { seccion: s } : null, replace: reemplazar });
  const volver = () => ((window.history.state?.idx ?? 0) > 0 ? navigate(-1) : abrir(null, true));
  useEffect(() => { if (seccion && window.innerWidth < 1024) window.scrollTo({ top: 0 }); }, [seccion]);

  const menu = [
    menuCuenta[0], menuCuenta[1], { texto: 'Mis Lanas', contador: formatoLanas(billetera.saldo) },
    ...menuCuenta.slice(2).map((f) => ('contador' in f && !config.usarMock ? { texto: f.texto } : f)),
  ] as { texto: string; to?: string; contador?: string }[];
  const menuWeb = [{ texto: 'Resumen' }, ...menu];
  const activo = seccion ?? 'Resumen';
  const accion = (texto: string, reemplazar: boolean) =>
    texto === 'Cerrar sesión' ? salir() : abrir(esSeccion(texto) ? texto : null, reemplazar);

  return (
    <>
      <Hero color="#211402" oscuro titulo={<Tx k="cuenta.hero.titulo" />} bajada={<Tx k="cuenta.hero.bajada" />} pose="cuenta" />

      {seccion ? (
        <Contenido className="lg:hidden">
          <div className="flex items-center gap-2">
            <button onClick={volver} aria-label="Volver a Mi cuenta" className="-ml-2 flex size-10 items-center justify-center rounded-pill hover:bg-n5">
              <Icon name="chevron" size={22} className="rotate-180" />
            </button>
            <h2 className="text-2xl font-black">{seccion}</h2>
          </div>
          <ContenidoSeccion s={seccion} onAbrir={(x) => abrir(x)} />
        </Contenido>
      ) : (
        <Contenido className="lg:hidden">
          <Perfil />
          <TarjetaPlanActual />
          <BloqueLanas onMovimientos={() => abrir('Mis Lanas')} />
          <CardProgresoMisiones />
          {FLAGS.miAnio && <MiAnio />}
          <PerfilIncompleto onCompletar={() => abrir('Mi perfil')} />
          <MiRebano />
          <nav className="overflow-hidden rounded-2xl">
            {menu.map((f) => {
              const fila = (
                <>
                  <span className="flex-1 text-base font-semibold">{f.texto}</span>
                  {f.contador && <span className="rounded-pill bg-fondo px-2.5 py-[3px] text-xs font-bold">{f.contador}</span>}
                  <Icon name="chevron" size={20} />
                </>
              );
              const cls = 'flex h-14 w-full items-center gap-3 border-b border-n10 bg-n0 px-5 text-left';
              return f.to ? <Link key={f.texto} to={f.to} className={cls}>{fila}</Link> : <button key={f.texto} className={cls} onClick={() => accion(f.texto, false)}>{fila}</button>;
            })}
          </nav>
        </Contenido>
      )}

      <Contenido className="hidden lg:flex lg:flex-row lg:items-start lg:gap-6">
        <aside className="flex w-[360px] shrink-0 flex-col gap-6">
          <Perfil />
          <nav className="overflow-hidden rounded-[24px]">
            {menuWeb.map((f) => (
              <button key={f.texto} onClick={() => accion(f.texto, true)} aria-current={activo === f.texto ? 'page' : undefined}
                className={cx('flex h-14 w-full items-center gap-3 border-b border-n10 px-5 text-left', activo === f.texto ? 'bg-amarillo' : 'bg-n0 hover:bg-n5')}>
                <span className="flex-1 text-base font-semibold">{f.texto}</span>
                {'contador' in f && f.contador && <span className="rounded-pill bg-fondo px-2.5 py-[3px] text-xs font-bold">{f.contador}</span>}
                <Icon name="chevron" size={20} />
              </button>
            ))}
          </nav>
          <div className="relative flex min-h-[200px] flex-col justify-center gap-2 overflow-hidden rounded-[24px] bg-yellow-cta p-6 pr-[130px]">
            <p className="text-[17px] font-extrabold leading-tight">¿Necesitas ayuda?</p>
            <p className="text-[13px] leading-[18px] text-cafe/85">Escríbenos y te respondemos lo antes posible.</p>
            <a href="mailto:contacto@akita.pe" className="w-fit text-[14px] font-bold underline underline-offset-2">contacto@akita.pe</a>
            <ImagenOpcional src="assets/oveja-faq.webp" className="absolute bottom-2 right-3 h-[130px] w-auto object-contain" />
          </div>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <h2 className="text-[40px] font-black leading-none">{activo}</h2>
          {seccion ? <ContenidoSeccion s={seccion} onAbrir={(x) => abrir(x, true)} /> : (
            <>
              <TarjetaPlanActual />
              <BloqueLanas onMovimientos={() => abrir('Mis Lanas', true)} />
              {FLAGS.miAnio && <MiAnio />}
              <CardProgresoMisiones />
              <div className="grid grid-cols-2 items-stretch gap-6 [&>*]:h-full">
                <PerfilIncompleto onCompletar={() => abrir('Mi perfil', true)} />
                <MiRebano />
              </div>
            </>
          )}
        </div>
      </Contenido>
    </>
  );
}
