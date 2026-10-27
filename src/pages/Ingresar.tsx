import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Campo } from '../components/suscripcion/Pasos';
import { Button } from '../components/ui/primitives';
import { Tx } from '../data/revision';
import { useSesion } from '../data/sesion';
import { ApiError, mensajeError } from '../api/client';
import { authApi } from '../api/servicios';
import { limpiar, validar } from '../data/validacion';

function LogoGoogle() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M23.5 12.27c0-.82-.07-1.6-.2-2.36H12v4.47h6.45a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.57-5.17 3.57-8.73Z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.9l-3.88-3c-1.07.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.95H1.28v3.1A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.29 14.3a7.2 7.2 0 0 1 0-4.6V6.6H1.28a12 12 0 0 0 0 10.8l4.01-3.1Z" />
      <path fill="#EA4335" d="M12 4.75c1.76 0 3.34.6 4.59 1.8l3.44-3.44A11.97 11.97 0 0 0 12 0 12 12 0 0 0 1.28 6.6l4.01 3.1C6.23 6.86 8.88 4.75 12 4.75Z" />
    </svg>
  );
}

export default function Ingresar() {
  const { iniciarSesion, modoMock } = useSesion();
  const navigate = useNavigate();
  const [correo, setCorreo] = useState(modoMock ? 'camila.r@correo.com' : '');
  const [clave, setClave] = useState(modoMock ? 'Akita2026' : '');
  const [intento, setIntento] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [tocado, setTocado] = useState({ correo: false, clave: false });
  const errores = { correo: validar.correo(correo), clave: validar.claveIngreso(clave) };
  const ok = !errores.correo && !errores.clave;
  const [aviso, setAviso] = useState('');
  const recuperar = async () => {
    setError('');
    if (errores.correo) { setTocado((t) => ({ ...t, correo: true })); setError('Escribe tu correo para enviarte el enlace.'); return; }
    try { if (!modoMock) await authApi.recuperarClave(correo.trim()); setAviso('Si tu correo está registrado, te enviamos un enlace para cambiar tu contraseña.'); }
    catch (e) { setError(mensajeError(e)); }
  };
  const entrar = async () => {
    setIntento(true);
    setError('');
    if (!ok || enviando) return;
    setEnviando(true);
    try {
      await iniciarSesion(correo.trim(), clave);
      navigate('/');
    } catch (e) {
      setError(e instanceof ApiError && (e.status === 401 || e.status === 400) ? 'Tu correo o contraseña no son correctos.' : mensajeError(e));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-[488px] flex-col items-center gap-5 px-6 py-10 lg:py-16">
      <div className="flex w-full max-w-[440px] flex-col gap-4 rounded-[28px] bg-n0 p-6 shadow-card sm:p-8">
        <h1 className="text-[30px] font-black leading-tight text-cafe sm:text-[34px]"><Tx k="login.titulo" /></h1>
        {(['Google', 'Facebook'] as const).map((red) => (
          <button key={red} type="button" onClick={() => { setError(''); setAviso(`Muy pronto podrás ingresar con ${red}. Por ahora, ingresa con tu correo.`); }}
            className="flex h-14 w-full items-center justify-center gap-3 rounded-pill border-[1.5px] border-n10 bg-n0 text-[15px] font-bold text-cafe transition hover:border-cafe/40">
            {red === 'Google' ? <LogoGoogle /> : <span className="flex size-6 items-center justify-center rounded-md bg-[#1877F2] text-[15px] font-black leading-none text-n0" aria-hidden>f</span>}
            Continuar con {red}
          </button>
        ))}
        <div className="flex items-center gap-3 text-[13px] text-n60"><span className="h-px flex-1 bg-n10" />o con tu correo<span className="h-px flex-1 bg-n10" /></div>
        <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); entrar(); }}>
          <Campo label="Correo" type="email" autoComplete="email" maxLength={100} value={correo} onChange={(e) => setCorreo(limpiar.correo(e.target.value))}
            onBlur={() => setTocado((t) => ({ ...t, correo: true }))} error={((intento || tocado.correo) && errores.correo) || undefined} />
          <Campo label="Contraseña" type="password" autoComplete="current-password" maxLength={64} value={clave} onChange={(e) => setClave(e.target.value)}
            onBlur={() => setTocado((t) => ({ ...t, clave: true }))} error={((intento || tocado.clave) && errores.clave) || undefined} />
          {error && <p role="alert" className="rounded-xl bg-rosa-claro px-3.5 py-2.5 text-[13px] font-semibold text-cafe">{error}</p>}
          <button type="button" onClick={recuperar} className="w-fit text-[14px] font-bold text-error"><Tx k="login.olvido" /></button>
          {aviso && <p role="status" className="rounded-xl bg-crema px-3.5 py-2.5 text-[13px] text-cafe">{aviso}</p>}
          <Button full type="submit" disabled={enviando} className="mt-1 !h-14 !text-[16px] disabled:opacity-60">{enviando ? 'Ingresando…' : <Tx k="login.cta" />}</Button>
        </form>
      </div>
      <p className="text-center text-sm text-n60"><Tx k="login.sinCuenta" /> <Link to="/planes" className="font-bold text-cafe underline">Elige tu plan</Link></p>
    </div>
  );
}
