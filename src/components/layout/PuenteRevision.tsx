import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { initRevision } from '../../data/assets';
import { useDemo, type EstadoCofre, type EstadoFlash } from '../../data/revision';
import { useSesion, type Suscripcion } from '../../data/sesion';

type Msg =
  | { tipo: 'ir'; ruta: string }
  | { tipo: 'sesion'; logueado: boolean }
  | { tipo: 'sus'; data: Suscripcion }
  | { tipo: 'demo'; revision: boolean; cofre: EstadoCofre; flash: EstadoFlash };

export function PuenteRevision() {
  const loc = useLocation();
  const navigate = useNavigate();
  const sesion = useSesion();
  const demo = useDemo();
  const id = initRevision?.id;
  const post = (m: object) => window.parent?.postMessage({ akita: true, id, ...m }, '*');

  useEffect(() => { post({ tipo: 'ruta', ruta: loc.pathname }); }, [loc.pathname]);
  useEffect(() => { post({ tipo: 'sesion', logueado: sesion.logueado }); }, [sesion.logueado]);
  useEffect(() => { post({ tipo: 'sus', data: sesion.suscripcion }); }, [sesion.suscripcion]);

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      const m = e.data as Msg & { akita?: boolean; desde?: string };
      if (!m?.akita || m.desde === id) return;
      if (m.tipo === 'ir' && m.ruta !== loc.pathname) navigate(m.ruta);
      if (m.tipo === 'sesion' && m.logueado !== sesion.logueado) (m.logueado ? sesion.iniciar : sesion.cerrar)();
      if (m.tipo === 'sus' && JSON.stringify(m.data) !== JSON.stringify(sesion.suscripcion)) sesion.actualizar(m.data);
      if (m.tipo === 'demo') { demo.setRevision(m.revision); if (m.cofre !== demo.cofre) demo.setCofre(m.cofre); if (m.flash !== demo.flash) demo.setFlash(m.flash); }
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  });
  return null;
}
