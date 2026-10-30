import { config } from '../api/config';
import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { Contenido } from '../components/layout/Hero';
import { HeroCarrusel } from '../components/layout/HeroCarrusel';
import { CardBilletera, CardCanje, CardFlash } from '../components/cards/cards';
import { DestacadosParaTi, FilaBeneficio, HojaDetalleBeneficio, SinBeneficios, vistaDe, type BeneficioVista } from '../components/beneficios/catalogo';
import { ChipFiltro } from '../components/ui/primitives';
import { FilaAuto } from '../components/ui/Carrusel';
import { Icon } from '../components/ui/Icon';
import { misCupones, promosBeneficios, ubicaciones } from '../data/mock';
import { Tx } from '../data/revision';
import { useBanners, useBeneficios, useCanjes } from '../data/datos';
import { useSesion } from '../data/sesion';

const POR_PAGINA = 8;
const descuentoDe = (etiqueta: string) => (/2x1/i.test(etiqueta) ? 50 : Number(etiqueta.match(/\d+/)?.[0] ?? 0));

export default function Beneficios() {
  const { beneficios, categorias: categoriasBeneficios } = useBeneficios();
  const { data: canjes } = useCanjes();
  const { modoMock } = useSesion();
  const banners = useBanners(['BENEFITS_MAIN']);
  const [cat, setCat] = useState('Todos');
  const [ubicacion, setUbicacion] = useState('Todas');
  const [orden, setOrden] = useState<'relevancia' | 'descuento'>('relevancia');
  const [mostrar, setMostrar] = useState(POR_PAGINA);
  const [abierto, setAbierto] = useState<BeneficioVista | null>(null);
  const cerrar = useCallback(() => setAbierto(null), []);
  const destacados = beneficios.filter((b) => b.destacado).map(vistaDe);

  const conUbicacion = beneficios.some((b) => 'ubicacion' in b && b.ubicacion);
  let lista = beneficios
    .filter((b) => cat === 'Todos' || b.categoria === cat)
    .filter((b) => ubicacion === 'Todas' || !('ubicacion' in b) || b.ubicacion === ubicacion || b.ubicacion === 'En todo el Perú');
  if (orden === 'descuento') lista = [...lista].sort((a, b) => descuentoDe(b.etiqueta) - descuentoDe(a.etiqueta));
  const visibles = lista.slice(0, mostrar);
  const restantes = lista.length - visibles.length;
  const cambiar = (f: () => void) => { f(); setMostrar(POR_PAGINA); };
  const selectCls = 'h-10 rounded-pill border border-n10 bg-n0 px-3 text-sm font-semibold text-cafe';

  return (
    <>
      <HeroCarrusel color="#3EB1FF" titulo={<Tx k="beneficios.hero.titulo" />} bajada={<Tx k="beneficios.hero.bajada" />} pose="beneficios"
        promos={config.usarMock ? promosBeneficios : []} banners={config.usarMock ? [] : banners.imagenes} />
      <Contenido>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <CardFlash />
          <div className="hidden lg:block"><CardBilletera etiquetaCanje="Ganar Lanas" conOveja /></div>
        </div>

        <DestacadosParaTi items={destacados} onAbrir={(i) => setAbierto(destacados[i])} />

        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-[22px] font-black uppercase leading-none lg:text-[28px]">Todos los <span className="text-rosa-fuerte">beneficios</span></h2>
            <p className="text-sm text-n60">{beneficios.length} beneficios para ti, ganes o no el sorteo.</p>
          </div>
          <div className="no-scrollbar -mx-6 flex gap-2 overflow-x-auto px-6 lg:mx-0 lg:flex-wrap lg:px-0">
            {categoriasBeneficios.map((c, i) => <ChipFiltro key={`${c}-${i}`} activo={c === cat} onClick={() => cambiar(() => setCat(c))}>{c}</ChipFiltro>)}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {conUbicacion && (
              <label className="flex items-center gap-2 text-sm font-semibold">
                Ubicación
                <select value={ubicacion} onChange={(e) => cambiar(() => setUbicacion(e.target.value))} className={selectCls}>
                  {ubicaciones.map((u) => <option key={u}>{u}</option>)}
                </select>
              </label>
            )}
            <label className="flex items-center gap-2 text-sm font-semibold">
              Ordenar
              <select value={orden} onChange={(e) => cambiar(() => setOrden(e.target.value as 'relevancia' | 'descuento'))} className={selectCls}>
                <option value="relevancia">Más buscados</option>
                <option value="descuento">Mayor descuento</option>
              </select>
            </label>
            <span className="text-[13px] text-n60">{lista.length} resultados</span>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:gap-4 xl:grid-cols-3">
            {visibles.map((b, i) => { const v = vistaDe(b); return <FilaBeneficio key={`${b.id}-${i}`} b={v} onAbrir={() => setAbierto(v)} />; })}
          </div>
          {restantes > 0 && (
            <button onClick={() => setMostrar((m) => m + POR_PAGINA)}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-pill border-[1.5px] border-cafe bg-n0 text-[15px] font-bold text-cafe lg:w-fit lg:self-center lg:px-10">
              Ver {restantes} beneficios más<Icon name="chevron-abajo" size={20} />
            </button>
          )}
          {lista.length === 0 && <SinBeneficios categoria={cat} ubicacion={ubicacion} onLimpiar={() => cambiar(() => { setCat('Todos'); setUbicacion('Todas'); })} />}
        </section>
        {abierto && <HojaDetalleBeneficio b={abierto} abierto onCerrar={cerrar} />}

        <section className="flex flex-col gap-3 rounded-[24px] bg-yellow-cta p-4 lg:p-6">
          <h2 className="text-[22px] font-extrabold"><Tx k="beneficios.canje.titulo" /></h2>
          <p className="text-[13px] leading-[19px]"><Tx k="beneficios.canje.bajada" /></p>
          <FilaAuto className="no-scrollbar flex snap-x gap-2.5 overflow-x-auto lg:grid lg:grid-cols-5 lg:overflow-visible [&>*]:snap-start">
            {canjes.map((c, i) => <CardCanje key={`${c.id}-${i}`} c={c} />)}
            {!canjes.length && <p className="text-[13px]">El catálogo de canje se está actualizando.</p>}
          </FilaAuto>
        </section>

        <Link to="/mi-cuenta" state={{ seccion: 'Mis Cupones' }} className="flex items-center gap-3 rounded-2xl bg-n0 py-3.5 pl-4 pr-3 lg:w-[420px]">
          <Icon name="cupon" size={24} />
          <span className="flex-1 text-sm font-bold">Mis Cupones{modoMock ? ` · ${misCupones} canjes` : ''}</span>
          <Icon name="chevron" size={20} className="text-n60" />
        </Link>
      </Contenido>
    </>
  );
}
