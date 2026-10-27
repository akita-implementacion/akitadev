export function asset(ruta: string): string {
  if (/^(https?:|data:|blob:)/.test(ruta)) return ruta;
  const mapa = (window as unknown as { __AKITA_ASSETS?: Record<string, string> }).__AKITA_ASSETS;
  return mapa?.[ruta] ?? `${import.meta.env.BASE_URL}${ruta}`;
}

export type InitRevision = { id: string; ruta: string; perfil: 'sin' | 'con'; revision: boolean; cofre: string; flash: string };
export const initRevision: InitRevision | null = (window as unknown as { __AKITA_INIT?: InitRevision }).__AKITA_INIT ?? null;
