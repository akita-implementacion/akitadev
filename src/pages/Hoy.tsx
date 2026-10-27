import { Link } from 'react-router-dom';
import { Contenido, EncabezadoSeccion, Hero } from '../components/layout/Hero';
import {
  BannerVip, CardBeneficioMini, CardBilletera, CardCofre, CardFlash,
  CardMision, CardProgresoMisiones, CardSorteoCompacta, CardSorteoDestacado,
} from '../components/cards/cards';
import { ButtonCompacto } from '../components/ui/primitives';
import { FilaAuto } from '../components/ui/Carrusel';
import { tx } from '../data/textos';
import { Tx } from '../data/revision';
import { useBeneficios, useMisiones, useSorteoDestacado, useUsuario } from '../data/datos';

export default function Hoy() {
  const usuario = useUsuario();
  const sorteoDestacado = useSorteoDestacado();
  const { beneficios } = useBeneficios();
  const misiones = useMisiones();
  const destacada = misiones.find((m) => m.destacada) ?? misiones[0];
  return (
    <>
      <Hero color="#45E586" titulo={<Tx k="hoy.hero.titulo" v={{ nombre: usuario.nombre }} />} bajada={<Tx k="hoy.hero.bajada" />} pose="hoy" />

      <Contenido className="pt-4 lg:hidden">
        <div className="flex gap-4">
          <CardFlash variante="compacta" />
          <CardCofre variante="compacta" />
        </div>
        <EncabezadoSeccion titulo={tx('hoy.siguienteSorteo')} extra={sorteoDestacado.corte ? `cierra ${/^\d/.test(sorteoDestacado.corte) ? 'a las' : 'el'} ${sorteoDestacado.corte}` : undefined} />
        <CardSorteoCompacta />
        <div className="flex items-center gap-2">
          <h2 className="min-w-0 flex-1 text-xl font-extrabold leading-6"><Tx k="hoy.siempre.titulo" /></h2>
          <Link to="/beneficios" className="shrink-0"><ButtonCompacto variant="outline" iconRight="flecha" className="!h-10 !px-3.5">Ver catálogo</ButtonCompacto></Link>
        </div>
        <FilaAuto className="no-scrollbar -mx-6 flex snap-x gap-3 overflow-x-auto scroll-px-6 px-6 [&>*]:snap-start">
          {beneficios.slice(0, 4).map((b, i) => <CardBeneficioMini key={`${b.id ?? b.titulo}-${i}`} b={b} i={i} />)}
        </FilaAuto>
        <EncabezadoSeccion titulo={tx('hoy.misionDestacada')} accion={<Link to="/misiones"><ButtonCompacto variant="outline" iconRight="flecha">Ver todas</ButtonCompacto></Link>} />
        {destacada && <CardMision m={destacada} />}
        <CardProgresoMisiones />
        <BannerVip />
      </Contenido>

      <Contenido className="hidden lg:flex">
        <div className="grid grid-cols-[minmax(0,1fr)_400px] gap-6">
          <div className="flex gap-6">
            <CardFlash variante="hoyWeb" />
            <CardCofre variante="hoyWeb" />
          </div>
          <div className="flex flex-col gap-6">
            {destacada && <div className="flex [&>*]:w-full"><CardMision m={destacada} /></div>}
            <div className="flex flex-1 [&>*]:w-full"><CardProgresoMisiones /></div>
          </div>
          <div className="flex [&>*]:w-full"><CardSorteoDestacado oscuro /></div>
          <div className="flex [&>*]:w-full"><CardBilletera conOveja /></div>
        </div>
        <section className="flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <div className="flex flex-1 flex-col gap-1">
              <h2 className="text-2xl font-extrabold leading-7"><Tx k="hoy.siempre.titulo" /></h2>
              <p className="text-[15px] leading-[21px] text-n60"><Tx k="hoy.siempre.bajada" /></p>
            </div>
            <Link to="/beneficios"><ButtonCompacto variant="outline" iconRight="flecha">Ver catálogo</ButtonCompacto></Link>
          </div>
          <div className="flex gap-5">
            {beneficios.slice(0, 4).map((b, i) => <CardBeneficioMini key={`${b.id ?? b.titulo}-${i}`} b={b} i={i} conCta />)}
          </div>
        </section>
      </Contenido>
    </>
  );
}
