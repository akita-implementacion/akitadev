import { Link } from 'react-router-dom';
import { CardCofreVisitante, CardFlashVisitante } from './vistaPrevia';
import { Icon } from '../components/ui/Icon';
import { MonedaLana } from '../components/ui/primitives';

const IMG3D = (f: string) => `${import.meta.env.BASE_URL}img/3d/${f}`;

export function SoloSuscriptores() {
  return (
    <>
      <section className="vista-d bg-fondo px-6 pt-6 max-lg:[@media(max-height:760px)]:pt-4 lg:flex lg:min-h-[var(--alto-vista)] lg:flex-col lg:justify-center lg:px-16 lg:py-[clamp(22px,4dvh,44px)]">
        <div className="mx-auto flex w-full max-w-[1238px] flex-col gap-4 lg:gap-[clamp(10px,1.8dvh,20px)]">
          <div className="flex flex-col gap-1.5 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
            <div className="flex shrink-0 flex-col gap-1.5">
              <span className="w-fit rounded-pill bg-cafe px-3 py-1 text-[11px] font-bold tracking-[1px] text-amarillo">SOLO PARA SUSCRIPTORES</span>
              <h2 className="text-[26px] font-black uppercase leading-[1.05] text-cafe lg:text-[clamp(28px,5dvh,40px)]">Cada semana hay algo nuevo</h2>
            </div>
            <p className="text-[14px] leading-[20px] text-cafe/80 lg:max-w-[480px] lg:pb-1 lg:text-[15px] lg:leading-[22px]">Además de los sorteos y los descuentos, con tu suscripción eliges premios o Lanas en el Cofre y el Flash, y entras a sorteos VIP.</p>
          </div>
          <div className="grid grid-cols-1 gap-3 lg:min-h-[clamp(212px,calc((var(--alto-vista)-200px)*0.6),400px)] lg:grid-cols-2 lg:gap-6">
            <CardCofreVisitante />
            <div className="vista-m scroll-mt-3"><CardFlashVisitante /></div>
          </div>
          <div className="grid grid-cols-1 gap-3 max-lg:pt-0 lg:min-h-[clamp(132px,calc((var(--alto-vista)-200px)*0.4),250px)] lg:grid-cols-2 lg:gap-6">
          <article className="relative flex min-h-[140px] items-stretch overflow-hidden rounded-[24px] bg-[radial-gradient(110%_120%_at_80%_40%,#3D2A08_0%,#211402_65%)] text-n0">
            <div className="relative z-10 flex min-w-0 flex-1 flex-col justify-center gap-1.5 py-3.5 pl-4 pr-1 lg:gap-[clamp(4px,1dvh,8px)] lg:py-3 lg:pl-7">
              <p className="flex items-center gap-2 text-[21px] font-black leading-none lg:text-[clamp(24px,4.2dvh,36px)]">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-pill bg-rosa text-cafe lg:size-10"><Icon name="corona" size={20} /></span>
                <span>Sorteos <span className="text-rosa">VIP</span></span>
              </p>
              <p className="text-[13px] leading-[18px] text-n0/85 lg:text-[clamp(13px,2.2dvh,15px)] lg:leading-[1.4]">Activa tu plan, cumple las misiones y participa sin costo adicional.</p>
              <Link to="/como-funciona#vip" className="inline-flex items-center gap-1.5 self-start text-[13px] font-bold text-amarillo underline lg:text-sm">Conoce los sorteos VIP <Icon name="flecha" size={16} /></Link>
            </div>
            <div className="relative h-[130px] w-[38%] max-w-[300px] shrink-0 lg:h-auto lg:w-[42%] lg:self-stretch">
              <img src={IMG3D('vip-3d.webp')} alt="Premios de sorteos VIP" className="absolute inset-0 m-auto max-h-full max-w-full object-contain" />
            </div>
          </article>
          <article className="relative flex min-h-[140px] items-stretch overflow-hidden rounded-[24px] bg-n0">
            <div className="relative z-10 flex min-w-0 flex-1 flex-col justify-center gap-1.5 py-3.5 pl-4 pr-1 lg:gap-[clamp(4px,1dvh,8px)] lg:py-3 lg:pl-7">
              <p className="flex items-center gap-2 text-[21px] font-black leading-none text-cafe lg:text-[clamp(24px,4.2dvh,36px)]">
                <span className="shrink-0"><MonedaLana size={34} /></span>
                <span>Gana <span className="text-rosa-fuerte">Lanas</span></span>
              </p>
              <p className="text-[13px] leading-[18px] text-n60 lg:text-[clamp(13px,2.2dvh,15px)] lg:leading-[1.4]">Cumple misiones, gana Lanas y canjéalas por chances o beneficios.</p>
              <Link to="/como-funciona" className="inline-flex items-center gap-1.5 self-start text-[13px] font-bold text-cafe underline lg:text-sm">Cómo funcionan las Lanas <Icon name="flecha" size={16} /></Link>
            </div>
            <div className="relative h-[130px] w-[38%] max-w-[300px] shrink-0 lg:h-auto lg:w-[42%] lg:self-stretch">
              <img src={IMG3D('lanas-3d.webp')} alt="Monedas de Lanas" className="absolute inset-0 m-auto max-h-full max-w-full object-contain" />
            </div>
          </article>
          </div>
        </div>
      </section>
    </>
  );
}
