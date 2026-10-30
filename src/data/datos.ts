import { config } from '../api/config';
import { ApiError } from '../api/client';
import { beneficiosApi, cofreApi, geoApi, lanasApi, misionesApi, publicoApi, recompensasApi, sorteosApi, suscripcionApi, usuarioApi } from '../api/servicios';
import type * as T from '../api/tipos';
import * as A from './adaptadores';
import * as M from './mock';
import { useRecurso } from './recurso';
import { useSesion } from './sesion';
import { useDemoOpcional } from './revision';
import { conPrueba, sinImagen } from './imagenesPrueba';

const conSesion = () => useSesion().logueado;

export function useUsuario() {
  const s = useSesion();
  const r = useRecurso('usuario:perfil', usuarioApi.perfil, null, null, s.logueado);
  const mock = { ...M.usuario, tieneSuscripcion: true, tarjetas: [] as { id: string; cardBrand?: string; lastFourDigits?: string }[] };
  if (config.usarMock) return { ...mock, cargando: false };
  if (r.ejemplo) return { ...mock, tieneSuscripcion: !!s.me?.hasSubscription, cargando: false };
  return { ...A.aUsuario(s.me, r.data), cargando: r.cargando };
}

export function useBilletera() {
  const r = useRecurso('lanas:me', () => lanasApi.resumen().then(A.aBilletera),
    { ...M.billetera, puedeGastar: true, bloqueadas: 0, precioChance: null as number | null }, { saldo: 0, porVencer: { lanas: 0, fecha: '' }, puedeGastar: false, bloqueadas: 0, precioChance: null as number | null }, conSesion());
  const demo = useDemoOpcional();
  if (config.usarMock && demo && demo.saldoLanas !== 'normal') return { ...r.data, saldo: demo.saldoLanas === 'poco' ? 20 : 0 };
  return r.data;
}

export function useCanjes() {
  return useRecurso('lanas:canjes', () => lanasApi.catalogoCanje().then(A.aCanjes),
    M.canjes.map((c, i) => ({ id: String(i), ...c, bloqueado: !!c.bloqueado })), [], conSesion());
}

function useListaSorteos() {
  const logueado = conSesion();
  const r = useRecurso('sorteos:lista', () => sorteosApi.listar().then(A.aSorteos), [], [], logueado);
  return { ...r, ejemplo: r.ejemplo || (!logueado && config.datosEjemplo) };
}

export function useSorteoDestacado() {
  const { data, ejemplo } = useListaSorteos();
  return config.usarMock || ejemplo ? { ...M.sorteoDestacado, id: '', puedeComprar: true, chances: null as number | null, terminosUrl: undefined as string | undefined } : A.aSorteoDestacado(data);
}

export function useChancesDe(premio: string, deApi?: number | null) {
  const plan = useUsuario().chancesPorPlan;
  const demo = useDemoOpcional();
  if (deApi != null) return { plan, extra: Math.max(0, deApi - plan), total: deApi };
  const extra = config.usarMock ? demo?.sumadas[premio] ?? 0 : 0;
  return { plan, extra, total: plan + extra };
}

export function useProximosSorteos() {
  const { data, ejemplo } = useListaSorteos();
  const prototipo = M.proximosSorteos.map((p) => ({ id: '', ...p }));
  if (ejemplo) return prototipo;
  return data.length ? A.aProximos(data) : mockOVacio(prototipo);
}

function proximosMiercoles(n: number) {
  const d = new Date(); d.setHours(16, 0, 0, 0);
  while (d.getDay() !== 3) d.setDate(d.getDate() + 1);
  return Array.from({ length: n + 3 }, (_, i) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + (i - 3) * 7, 16));
}

export function useFechasSorteo() {
  return useRecurso('sorteos:fechas', () => sorteosApi.fechas().then(A.aFechas),
    proximosMiercoles(8), []).data;
}

export function useGanadores(fecha?: string) {
  return useRecurso(`sorteos:ganadores:${fecha}`, () => sorteosApi.ganadores(fecha!).then(A.aGanadores), M.ganadores, [], !!fecha).data;
}

export function useUltimosGanadores() {
  const iso = (d: Date) => d.toLocaleDateString('en-CA', { timeZone: 'America/Lima' });
  const hoy = iso(new Date());
  const fechas = useFechasSorteo();
  const ultima = [...fechas].reverse().find((d) => iso(d) < hoy);
  return { fecha: ultima, ganadores: useGanadores(ultima ? iso(ultima) : undefined) };
}

export function useDesafioVip() {
  return useRecurso('vip:fechas', () => sorteosApi.vipFechas().then(A.aDesafioVip),
    { ...M.desafioVip, hayAcceso: true, proximamente: false }, { mes: '', cierre: '', requisitos: [], hayAcceso: false, proximamente: false }, conSesion()).data;
}

export function useBeneficios() {
  const logueado = conSesion();
  const cats = useRecurso('beneficios:categorias', beneficiosApi.categorias, [], []);
  const r = useRecurso(`beneficios:${logueado ? 'propios' : 'publicos'}`,
    () => (logueado ? beneficiosApi.propios() : beneficiosApi.publicos()),
    null as unknown, null as unknown);
  const prototipo = M.beneficios.map((b, i) => ({ id: b.titulo, agotado: false, ...b, foto: b.foto as string | undefined,
    destacado: !!b.destacado || (!M.beneficios.some((x) => x.destacado) && i < 4),
    descripcion: b.descripcion ?? `${b.etiqueta} en ${b.comercio}. Se usa con ${b.uso === 'DNI' ? 'tu DNI' : b.uso === 'QR' ? 'QR' : 'código'}.`,
    desde: '01/10/2026', hasta: '31/12/2026', metodo: b.uso === 'DNI' ? 'IN_PERSON' : b.uso === 'QR' ? 'EXTERNAL' : 'PROMO_CODE' }));
  if (r.ejemplo) return { beneficios: prototipo, categorias: M.categoriasBeneficios };
  const deApi = r.data ? A.aBeneficios(r.data, cats.data) : mockOVacio(prototipo);
  const categoriasApi = cats.data.length && !cats.ejemplo ? A.aCategorias(cats.data) : config.datosEjemplo ? M.categoriasBeneficios : mockOVacio(M.categoriasBeneficios);
  if (config.datosEjemplo && !config.usarMock && r.data) {
    const nombres = new Set(deApi.map((b) => `${b.comercio}·${b.titulo}`.toLowerCase()));
    const extra = prototipo.filter((b) => !nombres.has(`${b.comercio}·${b.titulo}`.toLowerCase())).map((b) => ({ ...b, id: undefined }));
    return { beneficios: [...deApi, ...extra], categorias: [...new Set([...categoriasApi, ...M.categoriasBeneficios.slice(1)])] };
  }
  return { beneficios: deApi, categorias: categoriasApi };
}

export function useFlash() {
  return useRecurso('beneficios:flash', () => beneficiosApi.flash().then(A.aFlash),
    { ...M.flash, id: 'mock', agotado: false, yaUsado: false, codigo: undefined as string | undefined } as ReturnType<typeof A.aFlash>, null, conSesion(),
    (f) => !f?.detalle);
}

export function useCofreApi() {
  return useRecurso('cofre:me', () => cofreApi.estado().then(A.aCofre), null, null, conSesion(), (c) => !c?.estadoApi);
}

export function useMisiones() {
  return useRecurso('misiones:lista', () => misionesApi.listar().then(A.aMisiones), M.misiones, [], conSesion()).data;
}

export function useReferidos() {
  const u = useUsuario();
  const r = useRecurso('misiones:referidos', () => misionesApi.referidos().then(A.aReferidos),
    { codigo: M.usuario.codigoReferido, avance: 2, meta: 3, recompensa: 500, elegible: true }, { codigo: '', avance: 0, meta: 0, recompensa: 0, elegible: false }, conSesion());
  return { ...r.data, codigo: r.data.codigo || u.codigoReferido };
}

export function useMarcasAliadas() {
  return useRecurso('publico:marcas', () => publicoApi.marcas().then((m) => (Array.isArray(m) ? m : []).map((x) => ({ nombre: x.name ?? '', logo: conPrueba(x.imageUrl, 'logo', x.name) }))),
    M.marcasAliadas.map((m) => ({ nombre: m.nombre, logo: m.logo as string | undefined })), []).data;
}

export function useMovimientosLanas(page = 1) {
  return useRecurso(`lanas:movimientos:${page}`, () => lanasApi.movimientos(page).then(A.aMovimientos),
    { items: page === 1 ? M.movimientosLanas : [], hayMas: false }, { items: [], hayMas: false }, conSesion());
}

export function useMisCupones() {
  const pedir = () => lanasApi.misCupones().catch((e) => { if (e instanceof ApiError && e.status === 404) return lanasApi.misCanjes(); throw e; }).then(A.aCupones);
  return useRecurso('lanas:cupones', pedir,
    M.cuponesUsuario.map((c) => ({ logo: undefined as string | undefined, enlace: undefined as string | undefined, qr: undefined as string | undefined, ...c })), [], conSesion());
}

export function useRecompensas() {
  return useRecurso('recompensas:me', () => recompensasApi.mias().then(A.aRecompensas), M.recompensasUsuario, [], conSesion());
}

export function useParticipaciones(tipo: 'activas' | 'historicas') {
  const activas = tipo === 'activas';
  return useRecurso(`sorteos:participaciones:${tipo}`,
    () => (activas ? sorteosApi.misParticipaciones() : sorteosApi.misParticipacionesHistoricas()).then(A.aParticipaciones),
    activas ? M.participacionesActivas : M.participacionesHistoricas, [], conSesion());
}

export function usePerfilEditable() {
  const r = useRecurso('usuario:perfil', usuarioApi.perfil, null, null, conSesion());
  return { perfil: config.usarMock || r.ejemplo ? M.perfilEditable : A.aPerfilEditable(r.data), cargando: r.cargando };
}

export function useUbigeo(departamento: string, provincia: string) {
  const deps = useRecurso('geo:departamentos', () => geoApi.departamentos().then(A.aUbigeos), M.ubigeo.departamentos, []);
  const provs = useRecurso(`geo:provincias:${departamento}`, () => geoApi.provincias(departamento).then(A.aUbigeos),
    M.ubigeo.provincias.filter((p) => p.codigo.startsWith(departamento)), [], !!departamento);
  const dists = useRecurso(`geo:distritos:${provincia}`, () => geoApi.distritos(provincia).then(A.aUbigeos),
    M.ubigeo.distritos.filter((d) => d.codigo.startsWith(provincia)), [], !!provincia);
  return {
    departamentos: deps.data,
    provincias: departamento ? provs.data : [],
    distritos: provincia ? dists.data : [],
    cargando: deps.cargando || provs.cargando || dists.cargando,
  };
}

function mockOVacio<T>(mock: T[]): T[] {
  return config.usarMock ? mock : [];
}

const fechaCorta = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'America/Lima' });
};
const PERIODO_TXT: Record<string, string> = { MONTHLY: 'Mensual', MENSUAL: 'Mensual', SEMIANNUAL: 'Semestral', SEMESTRAL: 'Semestral', BIANNUAL: 'Semestral', ANNUAL: 'Anual', ANUAL: 'Anual', YEARLY: 'Anual' };

export function useMiPlan() {
  const s = useSesion();
  const r = useRecurso<T.Usuario | null>('usuario:perfil', usuarioApi.perfil, null, null, s.logueado);
  const mock = { plan: M.usuario.plan, periodo: 'Mensual', monto: 'S/ 12.50', chances: M.usuario.chancesPorPlan, inicio: '01/10/2026', vence: '01/11/2026', activo: true,
    cancelada: false, recurrente: true, tarjetas: [{ id: 't1', marca: 'Visa', ultimos: '9984', principal: true }], idSuscripcion: 'SUB-DEMO', yoki: false, yape: false };
  if (config.usarMock || r.ejemplo) return { ...mock, cargando: false };
  const sub = r.data?.subscription;
  const st = sub?.status;
  const estado = (st && typeof st === 'object' ? String((st as { name?: string }).name ?? '') : String(st ?? '')).toUpperCase();
  const moneda = !sub?.currency || /PEN|SOL/i.test(sub.currency) ? 'S/' : sub.currency;
  return {
    plan: sub?.planName ?? '', periodo: PERIODO_TXT[(sub?.billingCycle ?? '').toUpperCase()] ?? (sub?.billingCycle ?? ''),
    monto: sub?.amount ? `${moneda} ${Number(sub.amount).toFixed(2)}` : '', chances: sub?.oportunitiesPerRaffle?.number ?? 0,
    inicio: fechaCorta(sub?.startDate ?? sub?.subscriptionDate),
    vence: fechaCorta(estado === 'CANCELED' ? sub?.endDate : sub?.renewDate ?? sub?.endDate),
    activo: !!sub && !/EXPIR|INACTIV/i.test(estado), cancelada: estado === 'CANCELED', recurrente: !!sub?.isConcurrent,
    tarjetas: (r.data?.savedCards ?? sub?.savedCards ?? []).map((t) => ({ id: t.id, marca: t.cardBrand ?? 'Tarjeta', ultimos: t.lastFourDigits ?? '', principal: !!t.isDefault })),
    idSuscripcion: sub?.referenceId ?? '', yoki: (sub?.origin ?? '').toUpperCase() === 'YOKI', cargando: r.cargando,
    yape: /YAPE/i.test(sub?.paymentGateway ?? ''),
  };
}

export function useHistorialPagos() {
  return useRecurso('pagos:historial', () => suscripcionApi.historialPagos().then(A.aHistorialPagos), [
    { id: 'f1', fecha: '01/10/2026', concepto: 'Plan LANOTA · Mensual', monto: 'S/ 12.50', estado: 'Pagado', invoiceId: undefined as string | undefined },
    { id: 'f2', fecha: '01/09/2026', concepto: 'Plan LANOTA · Mensual', monto: 'S/ 12.50', estado: 'Pagado', invoiceId: undefined as string | undefined },
  ], [], conSesion());
}

export function useOfertasUpgrade() {
  return useRecurso('suscripcion:ofertas', () => suscripcionApi.ofertasUpgrade().then(A.aOfertasUpgrade), {
    actual: null,
    ofertas: M.planes.slice(2).map((p) => ({ planId: p.nombre, plan: p.nombre, chances: p.chances, meses: 1, total: p.precios.mensual, totalTexto: `S/ ${p.precios.mensual.toFixed(2)}`, bonus: 0, hasta: '', tipo: 'Más chances' })),
  } as ReturnType<typeof A.aOfertasUpgrade>, { actual: null, ofertas: [] }, conSesion(), (o) => !o.ofertas.length);
}

export function useHistorialGanadores() {
  return useRecurso('ganadores:historial', () => sorteosApi.historialGanadores({ take: 50 }).then(A.aHistorialGanadores),
    M.historicoSorteos as unknown as ReturnType<typeof A.aHistorialGanadores>, [], true);
}

export function usePlanes() {
  const r = useRecurso('suscripcion:planes', () => suscripcionApi.planes().then(A.planesApi), [], [], true);
  return M.planes.map((p) => {
    const precios: Record<'mensual' | 'semestral' | 'anual', number> = { ...p.precios };
    for (const per of ['mensual', 'semestral', 'anual'] as const) {
      const x = r.data.find((a) => a.nombre === p.nombre && a.periodo === per && a.precio > 0);
      if (x) precios[per] = x.precio;
    }
    return { ...p, precios };
  });
}

export type SeccionBanner = 'BENEFITS_MAIN' | 'RAFFLES_MAIN' | 'PRIZES_LOGGED' | 'LANDING_MAIN';
type BannerApiResp = { autoAdvance?: boolean; intervalSeconds?: number; images?: { id: string; position?: number; desktopUrl?: string; mobileUrl?: string; linkUrl?: string; isExternal?: boolean }[] };
export function useBanners(secciones: SeccionBanner[]) {
  const clave = `banners:${secciones.join(',')}`;
  const r = useRecurso(clave, () => Promise.all(secciones.map((s) => publicoApi.banners(s).catch(() => null) as Promise<BannerApiResp | null>)), [], [], true);
  const respuestas = (r.ejemplo ? [] : r.data).filter(Boolean) as BannerApiResp[];
  const imagenes = respuestas.flatMap((b) => [...(b.images ?? [])].sort((a, c) => (a.position ?? 0) - (c.position ?? 0)))
    .filter((im) => !sinImagen(im.desktopUrl) || !sinImagen(im.mobileUrl))
    .map((im) => ({ id: im.id, desktop: (sinImagen(im.desktopUrl) ? im.mobileUrl : im.desktopUrl) ?? '', movil: sinImagen(im.mobileUrl) ? '' : im.mobileUrl ?? '', link: im.linkUrl, externo: !!im.isExternal }));
  const primero = respuestas[0];
  return { imagenes, autoAvance: primero?.autoAdvance !== false, intervalo: Math.min(99, Math.max(1, primero?.intervalSeconds ?? 5)) * 1000 };
}

const COBERTURA: Record<string, string> = { LIMA: 'Lima', PROVINCES: 'Provincias', LIMA_AND_PROVINCES: 'Lima y provincias' };
export function useDetalleBeneficio(id: string | undefined, abierto: boolean) {
  const { logueado } = useSesion();
  const r = useRecurso<T.DetalleBeneficio | null>(`beneficio:${id}:${logueado ? 's' : 'p'}`,
    () => (logueado ? beneficiosApi.detalle(id!) : beneficiosApi.detallePublico(id!)), null, null, abierto && !!id && id !== 'mock');
  const d = r.ejemplo ? null : r.data;
  if (!d) return { detalle: null, cargando: r.cargando };
  return {
    cargando: r.cargando,
    detalle: {
      descripcion: d.description ?? '', imagen: conPrueba(d.imageUrl, 'beneficio', d.id),
      vigencia: d.endDate ? `${d.startDate ? `Del ${d.startDate} al ` : 'Hasta el '}${d.endDate}` : '',
      cobertura: [COBERTURA[(d.coverage ?? '').toUpperCase()] ?? '', (d.departments ?? []).map((x) => x.name).filter(Boolean).join(', ')].filter(Boolean).join(' · '),
      condiciones: (d.considerations ?? []).filter(Boolean), nota: d.disclaimerNote ?? '',
      terminos: d.termsAndConditionsText ?? '', terminosUrl: d.termsAndConditionsUrl ?? '',
      metodo: (d.deliveryMethod ?? '').toUpperCase(), disponible: d.isAvailable !== false && d.redemptionEnabled !== false && !d.isExhausted,
      usos: d.isUnlimited ? 'Usos ilimitados' : d.usesLeft != null ? `${d.usesLeft} ${d.usesLeft === 1 ? 'uso disponible' : 'usos disponibles'}${d.maxUses ? ` de ${d.maxUses}` : ''}` : '',
      activado: d.activation ? { codigo: d.promoCode ?? undefined, enlace: d.redirectUrl ?? undefined } : null,
    },
  };
}
