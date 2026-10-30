import { cx } from '../components/ui/primitives';

const base = import.meta.env.BASE_URL;
export type MarcaId = 'aquamed' | 'arthur-sons' | 'barba-negra' | 'cinemark' | 'dermohelp' | 'franklin' | 'hollyfood' | 'psicoturay' | 'repsol' | 'trattoria' | 'botica';
export const NOMBRE_MARCA: Record<MarcaId, string> = {
  aquamed: 'Aquamed', 'arthur-sons': 'Arthur & Sons', 'barba-negra': 'Barba Negra', cinemark: 'Cinemark', dermohelp: 'Dermohelp',
  franklin: 'Franklin', hollyfood: 'Hollyfood', psicoturay: 'Psicoturay', repsol: 'Repsol', trattoria: 'La Bodega de la Trattoria', botica: 'Botica Bienestar',
};

const SIN_LOGO = new Set<MarcaId>(['trattoria', 'botica']);

const TAMANOS = { sm: 'h-8 w-[72px] p-1', md: 'h-11 w-[104px] p-1.5', lg: 'h-14 w-[132px] p-2' };

export function LogoMarca({ marca, tamano = 'md', className }: { marca: MarcaId; tamano?: keyof typeof TAMANOS; className?: string }) {
  return (
    <span className={cx('inline-flex shrink-0 items-center justify-center rounded-xl bg-n0 shadow-[0_1px_4px_rgba(33,20,2,0.12)]', TAMANOS[tamano], className)}>
      {SIN_LOGO.has(marca)
        ? <span className={cx('text-center font-extrabold text-cafe', tamano === 'sm' ? 'text-[9px] leading-[11px]' : tamano === 'md' ? 'text-[11px] leading-[13px]' : 'text-[14px] leading-[16px]')}>{NOMBRE_MARCA[marca]}</span>
        : <img src={`${base}img/marcas/${marca}.png`} alt={NOMBRE_MARCA[marca]} className="max-h-full max-w-full object-contain" loading="lazy" />}
    </span>
  );
}
