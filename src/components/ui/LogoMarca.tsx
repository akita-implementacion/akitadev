import { useState } from 'react';
import { asset } from '../../data/assets';
import { cx } from './primitives';

const TAMANOS = { sm: 'h-8 w-[72px] p-1', md: 'h-11 w-[104px] p-1.5', lg: 'h-14 w-[132px] p-2' };

export function LogoMarca({ src, nombre, tamano = 'md', className }: { src?: string; nombre: string; tamano?: keyof typeof TAMANOS; className?: string }) {
  const [fallo, setFallo] = useState(false);
  if (!src && !nombre) return null;
  return (
    <span className={cx('inline-flex shrink-0 items-center justify-center rounded-xl bg-n0 shadow-[0_1px_4px_rgba(33,20,2,0.12)]', TAMANOS[tamano], className)}>
      {fallo || !src
        ? <span className={cx('line-clamp-2 text-center font-extrabold text-cafe', tamano === 'sm' ? 'text-[9px] leading-[11px]' : tamano === 'md' ? 'text-[11px] leading-[13px]' : 'text-[14px] leading-[16px]')}>{nombre}</span>
        : <img src={asset(src!)} alt={nombre} onError={() => setFallo(true)} className="max-h-full max-w-full object-contain" loading="lazy" />}
    </span>
  );
}
