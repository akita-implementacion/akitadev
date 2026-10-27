import { cx } from '../components/ui/primitives';

const base = import.meta.env.BASE_URL;
export type MarcaId = 'aquamed' | 'arthur-sons' | 'barba-negra' | 'cinemark' | 'dermohelp' | 'franklin' | 'hollyfood' | 'psicoturay' | 'repsol';
export const NOMBRE_MARCA: Record<MarcaId, string> = {
  aquamed: 'Aquamed', 'arthur-sons': 'Arthur & Sons', 'barba-negra': 'Barba Negra', cinemark: 'Cinemark', dermohelp: 'Dermohelp',
  franklin: 'Franklin', hollyfood: 'Hollyfood', psicoturay: 'Psicoturay', repsol: 'Repsol',
};

const TAMANOS = { sm: 'h-8 w-[72px] p-1', md: 'h-11 w-[104px] p-1.5', lg: 'h-14 w-[132px] p-2' };

export function LogoMarca({ marca, tamano = 'md', className }: { marca: MarcaId; tamano?: keyof typeof TAMANOS; className?: string }) {
  return (
    <span className={cx('inline-flex shrink-0 items-center justify-center rounded-xl bg-n0 shadow-[0_1px_4px_rgba(33,20,2,0.12)]', TAMANOS[tamano], className)}>
      <img src={`${base}img/marcas/${marca}.png`} alt={NOMBRE_MARCA[marca]} className="max-h-full max-w-full object-contain" loading="lazy" />
    </span>
  );
}
