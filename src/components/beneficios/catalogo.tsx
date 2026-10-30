import { useCallback, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import { Hoja } from '../ui/Hoja';
import { cx } from '../ui/primitives';
import { asset } from '../../data/assets';
import { useDetalleBeneficio, useUsuario } from '../../data/datos';
import { useSesion } from '../../data/sesion';
import { invalidar } from '../../data/recurso';
import { beneficiosApi } from '../../api/servicios';
import { ApiError, mensajeError } from '../../api/client';
import { accionEntrega, ChipEntrega, CodigoParaCopiar, EntregaPremio, pasosPorDefecto, tipoDeMetodo, tituloResultado, type Entrega } from '../cards/entrega';

export type BeneficioVista = {
  id?: string; titulo: string; comercio: string; logo?: string; etiqueta: string; foto?: string; uso: string;
  descripcion: string; ubicacion: string; hasta: string; desde?: string; agotado?: boolean; metodo?: string; destacado?: boolean;
};

const url = (f?: string) => (f ? asset(f) : undefined);
const hoyTexto = () => { const d = new Date(); return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`; };
const generados = new Map<string, { entrega: Entrega; fecha: string }>();
export function vistaDe(b: { id?: string; titulo: string; comercio: string; logo?: string; etiqueta: string; foto?: string; uso: string; ubicacion?: string; agotado?: boolean;
  descripcion?: string; hasta?: string; desde?: string; metodo?: string; destacado?: boolean }): BeneficioVista {
  return {
    id: b.id, titulo: b.titulo, comercio: b.comercio, logo: url(b.logo), etiqueta: b.etiqueta, foto: url(b.foto), uso: b.uso, agotado: b.agotado,
    descripcion: b.descripcion || `${b.etiqueta} en ${b.comercio}.`, ubicacion: b.ubicacion === 'En todo el Perú' ? 'Lima y provincias' : b.ubicacion || 'Lima',
    hasta: b.hasta ?? '', desde: b.desde, metodo: b.metodo, destacado: b.destacado,
  };
}

export function LogoComercio({ logo, nombre, tamano = 'md', className }: { logo?: string; nombre: string; tamano?: 'sm' | 'md' | 'lg'; className?: string }) {
  const [forma, setForma] = useState<'horizontal' | 'cuadrado'>('horizontal');
  const [falla, setFalla] = useState(false);
  const caja = {
    horizontal: { sm: 'h-8 w-[76px] px-2', md: 'h-11 w-[104px] px-2.5', lg: 'h-16 w-[150px] px-3' }[tamano],
    cuadrado: { sm: 'size-10 p-1.5', md: 'size-12 p-1.5', lg: 'size-20 p-2.5' }[tamano],
  }[forma];
  return (
    <span className={cx('inline-flex shrink-0 items-center justify-center bg-n0 shadow-[0_1px_6px_rgba(33,20,2,0.14)]', forma === 'cuadrado' ? 'rounded-full' : 'rounded-xl', caja, className)}>
      {logo && !falla
        ? <img src={logo} alt={nombre} className="max-h-full max-w-full object-contain" loading="lazy" onError={() => setFalla(true)}
            onLoad={(e) => { const i = e.currentTarget; if (i.naturalWidth && i.naturalWidth / i.naturalHeight < 1.6) setForma('cuadrado'); }} />
        : <span className="truncate px-1 text-[11px] font-black text-cafe">{nombre}</span>}
    </span>
  );
}

const LogoMini = ({ logo, nombre }: { logo?: string; nombre: string }) =>
  logo ? <img src={logo} alt={nombre} className="h-5 w-auto max-w-[96px] self-start object-contain object-left" loading="lazy" /> : <span className="text-[11px] font-bold text-n60">{nombre}</span>;

const Etiqueta = ({ texto, chica }: { texto: string; chica?: boolean }) => texto ? (
  <span className={cx('rounded-lg bg-cafe font-black text-amarillo shadow-[0_2px_6px_rgba(33,20,2,0.25)]', chica ? 'px-1.5 py-0.5 text-[11px]' : 'px-2.5 py-1 text-[15px]')}>{texto}</span>
) : null;
const Vigencia = ({ hasta, ubicacion }: { hasta: string; ubicacion: string }) => (
  <span className="flex flex-col gap-1 text-[11px] text-n60">
    {hasta && <span className="flex w-fit items-center gap-1 rounded-pill bg-n5 px-2 py-0.5 font-semibold"><Icon name="calendario" size={12} />Hasta {hasta}</span>}
    <span className="flex items-center gap-1"><Icon name="beneficios" size={12} />{ubicacion}</span>
  </span>
);

export function TarjetaDestacado({ b, onAbrir }: { b: BeneficioVista; onAbrir: () => void }) {
  return (
    <button onClick={onAbrir} className="flex h-full w-full flex-col overflow-hidden rounded-[20px] bg-n0 text-left shadow-card">
      <div className={cx('relative h-[150px] shrink-0 lg:h-[170px]', !b.foto && 'flex items-center justify-center bg-rosa-claro')}>
        {b.foto ? <img src={b.foto} alt={b.titulo} className="absolute inset-0 size-full object-cover" loading="lazy" />
          : <LogoComercio logo={b.logo} nombre={b.comercio} tamano="lg" className="!shadow-none" />}
        <span className="absolute left-3 top-3"><Etiqueta texto={b.etiqueta} /></span>
      </div>
      <div className="relative flex flex-1 flex-col gap-1.5 px-4 pb-4 pt-3">
        {b.foto && <LogoComercio logo={b.logo} nombre={b.comercio} tamano="sm" className="mb-0.5 !shadow-none ring-1 ring-n10" />}
        <p className="text-[16px] font-extrabold leading-5 text-cafe">{b.titulo}</p>
        <p className="line-clamp-2 text-[12.5px] leading-[17px] text-n60">{b.descripcion}</p>
        <div className="mt-auto flex items-end justify-between gap-2 pt-1">
          <Vigencia hasta={b.hasta} ubicacion={b.ubicacion} />
          <span className="flex size-9 shrink-0 items-center justify-center rounded-pill bg-cafe text-n0"><Icon name="flecha" size={16} /></span>
        </div>
      </div>
    </button>
  );
}

export function FilaBeneficio({ b, onAbrir }: { b: BeneficioVista; onAbrir: () => void }) {
  return (
    <button onClick={onAbrir} className="flex w-full items-stretch gap-3 rounded-2xl bg-n0 p-2.5 text-left shadow-card">
      <div className={cx('relative min-h-[104px] w-[104px] shrink-0 overflow-hidden rounded-xl sm:w-[124px]', !b.foto && 'flex items-center justify-center bg-rosa-claro')}>
        {b.foto ? <img src={b.foto} alt={b.titulo} className="absolute inset-0 size-full object-cover" loading="lazy" />
          : <LogoComercio logo={b.logo} nombre={b.comercio} tamano="sm" className="!shadow-none" />}
        <span className="absolute left-1.5 top-1.5"><Etiqueta texto={b.etiqueta} chica /></span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1 py-0.5">
        {b.foto && <LogoMini logo={b.logo} nombre={b.comercio} />}
        <p className="line-clamp-2 text-[14px] font-extrabold leading-[18px] text-cafe">{b.titulo}</p>
        <p className="line-clamp-2 text-[12px] leading-4 text-n60">{b.descripcion}</p>
        <div className="mt-auto flex items-end justify-between gap-2">
          <Vigencia hasta={b.hasta} ubicacion={b.ubicacion} />
          <Icon name="flecha" size={18} className="shrink-0 text-cafe" />
        </div>
      </div>
    </button>
  );
}

export function DestacadosParaTi({ items, onAbrir, extra }: { items: BeneficioVista[]; onAbrir: (i: number) => void; extra?: ReactNode }) {
  if (!items.length) return null;
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-end justify-between gap-3">
        <h2 className="text-[22px] font-black uppercase leading-none text-cafe lg:text-[28px]">Destacados <span className="text-rosa-fuerte">para ti</span></h2>
        <span className="flex items-center gap-1 text-[12px] font-bold text-n60 lg:hidden">Desliza<Icon name="flecha" size={14} /></span>
        {extra}
      </div>
      <div className="no-scrollbar -mx-6 flex snap-x gap-3 overflow-x-auto px-6 pb-2 lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-5 lg:overflow-visible lg:px-0 [&>*]:snap-start">
        {items.map((b, i) => <div key={b.id ?? `${b.comercio}-${i}`} className="w-[78%] max-w-[300px] shrink-0 lg:w-auto lg:max-w-none"><TarjetaDestacado b={b} onAbrir={() => onAbrir(i)} /></div>)}
      </div>
    </section>
  );
}

export function HojaDetalleBeneficio({ b, abierto, onCerrar }: { b: BeneficioVista; abierto: boolean; onCerrar: () => void }) {
  const { logueado, modoMock } = useSesion();
  const usuario = useUsuario();
  const { detalle: dt } = useDetalleBeneficio(b.id, abierto);
  const [listo, setListo] = useState<Entrega | null>(null);
  const [condiciones, setCondiciones] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [soloSuscriptores, setSoloSuscriptores] = useState(false);
  const cerrar = useCallback(() => { setListo(null); setError(''); onCerrar(); }, [onCerrar]);
  const clave = b.id ?? `${b.comercio}·${b.titulo}`;

  const metodo = dt?.metodo || b.metodo || '';
  const yaActivo = dt?.activado ?? null;
  const tipo = tipoDeMetodo(metodo, metodo ? undefined : /dni/i.test(b.uso) ? false : undefined);
  const esEnlace = tipo === 'enlace';
  const conCodigo = metodo === 'PROMO_CODE_AND_LINK' || !!yaActivo?.codigo;
  const desde = dt?.vigencia && /Del (\S+)/.exec(dt.vigencia)?.[1] || b.desde || '';
  const hasta = dt?.vigencia && /(?:al|el) (\S+)$/.exec(dt.vigencia)?.[1] || b.hasta;
  const pasos = pasosPorDefecto(tipo, b.comercio, !esEnlace || conCodigo);
  const visitante = !logueado || (!usuario.tieneSuscripcion && !yaActivo) || soloSuscriptores;
  const noDisponible = (dt && !dt.disponible) || (b.agotado && !yaActivo);
  const generado = generados.get(clave) ?? (yaActivo?.codigo && tipo !== 'enlace' ? { entrega: { tipo, codigo: yaActivo.codigo, enlace: yaActivo.enlace }, fecha: '' } : undefined);
  const mostrar = (e: Entrega) => { if (e.tipo !== 'dni' && e.tipo !== 'contacto') generados.set(clave, { entrega: e, fecha: generados.get(clave)?.fecha ?? hoyTexto() }); setListo(e); };

  const usar = async () => {
    setError('');
    if (generado) { setListo(generado.entrega); return; }
    if (modoMock || !b.id) {
      mostrar({ tipo, codigo: tipo === 'dni' || tipo === 'contacto' ? undefined : `AKT-${b.comercio.slice(0, 4).toUpperCase()}`, enlace: esEnlace ? 'https://example.com' : undefined });
      return;
    }
    setEnviando(true);
    try {
      let e: Entrega;
      if (metodo === 'EXTERNAL') {
        const c = await beneficiosApi.canjearExterno(b.id).catch(() => beneficiosApi.cuponExterno(b.id!));
        e = { tipo: 'qr', codigo: c?.coupon?.code, qrUrl: c?.coupon?.qrUrl ?? undefined };
      } else {
        const r = await beneficiosApi.activar(b.id);
        e = { tipo, codigo: r?.promoCode, enlace: r?.redirectUrl };
        if (esEnlace && r?.redirectUrl && !r.promoCode) { window.open(r.redirectUrl, '_blank', 'noopener'); }
      }
      invalidar('misiones'); invalidar(`beneficio:${b.id}`); invalidar('lanas:cupones');
      mostrar(e);
    } catch (err) {
      if (err instanceof ApiError && err.code === 'BENEFIT_ACTIVATION_SUBSCRIBERS_ONLY') setSoloSuscriptores(true);
      else setError(mensajeError(err));
    } finally { setEnviando(false); }
  };

  if (listo) return (
    <Hoja abierto={abierto} onCerrar={cerrar} titulo={tituloResultado(listo.tipo)} subtitulo={`${b.etiqueta ? `${b.etiqueta} · ` : ''}${b.titulo} · ${b.comercio}`}
      pie={<button onClick={cerrar} className="inline-flex h-14 w-full items-center justify-center rounded-pill bg-amarillo text-[16px] font-extrabold text-cafe">Listo</button>}>
      {generado?.fecha && <p className="-mt-2 flex items-center gap-2 rounded-xl bg-n5 px-3 py-2 text-[13px] text-n60"><Icon name="check" size={16} />Lo generaste el {generado.fecha}. Es el mismo cupón cada vez que entres.</p>}
      <EntregaPremio entrega={listo} comercio={b.comercio} desde={generado?.fecha || desde} hasta={hasta} />
    </Hoja>
  );

  const pie = visitante ? (
    <>
      <Link to="/planes" onClick={cerrar} className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-pill bg-amarillo text-[16px] font-extrabold text-cafe">Elegir mi plan<Icon name="flecha" size={18} /></Link>
      <p className="text-center text-[12px] text-n60">Los beneficios se activan al suscribirte.</p>
    </>
  ) : (
    <>
      {error && <p role="alert" className="text-center text-xs font-semibold text-error">{error}</p>}
      <button onClick={usar} disabled={enviando || (!!noDisponible && !generado)} className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-pill bg-amarillo text-[16px] font-extrabold text-cafe disabled:opacity-40">
        {generado ? 'Ver mi cupón' : noDisponible ? 'No disponible' : enviando ? 'Generando…' : accionEntrega(tipo, b.comercio, conCodigo)}{esEnlace && !conCodigo && !noDisponible && !enviando && <Icon name="flecha" size={18} />}
      </button>
      {esEnlace && !conCodigo && <p className="text-center text-[12px] text-n60">Se abre la web de {b.comercio} en otra pestaña.</p>}
    </>
  );

  return (
    <Hoja abierto={abierto} onCerrar={cerrar} titulo={b.titulo} subtitulo={b.comercio} amplia pie={pie}>
      <div className="flex flex-col gap-5 lg:grid lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:items-start lg:gap-6">
        <div className={cx('relative h-[170px] shrink-0 overflow-hidden rounded-2xl lg:sticky lg:top-0 lg:h-[340px]', !(dt?.imagen || b.foto) && 'flex items-center justify-center bg-rosa-claro')}>
          {dt?.imagen || b.foto ? <img src={dt?.imagen || b.foto} alt={b.titulo} className="absolute inset-0 size-full object-cover" />
            : <LogoComercio logo={b.logo} nombre={b.comercio} tamano="lg" className="!shadow-none" />}
          <span className="absolute left-3 top-3"><Etiqueta texto={b.etiqueta} /></span>
          {hasta && <span className="absolute bottom-3 left-3 flex items-center gap-1 rounded-pill bg-cafe/85 px-2.5 py-1 text-[12px] font-bold text-n0"><Icon name="calendario" size={13} />Hasta {hasta}</span>}
        </div>
        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex items-center gap-3">
            <LogoComercio logo={b.logo} nombre={b.comercio} tamano="md" />
            <div className="flex min-w-0 flex-col gap-1">
              <p className="text-[13px] font-bold text-n60">{b.comercio}</p>
              <ChipEntrega tipo={tipo} conCodigo={conCodigo} />
            </div>
          </div>
          {(dt?.descripcion || b.descripcion) && <p className="text-[14px] leading-5">{dt?.descripcion || b.descripcion}</p>}
          <ol className="flex flex-col gap-2">
            {pasos.map((t, i) => (
              <li key={t} className="flex items-start gap-2.5 text-[14px] leading-5">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-pill bg-amarillo text-[12px] font-black">{i + 1}</span>{t}
              </li>
            ))}
          </ol>
          {logueado && dt?.usos && <p className="text-[13px] font-bold">{dt.usos}</p>}
          {yaActivo && (yaActivo.codigo || yaActivo.enlace) && (
            <div className="flex flex-col gap-2 rounded-2xl bg-amarillo/25 p-3.5">
              <p className="text-[13px] font-bold">Ya lo activaste{yaActivo.codigo ? ': tu código' : ''}</p>
              {yaActivo.codigo && <CodigoParaCopiar codigo={yaActivo.codigo} />}
              {yaActivo.enlace && <a href={yaActivo.enlace} target="_blank" rel="noopener noreferrer" className="self-start text-[13px] font-bold underline">Ir a {b.comercio}</a>}
            </div>
          )}
          <div className="rounded-2xl border border-n10 bg-n0">
            <button onClick={() => setCondiciones((x) => !x)} aria-expanded={condiciones} className="flex w-full items-center justify-between px-4 py-3 text-[15px] font-extrabold">
              Condiciones y vigencia<Icon name="chevron" size={18} className={cx('transition', condiciones ? '-rotate-90' : 'rotate-90')} />
            </button>
            {condiciones && (
              <dl className="flex flex-col gap-2 px-4 pb-4 text-[13px]">
                {(dt?.vigencia || hasta) && <div className="flex gap-3"><dt className="w-[92px] shrink-0 font-bold">Vigencia</dt><dd>{dt?.vigencia || `Hasta el ${hasta}`}</dd></div>}
                <div className="flex gap-3"><dt className="w-[92px] shrink-0 font-bold">Comercio</dt><dd>{b.comercio}</dd></div>
                <div className="flex gap-3"><dt className="w-[92px] shrink-0 font-bold">Dónde aplica</dt><dd className="flex items-center gap-1"><Icon name="beneficios" size={13} />{dt?.cobertura || b.ubicacion}</dd></div>
                {dt && dt.condiciones.length > 0 && <div className="flex gap-3"><dt className="w-[92px] shrink-0 font-bold">Condiciones</dt><dd><ul className="flex flex-col gap-1">{dt.condiciones.map((c) => <li key={c}>{c}</li>)}</ul></dd></div>}
                {dt?.nota && <p className="text-[12px] text-n60">{dt.nota}</p>}
                {dt?.terminos && <p className="text-[12px] leading-[17px] text-n60">{dt.terminos}</p>}
                {dt?.terminosUrl && <p className="pt-1 text-[12px] text-n60">*Aplican <a href={dt.terminosUrl} target="_blank" rel="noopener noreferrer" className="font-bold text-cafe underline">Términos y condiciones</a>.</p>}
              </dl>
            )}
          </div>
        </div>
      </div>
    </Hoja>
  );
}

export function SinBeneficios({ categoria, ubicacion, onLimpiar }: { categoria: string; ubicacion: string; onLimpiar: () => void }) {
  const que = categoria !== 'Todos' ? categoria.toLowerCase() : '';
  const donde = ubicacion !== 'Todas' ? ` en ${ubicacion}` : '';
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl bg-n0 px-6 py-8 text-center">
      <img src={asset('img/oveja-preguntas.webp')} alt="" className="h-24 w-auto object-contain" />
      <p className="text-[17px] font-extrabold">Aún no tenemos beneficios{que ? ` de ${que}` : ''}{donde}</p>
      <p className="max-w-[340px] text-sm text-n60">Estamos sumando nuevas marcas al rebaño. ¡Vuelve pronto! Mientras tanto, mira los demás beneficios.</p>
      <button onClick={onLimpiar} className="mt-1 inline-flex h-11 items-center rounded-pill bg-cafe px-5 text-sm font-bold text-n0">Ver todos los beneficios</button>
    </div>
  );
}
