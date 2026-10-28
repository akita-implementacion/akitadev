import type { ReactNode } from 'react';
import { Nube } from '../ui/Brand';
import { Oveja, type Pose, cx } from '../ui/primitives';
import { asset } from '../../data/assets';

export function Hero({ color, titulo, bajada, pose, imagen, oscuro, publico }: { color: string; titulo: ReactNode; bajada: ReactNode; pose?: Pose; imagen?: string; oscuro?: boolean; publico?: boolean }) {
  return (
    <section className={cx('relative overflow-hidden', publico ? 'min-h-[250px] max-lg:[@media(max-height:760px)]:min-h-[180px] lg:h-[300px] lg:min-h-0' : 'min-h-[230px] max-lg:[@media(max-height:760px)]:min-h-[170px] max-lg:[@media(max-height:620px)]:!min-h-[120px] lg:h-[280px] lg:min-h-0')} style={{ background: color }}>
      <div className="relative mx-auto h-full max-w-[1366px]">
        <div className={cx('relative z-10 w-[230px] pb-[78px] pl-6 pt-[40px] max-lg:[@media(max-height:760px)]:pb-[34px] max-lg:[@media(max-height:760px)]:pt-5 max-lg:[@media(max-height:620px)]:!pb-5 max-lg:[@media(max-height:620px)]:!pt-3 sm:w-[60%] lg:absolute lg:left-16 lg:w-[880px] lg:p-0', publico ? 'lg:top-[80px]' : 'lg:top-[67px]')}>
          <h1 className={cx('font-black uppercase leading-[0.95]', publico ? 'text-[30px] max-lg:[@media(max-height:760px)]:text-[26px] lg:text-[56px]' : 'text-[30px] max-lg:[@media(max-height:760px)]:text-[26px] lg:text-[52px]', oscuro ? 'text-fondo' : 'text-cafe')}>{titulo}</h1>
          <p className={cx('mt-3 text-[15px] max-lg:[@media(max-height:620px)]:hidden max-lg:[@media(max-height:760px)]:mt-2 max-lg:[@media(max-height:760px)]:text-[14px] lg:mt-4 lg:text-lg', oscuro ? 'text-fondo/90' : 'text-cafe/90')}>{bajada}</p>
        </div>
        <Nube className="-bottom-[88px] -left-[50px] w-[150px] text-fondo max-lg:[@media(max-height:620px)]:hidden lg:hidden" />
        <Nube className="-bottom-[112px] -right-[50px] w-[200px] text-fondo lg:hidden" />
        <Nube className="-left-20 top-[220px] hidden w-[260px] text-fondo lg:block" />
        <Nube className="left-[42%] top-[255px] hidden w-[220px] text-fondo lg:block" />
        <Nube className="right-[120px] top-[190px] hidden w-[300px] text-fondo lg:block" />
        {imagen ? (
          <img src={asset(imagen)} alt="" className="absolute right-4 top-6 z-10 h-[140px] w-auto drop-shadow-[0_12px_10px_rgba(33,20,2,0.25)] lg:right-[150px] lg:top-6 lg:h-[250px]" />
        ) : pose ? (
          <Oveja pose={pose} className="absolute right-6 top-5 z-10 size-24 max-lg:[@media(max-height:760px)]:top-3 max-lg:[@media(max-height:760px)]:size-20 lg:right-[104px] lg:top-6 lg:size-[220px]" />
        ) : null}
      </div>
    </section>
  );
}

export function Contenido({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx('mx-auto flex max-w-[1366px] flex-col gap-6 px-6 pb-8 pt-5 lg:gap-8 lg:px-16 lg:pb-20 lg:pt-12', className)}>{children}</div>;
}

export function EncabezadoSeccion({ titulo, extra, accion }: { titulo: string; extra?: ReactNode; accion?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-xl font-extrabold text-cafe lg:text-2xl">{titulo}</h2>
      {extra && <span className="text-xs font-medium text-n60">{extra}</span>}
      {accion}
    </div>
  );
}
