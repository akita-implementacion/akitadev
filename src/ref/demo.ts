import { usuarioApi } from '../api/servicios';
import { useRecurso } from '../data/recurso';
import { useSesion } from '../data/sesion';

export type EstadoCofreDemo = 'disponible' | 'agotado';
export type EstadoFlashDemo = 'disponible' | 'agotado' | 'proximamente';
export type PerfilDemo = 'visitante' | 'registrado' | 'vencido';
export type StockDemo = 'ambas' | 'sinPremio' | 'sinLanas' | 'agotado' | 'finalizado';
export type ResultadoPagoDemo = 'aprobado' | 'rechazado' | 'pendiente' | 'codigoVencido';

type Demo = {
  cofre: EstadoCofreDemo; flash: EstadoFlashDemo; clienteAntiguo: false | 'bendecido' | 'suertudo';
  perfil: PerfilDemo; sorteoMes: 'abierto' | 'cerrado';
  stockCofre: Exclude<StockDemo, 'finalizado'>; stockFlash: StockDemo; pago: ResultadoPagoDemo;
  heroMovil: 'a' | 'b' | 'c' | 'd';
};

function usePerfilActual(): PerfilDemo {
  const s = useSesion();
  const r = useRecurso('usuario:perfil', usuarioApi.perfil, null, null, s.logueado && !s.modoMock);
  if (!s.logueado) return 'visitante';
  return r.data?.subscription && !s.me?.hasSubscription ? 'vencido' : 'registrado';
}

export function useDemo(): Demo {
  return {
    cofre: 'disponible', flash: 'disponible', clienteAntiguo: false, sorteoMes: 'abierto',
    stockCofre: 'ambas', stockFlash: 'ambas', pago: 'aprobado', heroMovil: 'a', perfil: usePerfilActual(),
  };
}

export function setDemo(_: Partial<Demo>) {  }

export function usePerfil() {
  const perfil = usePerfilActual();
  const vencido = perfil === 'vencido';
  return {
    perfil, vencido, conSesion: perfil !== 'visitante',
    elegirMiPlan: vencido ? 'Reactivar mi suscripción' : 'Elegir mi plan',
    eligeTuPlan: vencido ? 'Reactiva tu plan' : 'Elige tu plan',
    participa: vencido ? 'Reactiva tu plan y participa' : 'Elige tu plan y participa',
  };
}
