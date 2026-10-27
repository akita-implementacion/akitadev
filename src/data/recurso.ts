import { useEffect, useState } from 'react';
import { config } from '../api/config';

type Entrada = { data?: unknown; error?: unknown; promesa?: Promise<void> };
const cache = new Map<string, Entrada>();
const oyentes = new Map<string, Set<() => void>>();

const avisar = (clave: string) => oyentes.get(clave)?.forEach((f) => f());

function cargar(clave: string, fn: () => Promise<unknown>) {
  const e = cache.get(clave) ?? {};
  if (e.promesa) return;
  e.promesa = fn()
    .then((d) => { e.data = d; e.error = undefined; })
    .catch((err) => { e.error = err; if (import.meta.env.DEV) console.warn(`[api] ${clave}`, err); })
    .finally(() => { e.promesa = undefined; avisar(clave); });
  cache.set(clave, e);
}

export function invalidar(prefijo: string) {
  [...cache.keys()].filter((k) => k.startsWith(prefijo)).forEach((k) => {
    cache.delete(k);
    avisar(k);
  });
}
export const limpiarCache = () => invalidar('');

export type Recurso<T> = { data: T; cargando: boolean; error: unknown; recargar: () => void; ejemplo: boolean };

const RELLENO = /de ejemplo/i;
export function sinDatos(d: unknown): boolean {
  if (d == null) return true;
  if (Array.isArray(d)) return d.length === 0 || RELLENO.test(JSON.stringify(d));
  if (typeof d === 'object') {
    const items = (d as { items?: unknown }).items;
    if (Array.isArray(items) && items.length === 0) return true;
    return RELLENO.test(JSON.stringify(d));
  }
  return false;
}

export function useRecurso<T>(clave: string, fn: () => Promise<T>, mock: T, vacio: T, activo = true, vacia: (d: T) => boolean = sinDatos): Recurso<T> {
  const [, refrescar] = useState(0);
  const usarApi = !config.usarMock && activo;

  useEffect(() => {
    if (!usarApi) return;
    const f = () => refrescar((n) => n + 1);
    if (!oyentes.has(clave)) oyentes.set(clave, new Set());
    oyentes.get(clave)!.add(f);
    if (!cache.has(clave)) cargar(clave, fn);
    return () => { oyentes.get(clave)?.delete(f); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave, usarApi, cache.has(clave)]);

  if (config.usarMock) return { data: mock, cargando: false, error: undefined, recargar: () => {}, ejemplo: false };
  const e = cache.get(clave);
  const cargando = !!e?.promesa;
  const recargar = () => invalidar(clave);
  const listo = usarApi && !!e && !cargando;
  if (listo && config.datosEjemplo && (e.error || vacia(e.data as T))) {
    return { data: mock, cargando, error: undefined, recargar, ejemplo: true };
  }
  const data = (e?.data as T | undefined) ?? (e?.error && config.mockFallback ? mock : vacio);
  return { data, cargando, error: e?.error, recargar, ejemplo: false };
}
