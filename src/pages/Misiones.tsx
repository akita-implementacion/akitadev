import { Contenido, Hero } from '../components/layout/Hero';
import { ImagenOpcional, cx } from '../components/ui/primitives';
import { CardMision, CardRequisitosVip, CodigoReferido } from '../components/cards/cards';
import { Tx } from '../data/revision';
import { useMisiones, useReferidos } from '../data/datos';
import { tx } from '../data/textos';

const comoFuncionan = [
  { t: 'Se acreditan solas', d: 'Al llegar a la meta, las Lanas entran a tu billetera.' },
  { t: 'Cada misión tiene su ciclo', d: 'Únicas, semanales o mensuales. Referidos siempre está activa.' },
  { t: 'Sin premios parciales', d: 'Si el ciclo termina antes de la meta, el avance no paga.' },
];

export default function Misiones() {
  const misiones = useMisiones();
  const referidos = useReferidos();
  const ref = misiones.find((m) => m.id === 'referidos');
  const resto = misiones.filter((m) => m !== ref);
  return (
    <>
      <Hero color="#FFD400" titulo={<Tx k="misiones.hero.titulo" />} bajada={<Tx k="misiones.hero.bajada" />} pose="misiones" />
      <Contenido>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch">
          <div className="lg:w-[600px]"><CardRequisitosVip /></div>
          <div className="relative hidden flex-1 flex-col gap-4 overflow-hidden rounded-[24px] bg-n0 p-7 lg:flex">
            <div className="flex items-start gap-4">
              <div className="flex flex-1 flex-col gap-1.5">
                {referidos.elegible && referidos.recompensa > 0 && <span className="w-fit rounded-pill bg-verde px-2.5 py-1 text-xs font-bold text-cafe">+{referidos.recompensa} LANAS AL COMPLETAR</span>}
                <h2 className="text-[26px] font-black leading-tight">Mi rebaño</h2>
                <p className="text-sm text-n60"><Tx k="cuenta.rebano.condicion" /></p>
              </div>
              <ImagenOpcional src="assets/oveja-feliz.webp" className="h-[110px] w-auto shrink-0 object-contain" />
            </div>
            {!referidos.elegible ? (
              <p className="rounded-2xl bg-n5 px-4 py-3 text-sm text-cafe">Con tu plan vigente puedes invitar amigos y ganar Lanas cuando hagan su primer pago.</p>
            ) : (
            <div className="flex items-center gap-3">
              {Array.from({ length: Math.max(1, referidos.meta) }, (_, k) => k + 1).map((n) => (
                <span key={n} className={cx('flex size-12 items-center justify-center rounded-pill text-lg font-black', n <= referidos.avance ? 'bg-amarillo text-cafe' : 'border-2 border-dashed border-cafe/30 text-cafe/40')}>{n <= referidos.avance ? '✓' : '+'}</span>
              ))}
              <p className="text-sm font-bold text-cafe">{referidos.avance} de {referidos.meta} amigos{referidos.meta > referidos.avance ? ` · falta${referidos.meta - referidos.avance > 1 ? 'n' : ''} ${referidos.meta - referidos.avance}` : ''}</p>
            </div>
            )}
            <div className="mt-auto"><CodigoReferido grande /></div>
          </div>
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-3">
          {ref && <CardMision m={ref} />}
          <div className="lg:hidden"><CodigoReferido grande /></div>
          {resto.map((m, i) => <CardMision key={`${m.id}-${i}`} m={m} />)}
          <section className="flex flex-col gap-3 rounded-2xl bg-yellow-cta p-5">
            <h2 className="text-xl font-extrabold">¿Cómo funcionan?</h2>
            {comoFuncionan.map((c) => (
              <div key={c.t} className="flex flex-col gap-0.5">
                <p className="text-[15px] font-bold">{c.t}</p>
                <p className="text-[13px] leading-[19px]">{c.d}</p>
              </div>
            ))}
          </section>
        </div>
      </Contenido>
    </>
  );
}
