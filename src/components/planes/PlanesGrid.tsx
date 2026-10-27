import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Carrusel } from '../ui/Carrusel';
import { Badge, ImagenOpcional, cx } from '../ui/primitives';
import { Icon } from '../ui/Icon';
import { planes as planesLocales, soles, type Periodo } from '../../data/mock';
import { usePlanes } from '../../data/datos';
import { Tx } from '../../data/revision';
import { useSesion } from '../../data/sesion';
import { useUsuario } from '../../data/datos';

const periodos: { id: Periodo; texto: string; meses: number }[] = [
  { id: 'mensual', texto: 'Mensual', meses: 1 },
  { id: 'semestral', texto: 'Semestral', meses: 6 },
  { id: 'anual', texto: 'Anual', meses: 12 },
];

const DETALLE: Record<string, { etiqueta: string; subtitulo: string; oscuro?: boolean; destacado?: boolean; oveja: string }> = {
  LANITA: { etiqueta: 'TU PRIMERA LANA', subtitulo: 'Empieza a participar', oveja: 'assets/oveja-plan-lanita.webp' },
  LANOTA: { etiqueta: 'RECOMENDADO', subtitulo: 'Más oportunidades', destacado: true, oveja: 'assets/oveja-plan-lanota.webp' },
  LANAZA: { etiqueta: 'MÁS CHANCES', subtitulo: 'Vive la experiencia completa', oscuro: true, oveja: 'assets/oveja-plan-lanaza.webp' },
};

const decimales = (n: number) => n.toFixed(2);

const BOTON: Record<string, string> = { LANITA: 'bg-verde', LANOTA: 'bg-amarillo', LANAZA: 'bg-rosa' };
const SUFIJO: Record<Periodo, string> = { mensual: 'al mes', semestral: 'cada 6 meses', anual: 'al año' };

export function PlanesGrid({ conComparar, titulo, bajada }: { sinAmarillo?: boolean; conComparar?: boolean; titulo?: React.ReactNode; bajada?: React.ReactNode }) {
  const { logueado, suscripcion, actualizar } = useSesion();
  const usuario = useUsuario();
  const navigate = useNavigate();
  const [periodo, setPeriodo] = useState<Periodo>(suscripcion.periodo);
  const [verCondiciones, setVerCondiciones] = useState(false);
  const meses = periodos.find((p) => p.id === periodo)!.meses;

  const planes = usePlanes();
  const elegir = (plan: (typeof planesLocales)[number]['nombre']) => {
    actualizar({ plan, periodo });
    if (!logueado || !usuario.tieneSuscripcion) navigate('/suscribirse/cuenta');
  };

  const selector = (
    <div className="flex flex-col gap-3 lg:items-end">
      <div className="flex rounded-pill bg-n0 p-1.5" role="tablist" aria-label="Elige cada cuánto pagar">
        {periodos.map((p) => (
          <button key={p.id} role="tab" aria-selected={periodo === p.id} onClick={() => setPeriodo(p.id)}
            className={cx('h-[51px] flex-1 whitespace-nowrap rounded-pill px-5 text-[16px] font-bold lg:px-7 lg:text-lg', periodo === p.id ? 'bg-cafe text-n0' : 'text-cafe')}>
            {p.texto}
          </button>
        ))}
      </div>
      <button type="button" onClick={() => setVerCondiciones(!verCondiciones)} aria-expanded={verCondiciones}
        className="flex items-center gap-2 text-[15px] font-semibold text-cafe underline underline-offset-2">
        <Icon name="info" size={18} />Condiciones de pago y renovación
      </button>
      {verCondiciones && (
        <p className="max-w-[420px] rounded-xl bg-n0/80 p-3 text-[13px] leading-5 text-cafe">
          Mensual: cobro automático con tarjeta. Semestral y anual: pagas con tarjeta o Yape y decides si se renueva solo.
          Puedes cancelar las renovaciones futuras desde Mi cuenta y conservas tu plan hasta el final del periodo pagado. <Tx k="planes.igv" />
        </p>
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-8">
      {titulo ? (
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4 lg:gap-6">
            <ImagenOpcional src="assets/oveja-planes.webp" className="hidden w-[130px] sm:block lg:w-[150px]" />
            <div>
              <h2 className="text-[28px] font-black uppercase leading-[1.1] text-cafe lg:text-[40px]">{titulo}</h2>
              {bajada && <p className="mt-1 text-[15px] text-n60 lg:text-base">{bajada}</p>}
            </div>
          </div>
          {selector}
        </div>
      ) : selector}

      {(() => {
        const tarjetas = planes.map((p) => {
          const d = DETALLE[p.nombre];
          const total = p.precios[periodo];
          const ahorroPct = Math.round((1 - total / (p.precios.mensual * meses)) * 100);
          const actual = logueado && usuario.plan.toUpperCase().includes(p.nombre);
          const osc = d.oscuro;
          return (
            <article key={p.nombre} className={cx('flex h-full flex-col gap-3.5 rounded-[24px] p-6 lg:p-8', osc ? 'bg-hero-brand text-n0' : 'bg-n0 text-cafe', p.nombre === 'LANITA' && 'ring-2 ring-n40')}>
              <div className="flex items-start gap-2">
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <div className="flex flex-wrap gap-2">
                    <Badge tone={d.destacado ? 'amarillo' : osc ? 'rosa' : 'verde'} small className="self-start">{d.etiqueta}</Badge>
                    {actual && <Badge tone="base" small>TU PLAN ACTUAL</Badge>}
                  </div>
                  <h3 className={cx('text-[26px] font-extrabold', osc && 'text-amarillo')}>{p.nombre}</h3>
                  <p className={cx('text-sm font-medium', osc ? 'text-n0/80' : 'text-[#5c544a]')}>{d.subtitulo}</p>
                  <hr className={cx('my-1 border-0 border-t', osc ? 'border-n0/20' : 'border-n10')} />
                  <p className={cx('whitespace-nowrap text-[40px] font-bold leading-none lg:text-[44px]', osc && 'text-amarillo')}>S/ {soles(total)}</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={cx('text-sm', osc ? 'text-n0/70' : 'text-n60')}>{SUFIJO[periodo]}</span>
                    {periodo !== 'mensual' && <span className="rounded-md bg-verde px-2 py-0.5 text-xs font-bold text-cafe">Ahorras {ahorroPct} %</span>}
                  </div>
                  {periodo !== 'mensual' && <p className={cx('text-[13px]', osc ? 'text-n0/70' : 'text-n60')}>Equivale a S/ {decimales(total / meses)} al mes</p>}
                </div>
                <ImagenOpcional src={d.oveja} className="size-[110px] shrink-0 object-contain lg:size-[136px]" />
              </div>
              <ul className="flex flex-col gap-2.5">
                <li className="flex items-center gap-2.5 text-[15px] font-medium"><Icon name="check" size={20} />{p.chances === 1 ? <Tx k="planes.chance1" /> : <Tx k="planes.chances" v={{ n: p.chances }} />}</li>
                <li className="flex items-center gap-2.5 text-[15px] font-medium"><Icon name="check" size={20} />Beneficios del catálogo</li>
                <li className="flex items-center gap-2.5 text-[15px] font-medium"><Icon name="check" size={20} />Misiones, cofre y Lanas</li>
              </ul>
              <div className="flex-1" />
              {actual ? (
                <span className={cx('inline-flex h-14 w-full items-center justify-center rounded-pill border-[1.5px] text-[15px] font-bold opacity-60', osc ? 'border-n0 text-n0' : 'border-cafe text-cafe')}>Es tu plan actual</span>
              ) : (
                <button type="button" onClick={() => elegir(p.nombre)}
                  className={cx('inline-flex h-14 w-full items-center justify-center gap-2.5 whitespace-nowrap rounded-pill text-[15px] font-bold text-cafe transition hover:brightness-95', BOTON[p.nombre])}>
                  <Tx k="planes.cta" v={{ plan: p.nombre }} /><Icon name="flecha" size={20} />
                </button>
              )}
            </article>
          );
        });
        return (
          <>
            <div className="hidden gap-6 md:grid md:grid-cols-3">{tarjetas}</div>
            <div className="md:hidden"><Carrusel anchoClase="w-[82vw] max-w-[340px]" gap={12} tonoPuntos="cafe">{tarjetas}</Carrusel></div>
          </>
        );
      })()}
      {conComparar && (
        <Link to="/planes#comparar" className="inline-flex h-11 items-center gap-2 self-center whitespace-nowrap rounded-pill bg-cafe px-5 text-sm font-bold text-n0">Comparar planes<Icon name="flecha" size={18} /></Link>
      )}
    </div>
  );
}

export function CompararPlanes() {
  const planes = usePlanes();
  const { hash } = useLocation();
  useEffect(() => {
    if (hash !== '#comparar') return;
    const t = window.setTimeout(() => document.getElementById('comparar')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 250);
    return () => window.clearTimeout(t);
  }, [hash]);
  const pct = (pl: ReturnType<typeof usePlanes>[number], p: (typeof periodos)[number]) => Math.round((1 - pl.precios[p.id] / (pl.precios.mensual * p.meses)) * 100);
  return (
    <section id="comparar" className="flex scroll-mt-[110px] flex-col gap-4 lg:scroll-mt-[130px]">
      <h2 className="text-[24px] font-extrabold text-cafe">Compara los planes</h2>
      <div className="flex flex-col gap-3 lg:hidden">
        {planes.map((pl) => (
          <div key={pl.nombre} className="flex flex-col rounded-2xl bg-n0 px-4 pb-1 pt-4 text-cafe">
            <div className="flex items-baseline justify-between gap-3 border-b border-n10 pb-3">
              <span className="text-[17px] font-extrabold">{pl.nombre}</span>
              <span className="whitespace-nowrap text-[13px] text-n60"><b className="text-cafe">{pl.chances}</b> {pl.chances === 1 ? 'chance' : 'chances'} por sorteo</span>
            </div>
            {periodos.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-3 border-b border-n10 py-3 last:border-0">
                <span className="text-[14px] text-n60">{p.texto}</span>
                <span className="flex items-center gap-2">
                  {pct(pl, p) > 0 && <span className="whitespace-nowrap rounded-md bg-verde px-1.5 py-0.5 text-xs font-bold">Ahorras {pct(pl, p)} %</span>}
                  <span className="whitespace-nowrap text-[15px] font-bold">S/ {soles(pl.precios[p.id])}</span>
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="hidden lg:block">
        <table className="w-full min-w-[620px] overflow-hidden rounded-2xl bg-n0 text-left text-[15px] text-cafe">
          <thead>
            <tr className="border-b border-n10">
              <th className="p-4 font-bold text-n60">Plan</th>
              <th className="p-4 font-bold text-n60">Chances</th>
              {periodos.map((p) => <th key={p.id} className="p-4 font-bold text-n60">{p.texto}</th>)}
            </tr>
          </thead>
          <tbody>
            {planes.map((pl) => (
              <tr key={pl.nombre} className="border-b border-n10 last:border-0">
                <td className="p-4 font-extrabold">{pl.nombre}</td>
                <td className="p-4">{pl.chances}</td>
                {periodos.map((p) => (
                  <td key={p.id} className="whitespace-nowrap p-4">
                    <span className="font-bold">S/ {soles(pl.precios[p.id])}</span>
                    {pct(pl, p) > 0 && <span className="ml-2 rounded-md bg-verde px-1.5 py-0.5 text-xs font-bold">Ahorras {pct(pl, p)} %</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[13px] text-n60">Precios con IGV. Mensual: cobro automático con tarjeta. Semestral y anual: tarjeta o Yape. El ahorro es frente a pagar mes a mes el mismo plan.</p>
    </section>
  );
}
