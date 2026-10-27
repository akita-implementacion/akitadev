import { useState } from 'react';
import { Hero } from '../components/layout/Hero';
import { CompararPlanes } from '../components/planes/PlanesGrid';
import { Carrusel, PreguntasFrecuentes, SelectorPeriodo, TarjetaPlan } from '../ref/secciones';
import { PLANES, type Periodo } from '../ref/planes';
import { preguntasFaq } from '../components/publico/Secciones';
import { usePlanes } from '../data/datos';

export default function Planes() {
  const [periodo, setPeriodo] = useState<Periodo>('mensual');
  const api = usePlanes();
  const planes = PLANES.map((p) => ({ ...p, precios: { ...p.precios, ...(api.find((a) => a.nombre === p.nombre)?.precios ?? {}) } }));
  return (
    <>
      <Hero publico color="#FFD400" titulo="Elige el plan que va contigo" bajada="Todos los planes incluyen participación en los sorteos regulares." imagen="img/oveja-03.webp" />
      <div className="mx-auto flex max-w-[1366px] flex-col gap-6 px-6 pt-10 lg:gap-8 lg:px-16 lg:pt-14">
        <SelectorPeriodo periodo={periodo} onChange={setPeriodo} izquierda />
        <div className="hidden grid-cols-3 gap-6 md:grid">
          {planes.map((p) => <TarjetaPlan key={p.id} plan={p} periodo={periodo} />)}
        </div>
        <div className="md:hidden">
          <Carrusel anchoClase="w-[82vw] max-w-[340px]" gap={12} tonoPuntos="cafe">
            {planes.map((p) => <TarjetaPlan key={p.id} plan={p} periodo={periodo} compacta />)}
          </Carrusel>
        </div>
      </div>
      <div className="mx-auto flex max-w-[1366px] flex-col gap-10 px-6 py-10 lg:gap-14 lg:px-16 lg:py-14">
        <CompararPlanes />
        <PreguntasFrecuentes preguntas={preguntasFaq()} />
      </div>
    </>
  );
}
