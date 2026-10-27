import { config } from './config';

const CLAVE = 'akita.rt';
let access: { token: string; expira: number } | null = null;

const storage = {
  get: () => { try { return sessionStorage.getItem(CLAVE); } catch { return null; } },
  set: (v: string) => { try { sessionStorage.setItem(CLAVE, v); } catch {  } },
  del: () => { try { sessionStorage.removeItem(CLAVE); } catch {  } },
};

export type Tokens = { accessToken: string; expiresIn?: number; refreshToken?: string };

export const tokens = {
  guardar(t: Tokens) {
    access = { token: t.accessToken, expira: Date.now() + (t.expiresIn ?? 600) * 1000 };
    if (config.refresh === 'storage' && t.refreshToken) storage.set(t.refreshToken);
  },
  access: () => (access && access.expira - 30000 > Date.now() ? access.token : null),
  venceEn: () => (access ? Math.max(0, access.expira - Date.now()) : 0),
  refresh: () => (config.refresh === 'storage' ? storage.get() : null),
  haySesionGuardada: () => !!access || config.refresh === 'cookie' || !!storage.get(),
  limpiar() { access = null; storage.del(); },
};
