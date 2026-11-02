import { config } from '../../api/config';
import { BannerApi } from '../../components/layout/BannerApi';
import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Contenido, Hero } from '../../components/layout/Hero';
import { CardBeneficioMini, CardPremio, CardSorteoDestacado } from '../../components/cards/cards';
import { CardCta, EstadoVacio, Faq, GanadoresUltimoSorteo, MarcasAliadas, PasosComoFunciona, PremiosDelMes, TarjetaBeneficioPublica, TituloSeccion } from '../../components/publico/Secciones';
import { Nube } from '../../components/ui/Brand';
import { Icon, type IconName } from '../../components/ui/Icon';
import { Badge, Button, ButtonCompacto, ChipFiltro, Foto, ImagenOpcional, MonedaLana, cx } from '../../components/ui/primitives';
import { bannersBeneficios, consultaCodigo } from '../../data/mock';
import { sorteosApi } from '../../api/servicios';
import { mensajeError } from '../../api/client';
import { useBeneficios, useFechasSorteo, useMarcasAliadas, useProximosSorteos, useHistorialGanadores, useSorteoDestacado, useUltimosGanadores } from '../../data/datos';
import { Tx } from '../../data/revision';
import { useSesion } from '../../data/sesion';
import { asset } from '../../data/assets';
import { useDetallePublico } from '../../components/sorteos/DetallePremio';
import { TERMINOS_VEHICULO } from '../../data/mock';
import {
  Boton, CanjesConLanas, CardCta as CardCtaRef, FiltroCategorias, MarcasAliadas as MarcasRef, PasosComoFunciona as PasosRef, PreguntasFrecuentes,
  SeccionGanadores, TarjetaBeneficio, Carrusel, CierreSuscripcion, GanadoresCompactos, SelectorFechas, TarjetaPremio,
  useFechasSorteo as useFechasRef,
} from '../../ref/secciones';
import { CERRADO, NOTA_CERRADO, rutaPlanesConPremio, textoCierre, useDetallePremio, usePremioMes } from '../../ref/premio';
import { usePerfil } from '../../ref/demo';
import { FuenteSorteosApi, useFuenteSorteos } from '../../ref/sitio';
import { BuscadorBeneficios, coincide, DestacadosParaTi, FilaBeneficio, HojaDetalleBeneficio, SinBeneficios, vistaDe, type BeneficioVista } from '../../components/beneficios/catalogo';
import { canjesEjemplo, pasos as pasosRef, type Beneficio as BeneficioRef } from '../../ref/publico';
import { preguntas as preguntasRef } from '../../ref/publico';

const nombreCorto = (n: string) => n.split(' ').slice(0, 2).join(' ');
const DIAS = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
const MESES = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SET', 'OCT', 'NOV', 'DIC'];
const ganadoresRef = (fecha: Date | undefined, lista: { nombre: string; premio: string; usuario: string; chances: number; foto?: string }[]) => ({
  fecha: fecha ? `${DIAS[fecha.getDay()].charAt(0)}${DIAS[fecha.getDay()].slice(1).toLowerCase()} ${fecha.getDate()} ${MESES[fecha.getMonth()].toLowerCase()}` : '',
  detalle: 'transmitido en vivo · nombres protegidos',
  ganadores: lista.slice(0, 8).map((g, i) => ({ id: `${g.usuario}-${i}`, nombre: g.nombre, premio: g.premio, usuario: g.usuario, chances: g.chances,
    fechaSorteo: fecha ? `SORTEO ${DIAS[fecha.getDay()]} ${fecha.getDate()} ${MESES[fecha.getMonth()]}` : '', foto: g.foto ? asset(g.foto) : '' })),
});
const aBeneficioRef = (b: { id?: string; titulo: string; comercio: string; uso: string; etiqueta: string; categoria?: string; foto?: string; logo?: string }, i: number): BeneficioRef => ({
  id: b.id ?? `b${i}`, titulo: b.titulo, comercio: b.comercio, uso: b.uso, etiqueta: b.etiqueta, categoria: b.categoria ?? '',
  foto: b.foto ? asset(b.foto) : undefined, logo: b.logo ? asset(b.logo) : undefined,
});

export function PremiosPublico() {
  return <FuenteSorteosApi><Premios /></FuenteSorteosApi>;
}

function Premios() {
  const mes = usePremioMes();
  const { participa, eligeTuPlan } = usePerfil();
  const detalle = useDetallePremio(mes.p, mes.cerrado);
  const f = useFechasRef();
  const { meses } = useFuenteSorteos();
  const [calendario, setCalendario] = useState(false);
  const mesSel = meses[f.m];
  const { fecha, ganadores } = useUltimosGanadores();
  const fechaTxt = fecha ? `${DIAS[fecha.getDay()].toLowerCase()} ${fecha.getDate()} ${MESES[fecha.getMonth()].toLowerCase()}` : '';
  return (
    <>
      <section className="relative overflow-hidden bg-rosa">
        <Nube className="-bottom-[86px] -left-[40px] w-[150px] text-fondo lg:-bottom-[150px] lg:w-[260px]" />
        <Nube className="-bottom-[100px] -right-[40px] w-[190px] text-fondo lg:-bottom-[170px] lg:right-[8%] lg:w-[300px]" />
        <div className="relative mx-auto flex max-w-[1366px] items-center justify-between gap-3 px-6 pb-9 pt-5 lg:px-16 lg:pb-14 lg:pt-10">
          <div className="relative z-10 flex flex-col gap-2">
            <h1 className="text-[30px] font-black uppercase leading-[0.95] text-cafe lg:text-[56px]">
              <span className="block">Premios de</span>
              <span className="block whitespace-nowrap">{'este me⁠-⁠e⁠-⁠es'}</span>
            </h1>
            <p className="max-w-[230px] text-[15px] leading-5 text-cafe/90 lg:max-w-none lg:text-lg">Activa tu plan y participa cada miércoles.</p>
          </div>
          <img src={asset('img/premios-hero.webp')} alt="" className="relative z-10 h-[112px] w-auto shrink-0 drop-shadow-[0_12px_10px_rgba(33,20,2,0.25)] lg:h-[210px]" />
        </div>
      </section>

      <div className="mx-auto flex max-w-[1366px] flex-col gap-8 px-6 pb-6 pt-1 lg:gap-12 lg:px-16 lg:pb-12">
        <section className="relative z-20 -mt-5 overflow-hidden rounded-[24px] bg-cafe shadow-card lg:-mt-8 lg:flex">
          <div className="relative h-[190px] overflow-hidden bg-amarillo lg:h-auto lg:min-h-[300px] lg:w-[48%]">
            <Nube className="-right-12 bottom-[-80px] w-[220px] text-n0/50" />
            {mes.p.foto && <img src={mes.p.foto} alt={mes.p.nombre} className="absolute inset-0 z-10 m-auto max-h-[94%] max-w-[94%] object-contain" />}
          </div>
          <div className="flex flex-1 flex-col items-start gap-1.5 p-5 pt-6 lg:justify-center lg:gap-2.5 lg:px-10 lg:py-10">
            <span className="rounded-pill bg-amarillo px-3 py-1 text-[11px] font-bold tracking-[0.6px] text-cafe">PREMIO GRANDE DEL MES</span>
            <h2 className="text-[24px] font-black leading-tight text-n0 lg:text-[36px]">{mes.p.nombre}</h2>
            <p className="text-[15px] font-semibold text-n0">Sorteo: {mes.sorteo} · en vivo</p>
            {mes.cerrado
              ? <p className="text-[14px] text-n0/85"><b className="text-rosa">{CERRADO}.</b> {NOTA_CERRADO}</p>
              : <p className="text-[14px] text-n0/85">{textoCierre(mes.fecha)}</p>}
            <Link to={mes.cerrado ? '/planes' : rutaPlanesConPremio(mes.p)} className="mt-2 inline-flex h-12 w-full items-center justify-center gap-2 whitespace-nowrap rounded-pill bg-amarillo px-6 text-[15px] font-bold text-cafe lg:h-14 lg:w-auto lg:px-9 lg:text-base">
              {mes.cerrado ? eligeTuPlan : participa}<Icon name="flecha" size={18} />
            </Link>
            <button onClick={detalle.abrir} className="self-center py-1.5 text-[14px] font-bold text-n0 underline underline-offset-2 lg:self-start">Ver detalle y términos</button>
            {detalle.modal}
          </div>
        </section>

        {!config.usarMock && <BannerApi secciones={['RAFFLES_MAIN']} />}

        <section className="flex flex-col gap-3">
          <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
            <div className="flex flex-col gap-0.5">
              <h2 className="text-[24px] font-extrabold leading-tight text-cafe lg:text-[32px]">Próximos sorteos</h2>
              {mesSel && <p className="text-[14px] text-n60">Sorteo del mié {f.dia} {mesSel.corto}</p>}
            </div>
            <button onClick={() => setCalendario((v) => !v)} aria-expanded={calendario} className="inline-flex items-center gap-1 whitespace-nowrap pb-0.5 text-[14px] font-bold text-cafe underline underline-offset-2">
              {calendario ? 'Ocultar fechas' : 'Ver otras fechas'}<Icon name={calendario ? 'chevron-abajo' : 'flecha'} size={16} className={cx(calendario && 'rotate-180')} />
            </button>
          </div>
          {calendario && <SelectorFechas m={f.m} dia={f.dia} onMes={f.onMes} onDia={f.onDia} />}
          <Carrusel anchoClase="w-[74vw] max-w-[300px] lg:w-[calc((100%-60px)/4)] lg:max-w-none" gap={16}>{f.premios.map((p) => <TarjetaPremio key={p.id} p={p} color />)}</Carrusel>
        </section>

        <section className="relative flex items-center gap-2 overflow-hidden rounded-[24px] bg-[radial-gradient(110%_120%_at_85%_40%,#3D2A08_0%,#211402_65%)] py-4 pl-5 pr-2 text-n0 lg:px-10 lg:py-7">
          <div className="relative z-10 flex min-w-0 flex-1 flex-col items-start gap-1.5 lg:gap-2.5">
            <span className="rounded-pill bg-amarillo px-3 py-1 text-[11px] font-bold tracking-[0.6px] text-cafe">SORTEOS VIP</span>
            <p className="text-[22px] font-black leading-tight lg:text-[32px]">Hay más por ganar</p>
            <p className="text-[13px] leading-[18px] text-n0/85 lg:max-w-[560px] lg:text-[15px] lg:leading-[22px]">Activa tu plan, completa las misiones VIP del mes y participa sin costo adicional.</p>
            <Link to="/como-funciona" state={{ ancla: 'vip' }} className="mt-1 inline-flex h-10 items-center gap-1.5 whitespace-nowrap rounded-pill border-[1.5px] border-amarillo px-4 text-[13px] font-bold text-amarillo lg:h-11 lg:text-sm">Conoce los sorteos VIP <Icon name="flecha" size={16} /></Link>
          </div>
          <img src={asset('img/premios-vip.webp')} alt="" className="h-[124px] w-auto shrink-0 object-contain lg:h-[190px]" />
        </section>

        {ganadores.length > 0 && (
          <GanadoresCompactos fecha={fechaTxt}
            ganadores={ganadores.slice(0, 8).map((g, i) => ({ id: `${g.usuario}-${i}`, nombre: g.nombre, premio: g.premio, usuario: g.usuario, chances: g.chances, fechaSorteo: fechaTxt, foto: g.foto ? asset(g.foto) : '' }))} />
        )}
        <CierreSuscripcion />
      </div>
    </>
  );
}

export function BeneficiosPublico() {
  const { beneficios, categorias: categoriasBeneficios } = useBeneficios();
  const marcasAliadas = useMarcasAliadas();
  const [cat, setCat] = useState('Todos');
  const [ubicacion, setUbicacion] = useState<'Todas' | 'Lima' | 'Provincias'>('Todas');
  const [busqueda, setBusqueda] = useState('');
  const [abierto, setAbierto] = useState<BeneficioVista | null>(null);
  const cerrarDetalle = useCallback(() => setAbierto(null), []);
  const lista = beneficios.filter((b) => coincide(b, busqueda)).filter((b) => cat === 'Todos' || b.categoria === cat).map(vistaDe)
    .filter((b) => ubicacion === 'Todas' || (ubicacion === 'Lima' ? /lima/i.test(b.ubicacion) : /provincia|perú/i.test(b.ubicacion)));
  const destacados = beneficios.filter((b) => b.destacado).map(vistaDe);
  return (
    <>
      <Hero publico color="#3EB1FF" titulo="Beneficios a diario" bajada="Descuentos en restaurantes, salud, belleza y más. Úsalos desde tu primer mes." imagen="img/beneficios-hero.webp" />
      <div className="mx-auto flex max-w-[1366px] flex-col gap-6 px-6 pb-3 pt-8 lg:px-16 lg:pb-5 lg:pt-10">
        <BannerApi secciones={['BENEFITS_MAIN']} ejemplos={config.usarMock || config.datosEjemplo ? bannersBeneficios.map((b) => ({ ...b, desktop: asset(b.desktop), movil: asset(b.movil), link: '/planes' })) : []} />
        <DestacadosParaTi items={destacados} onAbrir={(i) => setAbierto(destacados[i])} />
      </div>

      <div className="mx-auto flex max-w-[1366px] flex-col gap-10 px-6 pb-10 pt-6 lg:gap-14 lg:px-16 lg:pb-14 lg:pt-10">
        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-[22px] font-black uppercase leading-none text-cafe lg:text-[28px]">Todos los <span className="text-rosa-fuerte">beneficios</span></h2>
            <p className="text-sm text-n60">{beneficios.length} beneficios · se activan al suscribirte.</p>
          </div>
          <BuscadorBeneficios valor={busqueda} onCambio={setBusqueda} />
          <FiltroCategorias categorias={categoriasBeneficios} activa={cat} onChange={setCat} />
          <label className="flex w-fit items-center gap-2 text-sm font-semibold text-cafe">
            Ubicación
            <select value={ubicacion} onChange={(e) => setUbicacion(e.target.value as typeof ubicacion)} className="h-10 rounded-pill border border-n10 bg-n0 px-3 text-base font-semibold">
              {['Todas', 'Lima', 'Provincias'].map((u) => <option key={u}>{u}</option>)}
            </select>
          </label>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:gap-4 xl:grid-cols-3">
            {lista.map((b, i) => <FilaBeneficio key={`${b.id}-${i}`} b={b} onAbrir={() => setAbierto(b)} />)}
          </div>
          {lista.length === 0 && <SinBeneficios categoria={cat} ubicacion={ubicacion} busqueda={busqueda} onLimpiar={() => { setCat('Todos'); setUbicacion('Todas'); setBusqueda(''); }} />}
        </section>
        {abierto && <HojaDetalleBeneficio b={abierto} abierto onCerrar={cerrarDetalle} />}

        <section className="relative flex flex-col gap-4 overflow-hidden rounded-2xl bg-amarillo p-5 sm:flex-row sm:items-center lg:px-5 lg:py-2.5">
          <Nube className="-left-10 -top-10 w-[150px] text-fondo" />
          <img src={asset('img/beneficios-titulo.webp')} alt="" className="relative z-10 hidden size-[84px] object-contain sm:block" />
          <div className="relative flex-1 rounded-2xl px-1 py-1 sm:px-4 sm:py-3">
            <p className="text-[15px] font-bold text-cafe">Se activan al suscribirte</p>
            <p className="text-[13px] text-cafe">Con precio de lista y precio AKITÁ. Los usas con código, QR o tu DNI.</p>
          </div>
          <Boton to="/planes" tono="cafe" icono className="relative">Ver planes</Boton>
        </section>

        <CanjesConLanas canjes={canjesEjemplo} />
      </div>

      <div className="mx-auto flex max-w-[1366px] flex-col gap-6 px-6 pb-8 pt-4 lg:gap-8 lg:px-16 lg:pb-[clamp(24px,4dvh,48px)] lg:pt-[clamp(24px,4dvh,48px)]">
        {marcasAliadas.length > 0 && <MarcasRef marcas={marcasAliadas.filter((m) => m.logo).map((m) => ({ nombre: m.nombre.toLowerCase(), logo: asset(m.logo!) }))} />}
        <CardCtaRef titulo="Beneficios desde tu primer mes" bajada="Descuentos a diario, ganes o no el sorteo." boton="Ver planes" imagen={asset('img/beneficios-cta.webp')} />
      </div>
    </>
  );
}

export function Ganadores() {
  const [codigo, setCodigo] = useState('');
  const [buscado, setBuscado] = useState(false);
  const { modoMock } = useSesion();
  const { data: historicoSorteos } = useHistorialGanadores();
  const [resultado, setResultado] = useState<{ cargando: boolean; error?: string; ganados: { premio: string; fecha: string }[] }>({ cargando: false, ganados: [] });
  const buscar = async () => {
    setBuscado(true);
    if (modoMock || !codigo.trim()) return;
    setResultado({ cargando: true, ganados: [] });
    try {
      const r = await sorteosApi.historialGanadores({ code: codigo.trim(), take: 20 });
      setResultado({ cargando: false, ganados: (r.data ?? []).map((g) => ({ premio: g.prizeName ?? 'Premio', fecha: g.drawDate ?? '' })) });
    } catch (e) { setResultado({ cargando: false, error: mensajeError(e), ganados: [] }); }
  };
  const ultimo = historicoSorteos[0];
  const anteriores = historicoSorteos.slice(1);
  const filtros = ['Esta semana', ...new Set(anteriores.map((h) => h.mes))];
  const [filtro, setFiltro] = useState<string>('Esta semana');
  const grupos = filtro === 'Todos' ? anteriores
    : filtro === 'Esta semana' ? anteriores.filter((h) => h.mes === anteriores[0]?.mes)
      : anteriores.filter((h) => h.mes === filtro);
  if (!ultimo) return <><Hero publico color="#45E586" titulo={<Tx k="gan.hero.titulo" />} bajada={<Tx k="gan.hero.bajada" />} imagen="img/oveja-ganadores.webp" /><Contenido><EstadoVacio titulo="Los ganadores se publican después de cada sorteo" detalle="Vuelve el miércoles por la noche." /></Contenido></>;
  const mayor = ultimo.premios.find((p) => p.mayor) ?? ultimo.premios[0];
  return (
    <>
      <Hero publico color="#45E586" titulo={<Tx k="gan.hero.titulo" />} bajada={<Tx k="gan.hero.bajada" />} imagen="img/oveja-ganadores.webp" />
      <Contenido>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] lg:items-stretch lg:gap-6">
          <section className="flex flex-col gap-2.5 rounded-[24px] bg-n0 p-4">
            <div>
              <h2 className="text-[22px] font-extrabold leading-tight text-cafe"><Tx k="gan.ultimo" /></h2>
              <p className="text-[14px] text-n60">{ultimo.fecha} · transmitido en vivo</p>
            </div>
            <div className="flex flex-col overflow-hidden rounded-2xl bg-cafe sm:flex-row">
              <img src={asset(mayor.premio.includes('KIA') ? 'assets/premio-kia-banner.webp' : mayor.foto)} alt={mayor.premio}
                className="h-[150px] w-full bg-amarillo object-cover sm:h-[170px] sm:w-[46%]" />
              <div className="flex flex-col justify-center gap-0.5 px-4 py-3">
                <span className="self-start rounded-md bg-amarillo px-2 py-[3px] text-[11px] font-bold text-cafe">PREMIO MAYOR</span>
                <p className="text-[18px] font-extrabold leading-tight text-amarillo">{mayor.premio}</p>
                <p className="text-[13px] text-n0/80">Ganador</p>
                <p className="text-[15px] font-bold text-n0">{nombreCorto(mayor.ganador)}</p>
                <p className="text-xs text-n0/70">Usuario {mayor.usuario}</p>
              </div>
            </div>
            {ultimo.premios.length > 1 && (
              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {ultimo.premios.filter((p) => p !== mayor).slice(0, 3).map((p) => (
                  <li key={p.premio} className="flex items-center gap-2.5 rounded-xl bg-n5 p-2">
                    <img src={asset(('fotoGanador' in p ? String(p.fotoGanador ?? '') : '') || p.foto)} alt="" className="size-11 shrink-0 rounded-lg object-cover object-top" />
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-bold text-cafe">{p.premio}</p>
                      <p className="truncate text-[12px] text-n60">{nombreCorto(p.ganador)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <aside className="flex flex-col gap-2.5 rounded-[24px] bg-cafe p-5 text-n0">
            <h2 className="flex items-center gap-2.5 text-[22px] font-extrabold leading-tight text-amarillo"><span className="flex size-10 shrink-0 items-center justify-center rounded-pill bg-amarillo text-cafe"><Icon name="trofeo" size={20} /></span>Busca por código de usuario</h2>
            <p className="text-sm text-n0/80">Mira en qué sorteos participó, con cuántas chances y si ganó. Los nombres se muestran protegidos.</p>
            <form className="mt-auto flex flex-col gap-3" onSubmit={(e) => { e.preventDefault(); buscar(); }}>
              <label className="flex flex-col gap-1.5">
                <span className="text-[13px] font-semibold">Código de usuario</span>
                <input value={codigo} onChange={(e) => { setCodigo(e.target.value.toUpperCase()); setBuscado(false); }} placeholder="YK-7F3K-29"
                  className="h-12 rounded-2xl border border-n0/20 bg-n0 px-4 text-base text-cafe outline-none focus:border-amarillo" />
                <span className="text-xs text-n0/60">Tu código está en Mi cuenta › Mi perfil.</span>
              </label>
              <button type="submit" className="inline-flex h-12 items-center justify-center rounded-pill bg-amarillo px-5 text-[15px] font-bold text-cafe transition hover:brightness-95">Buscar</button>
            </form>
            {buscado && !modoMock && (
              resultado.cargando ? <p className="text-sm text-n0/70" aria-live="polite">Buscando…</p>
                : resultado.error ? <p className="rounded-xl bg-rosa-claro px-3.5 py-3 text-sm text-cafe" aria-live="polite">{resultado.error}</p>
                : resultado.ganados.length ? (
                  <div className="flex flex-col gap-1 rounded-xl bg-n0/10 px-3.5 py-3" aria-live="polite">
                    <p className="text-sm font-bold">{codigo.toUpperCase()} · {resultado.ganados.length} {resultado.ganados.length === 1 ? 'premio ganado' : 'premios ganados'}</p>
                    {resultado.ganados.map((x, i) => <p key={`${x.fecha}-${i}`} className="text-[13px] font-semibold text-verde">{x.fecha} · {x.premio}</p>)}
                  </div>
                ) : <p className="rounded-xl bg-n0/10 px-3.5 py-3 text-sm" aria-live="polite">Ese código todavía no tiene premios ganados.</p>
            )}
            {buscado && modoMock && (
              codigo.startsWith('YK-') ? (
                <div className="flex flex-col gap-1 rounded-xl bg-n0/10 px-3.5 py-3" aria-live="polite">
                  <p className="text-sm font-bold">{consultaCodigo.codigo} · {consultaCodigo.nombre} · {consultaCodigo.participaciones.length} sorteos</p>
                  {consultaCodigo.participaciones.map((x) => (
                    <p key={x.sorteo} className={cx('text-[13px]', x.vigente ? 'font-semibold text-verde' : 'text-n0/70')}>{x.sorteo} · {x.premio} · {x.chances} chances · {x.estado.toLowerCase()}</p>
                  ))}
                </div>
              ) : <p className="rounded-xl bg-rosa-claro px-3.5 py-3 text-sm text-cafe" aria-live="polite">No encontramos ese código. Revisa que empiece con YK-.</p>
            )}
          </aside>
        </div>

        <section id="historico" className="flex scroll-mt-32 flex-col gap-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-[24px] font-extrabold text-cafe lg:text-[28px]"><Tx k="gan.historico" /></h2>
              <p className="text-[15px] text-n60">Todos los sorteos anteriores, con su fecha y participantes</p>
            </div>
            <div className="no-scrollbar -mx-6 flex gap-2 overflow-x-auto px-6 lg:mx-0 lg:px-0">
              {filtros.map((f) => <ChipFiltro key={f} activo={f === filtro} onClick={() => setFiltro(f)}>{f}</ChipFiltro>)}
            </div>
          </div>
          {grupos.length ? (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
              {grupos.map((h) => (
                <article key={h.fecha} className="flex flex-col gap-3 rounded-[24px] bg-n0 p-4 lg:p-5">
                  <p className="flex items-center gap-2 text-[12px] font-bold tracking-[0.8px] text-n60"><Icon name="calendario" size={16} />{h.fecha.toUpperCase()}{h.participantes ? ` · ${h.participantes.toLocaleString('es-PE')} PARTICIPANTES` : ''}</p>
                  {h.premios.map((f) => {
                    const varios = 'extra' in f && f.extra ? Number(String(f.extra).match(/\d+/)?.[0] ?? 0) + 1 : 0;
                    return (
                      <div key={f.premio} className="flex items-center gap-3 rounded-2xl bg-n5 p-2.5">
                        <img src={asset(('fotoGanador' in f ? String(f.fotoGanador ?? '') : '') || f.foto)} alt="" loading="lazy" className="size-14 shrink-0 rounded-xl object-cover" />
                        <div className="min-w-0 flex-1">
                          <p className="text-[15px] font-bold leading-5 text-cafe">{f.premio}{varios ? ` · ${varios} ganadores` : ''}</p>
                          <p className="text-[13px] text-n60">{f.ganador}{varios ? ` y ${varios - 1} más` : ''}</p>
                        </div>
                        <span className="hidden shrink-0 rounded-md bg-amarillo px-2 py-[3px] text-[11px] font-bold text-cafe sm:inline">★ GANADOR</span>
                      </div>
                    );
                  })}
                </article>
              ))}
            </div>
          ) : <p className="text-sm text-n60">No hay sorteos registrados en este periodo.</p>}
          {filtro !== 'Todos' && (
            <button type="button" onClick={() => setFiltro('Todos')}
              className="inline-flex h-11 items-center gap-2 self-center whitespace-nowrap rounded-pill border-[1.5px] border-cafe px-5 text-sm font-bold text-cafe transition hover:bg-n5">
              Ver sorteos anteriores <Icon name="flecha" size={18} />
            </button>
          )}
        </section>
      </Contenido>
    </>
  );
}

const LO_QUE_ENCUENTRAS = [
  { id: 'cofre', t: 'Cofre sorpresa', d: 'Cada jueves se abre un cofre nuevo. Ábrelo y elige entre el premio que te tocó o Lanas.' },
  { id: 'flash', t: 'Beneficio Flash', d: 'Una oferta especial por pocas horas, cada viernes. Elige el beneficio o Lanas antes de que se agote.' },
  { id: 'vip', t: 'Sorteos VIP', d: 'Completa las misiones del mes y elige un sorteo VIP gratis. Los demás sorteos VIP se pagan con Lanas.' },
  { id: 'chances', t: 'Plan y chances', d: 'Tu plan incluye 1, 3 o 5 chances en cada sorteo regular. Se registran hasta las 12:00 del día del sorteo.' },
  { id: 'lanas', t: 'Lanas', d: 'Las ganas con misiones, referidos, el cofre y el Beneficio Flash. 1 Lana = 1 chance. Vencen a los 3 meses.' },
  { id: 'beneficios', t: 'Beneficios a diario', d: 'Descuentos en restaurantes, salud, belleza y más, ganes o no el sorteo. Úsalos con código, QR o tu DNI.' },
];

export function ComoFunciona() {
  const location = useLocation();
  const ancla = (location.state as { ancla?: string } | null)?.ancla ?? (location.hash ? location.hash.slice(1) : undefined);
  useEffect(() => {
    if (!ancla) return;
    const t = window.setTimeout(() => document.getElementById(ancla)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 250);
    return () => window.clearTimeout(t);
  }, [ancla]);
  return (
    <>
      <Hero publico oscuro color="#211402" titulo="¿Cómo funciona AKITÁ?" bajada="Elige tu plan, usa tus beneficios y participa cada semana: sorteos en vivo, cofre sorpresa y Beneficio Flash." imagen="img/oveja-05.webp" />
      <div className="mx-auto max-w-[1366px] px-6 pb-8 pt-6 lg:px-16 lg:pb-0 lg:pt-14">
        <PasosRef pasos={pasosRef} conBoton={false} titulo="Paso a paso" />
      </div>
      <div className="mx-auto flex max-w-[1366px] flex-col px-6 py-10 lg:px-16 lg:py-14">
        <section className="flex flex-col gap-5">
          <h2 className="text-[26px] font-black uppercase leading-[1.05] text-cafe lg:text-[36px]">Lo que encuentras al suscribirte</h2>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4">
            {LO_QUE_ENCUENTRAS.map((x) => (
              <div key={x.id} id={x.id} className={cx('flex scroll-mt-[110px] flex-col gap-1.5 rounded-[20px] p-4 transition-colors lg:gap-2 lg:rounded-[24px] lg:p-6', ancla === x.id ? 'bg-amarillo/40 ring-2 ring-amarillo' : 'bg-n0')}>
                <p className="text-[15px] font-extrabold leading-5 text-cafe lg:text-lg">{x.t}</p>
                <p className="text-[13px] leading-[18px] text-n60 lg:text-[15px] lg:leading-[22px]">{x.d}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
      <div className="mx-auto flex max-w-[1366px] flex-col gap-10 px-6 pb-10 lg:gap-14 lg:px-16 lg:pb-14">
        <PreguntasFrecuentes preguntas={preguntasRef} />
        <CardCtaRef titulo="¿Listo para pertenecer al rebaño y participar?" bajada="Elige tu plan y únete al rebaño AKITÁ." boton="Elegir mi plan" iconoIzq />
      </div>
    </>
  );
}
