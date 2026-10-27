import { api, apiArchivo, nuevaClaveIdempotencia } from './client';
import { tokens, type Tokens } from './tokens';
import type * as T from './tipos';


export const authApi = {
  async login(email: string, password: string) {
    const t = await api<Tokens>('/v1/users/login', { method: 'POST', auth: false, body: { email, password } });
    tokens.guardar(t);
  },
  async logout() {
    const refreshToken = tokens.refresh();
    try { await api('/v1/users/revoke', { method: 'POST', auth: false, body: refreshToken ? { refreshToken } : {} }); }
    finally { tokens.limpiar(); }
  },
  me: () => api<T.AuthMe>('/v1/auth/me'),
  registrar: (d: T.RegistroDTO) => api('/v1/users', { method: 'POST', auth: false, body: d }),
  recuperarClave: (email: string) => api('/v1/users/recovery-password', { auth: false, query: { email } }),
  cambiarClave: (password: string, token: string) => api('/v1/users/change-password', { method: 'POST', auth: false, body: { password, token } }),
};

export const usuarioApi = {
  perfil: () => api<T.Usuario>('/v1/users'),
  datosPersonales: (d: T.DatosPersonalesDTO) => api('/v1/users', { method: 'PUT', body: d }),
  perfilOpcional: (d: T.PerfilOpcionalDTO) =>
    api<T.PerfilOpcionalDTO>('/v1/users/optional-profile', { method: 'PUT', body: d }),
  confirmarDistrito: (districtUbigeoCode: string) =>
    api<T.ConfirmacionPerfil>('/v1/missions/me/profile-confirmations', { method: 'POST', body: { districtUbigeoCode } }),
};

export const geoApi = {
  departamentos: () => api<T.Ubigeo[]>('/v1/geo/departments', { auth: false }),
  provincias: (departmentCode: string) => api<T.Ubigeo[]>('/v1/geo/provinces', { auth: false, query: { departmentCode } }),
  distritos: (provinceCode: string) => api<T.Ubigeo[]>('/v1/geo/districts', { auth: false, query: { provinceCode } }),
};

export const recompensasApi = {
  mias: () => api<{ items?: T.Recompensa[] } | T.Paginado<T.Recompensa>>('/v1/rewards/me'),
};

export const lanasApi = {
  resumen: () => api<T.LanasMe>('/v1/lanas/me'),
  movimientos: (page = 1) => api<T.Paginado<T.MovimientoLana>>('/v1/lanas/me/movements', { query: { page } }),
  catalogoCanje: () => api<T.CatalogoCanje>('/v1/lana-redemptions/catalog'),
  canjear: (itemId: string) => api<T.Canje>('/v1/lana-redemptions', { method: 'POST', body: { itemId }, idempotencia: true }),
  misCanjes: () => api<{ items?: T.Canje[]; data?: T.Canje[] } | T.Canje[]>('/v1/lana-redemptions/mine'),
  tasa: () => api<{ lanasPerSol?: number; startsAt?: string }>('/v1/lanas/conversion-rate', { auth: false }),
};

export const sorteosApi = {
  listar: () => api<{ raffles?: T.Sorteo[] }>('/v1/raffles'),
  fechas: () => api<string[]>('/v1/raffles/draw-dates', { auth: false }),
  ganadores: (date: string) => api<T.Ganador[]>('/v1/raffles/winners', { auth: false, query: { date } }),
  historialGanadores: (q: { code?: string; date?: string; page?: number; take?: number } = {}) =>
    api<T.HistorialGanadores>('/v1/raffles/winners/history', { auth: false, query: q }),
  participantes: (raffleId: string, q: { publicId?: string; page?: number; limit?: number } = {}) =>
    api(`/v1/raffles/${encodeURIComponent(raffleId)}/participation`, { auth: false, query: q }),
  misParticipaciones: () => api<T.Paginado<T.GrupoParticipaciones>>('/v1/raffles/my-participations/active'),
  misParticipacionesHistoricas: () => api<T.Paginado<T.GrupoParticipaciones>>('/v1/raffles/my-participations/historical'),
  comprarChancesConTarjeta: (b: { token?: string; userPaymentMethodId?: string; raffleId: string; opportunities: number; promoCode?: string }) =>
    api<T.ResultadoPago>('/v1/payments/kushki/chances', { method: 'POST', body: b, idempotencia: true }),
  comprarChancesConYape: (b: { raffleId: string; opportunities: number; phoneNumber: string; otp: string; promoCode?: string }) =>
    api<T.ResultadoPago>('/v1/payments/yape', { method: 'POST', body: b, idempotencia: true }),
  comprarChancesConLanas: (raffleId: string, quantity: number) =>
    api<{ lanasBalance?: number; userChances?: number }>(`/v1/raffles/${encodeURIComponent(raffleId)}/chances/lanas`, {
      method: 'POST', body: { quantity, idempotencyKey: nuevaClaveIdempotencia() },
    }),
  vipFechas: () => api<T.FechasVip>('/v1/vip-raffles/me/dates'),
  vipDelDia: (drawDate: string) => api('/v1/vip-raffles/me', { query: { drawDate } }),
  vipInscribirse: (id: string, expectedLanas: number) =>
    api(`/v1/vip-raffles/${encodeURIComponent(id)}/entries`, { method: 'POST', body: { expectedLanas, acceptedCutoffTerms: true } }),
};

export const beneficiosApi = {
  propios: (q: { page?: number; categoryId?: string; search?: string } = {}) => api<T.Paginado<T.Beneficio>>('/v1/benefits/own', { query: q }),
  publicos: (page = 1) => api<T.Paginado<T.Beneficio>>('/v1/benefits/all', { auth: false, query: { page } }),
  categorias: () => api<T.Categoria[]>('/v1/benefit-categories', { auth: false }),
  detalle: (id: string) => api<T.DetalleBeneficio>(`/v1/benefits/${encodeURIComponent(id)}`),
  detallePublico: (id: string) => api<T.DetalleBeneficio>(`/v1/benefits/public/${encodeURIComponent(id)}`, { auth: false }),
  cuponExterno: (id: string) => api<T.CuponExterno>(`/v1/benefits/${encodeURIComponent(id)}/external-coupon`),
  canjearExterno: (id: string) => api<T.CuponExterno>(`/v1/benefits/${encodeURIComponent(id)}/external-redeem`, { method: 'POST', body: {} }),
  activar: (id: string) => api<T.Activacion>(`/v1/benefits/${encodeURIComponent(id)}/activations`, { method: 'POST', body: {} }),
  flash: () => api<T.FlashMeRespuesta>('/v1/benefits/flash/me'),
  obtenerCodigoFlash: (id: string, option: 'BENEFIT' | 'LANAS' = 'BENEFIT') =>
    api<T.CodigoFlash>(`/v1/benefits/flash/${encodeURIComponent(id)}/claims`, { method: 'POST', body: { option } }),
};

export const cofreApi = {
  estado: () => api<T.CofreMe>('/v1/chest/me'),
  abrir: () => api<T.AperturaCofre | null>('/v1/chest/me/openings', { method: 'POST', body: {} }),
  aplicar: (openingId: string) => api<T.AplicacionCofre>(`/v1/chest/me/openings/${encodeURIComponent(openingId)}/application`, { method: 'POST', body: {} }),
  cambiarPorLanas: (openingId: string) => api(`/v1/chest/me/openings/${encodeURIComponent(openingId)}/exchange`, { method: 'POST', body: {} }),
};

export const misionesApi = {
  listar: () => api<T.MisionesMe>('/v1/missions/me'),
  registrarVisita: () => api<{ firstOfDay?: boolean }>('/v1/missions/me/visits', { method: 'POST', body: {} }),
  referidos: () => api<T.ReferidosMe>('/v1/referrals/me'),
  validarReferido: (code: string) => api<T.Elegibilidad>(`/v1/referral-codes/${encodeURIComponent(code)}/eligibility`),
};

export const suscripcionApi = {
  planes: () => api<unknown>('/v1/subscription-plans', { auth: false }),
  pagarConTarjeta: (b: { token?: string; userPaymentMethodId?: string; planId: string; referralCode?: string; isConcurrent: boolean; promoCodeId?: string }) =>
    api<T.ResultadoPago>('/v1/payments/kushki', { method: 'POST', body: sinVacios(b), idempotencia: true }),
  pagarConYape: (b: { planId: string; phoneNumber: string; otp: string; referralCode?: string; promoCodeId?: string }) =>
    api<T.ResultadoPago>('/v1/payments/yape', { method: 'POST', body: sinVacios(b), idempotencia: true }),
  ofertasUpgrade: () => api<T.OfertasUpgrade>('/v1/subscriptions/upgrade-offers'),
  subirDePlan: (b: { gateway: 'kushki' | 'yape'; planId: string; token?: string; userPaymentMethodId?: string; phoneNumber?: string; otp?: string }) =>
    api<T.ResultadoPago>('/v1/subscriptions/upgrade', { method: 'POST', body: b, idempotencia: true }),
  cancelar: (id: string) => api(`/v1/subscriptions/${encodeURIComponent(id)}/cancel`, { method: 'PUT' }),
  historialPagos: (page = 1) => api<T.HistorialPagos>('/v1/payments/purchase-history', { query: { page } }),
  boleta: (invoiceId: string) => apiArchivo(`/v1/payments/purchase-history/${encodeURIComponent(invoiceId)}/receipt`),
  tarjetaPrincipal: (id: string) => api(`/v1/payment-methods/${encodeURIComponent(id)}/default`, { method: 'PATCH' }),
  eliminarTarjeta: (id: string) => api(`/v1/payment-methods/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  tarjetaYaGuardada: (bin: string, lastFourDigits: string) =>
    api<{ alreadySaved?: boolean }>('/v1/payment-methods/check', { method: 'POST', body: { bin, lastFourDigits } }),
  guardarTarjeta: (token: string, bin: string, last_four_digits: string) =>
    api<{ success?: boolean }>('/v1/payment-methods', { method: 'POST', body: { token, bin, last_four_digits } }),
};

export const reclamosApi = {
  registrar: (b: {
    documentType: 'DNI' | 'PASSPORT' | 'FOREIGN_ID_CARD'; documentNumber: string; name: string; lastName: string; address: string; country: string;
    phoneNumber: string; email: string; date: string; type: 'PRODUCT' | 'SERVICE'; amount: number; caseType: 'COMPLAINT' | 'CLAIM'; details: string; request: string;
  }) => api<{ id?: string; complaintCode?: string; createdAt?: string; email?: string }>('/v1/complaints', { method: 'POST', auth: false, body: b }),
};

export const promoApi = {
  validar: (b: { code: string; raffleId?: string; applicationContext: 'CHANCES' | 'SUBSCRIPTION'; opportunities?: number }) =>
    api<T.PromoValidacion>('/v1/promo-codes/validate', { method: 'POST', body: b }),
};

export const publicoApi = {
  marcas: () => api<{ name?: string; imageUrl?: string }[]>('/v1/merchants/landing', { auth: false }),
  banners: (section: string) => api('/v1/banners/public', { auth: false, query: { section } }),
  faqs: (section: string) => api('/v1/faqs/public', { auth: false, query: { section } }),
  configuraciones: () => api<T.Configuraciones>('/v1/configurations', { auth: false }),
};

function sinVacios<O extends Record<string, unknown>>(o: O): O {
  return Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== '')) as O;
}

export function utmDeLaUrl(): T.Utm {
  const p = new URLSearchParams(window.location.search);
  const k = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;
  return Object.fromEntries(k.map((x) => [x, p.get(x) ?? ''])) as T.Utm;
}
