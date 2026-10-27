import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import type { Periodo } from './mock';
import { initRevision } from './assets';
import { config } from '../api/config';
import { onSesionExpirada, refrescarSesion } from '../api/client';
import { authApi, misionesApi } from '../api/servicios';
import { tokens } from '../api/tokens';
import type { AuthMe } from '../api/tipos';
import { limpiarCache } from './recurso';

export type Metodo = 'tarjeta' | 'yape';
export type Suscripcion = {
  plan: 'LANITA' | 'LANOTA' | 'LANAZA';
  periodo: Periodo;
  metodo: Metodo;
  renovacion: boolean;
  referido: string;
  promoId?: string;
  promoTexto?: string;
  nombre: string;
  correo: string;
};
export type PagoPendiente = { tipo: 'tarjeta'; token: string; tarjeta: string } | { tipo: 'yape'; celular: string; otp: string };

type Sesion = {
  logueado: boolean;
  verificando: boolean;
  modoMock: boolean;
  me: AuthMe | null;
  perfilPendiente: boolean;
  iniciarSesion: (correo: string, clave: string) => Promise<void>;
  iniciar: () => void;
  cerrar: () => Promise<void>;
  recargarMe: () => Promise<void>;
  suscripcion: Suscripcion;
  actualizar: (p: Partial<Suscripcion>) => void;
  pago: React.MutableRefObject<PagoPendiente | null>;
};

const Ctx = createContext<Sesion | null>(null);

function registrarVisitaDelDia() {
  const hoy = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Lima' });
  try { if (localStorage.getItem('akita.visita') === hoy) return; localStorage.setItem('akita.visita', hoy); } catch {  }
  misionesApi.registrarVisita().catch(() => {});
}

export function SesionProvider({ children }: { children: ReactNode }) {
  const modoMock = config.usarMock;
  const [logueado, setLogueado] = useState(modoMock ? initRevision?.perfil === 'con' : false);
  const [verificando, setVerificando] = useState(!modoMock && tokens.haySesionGuardada());
  const [me, setMe] = useState<AuthMe | null>(null);
  const pago = useRef<PagoPendiente | null>(null);
  const [suscripcion, setSuscripcion] = useState<Suscripcion>({
    plan: 'LANOTA', periodo: 'mensual', metodo: 'tarjeta', renovacion: true, referido: '',
    nombre: modoMock ? 'Camila' : '', correo: modoMock ? 'camila.r@correo.com' : '',
  });

  const salirLocal = useCallback(() => {
    tokens.limpiar();
    limpiarCache();
    pago.current = null;
    setMe(null);
    setLogueado(false);
  }, []);

  const cargarMe = useCallback(async () => {
    const datos = await authApi.me();
    setMe(datos);
    setLogueado(true);
    if (datos.hasSubscription) registrarVisitaDelDia();
  }, []);

  useEffect(() => {
    if (modoMock) return;
    onSesionExpirada(salirLocal);
    if (!tokens.haySesionGuardada()) return;
    refrescarSesion()
      .then((ok) => (ok ? cargarMe() : salirLocal()))
      .catch(salirLocal)
      .finally(() => setVerificando(false));
  }, [modoMock, cargarMe, salirLocal]);

  useEffect(() => {
    if (modoMock || !logueado) return;
    const revisar = () => {
      if (tokens.venceEn() > 2 * 60000) return;
      refrescarSesion().then((ok) => { if (!ok) salirLocal(); });
    };
    const t = setInterval(revisar, 30000);
    return () => clearInterval(t);
  }, [modoMock, logueado, salirLocal]);

  const valor: Sesion = {
    logueado,
    verificando,
    modoMock,
    me,
    perfilPendiente: !modoMock && (me?.status ?? '').toUpperCase() === 'PENDING',
    async iniciarSesion(correo, clave) {
      if (modoMock) { setLogueado(true); return; }
      await authApi.login(correo, clave);
      limpiarCache();
      await cargarMe();
    },
    iniciar: () => setLogueado(true),
    async cerrar() {
      if (!modoMock) await authApi.logout().catch(() => {});
      salirLocal();
    },
    recargarMe: cargarMe,
    suscripcion,
    actualizar: (p) => setSuscripcion((s) => {
      const n = { ...s, ...p };
      if (n.periodo === 'mensual') { n.metodo = 'tarjeta'; n.renovacion = true; }
      return n;
    }),
    pago,
  };

  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

export function useSesion() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useSesion fuera de SesionProvider');
  return c;
}

export function SegunSesion({ publico, usuario }: { publico: ReactNode; usuario: ReactNode }) {
  const s = useSesion();
  if (s.verificando) return <div className="min-h-[60vh]" aria-busy="true" />;
  if (s.logueado && s.perfilPendiente) return <Navigate to="/suscribirse/cuenta" replace state={{ completarPerfil: true }} />;
  return <>{s.logueado ? usuario : publico}</>;
}
