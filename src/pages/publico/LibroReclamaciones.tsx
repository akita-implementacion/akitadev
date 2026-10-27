import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../components/ui/Icon';
import { cx } from '../../components/ui/primitives';
import { asset } from '../../data/assets';
import { useSesion } from '../../data/sesion';
import { reclamosApi } from '../../api/servicios';
import { ApiError, mensajeError } from '../../api/client';

const iso = (d: Date) => d.toLocaleDateString('en-CA', { timeZone: 'America/Lima' });
const HOY = iso(new Date());
const hoyTexto = new Date().toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'America/Lima' });
const DOCUMENTOS = [{ id: 'DNI', t: 'DNI' }, { id: 'FOREIGN_ID_CARD', t: 'Carné de extranjería' }, { id: 'PASSPORT', t: 'Pasaporte' }] as const;
const PAISES = ['Perú', 'Argentina', 'Bolivia', 'Brasil', 'Chile', 'Colombia', 'Ecuador', 'Venezuela', 'Otro'];

type Datos = { tipoDoc: (typeof DOCUMENTOS)[number]['id']; doc: string; nombre: string; apellido: string; direccion: string; pais: string; celular: string; correo: string;
  fecha: string; bien: 'Producto' | 'Servicio'; monto: string; caso: 'Reclamo' | 'Queja'; detalle: string; pedido: string };

function validar(d: Datos): Partial<Record<keyof Datos, string>> {
  const e: Partial<Record<keyof Datos, string>> = {};
  if (d.tipoDoc === 'DNI' ? !/^\d{8}$/.test(d.doc) : d.doc.length < 8 || d.doc.length > 20) e.doc = d.tipoDoc === 'DNI' ? 'El DNI tiene 8 dígitos.' : 'Debe tener entre 8 y 20 caracteres.';
  if (d.nombre.trim().length < 2) e.nombre = 'Escribe tu nombre.';
  if (d.apellido.trim().length < 2) e.apellido = 'Escribe tu apellido.';
  if (d.direccion.trim().length < 5) e.direccion = 'Escribe tu dirección (mínimo 5 caracteres).';
  if (d.celular.replace(/\D/g, '').length < 8) e.celular = 'Escribe un número válido.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.correo) || d.correo.length > 100) e.correo = 'Escribe un correo válido.';
  if (!d.fecha || d.fecha > HOY) e.fecha = 'Elige la fecha en que ocurrió (no puede ser futura).';
  if (d.bien === 'Producto' && !(Number(d.monto) > 0)) e.monto = 'Escribe el monto reclamado.';
  if (d.detalle.trim().length < 10) e.detalle = 'Cuéntanos con más detalle (mínimo 10 caracteres).';
  if (d.pedido.trim().length < 10) e.pedido = 'Cuéntanos qué solución esperas (mínimo 10 caracteres).';
  return e;
}

function Campo({ label, error, className, ...rest }: { label: string; error?: string; className?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={cx('flex min-w-0 flex-1 flex-col gap-1.5', className)}>
      <span className="text-[13px] font-semibold text-cafe">{label} <span className="text-error">*</span></span>
      <input {...rest} aria-invalid={!!error} className={cx('h-14 w-full min-w-0 rounded-2xl border bg-n0 px-4 text-base text-cafe outline-none placeholder:text-n40 focus:border-cafe', error ? 'border-error' : 'border-n10')} />
      {error && <span className="text-xs font-semibold text-error">{error}</span>}
    </label>
  );
}

function Lista({ label, opciones, value, onChange }: { label: string; opciones: readonly { id: string; t: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex min-w-0 flex-1 flex-col gap-1.5">
      <span className="text-[13px] font-semibold text-cafe">{label} <span className="text-error">*</span></span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="h-14 w-full min-w-0 rounded-2xl border border-n10 bg-n0 px-4 text-base text-cafe outline-none focus:border-cafe">
        {opciones.map((o) => <option key={o.id} value={o.id}>{o.t}</option>)}
      </select>
    </label>
  );
}

function Texto({ label, value, onChange, placeholder, error }: { label: string; value: string; onChange: (v: string) => void; placeholder: string; error?: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[13px] font-semibold text-cafe">{label} <span className="text-error">*</span></span>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={4} maxLength={1000} aria-invalid={!!error}
        className={cx('min-h-[120px] resize-y rounded-2xl border bg-n0 px-4 py-3 text-base text-cafe outline-none placeholder:text-n40 focus:border-cafe', error ? 'border-error' : 'border-n10')} />
      <span className="flex justify-between gap-3 text-xs"><span className="font-semibold text-error">{error}</span><span className="shrink-0 text-n60">{value.length}/1000</span></span>
    </label>
  );
}

function Opcion({ activa, onClick, titulo, detalle }: { activa: boolean; onClick: () => void; titulo: string; detalle?: string }) {
  return (
    <button type="button" role="radio" aria-checked={activa} onClick={onClick}
      className={cx('flex flex-1 items-start gap-3 rounded-2xl bg-n0 px-4 py-3.5 text-left', activa ? 'border-2 border-cafe' : 'border border-n10')}>
      <span className={cx('mt-0.5 flex size-[22px] shrink-0 items-center justify-center rounded-full border-2', activa ? 'border-cafe' : 'border-n40')}>{activa && <span className="size-2.5 rounded-full bg-cafe" />}</span>
      <span className="flex flex-col gap-0.5"><span className="text-[15px] font-bold text-cafe">{titulo}</span>{detalle && <span className="text-[13px] leading-[18px] text-n60">{detalle}</span>}</span>
    </button>
  );
}

const Bloque = ({ titulo, children }: { titulo: string; children: React.ReactNode }) => (
  <section className="flex flex-col gap-4 rounded-[24px] bg-n0 p-5 lg:bg-transparent lg:p-0">
    <h2 className="text-[18px] font-extrabold text-cafe">{titulo}</h2>
    {children}
  </section>
);

const CAMPO_API: [RegExp, keyof Datos][] = [
  [/documentNumber/, 'doc'], [/lastName/, 'apellido'], [/\bname\b/, 'nombre'], [/address/, 'direccion'], [/phoneNumber/, 'celular'],
  [/email/, 'correo'], [/\bdate\b/, 'fecha'], [/amount/, 'monto'], [/details/, 'detalle'], [/request/, 'pedido'],
];

export default function LibroReclamaciones() {
  const { modoMock } = useSesion();
  const [d, setD] = useState<Datos>({ tipoDoc: 'DNI', doc: '', nombre: '', apellido: '', direccion: '', pais: 'Perú', celular: '', correo: '', fecha: HOY, bien: 'Producto', monto: '', caso: 'Reclamo', detalle: '', pedido: '' });
  const [intento, setIntento] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState('');
  const [erroresApi, setErroresApi] = useState<Partial<Record<keyof Datos, string>>>({});
  const [enviado, setEnviado] = useState<{ codigo: string; correo: string } | null>(null);
  const errores = { ...(intento ? validar(d) : {}), ...erroresApi };
  const set = <K extends keyof Datos>(k: K, valor: Datos[K]) => { setD((x) => ({ ...x, [k]: valor })); setErroresApi((e) => ({ ...e, [k]: undefined })); };
  const v = (k: 'doc' | 'nombre' | 'apellido' | 'direccion' | 'celular' | 'correo' | 'monto') => ({
    value: d[k], error: errores[k], onChange: (e: React.ChangeEvent<HTMLInputElement>) => set(k, e.target.value),
  });

  const enviar = async () => {
    setIntento(true); setErrorGeneral(''); setErroresApi({});
    if (Object.keys(validar(d)).length || enviando) return;
    if (modoMock) { setEnviado({ codigo: `REC-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`, correo: d.correo }); window.scrollTo(0, 0); return; }
    setEnviando(true);
    try {
      const r = await reclamosApi.registrar({
        documentType: d.tipoDoc, documentNumber: d.doc.trim(), name: d.nombre.trim(), lastName: d.apellido.trim(), address: d.direccion.trim(),
        country: d.pais, phoneNumber: d.celular.replace(/\s/g, ''), email: d.correo.trim(), date: d.fecha,
        type: d.bien === 'Producto' ? 'PRODUCT' : 'SERVICE',
        amount: d.bien === 'Producto' ? Number(d.monto) : 0,
        caseType: d.caso === 'Reclamo' ? 'CLAIM' : 'COMPLAINT', details: d.detalle.trim(), request: d.pedido.trim(),
      });
      setEnviado({ codigo: r?.complaintCode ?? '', correo: r?.email ?? d.correo });
      window.scrollTo(0, 0);
    } catch (e) {
      if (e instanceof ApiError && e.status === 429) setErrorGeneral('Ya registraste varios reclamos. Intenta más tarde.');
      else if (e instanceof ApiError && e.status === 400) {
        const lista = (Array.isArray((e.cuerpo as { message?: unknown })?.message) ? (e.cuerpo as { message: string[] }).message : [e.message]);
        const porCampo: Partial<Record<keyof Datos, string>> = {};
        lista.forEach((m) => { const c = CAMPO_API.find(([re]) => re.test(m)); if (c && !porCampo[c[1]]) porCampo[c[1]] = 'Revisa este dato.'; });
        setErroresApi(porCampo);
        setErrorGeneral(Object.keys(porCampo).length ? 'Revisa los datos marcados.' : mensajeError(e));
      } else setErrorGeneral('No pudimos registrar tu reclamo. Inténtalo de nuevo.');
    } finally { setEnviando(false); }
  };

  if (enviado) {
    return (
      <div className="mx-auto flex max-w-[560px] flex-col items-center gap-4 px-6 py-12 text-center lg:my-14 lg:rounded-[32px] lg:bg-n0 lg:p-12">
        <span className="flex size-16 items-center justify-center rounded-full bg-verde"><Icon name="check" size={32} /></span>
        <h1 className="text-[26px] font-extrabold text-cafe">Recibimos tu {d.caso.toLowerCase()}</h1>
        {enviado.codigo && <p className="rounded-2xl bg-n5 px-4 py-3 text-[15px] font-bold text-cafe lg:bg-fondo">Hoja de reclamación N.º <span className="whitespace-nowrap">{enviado.codigo}</span> · {hoyTexto}</p>}
        <p className="text-[15px] leading-[22px] text-n60">Te enviamos la constancia en PDF a <b className="break-all text-cafe">{enviado.correo}</b>. Te responderemos en un plazo máximo de 15 días hábiles.</p>
        <Link to="/" className="mt-2 inline-flex h-14 w-full items-center justify-center rounded-pill bg-amarillo text-base font-bold text-cafe">Volver al inicio</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-[760px] flex-col gap-6 px-6 py-6 lg:my-14 lg:gap-8 lg:rounded-[32px] lg:bg-n0 lg:p-12">
      <div className="flex flex-col gap-2">
        <img src={asset('img/libro-de-reclamaciones.webp')} alt="" className="h-[52px] w-[90px] rounded-[8px] object-cover" />
        <h1 className="text-[28px] font-black leading-tight text-cafe lg:text-[36px]">Libro de Reclamaciones</h1>
        <p className="text-[15px] leading-[22px] text-n60">Cuéntanos qué pasó. Los campos con <span className="text-error">*</span> son obligatorios.</p>
      </div>

      <Bloque titulo="Datos personales">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Lista label="Documento de identidad" opciones={DOCUMENTOS} value={d.tipoDoc} onChange={(x) => set('tipoDoc', x as Datos['tipoDoc'])} />
          <Campo label="Número de documento" inputMode={d.tipoDoc === 'DNI' ? 'numeric' : 'text'} maxLength={d.tipoDoc === 'DNI' ? 8 : 20} {...v('doc')}
            onChange={(e) => set('doc', d.tipoDoc === 'DNI' ? e.target.value.replace(/\D/g, '') : e.target.value.replace(/[^A-Za-z0-9-]/g, '').toUpperCase())} />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row"><Campo label="Nombre" autoComplete="given-name" maxLength={100} {...v('nombre')} /><Campo label="Apellido" autoComplete="family-name" maxLength={100} {...v('apellido')} /></div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Campo label="Dirección" autoComplete="street-address" maxLength={100} {...v('direccion')} />
          <Lista label="País" opciones={PAISES.map((p) => ({ id: p, t: p }))} value={d.pais} onChange={(x) => set('pais', x)} />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Campo label="Número de celular" type="tel" autoComplete="tel" placeholder="987 654 321" maxLength={15} {...v('celular')} onChange={(e) => set('celular', e.target.value.replace(/[^\d +]/g, ''))} />
          <Campo label="Correo electrónico" type="email" autoComplete="email" maxLength={100} {...v('correo')} />
        </div>
      </Bloque>

      <div className="hidden h-px bg-n10 lg:block" />

      <Bloque titulo="Información general">
        <p className="text-[14px] text-n60">Fecha de registro: <b className="text-cafe">{hoyTexto}</b></p>
        <Campo label="Fecha del incidente" type="date" max={HOY} value={d.fecha} error={errores.fecha} onChange={(e) => set('fecha', e.target.value)} className="sm:max-w-[280px]" />
        <div className="flex flex-col gap-3 sm:flex-row" role="radiogroup" aria-label="Bien contratado">
          <Opcion activa={d.bien === 'Producto'} onClick={() => set('bien', 'Producto')} titulo="Producto" />
          <Opcion activa={d.bien === 'Servicio'} onClick={() => { set('bien', 'Servicio'); set('monto', ''); }} titulo="Servicio" />
        </div>
        {d.bien === 'Producto' && <Campo label="Monto reclamado (S/)" inputMode="decimal" placeholder="0.00" {...v('monto')} onChange={(e) => set('monto', e.target.value.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1'))} />}
      </Bloque>

      <div className="hidden h-px bg-n10 lg:block" />

      <Bloque titulo="Detalle del reclamo o queja">
        <div className="flex flex-col gap-3 sm:flex-row" role="radiogroup" aria-label="Tipo">
          <Opcion activa={d.caso === 'Reclamo'} onClick={() => set('caso', 'Reclamo')} titulo="Reclamo" detalle="Disconformidad relacionada a los productos o servicios." />
          <Opcion activa={d.caso === 'Queja'} onClick={() => set('caso', 'Queja')} titulo="Queja" detalle="Disconformidad no relacionada a los productos o servicios, o descontento respecto a la atención al público." />
        </div>
        <Texto label="Detalle" placeholder="Describe lo que pasó" value={d.detalle} error={errores.detalle} onChange={(x) => set('detalle', x)} />
        <Texto label="Pedido" placeholder="¿Qué solución esperas?" value={d.pedido} error={errores.pedido} onChange={(x) => set('pedido', x)} />
      </Bloque>

      <div className="flex flex-col gap-2 rounded-2xl bg-n5 px-4 py-3.5 text-[13px] leading-[19px] text-n60 lg:bg-fondo">
        <p>* La formulación del reclamo no impide acudir a otras vías de solución de controversias ni es requisito para interponer una denuncia ante el INDECOPI.</p>
        <p>* El proveedor debe dar respuesta al reclamo o queja en un plazo no mayor a quince (15) días hábiles, el cual es improrrogable.</p>
      </div>

      {errorGeneral && <p role="alert" className="rounded-2xl bg-rosa-claro px-4 py-3 text-sm font-semibold text-cafe">{errorGeneral}</p>}
      <button type="button" disabled={enviando} onClick={enviar}
        className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-pill bg-amarillo text-base font-bold text-cafe disabled:opacity-50">{enviando ? 'Enviando…' : <>Enviar <Icon name="flecha" size={20} /></>}</button>
    </div>
  );
}
