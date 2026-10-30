import type * as T from '../api/tipos';
import type { Ciclo, Mision, Periodo } from './mock';
import { conPrueba } from './imagenesPrueba';

const TZ = 'America/Lima';
const fecha = (iso?: string | null, o: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }) => {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('es-PE', { timeZone: TZ, ...o }).replace('.', '');
};
const hora = (iso?: string) => (iso ? new Date(iso).toLocaleTimeString('es-PE', { timeZone: TZ, hour: 'numeric', minute: '2-digit' }) : '');
const diaSemana = (iso?: string) => fecha(iso, { weekday: 'short', day: 'numeric', month: 'short' });
const lista = <X>(v: unknown, ...claves: string[]): X[] => {
  if (Array.isArray(v)) return v as X[];
  for (const k of claves) { const x = (v as Record<string, unknown> | null)?.[k]; if (Array.isArray(x)) return x as X[]; }
  return [];
};
const enDias = (iso?: string) => {
  if (!iso) return '';
  const d = Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);
  return d <= 0 ? 'Hoy' : d === 1 ? 'Mañana' : `En ${d} días`;
};
const restante = (iso?: string) => {
  if (!iso) return '';
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return '00:00:00';
  const h = Math.floor(ms / 3600000), m = Math.floor((ms % 3600000) / 60000), s = Math.floor((ms % 60000) / 1000);
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':');
};

export function aUsuario(me: T.AuthMe | null, u: T.Usuario | null) {
  const nombre = u?.firstName?.split(' ')[0] || me?.shortName?.split(' ')[0] || '';
  const apellido = u?.paternalSurname ?? '';
  return {
    nombre,
    nombreCompleto: [u?.firstName, u?.paternalSurname].filter(Boolean).join(' ') || me?.shortName || '',
    nombreCorto: me?.shortName || (apellido ? `${nombre} ${apellido[0]}.` : nombre),
    inicial: (nombre[0] ?? '·').toUpperCase(),
    plan: u?.subscription?.planName ?? '',
    chancesPorPlan: u?.subscription?.oportunitiesPerRaffle?.number ?? 0,
    codigoReferido: u?.publicId ?? '',
    idUsuario: u?.publicId ?? '',
    perfilPct: Math.round(u?.profileCompletion?.percentage ?? 0),
    tieneSuscripcion: !!me?.hasSubscription,
    tarjetas: u?.savedCards ?? [],
  };
}

export const aBilletera = (l: T.LanasMe) => ({
  saldo: l.balance ?? 0,
  porVencer: { lanas: l.nextExpiration?.amount ?? 0, fecha: fecha(l.nextExpiration?.date) },
  puedeGastar: l.canSpend !== false,
  bloqueadas: l.lockedLanas ?? 0,
  precioChance: l.chancePriceLanas && l.chancePriceLanas > 0 ? l.chancePriceLanas : null,
});

export const aHistorialPagos = (r: T.HistorialPagos) => (r.data ?? []).map((p) => ({
  id: p.invoiceId ?? p.orderNumber ?? '',
  fecha: fecha(p.date, { day: '2-digit', month: '2-digit', year: 'numeric' }),
  concepto: p.type === 'SUBSCRIPTION' ? 'Suscripción' : p.type === 'CHANCES' ? 'Chances' : (p.type ?? 'Pago').toLowerCase().replace(/^./, (x) => x.toUpperCase()),
  monto: `S/ ${((p.amountTotalCents ?? 0) / 100).toFixed(2)}`,
  estado: /PAID|ISSUED|SENT|OK|SUCCESS/i.test(p.invoiceStatus ?? '') ? 'Pagado' : /PEND/i.test(p.invoiceStatus ?? '') ? 'Pendiente' : /FAIL|REJECT|ERROR/i.test(p.invoiceStatus ?? '') ? 'Rechazado' : (p.invoiceStatus ?? ''),
  invoiceId: p.invoiceId,
}));
export const aHistorialGanadores = (r: T.HistorialGanadores) => {
  const grupos = new Map<string, { fecha: string; mes: string; participantes: number; premios: { premio: string; ganador: string; usuario: string; foto: string; mayor?: boolean; listaParticipantes?: boolean }[] }>();
  for (const g of r.data ?? []) {
    const k = g.drawDate ?? '';
    const d = fechaDMY(k);
    if (!grupos.has(k)) grupos.set(k, { fecha: d ? d.toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric', month: 'short', timeZone: TZ }).replace('.', '').replace(/^./, (x) => x.toUpperCase()) : k,
      mes: d ? d.toLocaleDateString('es-PE', { month: 'long', timeZone: TZ }).replace(/^./, (x) => x.toUpperCase()) : '', participantes: 0, premios: [] });
    const grupo = grupos.get(k)!;
    grupo.premios.push({ premio: g.prizeName ?? 'Premio', ganador: g.name ?? '', usuario: g.userPublicId ?? '', foto: conPrueba(g.photoUrl || g.prizeImageUrl, 'ganador', g.prizeName ?? g.name) ?? '',
      mayor: grupo.premios.length === 0, listaParticipantes: g.hasParticipationList });
  }
  return [...grupos.values()];
};
const fechaDMY = (s: string) => {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})/.exec(s);
  if (m) return new Date(`${m[3]}-${m[2]}-${m[1]}T17:00:00Z`);
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
};

export const aOfertasUpgrade = (r: T.OfertasUpgrade) => ({
  actual: r.currentSubscription ? {
    plan: r.currentSubscription.planName ?? '', estado: r.currentSubscription.status ?? '', diasParaVencer: r.currentSubscription.daysUntilExpiration ?? null,
    chances: r.currentSubscription.optionsPerRaffle ?? 0, recurrente: !!r.currentSubscription.isConcurrent,
  } : null,
  ofertas: (r.offers ?? []).filter((o) => !o.isSamePlan && o.planId).map((o) => ({
    planId: o.planId!, plan: o.planName ?? '', chances: o.optionsPerRaffle ?? 0, meses: o.durationMonths ?? 0,
    total: Number(String(o.totalUpgradeAmount ?? 0).replace(/[^\d.]/g, '')) || 0,
    totalTexto: typeof o.totalUpgradeAmount === 'string' ? o.totalUpgradeAmount.replace(/\u00a0/g, ' ') : `S/ ${(Number(o.totalUpgradeAmount) || 0).toFixed(2)}`,
    bonus: o.bonusChances ?? 0, hasta: fecha(o.endDate), tipo: o.movementType === 'vertical' ? 'Más chances' : o.movementType === 'horizontal' ? 'Más tiempo' : '',
  })),
});

export const aCanjes = (c: T.CatalogoCanje) => lista<T.ItemCanje>(c, 'items').map((i) => ({
  id: i.id,
  costo: i.lanasCost ?? 0,
  titulo: i.name ?? '',
  detalle: i.soldOut ? 'Agotado' : i.description ?? '',
  bloqueado: i.soldOut || c.subscriptionActive === false,
}));

export const aSorteos = (r: unknown) =>
  lista<T.Sorteo>(r, 'raffles', 'data')
    .filter((s) => !s.drawDate || new Date(s.drawDate).getTime() >= Date.now() - 86400000)
    .sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99));

const HORA_CORTE = '12:00';
export const aSorteoDestacado = (sorteos: T.Sorteo[]) => {
  const s = sorteos.find((x) => x.isFeatured) ?? sorteos[0];
  return {
    id: s?.id ?? '',
    premio: s?.name ?? '',
    fecha: s ? `Sorteo ${diaSemana(s.drawDate)} · ${s.hour ?? hora(s.drawDate)}` : '',
    cierraEn: s?.coverageMessage ?? '',
    horaCorta: s?.hour ?? hora(s?.drawDate),
    corte: s?.drawDate ? `${HORA_CORTE} del ${diaSemana(s.drawDate)}` : '',
    foto: s ? conPrueba(s.imageUrl, 'premio', s.id) : undefined,
    puedeComprar: !!s?.canBuy && !s?.isLive,
    descripcion: s?.description || undefined,
    terminosUrl: s?.termAndConditionsUrl ?? s?.termsAndConditionsUrl ?? undefined,
    chances: s?.userChances ?? null,
  };
};

export const aProximos = (sorteos: T.Sorteo[]) => sorteos.map((s) => ({
  id: s.id, categoria: '', premio: s.name ?? '', fecha: `Sorteo ${diaSemana(s.drawDate)}`, enDias: enDias(s.drawDate), foto: conPrueba(s.imageUrl, 'premio', s.id),
  fechaIso: s.drawDate ? new Date(s.drawDate).toLocaleDateString('en-CA', { timeZone: TZ }) : '',
  chances: s.userChances ?? null,
}));

export const aFechas = (fechas: unknown) =>
  lista<string>(fechas, 'data').map((f) => new Date(f)).filter((d) => !Number.isNaN(d.getTime()));

export const aGanadores = (g: unknown) => lista<T.Ganador>(g, 'data').map((x) => ({
  nombre: x.name ?? '', premio: x.prizeName ?? '', usuario: x.userPublicId ?? '', chances: 0, foto: conPrueba(x.prizeImageUrl || x.photoUrl, 'ganador', x.prizeName ?? x.name),
}));

export const aDesafioVip = (v: T.FechasVip) => {
  const d = v.challenges?.[0];
  return {
    mes: d?.startsAt ? fecha(d.startsAt, { month: 'long' }).toUpperCase() : '',
    cierre: d?.endsAt ? `${diaSemana(d.endsAt)} · ${hora(d.endsAt)}` : '',
    requisitos: (d?.missions ?? []).map((m) => ({
      icono: 'calendario' as const,
      texto: m.title ?? '',
      estado: m.completed ? 'hecha ✓' : `${m.progress ?? 0}/${m.goal ?? 1}`,
      hecha: !!m.completed,
    })),
    hayAcceso: v.hasAccess !== false,
    proximamente: !!v.comingSoon,
  };
};

const USO: Record<string, string> = {
  PROMO_CODE: 'Código', REDIRECT_LINK: 'Enlace', PROMO_CODE_AND_LINK: 'Código', IN_PERSON: 'En tienda', EXTERNAL: 'Código',
  QR: 'QR', DNI: 'DNI', LINK: 'Enlace',
};
const COBERTURA_BENEFICIO: Record<string, string> = { LIMA: 'Lima', PROVINCES: 'Provincias', LIMA_AND_PROVINCES: 'Lima y provincias' };
export const aBeneficios = (p: unknown, categorias: T.Categoria[]) => {
  const nombreCat = new Map(categorias.map((c) => [c.id, c.name ?? '']));
  return lista<T.Beneficio>(p, 'data').map((b) => ({
    id: b.id,
    titulo: b.name ?? '',
    comercio: b.brand?.name ?? '',
    logo: conPrueba(b.brand?.logo, 'logo', b.brand?.name ?? b.id),
    uso: USO[b.deliveryMethod ?? ''] ?? 'Código',
    etiqueta: b.highlightValue ?? b.highlightLabel ?? '',
    ahorro: '',
    categoria: nombreCat.get(b.categoryId ?? '') ?? '',
    foto: conPrueba(b.imageUrl, 'beneficio', b.id),
    agotado: !!b.isExhausted || b.isAvailable === false,
    destacado: !!b.isFeatured,
    descripcion: b.description ?? '',
    desde: b.startDate ?? '', hasta: b.endDate ?? '',
    ubicacion: COBERTURA_BENEFICIO[(b.coverage ?? '').toUpperCase()] ?? '',
    metodo: (b.deliveryMethod ?? '').toUpperCase(),
  }));
};
export const aCategorias = (c: unknown) => ['Todos', ...new Set(lista<T.Categoria>(c, 'data').filter((x) => x.isActive !== false).map((x) => x.name ?? '').filter(Boolean))];

export const aFlash = (r: T.FlashMeRespuesta) => {
  const f = (r && 'flashBenefit' in r ? r.flashBenefit : r) as T.FlashMe | null | undefined;
  if (!f || !f.id) return null;
  const lo = f.lanasOption;
  return {
    id: f.id,
    descuento: f.benefit?.highlightValue ?? '',
    detalle: f.benefit?.name ?? f.benefit?.description ?? '',
    detalleCorto: f.benefit?.name ?? '',
    comercio: f.benefit?.brand?.name ?? '',
    logo: conPrueba(f.benefit?.brand?.logo, 'logo', f.benefit?.brand?.name ?? f.id),
    imagen: conPrueba(f.benefit?.imageUrl, 'beneficio', f.id),
    vence: f.endsAt ? `vence ${diaSemana(f.endsAt)} a las ${hora(f.endsAt)}` : '',
    terminaEn: restante(f.endsAt),
    usados: f.usersEnjoying ?? 0,
    cupo: f.quota ?? 0,
    agotado: !!f.soldOut,
    beneficioAgotado: !!(f.benefitSoldOut ?? f.soldOut),
    yaUsado: !!f.alreadyClaimed,
    eleccion: (f.claim?.option ?? '').toUpperCase() === 'LANAS' ? 'lanas' as const : f.alreadyClaimed ? 'premio' as const : null,
    codigo: f.claim?.code ?? f.claim?.dniInstructions ?? undefined,
    terminos: f.benefit?.termsAndConditionsText ?? f.termsAndConditionsText ?? '',
    terminosUrl: f.benefit?.termsAndConditionsUrl ?? f.termsAndConditionsUrl ?? '',
    lanas: lo && (lo.amount ?? 0) > 0
      ? { cantidad: lo.amount ?? 0, entregadas: lo.quota?.used ?? 0, cupo: lo.quota?.total ?? 0, agotado: !!lo.soldOut }
      : null,
  };
};

export const aCofre = (c: T.CofreMe) => {
  const estado = (c.status ?? '').toUpperCase();
  const cierra = c.closesAt ?? c.opening?.cycleEndsAt;
  return {
    estadoApi: estado,
    oculto: ['NOT_ELIGIBLE', 'NO_CHEST', 'OUT_OF_WINDOW'].includes(estado),
    agotado: estado === 'SOLD_OUT',
    premios: { entregados: c.cycleStock?.delivered ?? c.deliveredThisCycle ?? 0, cupo: c.cycleStock?.total ?? 0 },
    quedan: c.cycleStock?.remaining ?? null,
    cierra: cierra ? `${diaSemana(cierra)} ${hora(cierra)}` : '',
    abre: c.nextAvailableAt ? `${diaSemana(c.nextAvailableAt)} ${hora(c.nextAvailableAt)}` : '',
    apertura: c.opening ? aApertura(c.opening) : null,
  };
};
export const aApertura = (a: T.AperturaCofre) => ({
  id: a.id ?? '',
  titulo: a.rewardLabel || (a.lanasAmount ? `+${a.lanasAmount} Lanas` : 'Tu premio'),
  detalle: a.rewardExpiresAt ? `Vence ${diaSemana(a.rewardExpiresAt)}, ${hora(a.rewardExpiresAt)}` : '',
  esLanas: a.rewardType === 'LANAS',
  logo: a.rewardType === 'LANAS' ? undefined : conPrueba(a.rewardImageUrl, 'logo', a.rewardLabel ?? a.id),
  alternativaLanas: a.exchangeOption?.lanasAmount ?? 0,
  estado: (a.status ?? '').toUpperCase(),
});

const CICLO: Record<string, Ciclo> = { ONE_TIME: 'ÚNICA', ONCE: 'ÚNICA', UNIQUE: 'ÚNICA', WEEKLY: 'SEMANAL', MONTHLY: 'MENSUAL', ALWAYS: 'SIEMPRE' };
const CTA: Record<string, Mision['cta']> = {
  REFERRAL: { texto: 'Copiar mi código', variant: 'link' },
  PROFILE_COMPLETION: { texto: 'Completar perfil', variant: 'link', to: '/mi-cuenta?s=Mi%20perfil' },
  PROFILE: { texto: 'Completar perfil', variant: 'link', to: '/mi-cuenta?s=Mi%20perfil' },
  CHEST_OPENING: { texto: 'Ir a Hoy', variant: 'link', to: '/' },
  CHEST: { texto: 'Ir a Hoy', variant: 'link', to: '/' },
  WEEKLY_VISIT: { texto: 'Ir a Hoy', variant: 'link', to: '/' },
  VISIT: { texto: 'Ir a Hoy', variant: 'link', to: '/' },
  LANAS_EARNED: { texto: 'Ir a Hoy', variant: 'link', to: '/' },
  LANAS_ASSIGNED_TO_RAFFLE: { texto: 'Ir a Sorteos', variant: 'link', to: '/sorteos' },
  MARKETPLACE_REDEMPTION: { texto: 'Ir a Canjear', variant: 'link', to: '/beneficios' },
  LANA_PURCHASE: { texto: 'Ver detalle', variant: 'link' },
  BENEFIT_ACTIVATION: { texto: 'Ver beneficios', variant: 'oscuro', to: '/beneficios' },
};
export const aMisiones = (m: T.MisionesMe): Mision[] =>
  lista<T.MisionApi>(m, 'items').filter((x) => x.id).map((x) => ({
    id: x.type === 'REFERRAL' ? 'referidos' : ['PROFILE_COMPLETION', 'PROFILE'].includes(x.type ?? '') ? 'perfil' : x.id,
    titulo: x.title ?? '',
    ciclo: CICLO[(x.cycle ?? '').toUpperCase()] ?? 'ÚNICA',
    recompensa: x.rewardLanas ? `+${x.rewardLanas}` : '',
    descripcion: x.description ?? '',
    avance: x.progress ?? 0,
    meta: x.goal ?? 1,
    destacada: x.id === m.highlightedMissionId,
    cta: CTA[(x.type ?? '').toUpperCase()] ?? { texto: 'Ver detalle', variant: 'link' },
  }));

export const aReferidos = (r: T.ReferidosMe) => {
  const m = r.missions?.[0] ?? r.mission;
  return { codigo: r.code ?? '', avance: m?.progress ?? 0, meta: m?.goal ?? 0, recompensa: m?.rewardLanas ?? 0, elegible: r.eligible !== false && !!m };
};

const CICLO_PLAN: Record<Periodo, string[]> = { mensual: ['MENSUAL', 'MONTHLY'], semestral: ['SEMESTRAL', 'SEMIANNUAL', 'BIANNUAL'], anual: ['ANUAL', 'ANNUAL', 'YEARLY'] };
export function idDePlan(respuesta: unknown, nombre: string, periodo: Periodo) {
  return planesApi(respuesta).find((x) => x.nombre === nombre && x.periodo === periodo)?.id
    ?? idDePlanLista(respuesta, nombre, periodo);
}
const CLAVE_PERIODO: Record<string, Periodo> = { MONTHLY: 'mensual', MENSUAL: 'mensual', SEMESTRAL: 'semestral', SEMIANNUAL: 'semestral', ANNUAL: 'anual', ANUAL: 'anual' };
export function planesApi(respuesta: unknown) {
  const r = (respuesta ?? {}) as Record<string, unknown>;
  return Object.entries(r).flatMap(([k, v]) => {
    const periodo = CLAVE_PERIODO[k.toUpperCase()];
    if (!periodo || !Array.isArray(v)) return [];
    return (v as { id?: string; name?: string; onlyPrice?: string; price?: string }[]).map((p) => ({
      id: p.id ?? '', nombre: (p.name ?? '').toUpperCase(), periodo,
      precio: Number(p.onlyPrice ?? String(p.price ?? '').replace(/[^\d.]/g, '')) || 0,
    }));
  });
}
function idDePlanLista(respuesta: unknown, nombre: string, periodo: Periodo) {
  const planes = lista<T.PlanApi>(respuesta, 'data', 'plans', 'items');
  const p = planes.find((x) => (x.name ?? '').toUpperCase().includes(nombre) && CICLO_PLAN[periodo].includes((x.billingCycle ?? '').toUpperCase()));
  return p?.id ?? null;
}

const ORIGEN: Record<string, string> = {
  CHEST: 'Cofre', MISSION: 'Misión', REFERRAL: 'Referidos', VISIT: 'Visita semanal', PROFILE: 'Perfil completo',
  STREAK: 'Racha', TOURNAMENT: 'Torneo', MARKETPLACE_REDEMPTION: 'Canje', MANUAL_ADJUSTMENT: 'Ajuste', GRACE_LOSS: 'Pérdida por gracia',
  RAFFLE: 'Chances de sorteo', RAFFLE_CHANCES: 'Chances de sorteo', VIP_RAFFLE: 'Sorteo VIP', REDEMPTION: 'Canje',
  LANA_REDEMPTION: 'Canje', PURCHASE: 'Recarga', LANA_PURCHASE: 'Recarga', PROMO_CODE: 'Código promo',
  EXPIRATION: 'Vencimiento', SUBSCRIPTION: 'Suscripción', FLASH: 'Beneficio Flash', ADJUSTMENT: 'Ajuste',
};
const origen = (s?: string) => ORIGEN[(s ?? '').toUpperCase()] ?? (s ? s.charAt(0) + s.slice(1).toLowerCase().replace(/_/g, ' ') : '');

const mesAnio = (iso?: string) => {
  const t = fecha(iso, { month: 'long', year: 'numeric' }).replace(' de ', ' ');
  return t.charAt(0).toUpperCase() + t.slice(1);
};

export const aMovimientos = (p: T.Paginado<T.MovimientoLana>) => ({
  items: lista<T.MovimientoLana>(p, 'data', 'items').map((m) => {
    const credito = (m.type ?? '').toUpperCase() === 'CREDIT';
    const vence = (m.allocations ?? []).map((a) => a.expiresAt).filter(Boolean).sort()[0];
    return {
      id: m.id,
      titulo: m.description || origen(m.source) || (credito ? 'Lanas recibidas' : (m.type ?? '').toUpperCase() === 'EXPIRATION' ? 'Lanas vencidas' : 'Lanas usadas'),
      origen: origen(m.source),
      fecha: fecha(m.createdAt),
      lanas: (credito ? 1 : -1) * Math.abs(m.amount ?? 0),
      vence: credito && vence ? fecha(vence) : '',
      lotes: (m.allocations ?? []).length,
      mes: mesAnio(m.createdAt),
    };
  }),
  hayMas: (p.meta?.currentPage ?? 1) < (p.meta?.lastPage ?? 1),
});
export type Movimiento = ReturnType<typeof aMovimientos>['items'][number];

const ORIGEN_CUPON: Record<string, string> = { BENEFIT: 'Beneficio', MARKETPLACE: 'Canje', CHEST: 'Cofre', FLASH_BENEFIT: 'Beneficio Flash' };
const estadoCupon = (c: T.CuponMio): 'disponible' | 'usado' | 'vencido' => {
  const st = (c.status ?? '').toUpperCase();
  if (/USED|CONSUMED/.test(st)) return 'usado';
  if (/EXPIRED/.test(st) || (c.expiresAt && new Date(c.expiresAt).getTime() < Date.now())) return 'vencido';
  return 'disponible';
};
const tipoCupon = (c: T.CuponMio): 'codigo' | 'qr' | 'dni' | 'enlace' | 'contacto' => {
  const m = (c.deliveryMode ?? c.discountDeliveryMode ?? '').toUpperCase();
  if (m === 'DNI' || m === 'IN_PERSON') return 'dni';
  if (/CONTACT/.test(m)) return 'contacto';
  if (c.redirectUrl) return 'enlace';
  if (c.qrUrl || /QR/.test(m)) return 'qr';
  return 'codigo';
};
export const aCupones = (r: unknown) => lista<T.CuponMio>(r, 'items', 'data').map((c) => ({
  id: c.id,
  titulo: c.title ?? c.benefitName ?? c.itemName ?? c.name ?? (c.rewardType ? origen(c.rewardType) : 'Cupón'),
  comercio: c.merchant?.tradeName ?? c.brand?.name ?? '',
  logo: conPrueba(c.merchant?.logoUrl ?? c.brand?.logo, 'logo', c.merchant?.tradeName ?? c.brand?.name ?? c.id),
  codigo: c.code ?? '',
  instrucciones: c.instructions ?? c.redemptionInstructions ?? ((c.deliveryMode ?? c.discountDeliveryMode) === 'DNI' ? 'Muestra tu DNI en el comercio para usarlo.' : ''),
  enlace: c.redirectUrl ?? undefined,
  qr: c.qrUrl ?? undefined,
  origen: ORIGEN_CUPON[(c.sourceType ?? '').toUpperCase()] ?? '',
  fecha: fecha(c.redeemedAt ?? c.createdAt),
  vence: fecha(c.expiresAt),
  lanas: c.lanasSpent ?? 0,
  conLanas: (c.lanasSpent ?? 0) > 0,
  estado: estadoCupon(c),
  tipo: tipoCupon(c),
}));
export type Cupon = ReturnType<typeof aCupones>[number];

export const aRecompensas = (r: unknown) => lista<T.Recompensa>(r, 'items', 'data').map((x) => ({
  id: x.id,
  titulo: x.rewardDescription || (x.rewardLanas ? `+${x.rewardLanas} Lanas` : 'Recompensa'),
  origen: origen(x.sourceType),
  fecha: fecha(x.awardedAt),
  lanas: x.rewardLanas ?? 0,
  vence: fecha(x.rewardExpiresAt),
}));
export type RecompensaVista = ReturnType<typeof aRecompensas>[number];

const ORIGEN_CHANCES: [keyof NonNullable<T.ParticipacionSorteo['breakdown']>, string][] = [
  ['subscription', 'plan'], ['purchased', 'compradas'], ['wallet', 'con Lanas'], ['promo', 'promo'],
];
export const aParticipaciones = (r: unknown) => lista<T.GrupoParticipaciones>(r, 'data', 'items').map((g) => ({
  fecha: diaSemana(g.drawDate),
  sorteos: (g.raffles ?? []).map((s) => ({
    id: s.raffleId,
    premio: s.prizeName ?? '',
    chances: Math.round(s.totalChances ?? 0),
    ganador: !!s.isWinner,
    renovacion: !!s.subjectToRenewal,
    plan: Math.round(s.breakdown?.subscription ?? 0),
    sumadas: Math.round((s.breakdown?.purchased ?? 0) + (s.breakdown?.wallet ?? 0)),
    regalo: Math.round(s.breakdown?.promo ?? 0),
    detalle: ORIGEN_CHANCES.map(([k, t]) => [Math.round(s.breakdown?.[k] ?? 0), t] as const).filter(([n]) => n > 0).map(([n, t]) => `${n} ${t}`).join(' · '),
  })),
}));
export type GrupoParticipacion = ReturnType<typeof aParticipaciones>[number];

export const aPerfilEditable = (u: T.Usuario | null) => ({
  direccion: u?.address ?? '',
  genero: u?.gender ?? '',
  distrito: /^\d{6}$/.test(u?.districtUbigeoCode ?? '') ? u!.districtUbigeoCode! : '',
  placa: u?.carPlate ?? '',
  correo: u?.email ?? '',
  telefono: u?.phone ?? '',
  nombre: [u?.firstName, u?.paternalSurname, u?.maternalSurname].filter(Boolean).join(' '),
  documento: [u?.documentType, u?.documentNumber].filter(Boolean).join(' '),
});
export type PerfilEditable = ReturnType<typeof aPerfilEditable>;

export const aUbigeos = (r: unknown) => {
  const vistos = new Set<string>();
  return lista<T.Ubigeo>(r, 'data', 'items')
    .filter((x) => x.code && !vistos.has(x.code) && !!vistos.add(x.code))
    .map((x) => ({ codigo: x.code, nombre: x.name ?? x.code }));
};
export type UbigeoVista = ReturnType<typeof aUbigeos>[number];
