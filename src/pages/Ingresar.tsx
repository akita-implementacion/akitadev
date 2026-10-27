import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Campo } from './suscripcion/Flujo';
import { Button } from '../components/ui/primitives';
import { Tx } from '../data/revision';
import { useSesion } from '../data/sesion';
import { ApiError, mensajeError } from '../api/client';
import { authApi } from '../api/servicios';
import { limpiar, validar } from '../data/validacion';

export default function Ingresar() {
  const { iniciarSesion, modoMock } = useSesion();
  const navigate = useNavigate();
  const [q] = useSearchParams();
  const volver = q.get('volver')?.startsWith('/') ? q.get('volver')! : '';
  const [correo, setCorreo] = useState(modoMock ? 'camila.r@correo.com' : '');
  const [clave, setClave] = useState(modoMock ? 'Akita2026' : '');
  const [intento, setIntento] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [tocado, setTocado] = useState({ correo: false, clave: false });
  const errores = { correo: validar.correo(correo), clave: validar.claveIngreso(clave) };
  const ok = !errores.correo && !errores.clave;
  const [aviso, setAviso] = useState(q.get('recuperar') ? 'Escribe tu correo y toca «¿Olvidaste tu contraseña?» para recibir el enlace.' : '');
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
      navigate(volver || '/');
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
