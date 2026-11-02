import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Route, Routes } from 'react-router-dom';
import './index.css';
import { AppShell } from './components/layout/AppShell';
import Hoy from './pages/Hoy';
import Sorteos from './pages/Sorteos';
import Beneficios from './pages/Beneficios';
import Misiones from './pages/Misiones';
import MiCuenta from './pages/MiCuenta';
import Planes from './pages/Planes';
import Ingresar from './pages/Ingresar';
import HomePublica from './pages/publico/HomePublica';
import { BeneficiosPublico, ComoFunciona, Ganadores, PremiosPublico } from './pages/publico/PaginasPublicas';
import { Confirmar, Cuenta, Listo, Pago } from './pages/suscripcion/Flujo';
import { SegunSesion, SesionProvider } from './data/sesion';
import { MemoryRouter, Navigate } from 'react-router-dom';
import { initRevision } from './data/assets';
import LibroReclamaciones from './pages/publico/LibroReclamaciones';
import Legal from './pages/publico/Legal';
import { DemoProvider } from './data/revision';
import { instalarRespaldoImagenes } from './data/imagenesPrueba';

instalarRespaldoImagenes();

const rutas = (
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<SegunSesion publico={<HomePublica />} usuario={<Hoy />} />} />
          <Route path="sorteos" element={<SegunSesion publico={<PremiosPublico />} usuario={<Sorteos />} />} />
          <Route path="beneficios" element={<SegunSesion publico={<BeneficiosPublico />} usuario={<Beneficios />} />} />
          <Route path="premios" element={<Navigate to="/sorteos" replace />} />
          <Route path="planes" element={<Planes />} />
          <Route path="ganadores" element={<Ganadores />} />
          <Route path="como-funciona" element={<ComoFunciona />} />
          <Route path="libro-reclamaciones" element={<LibroReclamaciones />} />
          <Route path="legal/:doc" element={<Legal />} />
          <Route path="ingresar" element={<SegunSesion basta="sesion" publico={<Ingresar />} usuario={<Navigate to="/" replace />} />} />
          <Route path="suscribirse/cuenta" element={<Cuenta />} />
          <Route path="suscribirse/pago" element={<Pago />} />
          <Route path="suscribirse/confirmar" element={<Confirmar />} />
          <Route path="suscribirse/listo" element={<Listo />} />
          <Route path="misiones" element={<SegunSesion basta="sesion" publico={<Navigate to="/ingresar" replace />} usuario={<Misiones />} />} />
          <Route path="mi-cuenta" element={<SegunSesion basta="sesion" publico={<Navigate to="/ingresar" replace />} usuario={<MiCuenta />} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SesionProvider>
    <DemoProvider>
    {initRevision ? <MemoryRouter initialEntries={[initRevision.ruta]}>{rutas}</MemoryRouter> : <HashRouter>{rutas}</HashRouter>}
    </DemoProvider>
    </SesionProvider>
  </React.StrictMode>,
);
