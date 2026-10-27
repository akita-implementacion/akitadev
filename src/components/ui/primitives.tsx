import { useState, type ReactNode, type ButtonHTMLAttributes } from 'react';
import { Icon, type IconName } from './Icon';
import { asset } from '../../data/assets';

const cx = (...c: (string | false | undefined | null)[]) => c.filter(Boolean).join(' ');
export { cx };

type ButtonVariant = 'primario' | 'blanco';
export function Button({
  variant = 'primario', icon, iconRight, full, children, className, ...rest
}: { variant?: ButtonVariant; icon?: IconName; iconRight?: IconName; full?: boolean; children: ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className={cx(
        'inline-flex h-14 items-center justify-center gap-2.5 whitespace-nowrap rounded-pill px-8 text-[15px] font-bold leading-[15px] text-cafe transition active:scale-[.98]',
        variant === 'primario' ? 'bg-amarillo hover:brightness-95' : 'bg-n0 hover:bg-n5',
        full && 'w-full',
        className,
      )}
    >
      {icon && <Icon name={icon} size={20} />}
      {children}
      {iconRight && <Icon name={iconRight} size={20} />}
    </button>
  );
}

type CompactVariant = 'oscuro' | 'amarillo' | 'outline' | 'outline-claro' | 'link' | 'blanco';
const compactStyles: Record<CompactVariant, string> = {
  oscuro: 'bg-cafe text-fondo px-5',
  amarillo: 'bg-amarillo text-cafe px-5',
  outline: 'border-[1.5px] border-cafe text-cafe px-5',
  'outline-claro': 'border-[1.5px] border-n0 text-n0 px-5',
  link: 'text-error px-0',
  blanco: 'bg-n0 text-morado px-5',
};
export function ButtonCompacto({
  variant = 'oscuro', icon, iconRight, full, children, className, ...rest
}: { variant?: CompactVariant; icon?: IconName; iconRight?: IconName; full?: boolean; children: ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className={cx('inline-flex h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-pill text-sm font-bold transition hover:opacity-90', compactStyles[variant], full && 'w-full', className)}
    >
      {icon && <Icon name={icon} size={18} />}
      {children}
      {iconRight && <Icon name={iconRight} size={variant === 'link' ? 16 : 18} />}
    </button>
  );
}

type BadgeTone = 'amarillo' | 'verde' | 'rosa' | 'base';
const badgeTone: Record<BadgeTone, string> = { amarillo: 'bg-amarillo', verde: 'bg-verde', rosa: 'bg-rosa', base: 'bg-fondo' };
export function Badge({ tone = 'amarillo', small, children, className }: { tone?: BadgeTone; small?: boolean; children: ReactNode; className?: string }) {
  return (
    <span className={cx('inline-flex shrink-0 items-center whitespace-nowrap rounded-md font-bold text-cafe', small ? 'px-2 py-[3px] text-[10px]' : 'px-3 py-[5px] text-xs', badgeTone[tone], className)}>
      {children}
    </span>
  );
}

export function ChipFiltro({ activo, children, onClick }: { activo?: boolean; children: ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cx(
        'shrink-0 whitespace-nowrap rounded-pill px-[18px] py-2.5 text-[13px] font-semibold leading-[13px]',
        activo ? 'bg-cafe text-n0' : 'border border-cafe/[.12] bg-cafe/[.06] text-cafe',
      )}
    >
      {children}
    </button>
  );
}

export function MonedaLana({ size = 24 }: { size?: number }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-pill border-cafe bg-amarillo font-black text-cafe"
      style={{ width: size, height: size, fontSize: size / 2, borderWidth: size / 16 }}
    >
      L
    </span>
  );
}

export function ChipLanas({ saldo, onClick }: { saldo: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="inline-flex items-center gap-1.5 rounded-pill bg-cafe py-1 pl-1 pr-3" aria-label={`Tienes ${saldo} Lanas`}>
      <span className="inline-flex size-[26px] items-center justify-center rounded-pill bg-amarillo text-[13px] font-black text-cafe">L</span>
      <span className="text-[15px] font-extrabold text-n0">{saldo}</span>
    </button>
  );
}

export function Barra({ valor, total, color = 'verde', fondo = 'n10', alto = 8 }: { valor: number; total: number; color?: 'verde' | 'amarillo' | 'success'; fondo?: 'n10' | 'claro'; alto?: number }) {
  const pct = Math.min(100, Math.round((valor / total) * 100));
  return (
    <div
      className={cx('w-full overflow-hidden rounded-pill', fondo === 'n10' ? 'bg-n10' : 'bg-n0/[.16]')}
      style={{ height: alto }}
      role="progressbar" aria-valuenow={valor} aria-valuemin={0} aria-valuemax={total}
    >
      <div className={cx('h-full rounded-pill', color === 'verde' ? 'bg-verde' : color === 'amarillo' ? 'bg-amarillo' : 'bg-success')} style={{ width: `${pct}%` }} />
    </div>
  );
}

export type Pose = 'hoy' | 'sorteos' | 'beneficios' | 'misiones' | 'cuenta' | 'pose' | 'vip' | 'feliz' | 'sorprendida' | 'triste';

export function Oveja({ pose, className }: { pose: Pose; className?: string }) {
  const [error, setError] = useState(false);
  const src = asset(`assets/oveja-${pose}.webp`);
  return (
    <div className={cx(/\b(absolute|fixed|static)\b/.test(className ?? '') ? '' : 'relative', className)}>
      {!error ? (
        <img src={src} alt="" onError={() => setError(true)} className="size-full object-contain" />
      ) : (
        <div className="flex size-full items-center justify-center rounded-full border-2 border-dashed border-cafe/25 bg-n0/40" title={`Falta assets/oveja-${pose}.webp`}>
          <svg viewBox="0 0 64 64" className="h-1/2 w-1/2 text-cafe/30" fill="currentColor" aria-hidden>
            <circle cx="22" cy="26" r="12" /><circle cx="36" cy="20" r="12" /><circle cx="44" cy="32" r="12" /><circle cx="28" cy="38" r="12" />
            <rect x="24" y="46" width="4" height="12" rx="2" /><rect x="38" y="46" width="4" height="12" rx="2" />
          </svg>
        </div>
      )}
      <div className="absolute bottom-[2%] left-1/2 h-[6%] w-[45%] -translate-x-1/2 rounded-[50%] bg-cafe/25 blur-[3px]" />
    </div>
  );
}

const fotoTonos = ['from-amarillo to-[#FFA800]', 'from-azul to-[#8ED0FF]', 'from-rosa to-rosa-claro', 'from-verde to-[#A7F3C9]'];
export function Foto({ src, alt, tono = 0, contain, className, children }: { src?: string; alt: string; tono?: number; contain?: boolean; className?: string; children?: ReactNode }) {
  const [fallida, setFallida] = useState<string>();
  const error = !src || fallida === src;
  return (
    <div className={cx('relative overflow-hidden', className)}>
      {!error && src ? (
        <img src={/^(https?:|\/|data:)/.test(src) ? src : asset(src)} alt={alt} onError={() => setFallida(src)}
          className={cx('absolute inset-0 size-full', contain ? 'bg-n0 object-contain p-3' : 'object-cover')} />
      ) : (
        <div className={cx('absolute inset-0 flex items-center justify-center bg-gradient-to-br', fotoTonos[tono % fotoTonos.length])}>
          <span className="max-w-[80%] text-center text-xs font-bold text-cafe/50">{alt}</span>
        </div>
      )}
      {children}
    </div>
  );
}

export function ImagenOpcional({ src, respaldo, alt = '', className }: { src: string; respaldo?: string; alt?: string; className?: string }) {
  const [intento, setIntento] = useState(0);
  const fuentes = [src, respaldo].filter(Boolean) as string[];
  if (intento >= fuentes.length) return null;
  const actual = fuentes[intento];
  return <img src={/^(https?:|\/|data:)/.test(actual) ? actual : asset(actual)} alt={alt} onError={() => setIntento((n) => n + 1)} className={className} />;
}
