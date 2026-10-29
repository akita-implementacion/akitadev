import { useRef, useState } from 'react';
import { config } from '../../api/config';
import { Icon } from '../ui/Icon';
import { cx } from '../ui/primitives';

export type TipoEntrega = 'codigo' | 'qr' | 'dni' | 'enlace' | 'contacto';
export type Entrega = { tipo: TipoEntrega; codigo?: string; enlace?: string; qrUrl?: string };

export function tipoDeMetodo(metodo?: string, conCodigo?: boolean): TipoEntrega {
  switch ((metodo ?? '').toUpperCase()) {
    case 'REDIRECT_LINK': case 'PROMO_CODE_AND_LINK': case 'URL': return 'enlace';
    case 'IN_PERSON': case 'DNI': return 'dni';
    case 'EXTERNAL': case 'QR': return 'qr';
    case 'CONTACT': return 'contacto';
    case 'PROMO_CODE': case 'CODE': return 'codigo';
    default: return conCodigo === false ? 'dni' : 'codigo';
  }
}

const ETIQUETA: Record<TipoEntrega, string> = { codigo: 'Cupón digital', qr: 'Cupón digital', dni: 'Con tu DNI', enlace: 'Enlace', contacto: 'Te contactamos' };
export const etiquetaEntrega = (t: TipoEntrega) => ETIQUETA[t];
export const esCupon = (t: TipoEntrega) => t === 'codigo' || t === 'qr';

export const accionEntrega = (t: TipoEntrega, comercio: string, conCodigo: boolean) =>
  esCupon(t) ? 'Generar mi cupón' : t === 'enlace' ? (conCodigo ? 'Generar mi cupón' : `Ir a ${comercio}`) : t === 'dni' ? 'Activar beneficio' : 'Quiero este beneficio';

export const pasosPorDefecto = (t: TipoEntrega, comercio: string, conCodigo = true): string[] => ({
  codigo: ['Genera tu cupón aquí.', `Muestra el QR o dicta el código al pagar en ${comercio}.`],
  qr: ['Genera tu cupón aquí.', `Muestra el QR en caja de ${comercio} para que lo escaneen.`],
  enlace: conCodigo ? ['Copia tu código promocional.', `Toca «Ir a ${comercio}» e ingrésalo al pagar en su web.`]
    : [`Toca «Ir a ${comercio}».`, 'El descuento se aplica en su web.'],
  dni: ['Activa el beneficio.', `Muestra tu DNI en caja de ${comercio}.`],
  contacto: ['Confirma que quieres este beneficio.', 'Jockey Plaza te contacta para coordinar la entrega.'],
}[t]);

export function QrEjemplo({ valor, tamano = 168 }: { valor: string; tamano?: number }) {
  const n = 25;
  let h = 0; for (const ch of valor) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const celdas: [number, number][] = [];
  const enFinder = (x: number, y: number) => [[0, 0], [n - 7, 0], [0, n - 7]].some(([fx, fy]) => x >= fx && x < fx + 7 && y >= fy && y < fy + 7);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    if (enFinder(x, y)) continue;
    h = (h * 1103515245 + 12345) >>> 0;
    if ((h >>> 16) % 100 < 46) celdas.push([x, y]);
  }
  const finder = (fx: number, fy: number) => (
    <g key={`${fx}-${fy}`}>
      <rect x={fx} y={fy} width={7} height={7} fill="#211402" />
      <rect x={fx + 1} y={fy + 1} width={5} height={5} fill="#fff" />
      <rect x={fx + 2} y={fy + 2} width={3} height={3} fill="#211402" />
    </g>
  );
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox={`-2 -2 ${n + 4} ${n + 4}`} width={tamano} height={tamano} role="img" aria-label={`Código QR ${valor}`} shapeRendering="crispEdges" className="rounded-lg bg-n0">
      <rect x={-2} y={-2} width={n + 4} height={n + 4} fill="#fff" />
      {celdas.map(([x, y]) => <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="#211402" />)}
      {finder(0, 0)}{finder(n - 7, 0)}{finder(0, n - 7)}
    </svg>
  );
}

function descargarQr(origen: SVGSVGElement | HTMLImageElement | null, nombre: string) {
  if (!origen) return;
  const imagen = new Image();
  imagen.crossOrigin = 'anonymous';
  imagen.onload = () => {
    const lienzo = document.createElement('canvas'); lienzo.width = 600; lienzo.height = 600;
    const ctx = lienzo.getContext('2d'); if (!ctx) return;
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 600, 600); ctx.drawImage(imagen, 0, 0, 600, 600);
    try {
      const a = document.createElement('a'); a.download = `${nombre}.png`; a.href = lienzo.toDataURL('image/png'); a.click();
    } catch {
      window.open((origen as HTMLImageElement).src, '_blank', 'noopener');
    }
  };
  imagen.src = origen instanceof HTMLImageElement ? origen.src : `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(origen))}`;
}

export function CodigoParaCopiar({ codigo }: { codigo: string }) {
  const [copiado, setCopiado] = useState(false);
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border-[1.5px] border-dashed border-cafe/40 bg-n0 px-4 py-3">
      <span className="min-w-0 truncate text-xl font-black tracking-[3px]">{codigo}</span>
      <button onClick={() => { navigator.clipboard?.writeText(codigo).catch(() => {}); setCopiado(true); window.setTimeout(() => setCopiado(false), 1800); }}
        className={cx('flex shrink-0 items-center gap-1.5 text-sm font-bold', copiado ? 'text-verde-texto' : 'text-cafe')}>
        <Icon name={copiado ? 'check' : 'copiar'} size={16} />{copiado ? '¡Copiado!' : 'Copiar'}
      </button>
    </div>
  );
}

export function ChipEntrega({ tipo, conCodigo }: { tipo: TipoEntrega; conCodigo?: boolean }) {
  return (
    <span className="flex w-fit items-center gap-1.5 rounded-pill bg-cafe px-2.5 py-1 text-[12px] font-bold text-amarillo">
      <Icon name={esCupon(tipo) ? 'cupon' : tipo === 'dni' ? 'cuenta' : tipo === 'enlace' ? 'compartir' : 'info'} size={14} />{tipo === 'enlace' && conCodigo ? 'Código y enlace' : ETIQUETA[tipo]}
    </span>
  );
}

export const tituloResultado = (t: TipoEntrega) => esCupon(t) || t === 'enlace' ? '¡Tu cupón está listo!' : t === 'dni' ? '¡Beneficio activado!' : '¡Listo! Te contactaremos';

export function EntregaPremio({ entrega, comercio, desde, hasta, dni, className }: {
  entrega: Entrega; comercio: string; desde?: string; hasta?: string; dni?: string; className?: string;
}) {
  const { tipo, codigo, enlace, qrUrl } = entrega;
  const qr = useRef<HTMLDivElement>(null);
  const conQr = !!qrUrl || config.usarMock;
  const vigencia = (desde || hasta) && (
    <div className="flex flex-wrap justify-center gap-1.5">
      {desde && <span className="flex items-center gap-1 rounded-pill bg-n5 px-2.5 py-1 text-[12px] font-semibold text-n60"><Icon name="reloj" size={13} />Válido desde {desde}</span>}
      {hasta && <span className="flex items-center gap-1 rounded-pill bg-n5 px-2.5 py-1 text-[12px] font-semibold text-n60"><Icon name="reloj" size={13} />Válido hasta {hasta}</span>}
    </div>
  );
  return (
    <div className={cx('flex flex-col gap-3 rounded-2xl bg-n0 p-4', className)}>
      {esCupon(tipo) && (
        <>
          <p className="text-center text-[14px] leading-5">Muéstralo en <b>{comercio}</b> para usar tu beneficio.</p>
          {conQr && (
            <div ref={qr} className="flex justify-center rounded-2xl bg-n5 p-4">
              {qrUrl ? <img src={qrUrl} alt={`Código QR de tu cupón de ${comercio}`} className="size-[176px] rounded-lg bg-n0 object-contain" /> : <QrEjemplo valor={codigo ?? comercio} tamano={176} />}
            </div>
          )}
          {codigo && <CodigoParaCopiar codigo={codigo} />}
          {vigencia}
          {conQr && (
            <button onClick={() => descargarQr(qr.current?.querySelector('svg, img') as SVGSVGElement | HTMLImageElement | null, `cupon-${(codigo ?? comercio).toLowerCase()}`)}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-pill border-[1.5px] border-cafe text-sm font-bold text-cafe">
              <Icon name="flecha" size={16} className="rotate-90" />Descargar QR
            </button>
          )}
        </>
      )}
      {tipo === 'enlace' && (
        <>
          <p className="text-center text-[14px] leading-5">{codigo ? <>Copia tu código e ingrésalo al pagar en la web de <b>{comercio}</b>.</> : <>El descuento se aplica en la web de <b>{comercio}</b>.</>}</p>
          {codigo && <CodigoParaCopiar codigo={codigo} />}
          {vigencia}
          {enlace && <a href={enlace} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-pill bg-cafe text-sm font-bold text-n0">Ir a {comercio}<Icon name="flecha" size={16} /></a>}
          {enlace && <p className="text-center text-[12px] text-n60">Se abre en otra pestaña.</p>}
        </>
      )}
      {tipo === 'dni' && (
        <>
          <div className="flex items-start gap-3 rounded-2xl bg-n5 p-3.5">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-pill bg-amarillo"><Icon name="cuenta" size={20} /></span>
            <p className="text-[14px] leading-5"><b>Muestra tu DNI en caja de {comercio}.</b> El beneficio ya está asociado a tu documento{dni ? ` (${dni})` : ''}; no necesitas código.</p>
          </div>
          {vigencia}
        </>
      )}
      {tipo === 'contacto' && (
        <div className="flex items-start gap-3 rounded-2xl bg-amarillo/30 p-3.5">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-pill bg-amarillo"><Icon name="info" size={20} /></span>
          <p className="text-[14px] leading-5"><b>Jockey Plaza te contactará en los próximos 5 días hábiles</b> por correo o WhatsApp para coordinar la entrega de tu beneficio de {comercio}.</p>
        </div>
      )}
      <p className="text-center text-[12px] text-n60">También lo encuentras en Mis Cupones.</p>
    </div>
  );
}
