import { config } from '../../api/config';
import { BannerApi } from '../../components/layout/BannerApi';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Contenido, Hero } from '../../components/layout/Hero';
import { CardBeneficioMini, CardPremio, CardSorteoDestacado } from '../../components/cards/cards';
import { CardCta, EstadoVacio, Faq, GanadoresUltimoSorteo, MarcasAliadas, PasosComoFunciona, PremiosDelMes, TarjetaBeneficioPublica, TituloSeccion } from '../../components/publico/Secciones';
import { Nube } from '../../components/ui/Brand';
import { Icon, type IconName } from '../../components/ui/Icon';
import { Badge, Button, ButtonCompacto, ChipFiltro, Foto, ImagenOpcional, MonedaLana, cx } from '../../components/ui/primitives';
import { consultaCodigo } from '../../data/mock';
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
  PremiosDelMesDatos, SeccionGanadores, TarjetaBeneficio,
} from '../../ref/secciones';
import { canjesEjemplo, pasos as pasosRef, type Beneficio as BeneficioRef } from '../../ref/publico';
import { preguntasFaq } from '../../components/publico/Secciones';

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
  const fechasSorteo = useFechasSorteo();
  const proximosSorteos = useProximosSorteos();
  const d = useSorteoDestacado();
  const { fecha, ganadores } = useUltimosGanadores();
  const extra = d as { descripcion?: string; terminosUrl?: string };
  const detalle = useDetallePublico({ premio: d.premio, fecha: d.fecha.replace(/^Sorteo /, ''), foto: d.foto, descripcion: extra.descripcion, terminosUrl: extra.terminosUrl,
    terminos: /moto|camioneta|auto/i.test(d.premio) ? TERMINOS_VEHICULO : undefined });
  const fotoDestacado = !d.foto || d.foto.includes('premio-kia') ? 'img/premio-destacado.webp' : d.foto;
  return (
    <>
      <Hero publico color="#FF88F7" titulo={"Premios de este me\u2060-\u2060e\u2060-\u2060es"} bajada="Cada miércoles sorteamos premios en vivo. Suscríbete para participar." imagen="img/oveja-01.webp" />
      <div className="mx-auto max-w-[1366px] px-6 pb-6 pt-6 lg:px-16 lg:pb-[clamp(16px,3dvh,32px)] lg:pt-[clamp(14px,2.6dvh,28px)]">
        {!config.usarMock && <BannerApi secciones={['RAFFLES_MAIN']} className="mb-6" />}
        {d.premio && (
          <section className="relative">
            <div className="flex flex-col overflow-hidden rounded-[24px] bg-hero-brand lg:h-[clamp(220px,calc(var(--alto-vista)-360px),290px)] lg:flex-row">
              <div className="relative h-[200px] bg-amarillo lg:h-auto lg:w-[clamp(360px,32vw,453px)]">
                <img src={asset(fotoDestacado)} alt={d.premio} className="size-full object-cover" />
              </div>
              <div className="flex flex-1 flex-col items-start justify-center gap-2 p-6 lg:gap-[clamp(4px,1dvh,10px)] lg:px-8 lg:py-5 lg:pr-[260px]">
                <span className="rounded-md bg-amarillo px-3 py-[5px] text-xs font-bold text-cafe">PREMIO DESTACADO</span>
                <h2 className="text-[28px] font-black leading-tight text-n0 lg:text-[clamp(26px,4.4dvh,36px)]">{d.premio}</h2>
                <p className="text-sm font-medium text-n0/80">{d.fecha} · en vivo</p>
                <p className="text-[15px] font-bold text-n0">Participa desde 1 chance con cualquier plan</p>
                <Link to="/planes" className="mt-1 inline-flex h-12 items-center whitespace-nowrap rounded-pill bg-amarillo px-8 text-[15px] font-bold text-cafe lg:h-[clamp(44px,7dvh,56px)]">Suscríbete para participar</Link>
                <p className="text-xs text-n0/80">En vivo por nuestras redes · queda grabado · <button onClick={detalle.abrir} className="font-bold text-amarillo underline">Ver detalle y términos</button></p>
                {detalle.modal}
              </div>
            </div>
            <img src={asset('img/oveja-09.webp')} alt="" className="absolute bottom-0 right-10 z-10 hidden h-[clamp(150px,calc(var(--alto-vista)-470px),200px)] lg:block" />
          </section>
        )}
      </div>

      <div className="mx-auto flex max-w-[1366px] flex-col gap-10 px-6 py-10 lg:gap-14 lg:px-16 lg:py-14">
        <PremiosDelMesDatos fechas={fechasSorteo} premios={proximosSorteos} titulo="Próximos sorteos" bajada="" color enBanda={false} />

        <section className="flex flex-col items-start gap-2 rounded-2xl bg-n0 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <p className="text-[15px] font-bold leading-5 text-cafe"><span className="mr-2 text-[12px] font-black tracking-[0.6px] text-morado">SORTEOS VIP</span>Además de los sorteos regulares, hay sorteos VIP para quienes cumplen las misiones del mes.</p>
          <Link to="/como-funciona" state={{ ancla: 'vip' }} className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-sm font-bold text-cafe underline underline-offset-2">Conoce los sorteos VIP <Icon name="flecha" size={16} /></Link>
        </section>

        {ganadores.length > 0 && <SeccionGanadores {...ganadoresRef(fecha, ganadores)} />}
      </div>

      <div className="mx-auto max-w-[1366px] px-6 pb-8 pt-2 lg:px-16 lg:pb-[clamp(20px,4dvh,48px)]">
        <CardCtaRef titulo="¿Quieres estar en el próximo sorteo?" bajada="Elige tu plan y participa cada miércoles." boton="Ver planes" imagen={asset('img/oveja-cta-2.webp')} />
      </div>
    </>
  );
}

export function BeneficiosPublico() {
  const { beneficios, categorias: categoriasBeneficios } = useBeneficios();
  const marcasAliadas = useMarcasAliadas();
  const [cat, setCat] = useState('Todos');
  const todos = beneficios.map(aBeneficioRef);
  const lista = cat === 'Todos' ? todos : todos.filter((b) => b.categoria === cat);
  return (
    <>
      <Hero publico color="#3EB1FF" titulo="Beneficios a diario" bajada="Descuentos en restaurantes, salud, belleza y más. Úsalos desde tu primer mes." imagen="img/oveja-01.webp" />
      <div className="mx-auto flex max-w-[1366px] flex-col gap-5 px-6 pb-3 pt-8 lg:gap-6 lg:px-16 lg:pb-5 lg:pt-10">
        {!config.usarMock && <BannerApi secciones={['BENEFITS_MAIN']} />}
        <FiltroCategorias categorias={categoriasBeneficios} activa={cat} onChange={setCat} />
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
          {lista.slice(0, 4).map((b) => <TarjetaBeneficio key={b.id} b={b} apilada />)}
          {lista.length === 0 && <p className="col-span-2 text-n60">Pronto habrá beneficios en esta categoría.</p>}
        </div>
      </div>

      <div className="mx-auto flex max-w-[1366px] flex-col gap-10 px-6 pb-10 pt-6 lg:gap-14 lg:px-16 lg:pb-14 lg:pt-10">
        {lista.length > 4 && (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
            {lista.slice(4).map((b) => <TarjetaBeneficio key={b.id} b={b} apilada />)}
          </div>
        )}

        <section className="relative flex flex-col gap-4 overflow-hidden rounded-2xl bg-amarillo p-5 sm:flex-row sm:items-center lg:px-5 lg:py-2.5">
          <Nube className="-left-10 -top-10 w-[150px] text-fondo" />
          <img src={asset('img/oveja-beneficios-titulo.webp')} alt="" className="relative z-10 hidden size-[84px] object-contain sm:block" />
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
        <CardCtaRef titulo="Beneficios desde tu primer mes" bajada="Descuentos a diario, ganes o no el sorteo." boton="Ver planes" imagen={asset('img/oveja-cta-2.webp')} />
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
  { id: 'cofre', t: 'Cofre sorpresa', d: 'Cada miércoles se abre un cofre nuevo. Ábrelo y elige entre el premio que te tocó o Lanas.' },
  { id: 'flash', t: 'Beneficio Flash', d: 'Una oferta especial por pocas horas, cada miércoles. Elige el beneficio o Lanas antes de que se agote.' },
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
      <Hero publico oscuro color="#211402" titulo="¿Cómo funciona AKITÁ?" bajada="Elige tu plan, usa tus beneficios y participa cada miércoles: sorteos en vivo, cofre sorpresa y Beneficio Flash." imagen="img/oveja-05.webp" />
      <div className="mx-auto max-w-[1366px] px-6 pb-8 pt-6 lg:px-16 lg:pb-0 lg:pt-14">
        <PasosRef pasos={pasosRef} conBoton={false} titulo="Paso a paso" />
      </div>
      <div className="mx-auto flex max-w-[1366px] flex-col px-6 py-10 lg:px-16 lg:py-14">
        <section className="flex flex-col gap-5">
          <h2 className="text-[26px] font-black uppercase leading-[1.05] text-cafe lg:text-[36px]">Lo que encuentras al suscribirte</h2>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4">
            {LO_QUE_ENCUENTRAS.map((x) => (
              <div key={x.id} id={x.id} className="flex scroll-mt-[110px] flex-col gap-1.5 rounded-[20px] bg-n0 p-4 lg:gap-2 lg:rounded-[24px] lg:p-6">
                <p className="text-[15px] font-extrabold leading-5 text-cafe lg:text-lg">{x.t}</p>
                <p className="text-[13px] leading-[18px] text-n60 lg:text-[15px] lg:leading-[22px]">{x.d}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
      <div className="mx-auto flex max-w-[1366px] flex-col gap-10 px-6 pb-10 lg:gap-14 lg:px-16 lg:pb-14">
        <PreguntasFrecuentes preguntas={preguntasFaq()} />
        <CardCtaRef titulo="¿Listo para pertenecer al rebaño y participar?" bajada="Elige tu plan y únete al rebaño AKITÁ." boton="Elegir mi plan" iconoIzq />
      </div>
    </>
  );
}
