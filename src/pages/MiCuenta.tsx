import { FLAGS } from '../data/reglas';
import { useEffect, useState, type ReactNode } from 'react';
import { Contenido, Hero } from '../components/layout/Hero';
import { CardBilletera, CardProgresoMisiones, CodigoReferido } from '../components/cards/cards';
import { Badge, Barra, ButtonCompacto, ChipFiltro, ImagenOpcional, MonedaLana, cx } from '../components/ui/primitives';
import { Icon } from '../components/ui/Icon';
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
import type { Cupon, GrupoParticipacion, PerfilEditable } from '../data/adaptadores';

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
          : <p className="text-[13px] text-n60">Sin plan activo</p>}
        <Link to="/planes" className="text-[13px] font-bold text-error">Ver planes</Link>
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


function PaginaMovimientos({ page, ultima, onMas }: { page: number; ultima: boolean; onMas: () => void }) {
  const r = useMovimientosLanas(page);
  if (page === 1 && !r.data.items.length) return <Estado cargando={r.cargando} error={r.error} recargar={r.recargar} vacio="Aún no tienes movimientos de Lanas." />;
  return (
    <>
      {r.data.items.map((m, i) => (
        <Fila key={`${m.id}-${i}`}>
          <span className={cx('flex size-10 shrink-0 items-center justify-center rounded-pill', m.lanas < 0 ? 'bg-n5' : 'bg-amarillo')}>
            <Icon name={m.lanas < 0 ? 'ticket' : 'regalo'} size={18} />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <p className="truncate text-[15px] font-bold">{m.titulo}</p>
            <p className="text-xs text-n60">{[m.origen !== m.titulo && m.origen, m.fecha].filter(Boolean).join(' · ')}</p>
            {m.vence && <p className="text-xs font-semibold text-n60">Vence el {m.vence}{m.lotes > 1 ? ` · ${m.lotes} lotes` : ''}</p>}
          </div>
          <CantidadLanas n={m.lanas} />
        </Fila>
      ))}
      {ultima && (r.cargando ? <Fila><p className="text-sm text-n60">Cargando…</p></Fila>
        : r.data.hayMas && <Fila className="justify-center"><ButtonCompacto variant="link" onClick={onMas}>Ver más movimientos</ButtonCompacto></Fila>)}
    </>
  );
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

function MisLanas() {
  const billetera = useBilletera();
  const [paginas, setPaginas] = useState(1);
  return (
    <div className="flex flex-col gap-4 lg:gap-6">
      <div className="grid items-start gap-4 lg:grid-cols-2 lg:gap-6">
        <CardBilletera />
        <div className="flex flex-col gap-2 rounded-2xl bg-n0 p-5 text-sm lg:rounded-[24px] lg:p-6">
          <p className="text-[10px] font-bold tracking-[1.4px] text-n60">CÓMO VENCEN</p>
          <p className="leading-5">Las Lanas vencen 3 meses después de recibirlas (al cierre de ese mes). Al usarlas, se descuentan primero las que vencen antes.</p>
          {billetera.porVencer.lanas > 0 && <p className="font-bold">Próximo vencimiento: {formatoLanas(billetera.porVencer.lanas)} Lanas el {billetera.porVencer.fecha}</p>}
        </div>
      </div>
      <h3 className="text-xl font-extrabold lg:text-2xl">Movimientos</h3>
      <Lista>
        {Array.from({ length: paginas }, (_, i) => (
          <PaginaMovimientos key={i} page={i + 1} ultima={i + 1 === paginas} onMas={() => setPaginas(paginas + 1)} />
        ))}
      </Lista>
    </div>
  );
}


function CardCupon({ c }: { c: Cupon }) {
  const [copiado, setCopiado] = useState(false);
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-n0 p-5 lg:rounded-[24px]">
      <div className="flex items-start justify-between gap-3">
        {c.logo && <ImagenOpcional src={c.logo} alt={c.comercio} className="size-10 shrink-0 rounded-xl bg-n5 object-contain p-1" />}
        <div className="flex min-w-0 flex-1 flex-col"><p className="text-base font-extrabold leading-5">{c.titulo}</p>{c.comercio && <p className="text-xs text-n60">{c.comercio}</p>}</div>
        {c.conLanas ? <Badge small>Canjeado con {formatoLanas(c.lanas)} Lanas</Badge> : <Badge small tone="base">Beneficio</Badge>}
      </div>
      {c.codigo && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-cafe/30 bg-crema px-4 py-3">
          <span className="truncate font-mono text-[15px] font-bold tracking-wide">{c.codigo}</span>
          <ButtonCompacto variant="link" icon="copiar" className="h-auto"
            onClick={() => { navigator.clipboard?.writeText(c.codigo).catch(() => {}); setCopiado(true); }}>
            {copiado ? 'Copiado' : 'Copiar'}
          </ButtonCompacto>
        </div>
      )}
      {c.instrucciones && <p className="text-xs leading-[17px] text-n60">{c.instrucciones}</p>}
      <p className="text-xs font-semibold text-n60">{[c.fecha && `Obtenido el ${c.fecha}`, c.vence && `vence el ${c.vence}`].filter(Boolean).join(' · ')}</p>
    </div>
  );
}

function MisCupones() {
  const r = useMisCupones();
  const [filtro, setFiltro] = useState<'Todos' | 'Canjeados con Lanas' | 'Beneficios'>('Todos');
  const lista = r.data.filter((c) => filtro === 'Todos' || (filtro === 'Canjeados con Lanas') === c.conLanas);
  return (
    <div className="flex flex-col gap-4">
      <div className="no-scrollbar -mx-6 flex gap-2 overflow-x-auto px-6 lg:mx-0 lg:px-0">
        {(['Todos', 'Canjeados con Lanas', 'Beneficios'] as const).map((f) => <ChipFiltro key={f} activo={filtro === f} onClick={() => setFiltro(f)}>{f}</ChipFiltro>)}
      </div>
      {lista.length ? (
        <div className="grid items-start gap-4 lg:grid-cols-2 lg:gap-6">{lista.map((c, i) => <CardCupon key={`${c.id}-${i}`} c={c} />)}</div>
      ) : (
        <Estado cargando={r.cargando} error={r.error} recargar={r.recargar}
          vacio={filtro === 'Todos' ? 'Aún no tienes cupones. Canjea tus Lanas o usa un beneficio para verlos aquí.' : 'No hay cupones en este filtro.'} />
      )}
    </div>
  );
}


function HistorialRecompensas() {
  const r = useRecompensas();
  if (!r.data.length) return <Estado cargando={r.cargando} error={r.error} recargar={r.recargar} vacio="Aún no tienes recompensas. Completa misiones y abre tu cofre para ganarlas." />;
  return (
    <Lista>
      {r.data.map((x, i) => (
        <Fila key={`${x.id}-${i}`}>
          <span className="flex size-10 shrink-0 items-center justify-center rounded-pill bg-rosa-claro"><Icon name="trofeo" size={18} /></span>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <p className="text-[15px] font-bold leading-5">{x.titulo}</p>
            <p className="text-xs text-n60">{[x.origen, x.fecha].filter(Boolean).join(' · ')}</p>
            {x.vence && <p className="text-xs font-semibold text-n60">Vence el {x.vence}</p>}
          </div>
          {x.lanas > 0 ? <CantidadLanas n={x.lanas} /> : <Badge small tone="rosa">Premio</Badge>}
        </Fila>
      ))}
    </Lista>
  );
}


function GruposParticipacion({ grupos }: { grupos: GrupoParticipacion[] }) {
  return (
    <div className="flex flex-col gap-4">
      {grupos.map((g, gi) => (
        <div key={`${g.fecha}-${gi}`} className="flex flex-col gap-2">
          <p className="text-[10px] font-bold tracking-[1.4px] text-n60">SORTEO {g.fecha.toUpperCase()}</p>
          <Lista>
            {g.sorteos.map((s, i) => (
              <Fila key={`${s.id}-${i}`}>
                <span className="flex size-10 shrink-0 items-center justify-center rounded-pill bg-azul/30"><Icon name="sorteos" size={18} /></span>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <p className="text-[15px] font-bold leading-5">{s.premio}</p>
                  {s.detalle && <p className="text-xs text-n60">{s.detalle}</p>}
                  {s.renovacion && <p className="text-xs font-semibold text-n60">Sujeto a la renovación de tu plan</p>}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="text-base font-extrabold">{s.chances} {s.chances === 1 ? 'chance' : 'chances'}</span>
                  {s.ganador && <Badge small tone="verde">¡Ganaste!</Badge>}
                </div>
              </Fila>
            ))}
          </Lista>
        </div>
      ))}
    </div>
  );
}

function MisParticipaciones() {
  const [tipo, setTipo] = useState<'activas' | 'historicas'>('activas');
  const r = useParticipaciones(tipo);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <ChipFiltro activo={tipo === 'activas'} onClick={() => setTipo('activas')}>Próximos sorteos</ChipFiltro>
        <ChipFiltro activo={tipo === 'historicas'} onClick={() => setTipo('historicas')}>Historial</ChipFiltro>
      </div>
      {r.data.length ? <GruposParticipacion grupos={r.data} /> : (
        <Estado cargando={r.cargando} error={r.error} recargar={r.recargar}
          vacio={tipo === 'activas' ? 'No participas en próximos sorteos. Activa un plan o suma chances con tus Lanas.' : 'Aún no tienes sorteos pasados.'} />
      )}
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
  const mision = useMisiones().find((m) => m.id === 'perfil' || m.cta.to === '/mi-cuenta');
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
        <p className="text-base font-extrabold">¡Listo! Confirmaste tu distrito{lanas ? ` y ganaste ${formatoLanas(lanas)} Lanas` : ''}.</p>
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
      <MisionDistrito distritoActual={perfil.distrito} />

      <div className="flex flex-col gap-4 rounded-2xl bg-n0 p-5 lg:rounded-[24px] lg:p-6">
        <p className="text-[10px] font-bold tracking-[1.4px] text-n60">DATOS PERSONALES</p>
        <dl className="grid gap-3 text-sm lg:grid-cols-2">
          {([['Nombre', perfil.nombre], ['Documento', perfil.documento], ['Correo', perfil.correo], ['Celular', perfil.telefono]] as const).map(([t, v]) => (
            <div key={t} className="flex flex-col gap-0.5"><dt className="text-xs font-bold text-n60">{t}</dt><dd className="font-semibold">{v || (cargando ? '…' : '—')}</dd></div>
          ))}
        </dl>
        <p className="text-xs text-n60">Para cambiar estos datos escríbenos desde Ayuda.</p>
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

function ContenidoSeccion({ s }: { s: Seccion }) {
  switch (s) {
    case 'Mi plan y pagos': return <MiPlanYPagos />;
    case 'Mis Lanas': return <MisLanas />;
    case 'Mis Cupones': return <MisCupones />;
    case 'Historial de recompensas': return <HistorialRecompensas />;
    case 'Mis participaciones': return <MisParticipaciones />;
    case 'Mi perfil': return <MiPerfil />;
  }
}

export default function MiCuenta() {
  const navigate = useNavigate();
  const location = useLocation();
  const pedida = (location.state as { seccion?: unknown } | null)?.seccion;
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
          <ContenidoSeccion s={seccion} />
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
          {seccion ? <ContenidoSeccion s={seccion} /> : (
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
