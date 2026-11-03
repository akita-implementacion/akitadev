import { useEffect, useMemo, useState } from 'react';
import { Icon } from '../ui/Icon';
import { Hoja } from '../ui/Hoja';
import { cx } from '../ui/primitives';
import { asset } from '../../data/assets';
import { MESES_LARGOS, type PremioHistorico, type SorteoHistorico } from '../../data/adaptadores';
import { useParticipantesSorteo, useTotalParticipantes } from '../../data/datos';

const POR_PAGINA = 4;
type Seleccion = { tipo: 'semana' } | { tipo: 'mes'; anio: number; mes: number };

function rangoSemana(hoy = new Date()) {
  const lima = new Date(hoy.toLocaleString('en-US', { timeZone: 'America/Lima' }));
  const lunes = new Date(lima); lunes.setDate(lima.getDate() - ((lima.getDay() + 6) % 7));
  const domingo = new Date(lunes); domingo.setDate(lunes.getDate() + 6);
  const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return [iso(lunes), iso(domingo)] as const;
}

const miles = (n: number) => n.toLocaleString('es-PE').replace(/,/g, '.');

export function HistoricoGanadores({ sorteos }: { sorteos: SorteoHistorico[] }) {
  const anios = useMemo(() => {
    const mapa = new Map<number, Set<number>>();
    sorteos.forEach((s) => { if (!s.anio) return; if (!mapa.has(s.anio)) mapa.set(s.anio, new Set()); mapa.get(s.anio)!.add(s.mesNum); });
    return [...mapa.entries()].sort((a, b) => b[0] - a[0]).map(([anio, m]) => ({ anio, meses: [...m].sort((a, b) => b - a) }));
  }, [sorteos]);
  const [desde, hasta] = rangoSemana();
  const deLaSemana = sorteos.filter((s) => s.iso >= desde && s.iso <= hasta);
  const anioActual = new Date().getFullYear();
  const inicial = (): Seleccion => (deLaSemana.length || !anios[0] ? { tipo: 'semana' } : { tipo: 'mes', anio: anios[0].anio, mes: anios[0].meses[0] });
  const [sel, setSel] = useState<Seleccion>(inicial);
  const [anio, setAnio] = useState(anios[0]?.anio ?? anioActual);
  const [mostrar, setMostrar] = useState(POR_PAGINA);
  const [abierto, setAbierto] = useState<{ p: PremioHistorico; s: SorteoHistorico } | null>(null);
  const firma = sorteos.length ? sorteos[0].iso + sorteos.length : '';
  useEffect(() => { setSel(inicial()); setAnio(anios[0]?.anio ?? anioActual); setMostrar(POR_PAGINA); }, [firma]); // eslint-disable-line react-hooks/exhaustive-deps

  const meses = anios.find((a) => a.anio === anio)?.meses ?? [];
  const lista = sel.tipo === 'semana' ? deLaSemana : sorteos.filter((s) => s.anio === sel.anio && s.mesNum === sel.mes);
  const visibles = lista.slice(0, mostrar);
  const restantes = lista.length - visibles.length;
  const elegir = (s: Seleccion) => { setSel(s); setMostrar(POR_PAGINA); };
  const cambiarAnio = (a: number) => {
    setAnio(a);
    const m = anios.find((x) => x.anio === a)?.meses[0];
    if (m !== undefined) elegir({ tipo: 'mes', anio: a, mes: m });
  };
  const resumen = sel.tipo === 'semana' ? 'Esta semana' : `${MESES_LARGOS[sel.mes]} ${sel.anio}`;
  const primerAnio = anios[anios.length - 1]?.anio ?? 2025;
  const selectCls = 'h-11 w-auto appearance-none rounded-pill border-[1.5px] border-cafe bg-n0 pl-4 pr-10 text-base font-extrabold text-cafe outline-none focus-visible:ring-2 focus-visible:ring-amarillo';

  return (
    <section id="historico" className="flex scroll-mt-32 flex-col gap-4 lg:gap-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-[24px] font-extrabold text-cafe lg:text-[28px]">Histórico de ganadores</h2>
          <p className="text-[15px] text-n60">Todos los sorteos desde {primerAnio}, con su fecha y participantes</p>
        </div>
        {anios.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <label className="relative shrink-0">
              <span className="sr-only">Año</span>
              <select value={anio} onChange={(e) => cambiarAnio(Number(e.target.value))} className={selectCls}>
                {anios.map((a) => <option key={a.anio} value={a.anio}>{a.anio}</option>)}
              </select>
              <Icon name="chevron-abajo" size={16} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-cafe" />
            </label>
            <label className="relative shrink-0">
              <span className="sr-only">Mes</span>
              <select className={selectCls}
                value={sel.tipo === 'semana' ? 'semana' : sel.anio === anio ? String(sel.mes) : ''}
                onChange={(e) => elegir(e.target.value === 'semana' ? { tipo: 'semana' } : { tipo: 'mes', anio, mes: Number(e.target.value) })}>
                {anio === anioActual && <option value="semana">Esta semana</option>}
                {sel.tipo === 'mes' && sel.anio !== anio && <option value="" disabled>Elige un mes</option>}
                {meses.map((m) => <option key={m} value={m}>{MESES_LARGOS[m]}</option>)}
              </select>
              <Icon name="chevron-abajo" size={16} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-cafe" />
            </label>
          </div>
        )}
      </div>

      <p className="text-[13px] font-semibold text-n60">{resumen} · {lista.length} {lista.length === 1 ? 'sorteo' : 'sorteos'}</p>

      {lista.length === 0 ? (
        <div className="flex flex-col items-center gap-1 rounded-[24px] bg-n0 px-6 py-8 text-center">
          <p className="text-[17px] font-extrabold text-cafe">{sel.tipo === 'semana' ? 'Aún no hay sorteos esta semana' : 'No hay sorteos en este mes'}</p>
          <p className="text-sm text-n60">El sorteo es cada miércoles en vivo. Mientras tanto, revisa los meses anteriores.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-start lg:gap-6">
          {visibles.map((s) => <TarjetaSorteo key={s.iso} s={s} onParticipantes={(p) => setAbierto({ p, s })} />)}
        </div>
      )}
      {restantes > 0 && (
        <button type="button" onClick={() => setMostrar((m) => m + POR_PAGINA)}
          className="flex h-12 items-center justify-center gap-2 self-center rounded-pill border-[1.5px] border-cafe bg-n0 px-8 text-[15px] font-bold text-cafe transition hover:bg-n5">
          Ver {Math.min(restantes, POR_PAGINA)} {Math.min(restantes, POR_PAGINA) === 1 ? 'sorteo' : 'sorteos'} más<Icon name="chevron-abajo" size={18} />
        </button>
      )}
      {abierto && <HojaParticipantes p={abierto.p} s={abierto.s} onCerrar={() => setAbierto(null)} />}
    </section>
  );
}

function TarjetaSorteo({ s, onParticipantes }: { s: SorteoHistorico; onParticipantes: (p: PremioHistorico) => void }) {
  const conLista = s.premios.find((p) => p.listaParticipantes && p.raffleId && !p.raffleId.startsWith('demo-'));
  const total = useTotalParticipantes(conLista?.raffleId, !s.participantes && !!conLista);
  const participantes = s.participantes || total;
  return (
    <article className="flex flex-col gap-3 rounded-[24px] bg-n0 p-4 lg:p-5">
      <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12px] font-bold tracking-[0.8px] text-n60">
        <Icon name="calendario" size={16} className="shrink-0" />{s.etiqueta}{participantes ? <span>· {miles(participantes)} PARTICIPANTES</span> : null}
      </p>
      {s.premios.map((f, i) => (
        <div key={`${f.premio}-${i}`} className="flex flex-wrap items-center gap-3 rounded-2xl bg-n5 p-2.5 sm:flex-nowrap">
          <img src={asset(f.fotoGanador || f.foto)} alt="" loading="lazy" className="size-14 shrink-0 rounded-xl bg-n0 object-contain p-1" />
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-bold leading-5 text-cafe">{f.premio}</p>
            <p className="text-[13px] text-n60">{f.ganador}</p>
          </div>
          <span className="hidden shrink-0 rounded-md bg-amarillo px-2 py-[3px] text-[11px] font-bold text-cafe sm:inline">★ GANADOR</span>
          {f.listaParticipantes && f.raffleId && (
            <button type="button" onClick={() => onParticipantes(f)}
              className="inline-flex h-10 w-full shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-pill border-[1.5px] border-cafe bg-n0 px-4 text-[13px] font-bold text-cafe transition hover:bg-n5 sm:w-auto">
              <Icon name="cuenta" size={16} />Ver participantes
            </button>
          )}
        </div>
      ))}
    </article>
  );
}

function HojaParticipantes({ p, s, onCerrar }: { p: PremioHistorico; s: SorteoHistorico; onCerrar: () => void }) {
  const [page, setPage] = useState(1);
  const [codigo, setCodigo] = useState('');
  const [buscar, setBuscar] = useState('');
  const r = useParticipantesSorteo(p.raffleId, page, buscar, true);
  const d = r.data;
  const total = s.participantes || (d?.totals?.participants ?? 0);
  const paginas = d?.totalPages ?? 1;
  const items = d?.items ?? [];
  return (
    <Hoja abierto onCerrar={onCerrar} titulo={p.premio} subtitulo={`Sorteo del ${s.etiqueta.toLowerCase()}${total ? ` · ${miles(total)} participantes` : ''}`}>
      <div className="flex items-center gap-3 rounded-2xl bg-amarillo/30 px-4 py-3">
        <span className="rounded-md bg-amarillo px-2 py-[3px] text-[11px] font-bold text-cafe">★ GANADOR</span>
        <p className="min-w-0 text-[14px] font-bold text-cafe">{p.ganador}{p.usuario ? <span className="font-normal text-n60"> · {p.usuario}</span> : null}</p>
      </div>
      <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); setPage(1); setBuscar(codigo.trim().toUpperCase()); }}>
        <input value={codigo} onChange={(e) => setCodigo(e.target.value.toUpperCase())} placeholder="Busca tu código (YK-…)" aria-label="Código de usuario"
          className="h-12 min-w-0 flex-1 rounded-2xl border border-n10 bg-n0 px-4 text-base text-cafe outline-none focus:border-cafe" />
        <button type="submit" className="h-12 shrink-0 rounded-2xl bg-cafe px-4 text-sm font-bold text-n0">Buscar</button>
      </form>
      {buscar && (
        d?.match
          ? <p className="rounded-2xl bg-verde/25 px-4 py-3 text-[14px] text-cafe"><b>{d.match.maskedName}</b> ({d.match.publicId}) participó con <b>{d.match.chancesTotal ?? 0} {d.match.chancesTotal === 1 ? 'chance' : 'chances'}</b>.</p>
          : !r.cargando && <p className="rounded-2xl bg-rosa-claro px-4 py-3 text-[14px] text-cafe">No encontramos el código {buscar} en este sorteo.</p>
      )}
      {buscar && <button type="button" onClick={() => { setBuscar(''); setCodigo(''); }} className="self-start text-[13px] font-bold underline">Ver todos los participantes</button>}
      {!buscar && (
        r.cargando && !items.length ? <p className="text-sm text-n60">Cargando…</p> : (
          <ul className="flex flex-col overflow-hidden rounded-2xl bg-n0">
            {items.map((x, i) => (
              <li key={`${x.publicId}-${i}`} className="flex items-center gap-3 border-b border-n10 px-4 py-2.5 last:border-0">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-semibold text-cafe">{x.maskedName}</p>
                  <p className="text-[12px] text-n60">{x.publicId}</p>
                </div>
                <span className="shrink-0 text-[13px] font-bold text-cafe">{x.chancesTotal ?? 0} {x.chancesTotal === 1 ? 'chance' : 'chances'}</span>
              </li>
            ))}
          </ul>
        )
      )}
      {!buscar && paginas > 1 && (
        <div className="flex items-center justify-between gap-2">
          <button type="button" disabled={page <= 1} onClick={() => setPage((n) => n - 1)} className={cx('h-10 rounded-pill border-[1.5px] border-cafe px-4 text-sm font-bold text-cafe', page <= 1 && 'opacity-40')}>Anterior</button>
          <span className="text-[13px] text-n60">Página {page} de {miles(paginas)}</span>
          <button type="button" disabled={page >= paginas} onClick={() => setPage((n) => n + 1)} className={cx('h-10 rounded-pill border-[1.5px] border-cafe px-4 text-sm font-bold text-cafe', page >= paginas && 'opacity-40')}>Siguiente</button>
        </div>
      )}
    </Hoja>
  );
}
