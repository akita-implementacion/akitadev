import {
  BandaPlanes, BeneficiosADiario, CtaCompacto, GanadoresCompactos, PasosPlegables, PreguntasFrecuentes, PremiosDelMes,
  PropuestaValor, SliderHero,
} from '../../ref/secciones';
import { SoloSuscriptores } from '../../ref/SoloSuscriptores';
import { FuenteSorteosApi } from '../../ref/sitio';
import { pasos, preguntas, propuestaValor, slides } from '../../ref/publico';
import { useBeneficios, useUltimosGanadores } from '../../data/datos';
import { asset } from '../../data/assets';
import { useScrollPorVistas } from '../../hooks/vistas';

const DIAS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'set', 'oct', 'nov', 'dic'];
const fotoUrl = (f?: string) => (f ? asset(f) : '');

export default function HomePublica() {
  useScrollPorVistas();
  const { beneficios } = useBeneficios();
  const { fecha, ganadores } = useUltimosGanadores();
  const fechaTxt = fecha ? `${DIAS[fecha.getDay()]} ${fecha.getDate()} ${MESES[fecha.getMonth()]}` : '';
  return (
    <FuenteSorteosApi>
      <SliderHero slides={slides} />
      <PropuestaValor items={propuestaValor} />
      <SoloSuscriptores />
      <div className="vista-d lg:flex lg:min-h-[var(--alto-vista)] lg:flex-col">
        <PremiosDelMes />
        <BandaPlanes />
      </div>
      <div className="mx-auto flex w-full max-w-[1366px] flex-col gap-8 px-6 pb-6 pt-8 lg:gap-14 lg:px-16 lg:py-14">
        <PasosPlegables pasos={pasos} />
        {beneficios.length > 0 && (
          <BeneficiosADiario beneficios={beneficios.map((b, i) => ({ id: b.id ?? `b${i}`, titulo: b.titulo, comercio: b.comercio, uso: b.uso, etiqueta: b.etiqueta,
            categoria: b.categoria ?? '', foto: b.foto ? fotoUrl(b.foto) : undefined, logo: b.logo ? fotoUrl(b.logo) : undefined }))} />
        )}
        {ganadores.length > 0 && (
          <GanadoresCompactos fecha={fechaTxt}
            ganadores={ganadores.slice(0, 8).map((g, i) => ({ id: `${g.usuario}-${i}`, nombre: g.nombre, premio: g.premio, usuario: g.usuario, chances: g.chances, fechaSorteo: fechaTxt, foto: fotoUrl(g.foto) }))} />
        )}
        <PreguntasFrecuentes preguntas={preguntas} />
        <CtaCompacto />
      </div>
    </FuenteSorteosApi>
  );
}
