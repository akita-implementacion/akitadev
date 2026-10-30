import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Carrusel } from '../components/ui/Carrusel';
import { Nube } from '../components/ui/Brand';
import { Icon } from '../components/ui/Icon';
import { cx } from '../components/ui/primitives';
import { PreguntasFrecuentes, SelectorPeriodo, TarjetaPlan, rutaElegir } from '../ref/secciones';
import { useScrollPorVistas } from '../hooks/vistas';
import { BENEFICIOS_COMUNES, PERIODOS, PLANES, ahorro, chancesTexto, planPorId, soles, type Periodo, type PlanId } from '../ref/planes';
import { preguntas } from '../ref/publico';

const img = (f: string) => `${import.meta.env.BASE_URL}img/${f}`;
const ETIQUETA_PERIODO: Record<Periodo, string> = { mensual: 'Mensual', semestral: '6 meses', anual: '12 meses' };

export default function Planes() {
  const [q] = useSearchParams();
  const navigate = useNavigate();
  const periodoQ = q.get('periodo') as Periodo | null;
  const [periodo, setPeriodo] = useState<Periodo>(periodoQ && PERIODOS.some((p) => p.id === periodoQ) ? periodoQ : 'mensual');
  const [sel, setSel] = useState<{ plan: PlanId; periodo: Periodo }>({ plan: planPorId(q.get('plan')).id, periodo });
  const premio = q.get('premio'); const sorteo = q.get('sorteo');
  const extra = premio ? `&premio=${encodeURIComponent(premio)}&sorteo=${encodeURIComponent(sorteo ?? '')}` : '';
  const { hash } = useLocation();
  useScrollPorVistas();
  useEffect(() => {
    if (hash !== '#comparar') return;
    const t = window.setTimeout(() => document.getElementById('comparar')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 250);
    return () => window.clearTimeout(t);
  }, [hash]);
  const cambiarPeriodo = (p: Periodo) => { setPeriodo(p); setSel((s) => ({ ...s, periodo: p })); };
  useEffect(() => {
    const pl = q.get('plan'); const pe = q.get('periodo') as Periodo | null;
    if (pl) setSel({ plan: planPorId(pl).id, periodo: pe && PERIODOS.some((x) => x.id === pe) ? pe : periodo });
  }, [q]); // eslint-disable-line react-hooks/exhaustive-deps
  const planSel = planPorId(sel.plan);
  return (
    <>
      <section className="relative overflow-hidden bg-amarillo">
        <Nube className="-bottom-[90px] -left-[40px] w-[150px] text-fondo lg:-bottom-[150px] lg:w-[260px]" />
        <Nube className="-bottom-[110px] -right-[30px] w-[190px] text-fondo lg:-bottom-[170px] lg:right-[8%] lg:w-[300px]" />
        <div className="relative mx-auto flex max-w-[1366px] items-center justify-between gap-2 px-6 pb-7 pt-4 lg:px-16 lg:pb-14 lg:pt-10">
          <div className="relative z-10 flex flex-col gap-2">
            <h1 className="text-[25px] font-black uppercase leading-[0.98] text-cafe lg:text-[56px]"><span className="block whitespace-nowrap">Elige tu plan</span><span className="block whitespace-nowrap">y vive ganando</span></h1>
            <p className="max-w-[230px] text-[14px] leading-5 text-cafe/90 lg:max-w-none lg:text-lg">Todos incluyen sorteos, beneficios y recompensas.</p>
          </div>
          <img src={img('planes-hero.webp')} alt="" className="relative z-10 h-[104px] w-auto shrink-0 drop-shadow-[0_12px_10px_rgba(33,20,2,0.25)] lg:h-[220px]" />
        </div>
      </section>

      <div className="mx-auto flex max-w-[1366px] flex-col gap-4 px-6 pt-3 lg:gap-8 lg:px-16 lg:pt-10">
        {premio && (
          <p className="flex items-center gap-2 rounded-2xl bg-n0 px-3.5 py-2.5 text-[13px] leading-[18px] text-cafe shadow-card">
            <Icon name="premios" size={20} className="shrink-0" />
            <span>Participa por la <b>{premio}</b>{sorteo ? ` (sorteo del ${sorteo})` : ''} y por todos los premios de cada miércoles</span>
          </p>
        )}
        <SelectorPeriodo periodo={periodo} onChange={cambiarPeriodo} izquierda compacto />
        <div className="hidden grid-cols-3 gap-6 lg:grid">
          {PLANES.map((p) => <TarjetaPlan key={p.id} plan={p} periodo={periodo} extra={extra} />)}
        </div>
        <div className="lg:hidden">
          <Carrusel anchoClase="w-[82vw] max-w-[340px]" gap={12} tonoPuntos="cafe">
            {PLANES.map((p) => <TarjetaPlan key={p.id} plan={p} periodo={periodo} compacta apretada extra={extra} />)}
          </Carrusel>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1366px] flex-col gap-10 px-6 py-8 lg:gap-14 lg:px-16 lg:py-14">
        <section id="comparar" className="flex scroll-mt-[100px] flex-col gap-4 lg:scroll-mt-[130px]">
          <div className="flex flex-col gap-1">
            <h2 className="text-[24px] font-extrabold text-cafe lg:text-[30px]">Compara los planes</h2>
            <p className="text-[14px] text-n60">Toca una opción para elegirla. El ahorro es frente a pagar mes a mes el mismo plan.</p>
          </div>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3 lg:gap-5" role="radiogroup" aria-label="Plan y periodo">
            {PLANES.map((pl) => (
              <div key={pl.id} className={cx('flex flex-col rounded-[20px] bg-n0 px-3 pb-3 pt-4 text-cafe', sel.plan === pl.id && 'ring-2 ring-inset ring-cafe')}>
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5 px-1 pb-3">
                  <span className="flex items-center gap-2">
                    <img src={img(pl.imagen.replace('img/', ''))} alt="" className="size-9 object-contain" />
                    <span className="text-[18px] font-extrabold">{pl.nombre}</span>
                  </span>
                  <span className="whitespace-nowrap text-[13px] font-semibold">{chancesTexto(pl.chances)}</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {PERIODOS.map((p) => {
                    const on = sel.plan === pl.id && sel.periodo === p.id;
                    const pct = ahorro(pl, p.id);
                    const mensualEq = pl.precios[p.id] / p.meses;
                    return (
                      <button key={p.id} role="radio" aria-checked={on} onClick={() => { setSel({ plan: pl.id, periodo: p.id }); setPeriodo(p.id); }}
                        className={cx('flex min-h-[64px] items-center gap-3 rounded-2xl border-2 px-3 py-2.5 text-left', on ? 'border-cafe bg-amarillo/25' : p.id === 'anual' ? 'border-transparent bg-amarillo/10' : 'border-transparent bg-fondo')}>
                        <span className={cx('flex size-5 shrink-0 items-center justify-center rounded-full border-2', on ? 'border-cafe bg-cafe' : 'border-n40')}>{on && <span className="size-2 rounded-full bg-amarillo" />}</span>
                        <span className="flex-1 text-[15px] font-semibold">{ETIQUETA_PERIODO[p.id]}</span>
                        <span className="flex flex-col items-end gap-0.5">
                          <span className="flex items-center gap-1.5">
                            {pct > 0 && <span className="whitespace-nowrap rounded-md bg-verde px-1.5 py-0.5 text-[11px] font-bold">Ahorras {pct} %</span>}
                            <span className="whitespace-nowrap text-[17px] font-extrabold">{soles(pl.precios[p.id])}</span>
                          </span>
                          <span className="whitespace-nowrap text-[12px] text-n60">{p.meses > 1 ? `equivale a ${soles(Math.round(mensualEq * 100) / 100)} al mes` : 'cada mes'}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <p className="flex items-start gap-2 text-[13px] leading-[18px] text-cafe"><Icon name="check" size={16} className="mt-0.5 shrink-0" /><span><b>Todos los planes incluyen:</b> {BENEFICIOS_COMUNES.join(' · ')}. Precios con IGV.</span></p>
          <div className="flex flex-col gap-3 rounded-[20px] bg-cafe p-4 text-n0 sm:flex-row sm:items-center sm:justify-between lg:px-6">
            <div className="flex flex-col gap-0.5">
              <p className="text-[12px] font-bold tracking-[0.8px] text-amarillo">TU ELECCIÓN</p>
              <p className="text-[17px] font-extrabold">{planSel.nombre} · {PERIODOS.find((p) => p.id === sel.periodo)!.label}</p>
              <p className="text-[14px] text-n0/85">{soles(planSel.precios[sel.periodo])} {PERIODOS.find((p) => p.id === sel.periodo)!.sufijo} · {chancesTexto(planSel.chances)}</p>
            </div>
            <button onClick={() => navigate(rutaElegir(planSel, sel.periodo, extra))} className="inline-flex h-12 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-pill bg-n0 px-6 text-[15px] font-bold text-cafe">
              Elegir {planSel.nombre} <Icon name="flecha" size={18} />
            </button>
          </div>
        </section>
        <PreguntasFrecuentes preguntas={preguntas} />
      </div>
    </>
  );
}
