import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Campo, LayoutCheckout, ResumenPlan } from '../../components/suscripcion/Pasos';
import { Button, cx } from '../../components/ui/primitives';
import { Tx } from '../../data/revision';
import { useSesion } from '../../data/sesion';
import { ApiError, mensajeError } from '../../api/client';
import { authApi, misionesApi, usuarioApi, utmDeLaUrl } from '../../api/servicios';
import { invalidar } from '../../data/recurso';
import { DOCUMENTO, limpiar, validar, type TipoDoc } from '../../data/validacion';

const TIPO_DOC: Record<string, 'DNI' | 'PASSPORT' | 'FOREIGN_ID_CARD'> = { DNI: 'DNI', CE: 'FOREIGN_ID_CARD', Pasaporte: 'PASSPORT' };

function esMayorDeEdad(iso: string) {
  const [a, m, d] = iso.split('-').map(Number);
  if (!a || !m || !d) return false;
  const hoy = new Date();
  const cumple18 = new Date(a + 18, m - 1, d);
  return cumple18.getTime() <= hoy.getTime();
}
const hoyMenos18 = () => {
  const h = new Date();
  return `${h.getFullYear() - 18}-${String(h.getMonth() + 1).padStart(2, '0')}-${String(h.getDate()).padStart(2, '0')}`;
};

export default function Cuenta() {
  const { suscripcion, actualizar, modoMock, logueado, iniciarSesion, recargarMe, perfilPendiente, me } = useSesion();
  const navigate = useNavigate();
  const completarPerfil = !!(useLocation().state as { completarPerfil?: boolean } | null)?.completarPerfil || perfilPendiente;
  const [f, setF] = useState(modoMock
    ? { nombres: 'Camila Andrea', apellidos: 'Rojas Pérez', tipoDoc: 'DNI', doc: '45678912', nacimiento: '1994-05-12', correo: suscripcion.correo, celular: '987 654 321', clave: '', terminos: false, promos: false }
    : { nombres: '', apellidos: '', tipoDoc: 'DNI', doc: '', nacimiento: '', correo: suscripcion.correo, celular: '', clave: '', terminos: false, promos: false });
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [errorReferido, setErrorReferido] = useState('');
  const [referido, setReferido] = useState(suscripcion.referido);
  const [verReferido, setVerReferido] = useState(!!suscripcion.referido);
  const [intento, setIntento] = useState(false);
  const [tocado, setTocado] = useState<Record<string, boolean>>({});
  const tocar = (k: string) => () => setTocado((t) => ({ ...t, [k]: true }));

  const reglas = [
    { ok: f.clave.length >= 8, t: 'Mínimo 8 caracteres' },
    { ok: /[A-Z]/.test(f.clave), t: 'Una mayúscula' },
    { ok: /\d/.test(f.clave), t: 'Un número' },
  ];
  const tipoDoc = f.tipoDoc as TipoDoc;
  const errores = {
    nombres: validar.nombre(f.nombres, 'nombres'),
    apellidos: validar.nombre(f.apellidos, 'apellidos'),
    doc: validar.documento(f.doc, tipoDoc),
    nacimiento: esMayorDeEdad(f.nacimiento) ? '' : f.nacimiento ? 'Debes ser mayor de 18 años' : 'Ingresa tu fecha de nacimiento',
    correo: logueado ? '' : validar.correo(f.correo),
    celular: validar.celular(f.celular),
    clave: logueado ? '' : validar.clave(f.clave),
    referido: validar.referido(referido),
  };
  const ver = (k: keyof typeof errores) => ((intento || tocado[k]) && errores[k]) || undefined;
  const valido = Object.values(errores).every((e) => !e) && f.terminos;
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setF({ ...f, [k]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value });
  const setLimpio = (k: keyof typeof f, fn: (v: string) => string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setF({ ...f, [k]: fn(e.target.value) });

  const continuar = async () => {
    setIntento(true);
    setError('');
    setErrorReferido('');
    if (!valido || enviando) return;
    const codigo = referido.trim();
    if (modoMock) {
      actualizar({ nombre: f.nombres.split(' ')[0], correo: f.correo, referido: codigo });
      navigate('/suscribirse/pago');
      return;
    }
    setEnviando(true);
    try {
      const utmParams = utmDeLaUrl();
      if (!logueado) {
        await authApi.registrar({
          email: f.correo.trim(), password: f.clave, utmParams,
          consentAcceptedPrivacyPolicy: f.terminos,
          consentSubscribeOffers: f.promos,
          consentReceivePersonalizedPromotions: f.promos,
          consentShareDataWithPartners: false,
        });
        await iniciarSesion(f.correo.trim(), f.clave);
      }
      if (codigo) {
        const r = await misionesApi.validarReferido(codigo).catch(() => null);
        if (r && r.valid === false) { setErrorReferido('Este código no es válido. Lo quitamos: puedes escribir otro o continuar sin él.'); setReferido(''); return; }
      }
      const [paterno, ...materno] = f.apellidos.trim().split(/\s+/);
      await usuarioApi.datosPersonales({
        firstName: f.nombres.trim(), paternalSurname: paterno, maternalSurname: materno.join(' '),
        documentType: TIPO_DOC[f.tipoDoc] ?? 'DNI', documentNumber: f.doc,
        phone: f.celular.replace(/\D/g, ''), utmParams,
        birthDate: `${f.nacimiento}T05:00:00.000Z`,
      });
      await recargarMe().catch(() => {});
      invalidar('usuario');
      invalidar('misiones');
      actualizar({ nombre: f.nombres.split(' ')[0], correo: f.correo, referido: codigo });
      navigate(completarPerfil && me?.hasSubscription ? '/' : '/suscribirse/pago');
    } catch (e) {
      setError(e instanceof ApiError && e.status === 409 ? 'Ya existe una cuenta con este correo. Inicia sesión para continuar.' : mensajeError(e));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <LayoutCheckout titulo={<Tx k="sus.cuenta.titulo" />} paso={2} volver="/planes" lateral={<ResumenPlan cambiar />} movil={<ResumenPlan cambiar />}>
      <section className="flex flex-col gap-4 lg:rounded-[24px] lg:bg-n0 lg:p-8">
        {completarPerfil && (
          <p role="status" className="rounded-xl bg-crema px-3.5 py-2.5 text-[13px] font-semibold text-cafe">Completa tus datos para terminar de crear tu cuenta.</p>
        )}

        <p className="text-[15px] font-extrabold text-cafe">Datos personales</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo label="Nombres" value={f.nombres} onChange={setLimpio('nombres', limpiar.nombre)} onBlur={tocar('nombres')} autoComplete="given-name" maxLength={60} error={ver('nombres')} />
          <Campo label="Apellidos" value={f.apellidos} onChange={setLimpio('apellidos', limpiar.nombre)} onBlur={tocar('apellidos')} autoComplete="family-name" maxLength={60} ayuda="Paterno y materno" error={ver('apellidos')} />
        </div>
        <div className="grid grid-cols-[110px_minmax(0,1fr)] items-start gap-3">
          <label className="flex min-w-0 flex-col gap-1.5">
            <span className="text-[13px] font-semibold text-cafe">Documento</span>
            <select value={f.tipoDoc} onChange={(e) => setF({ ...f, tipoDoc: e.target.value, doc: limpiar.documento(f.doc, e.target.value as TipoDoc) })} className="h-14 w-full min-w-0 rounded-2xl border border-n10 bg-n0 px-3 text-base text-cafe">
              <option>DNI</option><option>CE</option><option>Pasaporte</option>
            </select>
          </label>
          <Campo label="Número de documento" inputMode={DOCUMENTO[tipoDoc].soloDigitos ? 'numeric' : 'text'} maxLength={DOCUMENTO[tipoDoc].max}
            placeholder={DOCUMENTO[tipoDoc].ayuda} value={f.doc} onChange={setLimpio('doc', (v) => limpiar.documento(v, tipoDoc))} onBlur={tocar('doc')} error={ver('doc')} />
        </div>
        <Campo label="Fecha de nacimiento" type="date" value={f.nacimiento} onChange={set('nacimiento')} onBlur={tocar('nacimiento')} min="1900-01-01" max={hoyMenos18()} autoComplete="bday"
          ayuda="Debes ser mayor de 18 años. El documento no se puede cambiar después."
          error={ver('nacimiento')} />

        <p className="pt-2 text-[15px] font-extrabold text-cafe">Contacto</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {!logueado && <Campo label="Correo" type="email" value={f.correo} onChange={setLimpio('correo', limpiar.correo)} onBlur={tocar('correo')} autoComplete="email" maxLength={100} ayuda="Aquí te enviamos el comprobante." error={ver('correo')} />}
          <Campo label="Celular" type="tel" inputMode="numeric" placeholder="987 654 321" value={f.celular} onChange={setLimpio('celular', limpiar.celular)} onBlur={tocar('celular')} autoComplete="tel-national" maxLength={11} error={ver('celular')} />
        </div>

        {!logueado && (
          <>
            <p className="pt-2 text-[15px] font-extrabold text-cafe">Seguridad</p>
            <Campo label="Contraseña" type="password" value={f.clave} onChange={set('clave')} onBlur={tocar('clave')} autoComplete="new-password" maxLength={64} />
            <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
              {reglas.map((r) => <li key={r.t} className={cx('font-semibold', r.ok ? 'text-verde-texto' : intento ? 'text-error' : 'text-n60')}>{r.ok ? '✓' : '•'} {r.t}</li>)}
            </ul>
          </>
        )}

        <div className="flex flex-col gap-3 rounded-2xl bg-crema p-4">
          <button type="button" onClick={() => setVerReferido(!verReferido)} aria-expanded={verReferido} className="flex items-center justify-between text-left text-sm font-bold text-cafe">
            <Tx k="sus.referido.pregunta" /><span className="text-lg">{verReferido ? '−' : '+'}</span>
          </button>
          {verReferido && <Campo label="Código de tu amigo" placeholder="YK-…" value={referido} onChange={(e) => setReferido(limpiar.referido(e.target.value))} onBlur={tocar('referido')} maxLength={20} ayuda={<Tx k="sus.referido.ayuda" />} error={errorReferido || ver('referido')} />}
        </div>

        <label className="flex items-start gap-3 text-sm text-cafe">
          <input type="checkbox" checked={f.terminos} onChange={set('terminos')} className="mt-0.5 size-5 accent-cafe" />
          <span>Acepto los <a href="#" className="font-bold underline">Términos y condiciones</a> y la <a href="#" className="font-bold underline">Política de privacidad</a> *</span>
        </label>
        {intento && !f.terminos && <p className="-mt-2 text-xs font-semibold text-error">Para continuar, acepta los términos.</p>}
        <label className="flex items-start gap-3 text-sm text-n60">
          <input type="checkbox" checked={f.promos} onChange={set('promos')} className="mt-0.5 size-5 accent-cafe" />
          Quiero recibir promociones y beneficios de AKITÁ y Jockey Plaza (opcional)
        </label>

        {error && <p role="alert" className="rounded-xl bg-rosa-claro px-3.5 py-2.5 text-[13px] font-semibold text-cafe">{error}</p>}
        <Button full onClick={continuar} disabled={enviando} className="disabled:opacity-60">{enviando ? 'Creando tu cuenta…' : <Tx k="sus.cuenta.cta" />}</Button>
        {!logueado && <p className="text-center text-sm text-n60">¿Ya tienes cuenta? <Link to="/ingresar" className="font-bold text-cafe underline">Inicia sesión</Link></p>}
      </section>
    </LayoutCheckout>
  );
}
