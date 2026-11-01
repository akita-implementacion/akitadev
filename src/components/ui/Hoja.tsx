import { useEffect, useState, type ReactNode } from 'react';
import { Icon } from './Icon';
import { cx } from './primitives';

export function Hoja({ abierto, onCerrar, titulo, subtitulo, onVolver, children, amplia, pie }: {
  abierto: boolean; onCerrar: () => void; titulo: ReactNode; subtitulo?: ReactNode; onVolver?: () => void; children: ReactNode;
  amplia?: boolean;
  pie?: ReactNode;
}) {
  useEffect(() => {
    if (!abierto) return;
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onCerrar();
    window.addEventListener('keydown', esc);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', esc); document.body.style.overflow = ''; };
  }, [abierto, onCerrar]);

  if (!abierto) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-cafe/60 lg:items-center" role="dialog" aria-modal="true" onClick={onCerrar}>
      <div className={cx('flex max-h-[88dvh] w-full flex-col gap-5 overflow-y-auto overscroll-contain rounded-t-[28px] bg-fondo p-6 text-cafe [&>*]:shrink-0 lg:max-h-[92vh] lg:rounded-[28px]',
        pie ? 'pb-0' : 'pb-[max(2rem,env(safe-area-inset-bottom))] lg:pb-6', amplia ? 'lg:w-[min(920px,92vw)]' : 'lg:w-[480px]')} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start gap-3">
          {onVolver && (
            <button aria-label="Volver" onClick={onVolver} className="flex size-10 shrink-0 items-center justify-center rounded-pill bg-n0">
              <Icon name="flecha" size={18} className="rotate-180" />
            </button>
          )}
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <p className="text-[22px] font-black leading-7">{titulo}</p>
            {subtitulo && <p className="text-[13px] text-n60">{subtitulo}</p>}
          </div>
          <button aria-label="Cerrar" onClick={onCerrar} className="flex size-10 shrink-0 items-center justify-center rounded-pill bg-n0"><Icon name="cerrar" size={18} /></button>
        </div>
        {children}
        {pie && <div className="sticky bottom-0 -mx-6 mt-auto flex flex-col gap-1.5 bg-fondo px-6 pb-[max(24px,env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_16px_-12px_rgba(33,20,2,0.35)]">{pie}</div>}
      </div>
    </div>
  );
}

export function Bloque({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={cx('flex flex-col gap-3 rounded-2xl bg-n0 p-4', className)}>{children}</div>;
}

export function TerminosPremio({ texto, etiqueta = 'Términos y condiciones del premio' }: { texto: string | string[]; etiqueta?: string }) {
  const [ver, setVer] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <button type="button" onClick={(e) => { e.stopPropagation(); setVer((v) => !v); }} aria-expanded={ver} className="flex items-center gap-1.5 self-start text-left text-[13px] font-bold underline">
        <Icon name="info" size={16} />{etiqueta}
      </button>
      {ver && (Array.isArray(texto)
        ? <ul className="flex flex-col gap-1.5 rounded-xl bg-n5 p-3 text-[13px] leading-[19px] text-n60">
            {texto.map((t) => <li key={t} className="flex gap-2"><span className="mt-[7px] size-1 shrink-0 rounded-pill bg-n60" />{t}</li>)}
          </ul>
        : <p className="rounded-xl bg-n5 p-3 text-[13px] leading-[19px] text-n60">{texto}</p>)}
    </div>
  );
}

export function OpcionElegible({ activa, agotada, onClick, icono, titulo, detalle }: {
  activa: boolean; agotada?: boolean; onClick: () => void; icono: ReactNode; titulo: string; detalle: string;
}) {
  return (
    <button type="button" role="radio" aria-checked={activa} onClick={onClick} disabled={agotada}
      className={cx('flex items-center gap-3 rounded-2xl border-2 bg-n0 p-4 text-left disabled:opacity-50', activa ? 'border-cafe' : 'border-transparent')}>
      <span className="flex size-10 shrink-0 items-center justify-center rounded-pill bg-n5">{icono}</span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-[15px] font-extrabold">{titulo}</span>
        <span className={cx('text-[13px]', agotada ? 'font-bold text-error' : 'text-n60')}>{agotada ? 'Agotado' : detalle}</span>
      </span>
      <span className={cx('flex size-5 shrink-0 items-center justify-center rounded-pill border-2', activa ? 'border-cafe bg-cafe' : 'border-n40')}>
        {activa && <span className="size-2 rounded-pill bg-amarillo" />}
      </span>
    </button>
  );
}

export function CodigoCopiable({ codigo }: { codigo: string }) {
  const [copiado, setCopiado] = useState(false);
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border-[1.5px] border-dashed border-cafe/40 bg-n0 px-4 py-3">
      <span className="min-w-0 break-all text-xl font-black tracking-[3px]">{codigo}</span>
      <button type="button" onClick={() => { navigator.clipboard?.writeText(codigo).catch(() => {}); setCopiado(true); }}
        className="flex shrink-0 items-center gap-1.5 text-sm font-bold text-error">
        <Icon name="copiar" size={16} />{copiado ? 'Copiado' : 'Copiar'}
      </button>
    </div>
  );
}
