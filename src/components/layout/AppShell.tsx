import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { createContext, useContext, useEffect, useState } from 'react';
import { useOcultarAlBajar } from '../../hooks/vistas';
import { IconoCorreo, IconoRed } from '../../ref/MarcaIconos';
import { redes as redesRef } from '../../ref/publico';
import { Icon, type IconName } from '../ui/Icon';
import { LogoAkita, LogoJockeyPlaza, Nube } from '../ui/Brand';
import { ChipLanas, ImagenOpcional, Oveja, cx } from '../ui/primitives';
import { formatoLanas } from '../../data/mock';
import { useBilletera, useUsuario } from '../../data/datos';
import { PuenteRevision } from './PuenteRevision';
import { asset, initRevision } from '../../data/assets';
import { useSesion } from '../../data/sesion';
import { Tx } from '../../data/revision';

export const TABS: { to: string; label: string; icon: IconName }[] = [
  { to: '/', label: 'Hoy', icon: 'hoy' },
  { to: '/sorteos', label: 'Sorteos', icon: 'sorteos' },
  { to: '/beneficios', label: 'Beneficios', icon: 'beneficios' },
  { to: '/misiones', label: 'Misiones', icon: 'misiones' },
  { to: '/mi-cuenta', label: 'Mi cuenta', icon: 'cuenta' },
];

export const NAV_PUBLICA: { to: string; label: string; icon: IconName }[] = [
  { to: '/', label: 'Inicio', icon: 'hoy' },
  { to: '/sorteos', label: 'Premios', icon: 'regalo' },
  { to: '/beneficios', label: 'Beneficios', icon: 'ticket' },
  { to: '/planes', label: 'Planes', icon: 'chispa' },
  { to: '/ganadores', label: 'Ganadores', icon: 'trofeo' },
  { to: '/como-funciona', label: '¿Cómo funciona?', icon: 'info' },
];

function Preheader({ alto, logo }: { alto: string; logo: number }) {
  return (
    <div className={cx('flex items-center justify-center gap-2 bg-cafe-pre', alto)}>
      <span className="text-xs font-light text-n0">Creado por:</span>
      <LogoJockeyPlaza width={logo} className="text-n0" />
    </div>
  );
}

const OcultoCtx = createContext(false);

function HeaderPublicoMobile() {
  const oculto = useContext(OcultoCtx);
  const { logueado, cerrar } = useSesion();
  const usuario = useUsuario();
  const navigate = useNavigate();
  const [abierto, setAbierto] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => { setAbierto(false); }, [pathname]);
  const checkout = pathname.startsWith('/suscribirse');
  return (
    <header className={cx('fixed inset-x-0 top-0 transition-transform duration-300 lg:hidden', abierto ? 'z-50' : 'z-30', oculto && !abierto && '-translate-y-full')}>
      <Preheader alto="h-7" logo={98} />
      <div className="flex h-16 items-center justify-between border-b border-cafe/[.12] bg-n0 px-4 shadow-header">
        <NavLink to="/" aria-label="Ir al inicio"><LogoAkita width={80} className="text-cafe" /></NavLink>
        <div className={cx('flex items-center gap-3', checkout && 'hidden')}>
          <Link to="/planes" className={cx(abierto && "hidden", "flex h-10 items-center gap-1.5 whitespace-nowrap rounded-pill bg-cafe px-4 text-sm font-bold text-n0")}><Icon name="chispa" size={16} /><Tx k="pub.nav.suscribirme" /></Link>
          <button aria-label={abierto ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={abierto} onClick={() => setAbierto(!abierto)} className="flex size-10 items-center justify-center text-cafe">
            {abierto ? <span className="text-2xl font-bold leading-none">×</span> : <span className="flex w-6 flex-col gap-[5px]"><i className="h-0.5 rounded bg-cafe" /><i className="h-0.5 rounded bg-cafe" /><i className="h-0.5 rounded bg-cafe" /></span>}
          </button>
        </div>
      </div>
      {abierto && (
        <nav className="fixed inset-x-0 bottom-0 top-[92px] z-50 flex flex-col overflow-y-auto overflow-x-hidden bg-fondo px-6 pt-4" aria-label="Menú">
          {NAV_PUBLICA.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.to === '/'}
              className={({ isActive }) => cx('flex h-14 shrink-0 items-center gap-3 border-b border-cafe/10 text-lg', isActive ? 'font-extrabold text-cafe' : 'font-semibold text-cafe/80')}>
              <Icon name={n.icon} size={22} /><span className="flex-1">{n.label}</span><Icon name="chevron" size={18} />
            </NavLink>
          ))}
          <div className="flex shrink-0 flex-col gap-3 pt-6">
            <Link to="/planes" className="flex h-14 items-center justify-center rounded-pill bg-amarillo text-[15px] font-bold text-cafe"><Tx k="pub.nav.suscribirme" /></Link>
            {logueado ? (
              <>
                <Link to="/mi-cuenta" className="flex h-14 items-center justify-center gap-2 rounded-pill border-[1.5px] border-cafe text-[15px] font-bold text-cafe"><Icon name="cuenta" size={18} />{usuario.nombreCorto || 'Mi cuenta'}</Link>
                <button onClick={async () => { await cerrar(); navigate('/'); }} className="h-12 text-[15px] font-bold text-error">Cerrar sesión</button>
              </>
            ) : <Link to="/ingresar" className="flex h-14 items-center justify-center rounded-pill border-[1.5px] border-cafe text-[15px] font-bold text-cafe"><Tx k="pub.nav.iniciar" /></Link>}
          </div>
          <div className="relative mt-auto h-[200px] shrink-0">
            <Nube className="-right-10 bottom-[-60px] w-[240px] text-n0" />
            <ImagenOpcional src="assets/oveja-sigueme.webp" className="absolute bottom-6 right-12 z-10 w-[120px]" />
          </div>
        </nav>
      )}
    </header>
  );
}

function HeaderPublicoDesktop() {
  const { logueado } = useSesion();
  return (
    <header className="fixed inset-x-0 top-0 z-30 hidden lg:block">
      <Preheader alto="h-9" logo={158} />
      <div className="border-b border-cafe/[.12] bg-n0 shadow-header">
        <div className="mx-auto flex h-[77px] max-w-[1366px] items-center justify-between gap-4 px-16">
          <NavLink to="/" aria-label="Ir al inicio" className="shrink-0"><LogoAkita width={100} className="text-cafe" /></NavLink>
          <nav className="flex min-w-0 gap-0.5 xl:gap-1">
            {NAV_PUBLICA.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.to === '/'}
                className={({ isActive }) => cx('whitespace-nowrap rounded-[10px] px-2 py-2 text-sm text-cafe xl:px-3 xl:text-[15px]', isActive ? 'bg-n5 font-semibold' : 'font-medium hover:bg-n5/60')}>
                {n.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex shrink-0 items-center gap-2 xl:gap-3">
            {logueado ? <MenuUsuario /> : <Link to="/ingresar" className="flex h-11 items-center whitespace-nowrap rounded-pill border-[1.5px] border-cafe px-4 text-sm font-bold text-cafe xl:px-6"><Tx k="pub.nav.iniciar" /></Link>}
            <Link to="/planes" className="flex h-11 items-center gap-2 whitespace-nowrap rounded-pill bg-cafe px-4 text-sm font-bold text-n0 xl:px-6"><Icon name="chispa" size={18} /><Tx k="pub.nav.suscribirme" /></Link>
          </div>
        </div>
      </div>
    </header>
  );
}

function HeaderMobile() {
  const billetera = useBilletera();
  const { modoMock } = useSesion();
  const oculto = useContext(OcultoCtx);
  return (
    <header className={cx('fixed inset-x-0 top-0 z-30 transition-transform duration-300 lg:hidden', oculto && '-translate-y-full')}>
      <div className="flex h-7 items-center justify-center gap-2 bg-cafe-pre">
        <span className="text-xs font-light text-n0">Creado por:</span>
        <LogoJockeyPlaza width={98} className="text-n0" />
      </div>
      <div className="flex h-16 items-center justify-between border-b border-cafe/[.12] bg-n0 px-4 shadow-header">
        <NavLink to="/" aria-label="Ir a Hoy"><LogoAkita width={80} className="text-cafe" /></NavLink>
        <div className="flex items-center gap-4">
          <NavLink to="/mi-cuenta"><ChipLanas saldo={formatoLanas(billetera.saldo)} /></NavLink>
        </div>
      </div>
    </header>
  );
}

function HeaderDesktop() {
  return (
    <header className="fixed inset-x-0 top-0 z-30 hidden lg:block">
      <div className="flex h-9 items-center justify-center gap-2 bg-cafe-pre">
        <span className="text-xs font-light text-n0">Creado por:</span>
        <LogoJockeyPlaza width={158} className="text-n0" />
      </div>
      <div className="border-b border-cafe/[.12] bg-n0 shadow-header">
        <div className="mx-auto flex h-[77px] max-w-[1366px] items-center justify-between px-16">
          <NavLink to="/" aria-label="Ir a Hoy"><LogoAkita width={100} className="text-cafe" /></NavLink>
          <nav className="flex gap-2">
            {TABS.map((t) => (
              <NavLink
                key={t.to}
                to={t.to}
                end={t.to === '/'}
                className={({ isActive }) => cx('rounded-[10px] px-3.5 py-2 text-[15px] text-cafe', isActive ? 'bg-n5 font-semibold' : 'font-medium hover:bg-n5/60')}
              >
                {t.label}
              </NavLink>
            ))}
          </nav>
          <MenuUsuario />
        </div>
      </div>
    </header>
  );
}

function MenuUsuario() {
  const [abierto, setAbierto] = useState(false);
  const { cerrar } = useSesion();
  const usuario = useUsuario();
  const navigate = useNavigate();
  return (
    <div className="relative">
      <button onClick={() => setAbierto(!abierto)} aria-expanded={abierto} className="flex items-center gap-3 text-base font-semibold text-cafe">
        {usuario.nombreCorto || 'Mi cuenta'}
        <Icon name="chevron-abajo" />
      </button>
      {abierto && (
        <div className="absolute right-0 top-10 flex w-52 flex-col overflow-hidden rounded-2xl bg-n0 py-1 shadow-card ring-1 ring-n10">
          <Link to="/mi-cuenta" onClick={() => setAbierto(false)} className="px-4 py-3 text-sm font-semibold text-cafe hover:bg-n5">Mi cuenta</Link>
          <Link to="/mi-cuenta" state={{ seccion: 'Mi plan y pagos' }} onClick={() => setAbierto(false)} className="px-4 py-3 text-sm font-semibold text-cafe hover:bg-n5">Mi plan y pagos</Link>
          <button onClick={async () => { setAbierto(false); await cerrar(); navigate('/'); }} className="px-4 py-3 text-left text-sm font-semibold text-error hover:bg-n5">Cerrar sesión</button>
        </div>
      )}
    </div>
  );
}

const TABS_PUBLICAS: { to: string; label: string; icon: IconName }[] = [
  { to: '/', label: 'Inicio', icon: 'hoy' },
  { to: '/sorteos', label: 'Premios', icon: 'sorteos' },
  { to: '/beneficios', label: 'Beneficios', icon: 'beneficios' },
  { to: '/planes', label: 'Planes', icon: 'chispa' },
  { to: '/ganadores', label: 'Ganadores', icon: 'trofeo' },
];

function TabBar({ tabs = TABS }: { tabs?: typeof TABS }) {
  const oculto = useContext(OcultoCtx);
  return (
    <nav className={cx('fixed inset-x-0 bottom-0 z-30 flex h-20 items-center justify-between border-t border-n10 bg-n0 px-3 pb-[18px] pt-3.5 transition-transform duration-300 lg:hidden', oculto && 'translate-y-full')} aria-label="Navegación principal">
      {tabs.map((t) => (
        <NavLink key={t.to} to={t.to} end={t.to === '/'} className="flex w-[72px] flex-col items-center gap-1">
          {({ isActive }) => (
            <>
              <span className={cx('flex h-[30px] w-[52px] items-center justify-center rounded-pill', isActive ? 'bg-amarillo text-cafe' : 'text-n60')}>
                <Icon name={t.icon} size={22} />
              </span>
              <span className={cx('text-[11px]', isActive ? 'font-bold text-cafe' : 'font-medium text-n60')}>{t.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

export const REDES: { nombre: string; href: string; d: string }[] = [
  { nombre: 'Facebook', href: '#', d: 'M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.6-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.9v3h2.6V21h3z' },
  { nombre: 'Instagram', href: '#', d: 'M12 7.4a4.6 4.6 0 1 0 0 9.2 4.6 4.6 0 0 0 0-9.2zm0 7.6a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm5.9-7.8a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0zM12 4.6c2.4 0 2.7 0 3.6.1 2.4.1 3.6 1.3 3.7 3.7.1.9.1 1.2.1 3.6s0 2.7-.1 3.6c-.1 2.4-1.3 3.6-3.7 3.7-.9.1-1.2.1-3.6.1s-2.7 0-3.6-.1c-2.4-.1-3.6-1.3-3.7-3.7-.1-.9-.1-1.2-.1-3.6s0-2.7.1-3.6c.1-2.4 1.3-3.6 3.7-3.7.9-.1 1.2-.1 3.6-.1zM12 3c-2.4 0-2.8 0-3.7.1C5 3.2 3.2 5 3.1 8.3 3 9.2 3 9.6 3 12s0 2.8.1 3.7C3.2 19 5 20.8 8.3 20.9c.9.1 1.3.1 3.7.1s2.8 0 3.7-.1c3.3-.1 5.1-1.9 5.2-5.2.1-.9.1-1.3.1-3.7s0-2.8-.1-3.7C20.8 5 19 3.2 15.7 3.1 14.8 3 14.4 3 12 3z' },
  { nombre: 'TikTok', href: '#', d: 'M16.6 5.8A4.3 4.3 0 0 1 15.5 3h-3.1v12.4a2.6 2.6 0 1 1-1.8-2.5V9.8a5.7 5.7 0 1 0 4.9 5.6V9.1a7.3 7.3 0 0 0 4.3 1.4V7.4a4.3 4.3 0 0 1-3.2-1.6z' },
  { nombre: 'YouTube', href: '#', d: 'M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8zM10 15V9l5.2 3L10 15z' },
];
function Redes() {
  return (
    <div className="flex gap-3 lg:gap-4">
      {redesRef.map((r) => (
        <a key={r.id} href={r.href} aria-label={r.label} className="flex size-8 items-center justify-center rounded-md bg-n0 text-cafe lg:size-7">
          <IconoRed red={r.id} size={16} fondo="#FFFFFF" />
        </a>
      ))}
    </div>
  );
}

function LibroReclamaciones({ className }: { className?: string }) {
  return (
    <Link to="/libro-reclamaciones" aria-label="Libro de Reclamaciones" className={cx('block shrink-0 overflow-hidden rounded-[9px]', className)}>
      <img src={asset('img/libro-de-reclamaciones.webp')} alt="Libro de Reclamaciones" className="size-full object-cover" />
    </Link>
  );
}

function Footer() {
  const col = 'flex flex-col gap-1.5 text-[13px] lg:flex-1 lg:gap-3 lg:border-l lg:border-n0/[.12] lg:pl-8 lg:pr-4 lg:text-sm';
  const escribenos = (
    <>
      <p className="font-bold text-amarillo">Escríbenos</p>
      <a href="mailto:contacto@akita.pe" className="flex items-center gap-2 whitespace-nowrap font-light text-n0"><IconoCorreo />contacto@akita.pe</a>
    </>
  );
  return (
    <footer className="relative overflow-hidden bg-cafe">
      <Nube className="-right-[70px] -top-[112px] hidden w-[250px] text-fondo lg:block" />
      <div className="relative mx-auto grid max-w-[1366px] grid-cols-2 gap-x-5 gap-y-6 px-6 pb-7 pt-8 lg:flex lg:gap-0 lg:px-16 lg:pb-8 lg:pt-12">
        <div className="col-span-2 flex items-center justify-between gap-4 lg:w-[340px] lg:flex-col lg:items-start lg:justify-start lg:gap-5 lg:pr-8">
          <LogoAkita width={120} className="text-amarillo lg:w-[159px]" />
          <p className="hidden text-2xl font-bold text-amarillo lg:block">¡SÍGUEMEE-E-E-E!</p>
          <Redes />
        </div>
        <div className="flex flex-col gap-6 lg:contents">
          <nav className={col} aria-label="Enlaces">
            <p className="font-bold text-amarillo">Enlaces</p>
            {[['Premios', '/sorteos'], ['Beneficios', '/beneficios'], ['Planes', '/planes'], ['Ganadores', '/ganadores'], ['¿Cómo funciona?', '/como-funciona']].map(([t, to]) => <Link key={t} to={to} className="font-light text-n0">{t}</Link>)}
          </nav>
          <div className="flex flex-col gap-1.5 text-[13px] lg:hidden">{escribenos}</div>
        </div>
        <div className="flex flex-col gap-6 lg:contents">
          <nav className={col} aria-label="Legales">
            <p className="font-bold text-amarillo">Legales</p>
            {['Términos y condiciones', 'Política de privacidad', 'Políticas de cookies', 'Bases de cada sorteo', 'Política de cancelación', 'Método de selección de ganadores'].map((t) => (
              <a key={t} href="#" className="font-light leading-[18px] text-n0">{t}</a>
            ))}
          </nav>
          <LibroReclamaciones className="h-[58px] w-[100px] lg:hidden" />
        </div>
        <div className={cx('hidden lg:flex', col)}>
          <div className="flex flex-col gap-3">{escribenos}</div>
          <LibroReclamaciones className="h-[69px] w-[120px]" />
        </div>
      </div>
      <div className="relative border-t border-n0/[.12] bg-cafe-pre py-3 text-center text-xs font-light text-n0">© Mall 360 S.A.C. 2026</div>
    </footer>
  );
}

export function AppShell() {
  const { pathname } = useLocation();
  const { logueado, conPlan } = useSesion();
  const oculto = useOcultarAlBajar();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname, logueado]);
  return (
    <OcultoCtx.Provider value={oculto}>
    <div className="min-h-screen bg-fondo">
      {conPlan ? <><HeaderMobile /><HeaderDesktop /></> : <><HeaderPublicoMobile /><HeaderPublicoDesktop /></>}
      <main className="pb-0 pt-[92px] lg:pt-[113px]">
        <Outlet />
      </main>
      <Footer />
      {!pathname.startsWith('/suscribirse') && <TabBar tabs={conPlan ? TABS : TABS_PUBLICAS} />}
      {initRevision && <PuenteRevision />}
    </div>
    </OcultoCtx.Provider>
  );
}
