import { config } from './config';
import { tokens, type Tokens } from './tokens';

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string, public cuerpo?: unknown) {
    super(message);
  }
}

type Query = Record<string, string | number | boolean | undefined | null>;
type Opciones = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  query?: Query;
  auth?: boolean;
  idempotencia?: boolean;
  signal?: AbortSignal;
};

let alExpirar: (() => void) | null = null;
export const onSesionExpirada = (fn: () => void) => { alExpirar = fn; };

export const nuevaClaveIdempotencia = () =>
  globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;

function url(path: string, query?: Query) {
  const u = new URL(config.apiBaseUrl + path);
  Object.entries(query ?? {}).forEach(([k, v]) => v !== undefined && v !== null && v !== '' && u.searchParams.set(k, String(v)));
  return u.toString();
}

async function fetchJson(path: string, o: Opciones, bearer: string | null) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), config.timeoutMs);
  o.signal?.addEventListener('abort', () => ctrl.abort());
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (o.body !== undefined) headers['Content-Type'] = 'application/json';
  if (bearer) headers.Authorization = `Bearer ${bearer}`;
  if (o.idempotencia) headers['Idempotency-Key'] = nuevaClaveIdempotencia();
  try {
    const r = await fetch(url(path, o.query), {
      method: o.method ?? 'GET',
      headers,
      body: o.body !== undefined ? JSON.stringify(o.body) : undefined,
      signal: ctrl.signal,
      credentials: config.refresh === 'cookie' ? 'include' : 'same-origin',
    });
    const texto = await r.text();
    let cuerpo: any = null;
    try { cuerpo = texto ? JSON.parse(texto) : null; } catch { cuerpo = texto; }
    return { r, cuerpo };
  } catch (e) {
    if ((e as Error).name === 'AbortError') throw new ApiError(0, 'TIMEOUT', 'El servidor tardó demasiado en responder.');
    throw new ApiError(0, 'RED', 'No pudimos conectarnos. Revisa tu conexión.');
  } finally {
    clearTimeout(timer);
  }
}

function aError(status: number, cuerpo: any) {
  const msg = Array.isArray(cuerpo?.message) ? cuerpo.message.join('. ') : cuerpo?.message;
  return new ApiError(status, cuerpo?.code ?? cuerpo?.error ?? `HTTP_${status}`, msg || 'Ocurrió un error inesperado.', cuerpo);
}

let refrescando: Promise<boolean> | null = null;
export function refrescarSesion(): Promise<boolean> {
  if (!refrescando) {
    refrescando = (async () => {
      const rt = tokens.refresh();
      if (config.refresh === 'storage' && !rt) return false;
      const { r, cuerpo } = await fetchJson('/v1/users/refresh', { method: 'POST', body: rt ? { refreshToken: rt } : {} }, null);
      if (!r.ok || !cuerpo?.accessToken) { tokens.limpiar(); return false; }
      tokens.guardar(cuerpo as Tokens);
      return true;
    })().catch(() => false).finally(() => { refrescando = null; });
  }
  return refrescando;
}

export async function api<T = unknown>(path: string, o: Opciones = {}): Promise<T> {
  const auth = o.auth !== false;
  if (auth && !tokens.access()) await refrescarSesion();
  let { r, cuerpo } = await fetchJson(path, o, auth ? tokens.access() : null);
  if (r.status === 401 && auth) {
    if (await refrescarSesion()) ({ r, cuerpo } = await fetchJson(path, o, tokens.access()));
    else { alExpirar?.(); throw aError(401, cuerpo); }
  }
  if (!r.ok) throw aError(r.status, cuerpo);
  return cuerpo as T;
}

export async function apiArchivo(path: string): Promise<Blob> {
  if (!tokens.access()) await refrescarSesion();
  const pedir = () => fetch(url(path), { headers: { Authorization: `Bearer ${tokens.access() ?? ''}` }, credentials: config.refresh === 'cookie' ? 'include' : 'same-origin' });
  let r = await pedir();
  if (r.status === 401 && (await refrescarSesion())) r = await pedir();
  if (!r.ok) {
    let cuerpo: unknown = null;
    try { cuerpo = await r.json(); } catch {  }
    throw aError(r.status, cuerpo);
  }
  return r.blob();
}

const MENSAJES: Record<string, string> = {
  Unauthorized: 'Tu sesión expiró. Vuelve a iniciar sesión.',
  LANA_SUBSCRIPTION_REQUIRED: 'Necesitas una suscripción vigente para usar tus Lanas.',
  LANA_INSUFFICIENT_BALANCE: 'No tienes Lanas suficientes.',
  CHEST_SOLD_OUT: 'El cofre de esta semana se agotó.',
  VIP_RAFFLE_PRICE_CHANGED: 'El precio del sorteo cambió. Revisa el nuevo costo.',
  KUSHKI_NO_CONFIGURADO: 'El pago con tarjeta aún no está habilitado.',
  PLAN_NO_ENCONTRADO: 'No encontramos el plan elegido. Intenta de nuevo.',
  FLASH_BENEFIT_ALREADY_CLAIMED: 'Ya elegiste este Beneficio Flash.',
  FLASH_BENEFIT_NOT_AVAILABLE: 'Este Beneficio Flash ya no está disponible.',
  FLASH_BENEFIT_SOLD_OUT: 'Este beneficio se agotó.',
  FLASH_BENEFIT_LANAS_NOT_AVAILABLE: 'La opción de Lanas ya no está disponible.',
  CHEST_EXCHANGE_NOT_AVAILABLE: 'Ya no se puede cambiar este premio por Lanas.',
  CHEST_REWARD_EXPIRED: 'Este premio ya venció.',
  CHEST_SUBSCRIPTION_REQUIRED: 'Necesitas una suscripción vigente para usar el cofre.',
  UPGRADE_YAPE_NOT_ALLOWED_RECURRING: 'Tu plan se renueva solo: sube de plan con tarjeta.',
  BENEFIT_ACTIVATION_SUBSCRIBERS_ONLY: 'Este beneficio es solo para suscriptores.',
  SUBSCRIPTION_PLAN_NOT_AVAILABLE: 'Este plan ya no está disponible. Elige uno de los planes de AKITÁ.',
  MOCK_ROUTE_NOT_FOUND: 'Esta función todavía no está disponible. Inténtalo más tarde.',
};
export const mensajeError = (e: unknown) =>
  e instanceof ApiError ? MENSAJES[e.code] ?? e.message : 'Ocurrió un error inesperado.';
