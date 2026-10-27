import { Link } from 'react-router-dom';
import { Icon } from '../../components/ui/Icon';
import { ImagenOpcional, MonedaLana } from '../../components/ui/primitives';
import { CardCofreVisitante, CardFlashVisitante } from '../../components/cards/CofreFlash';
import { preguntasFaq } from '../../components/publico/Secciones';
import {
  BandaPlanes, BandaSigueme, BeneficiosADiario, CardCta, MarcasAliadas, PasosComoFunciona, PreguntasFrecuentes, PremiosDelMesDatos,
  PropuestaValor, SeccionGanadores, SliderHero, Vista,
} from '../../ref/secciones';
import { pasos, propuestaValor, slides } from '../../ref/publico';
import { useBeneficios, useFechasSorteo, useMarcasAliadas, useProximosSorteos, useUltimosGanadores } from '../../data/datos';
import { asset } from '../../data/assets';

const DIAS = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
const MESES = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SET', 'OCT', 'NOV', 'DIC'];
const fotoUrl = (f?: string) => (f ? asset(f) : '');

export default function HomePublica() {
  const { beneficios } = useBeneficios();
  const marcas = useMarcasAliadas();
  const proximos = useProximosSorteos();
  const fechas = useFechasSorteo();
  const { fecha, ganadores } = useUltimosGanadores();
  const sorteo = fecha ? `SORTEO ${DIAS[fecha.getDay()]} ${fecha.getDate()} ${MESES[fecha.getMonth()]}` : '';
  const fechaTxt = fecha ? `${DIAS[fecha.getDay()].charAt(0)}${DIAS[fecha.getDay()].slice(1).toLowerCase()} ${fecha.getDate()} ${MESES[fecha.getMonth()].toLowerCase()}` : '';
  return (
    <>
      <SliderHero slides={slides} />
      <PropuestaValor items={propuestaValor} />
      <SoloSuscriptores />
      <div className="lg:flex lg:flex-col">
        <PremiosDelMesDatos fechas={fechas} premios={proximos} />
        <BandaPlanes />
      </div>
      <Vista>
        <PasosComoFunciona pasos={pasos} />
        {beneficios.length > 0 && (
          <BeneficiosADiario beneficios={beneficios.map((b, i) => ({ id: b.id ?? `b${i}`, titulo: b.titulo, comercio: b.comercio, uso: b.uso, etiqueta: b.etiqueta,
            categoria: b.categoria ?? '', foto: b.foto ? fotoUrl(b.foto) : undefined, logo: b.logo ? fotoUrl(b.logo) : undefined }))} />
        )}
      </Vista>
      <Vista>
        {marcas.length > 0 && <MarcasAliadas marcas={marcas.filter((m) => m.logo).map((m) => ({ nombre: m.nombre.toLowerCase(), logo: fotoUrl(m.logo) }))} />}
        {ganadores.length > 0 && (
          <SeccionGanadores fecha={fechaTxt} detalle="transmitido en vivo · nombres protegidos"
            ganadores={ganadores.slice(0, 8).map((g, i) => ({ id: `${g.usuario}-${i}`, nombre: g.nombre, premio: g.premio, usuario: g.usuario, chances: g.chances, fechaSorteo: sorteo, foto: fotoUrl(g.foto) }))} />
        )}
      </Vista>
      <Vista>
        <PreguntasFrecuentes preguntas={preguntasFaq()} />
        <CardCta titulo="¿Listo para pertenecer al rebaño y participar?" bajada="Elige tu plan y únete al rebaño AKITÁ." boton="Elegir mi plan" iconoIzq />
      </Vista>
      <BandaSigueme />
    </>
  );
}

function SoloSuscriptores() {
  return (
    <section className="bg-fondo px-6 pt-5 lg:px-16 lg:py-10">
      <div className="mx-auto flex w-full max-w-[1238px] flex-col gap-4 lg:gap-5">
        <div className="flex flex-col gap-1.5 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
          <div className="flex shrink-0 flex-col gap-1.5">
            <span className="w-fit rounded-pill bg-cafe px-3 py-1 text-[11px] font-bold tracking-[1px] text-amarillo">SOLO PARA SUSCRIPTORES</span>
            <h2 className="text-[26px] font-black uppercase leading-[1.05] text-cafe lg:text-[40px]">Cada miércoles hay algo nuevo</h2>
          </div>
          <p className="text-[14px] leading-[20px] text-cafe/80 lg:max-w-[480px] lg:pb-1 lg:text-[15px] lg:leading-[22px]">Además de los sorteos y los descuentos, al suscribirte abres un cofre sorpresa, aprovechas el Beneficio Flash y entras a sorteos VIP.</p>
        </div>
        <div className="grid grid-cols-1 gap-3 lg:min-h-[340px] lg:grid-cols-2 lg:gap-6">
          <CardCofreVisitante />
          <CardFlashVisitante />
        </div>
        <div className="grid grid-cols-1 gap-3 lg:min-h-[200px] lg:grid-cols-2 lg:gap-6">
          <article className="relative flex min-h-[140px] items-stretch overflow-hidden rounded-[24px] bg-[radial-gradient(110%_120%_at_80%_40%,#3D2A08_0%,#211402_65%)] text-n0 lg:min-h-[200px]">
            <div className="relative z-10 flex min-w-0 flex-1 flex-col justify-center gap-1.5 py-3.5 pl-4 pr-1 lg:gap-2 lg:py-5 lg:pl-7">
              <p className="flex items-center gap-2 text-[21px] font-black leading-none lg:text-[32px]">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-pill bg-rosa text-cafe lg:size-10"><Icon name="corona" size={20} /></span>
                <span>Sorteos <span className="text-rosa">VIP</span></span>
              </p>
              <p className="text-[13px] leading-[18px] text-n0/85 lg:text-[15px] lg:leading-[21px]">Completa las misiones del mes y entra gratis a sorteos exclusivos, con premios más grandes y menos participantes.</p>
              <Link to="/como-funciona" state={{ ancla: 'vip' }} className="inline-flex items-center gap-1.5 self-start text-[13px] font-bold text-amarillo underline lg:text-sm">Conoce los sorteos VIP <Icon name="flecha" size={16} /></Link>
            </div>
            <div className="relative h-[130px] w-[38%] max-w-[300px] shrink-0 self-center lg:h-auto lg:w-[42%] lg:self-stretch">
              <ImagenOpcional src="assets/3d/vip-3d.webp" alt="Premios de sorteos VIP" className="absolute inset-0 m-auto max-h-full max-w-full object-contain" />
            </div>
          </article>
          <article className="relative flex min-h-[140px] items-stretch overflow-hidden rounded-[24px] bg-n0 lg:min-h-[200px]">
            <div className="relative z-10 flex min-w-0 flex-1 flex-col justify-center gap-1.5 py-3.5 pl-4 pr-1 lg:gap-2 lg:py-5 lg:pl-7">
              <p className="flex items-center gap-2 text-[21px] font-black leading-none text-cafe lg:text-[32px]">
                <span className="shrink-0"><MonedaLana size={34} /></span>
                <span>Gana <span className="text-rosa-fuerte">Lanas</span></span>
              </p>
              <p className="text-[13px] leading-[18px] text-n60 lg:text-[15px] lg:leading-[21px]">Las ganas con misiones, referidos y el cofre. Las cambias por chances (1 Lana = 1 chance) o por beneficios.</p>
              <Link to="/como-funciona" state={{ ancla: 'lanas' }} className="inline-flex items-center gap-1.5 self-start text-[13px] font-bold text-cafe underline lg:text-sm">Cómo funcionan las Lanas <Icon name="flecha" size={16} /></Link>
            </div>
            <div className="relative h-[130px] w-[38%] max-w-[300px] shrink-0 self-center lg:h-auto lg:w-[42%] lg:self-stretch">
              <ImagenOpcional src="assets/3d/lanas-3d.webp" alt="Monedas de Lanas" className="absolute inset-0 m-auto max-h-full max-w-full object-contain" />
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
