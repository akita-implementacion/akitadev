import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Icon, type IconName } from '../ui/Icon';
import { Nube } from '../ui/Brand';
import { Badge, Barra, Button, ButtonCompacto, Foto, ImagenOpcional, MonedaLana, cx } from '../ui/primitives';
import { formatoLanas, type Mision } from '../../data/mock';
import { Tx } from '../../data/revision';
import { useBilletera, useDesafioVip, useDetalleBeneficio, useReferidos, useSorteoDestacado, useUsuario } from '../../data/datos';
import { useSesion } from '../../data/sesion';
import { beneficiosApi, lanasApi, sorteosApi } from '../../api/servicios';
import { ApiError, mensajeError } from '../../api/client';
import type * as T from '../../api/tipos';
import { asset } from '../../data/assets';
import { invalidar } from '../../data/recurso';
import { Modal } from './CofreFlash';
import { SumarChances } from '../sorteos/SumarChances';
import { useDetallePublico, usePremioConSesion, type DetallePremio } from '../sorteos/DetallePremio';
import { LogoMarca } from '../ui/LogoMarca';
import { TERMINOS_VEHICULO } from '../../data/mock';
import { CodigoCopiable } from '../ui/Hoja';

export { CardCofre, CardFlash, CardFlashCompacta } from './CofreFlash';

function useAccion<R>(fn: () => Promise<R>, alTerminar?: (r: R | null) => void, alFallar?: (e: unknown) => void) {
  const { modoMock } = useSesion();
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const ejecutar = async () => {
    if (enviando) return;
    setError('');
    if (modoMock) { alTerminar?.(null); return; }
    setEnviando(true);
    try { alTerminar?.(await fn()); } catch (e) { setError(mensajeError(e)); alFallar?.(e); } finally { setEnviando(false); }
  };
  return { ejecutar, enviando, error };
}

function useSorteoParaChances() {
  const s = useSorteoDestacado();
  const usuario = useUsuario();
  return { id: s.id, premio: s.premio, fecha: s.fecha.replace(/^Sorteo /, ''), corte: s.corte || s.cierraEn || '', chancesActuales: usuario.chancesPorPlan, puedeComprar: s.puedeComprar };
}

export function CardSorteoCompacta() {
  const sorteoDestacado = useSorteoDestacado();
  const usuario = useUsuario();
  const paraChances = useSorteoParaChances();
  const [abierto, setAbierto] = useState(false);
  if (!sorteoDestacado.premio) return null;
  return (
    <div className="flex min-h-[150px] overflow-hidden rounded-[20px]">
      <Foto src={sorteoDestacado.foto} alt={sorteoDestacado.premio} className="flex-1 bg-amarillo [&_img]:object-[20%_50%]">
        <span className="absolute left-[7px] top-[7px] rounded-md bg-black/50 px-1.5 py-[3px] text-[10px] font-bold text-n0">{sorteoDestacado.horaCorta}</span>
      </Foto>
      <div className="flex flex-1 flex-col gap-1 bg-hero-brand p-3.5">
        <p className="text-[15px] font-black uppercase leading-[18px] text-amarillo">{sorteoDestacado.premio}</p>
        <p className="text-xs font-medium text-n0/80">Tienes {usuario.chancesPorPlan} chances</p>
        <div className="flex-1" />
        <button type="button" onClick={() => setAbierto(true)} className="w-full rounded-pill bg-n0 py-1 pl-3 text-left text-xs font-bold leading-[24px] text-cafe">Sumar chances</button>
      </div>
      <SumarChances sorteo={paraChances} abierto={abierto} onCerrar={() => setAbierto(false)} />
    </div>
  );
}

export function CardSorteoDestacado({ oscuro, publico, conOveja }: { oscuro?: boolean; publico?: boolean; conOveja?: boolean }) {
  const sorteoDestacado = useSorteoDestacado();
  const usuario = useUsuario();
  const paraChances = useSorteoParaChances();
  const extra = sorteoDestacado as { descripcion?: string; specs?: string[]; terminos?: string[]; terminosUrl?: string };
  const detalle: DetallePremio = { premio: sorteoDestacado.premio, fecha: sorteoDestacado.fecha, foto: sorteoDestacado.foto,
    descripcion: extra.descripcion, specs: extra.specs, terminosUrl: extra.terminosUrl,
    terminos: extra.terminos ?? (/moto|camioneta|auto/i.test(sorteoDestacado.premio) ? TERMINOS_VEHICULO : undefined) };
  const conSesion = usePremioConSesion(detalle, paraChances);
  const sinSesion = useDetallePublico(detalle);
  if (!sorteoDestacado.premio) return null;
  return (
    <div className={cx('relative flex flex-col overflow-hidden rounded-[24px] lg:flex-row', oscuro ? 'bg-hero-brand' : 'bg-rosa')}>
      <Foto src={sorteoDestacado.foto} contain={!sorteoDestacado.foto?.includes('-banner')} alt={sorteoDestacado.premio}
        className={cx('h-[180px] lg:h-auto lg:min-h-[290px] lg:flex-1 [&_img]:!bg-transparent [&_img]:object-[20%_40%]', !sorteoDestacado.foto?.includes('-banner') && '[&_img]:!p-2', oscuro && 'bg-amarillo')} />
      {conOveja && <ImagenOpcional src="assets/oveja-beneficios.webp" className="absolute right-3 top-[110px] z-10 size-28 object-contain lg:hidden" />}
      <div className={cx('relative flex flex-col gap-2.5 p-5 lg:flex-1 lg:justify-center lg:p-8', oscuro ? 'text-n0' : 'text-cafe', !oscuro && !conOveja && 'lg:pr-[230px]')}>
        {!oscuro && !conOveja && (
          <div className="pointer-events-none absolute bottom-0 right-6 hidden flex-col items-center lg:flex">
            {sorteoDestacado.corte && <span className="mb-1 rounded-2xl bg-n0 px-3 py-2 text-center text-[12px] font-bold leading-4 text-cafe shadow-card">Cierre de listas<br /><span className="text-[15px] font-black">{sorteoDestacado.corte}</span></span>}
            <ImagenOpcional src="assets/oveja-09.webp" className="h-[190px] w-auto object-contain" />
          </div>
        )}
        <Badge className="w-fit"><Tx k="sorteos.destacado" /></Badge>
        <p className="text-[26px] font-black leading-[30px] lg:text-[30px] lg:leading-10">{sorteoDestacado.premio}</p>
        <p className={cx('text-sm font-medium', oscuro && 'text-n0/80')}>{sorteoDestacado.fecha} · en vivo</p>
        {(sorteoDestacado.corte || (oscuro && sorteoDestacado.cierraEn)) && (
          <p className={cx('text-xs font-semibold', oscuro ? 'text-amarillo' : 'text-cafe')}>Cierre: {sorteoDestacado.corte || sorteoDestacado.cierraEn}</p>
        )}
        <p className={cx('text-[15px] font-bold', oscuro && '[&_span]:text-verde')}>
          {publico ? 'Participa desde 1 chance con cualquier plan' : <>Tienes <span className="font-extrabold">{usuario.chancesPorPlan} chances</span> por tu plan</>}
        </p>
        {publico
          ? <Link to="/planes" className="w-full lg:w-fit"><Button variant={oscuro ? 'primario' : 'blanco'} className="w-full"><Tx k="premios.cta" /></Button></Link>
          : <Button variant={oscuro ? 'primario' : 'blanco'} icon="ticket" className="w-full lg:w-fit" onClick={conSesion.sumarChances}><Tx k="sorteos.cta.sumar" /></Button>}
        {publico
          ? <p className={cx('text-xs', oscuro ? 'text-n0/70' : 'text-n60')}>En vivo por nuestras redes · queda grabado</p>
          : <p className={cx('text-xs', oscuro && 'text-n0/80')}>Suma chances con soles o Lanas{sorteoDestacado.corte ? ` hasta ${/^\d/.test(sorteoDestacado.corte) ? 'las' : 'el'} ${sorteoDestacado.corte}` : ''}</p>}
        <button type="button" onClick={publico ? sinSesion.abrir : conSesion.verDetalle} className={cx('w-fit text-[13px] font-bold underline', oscuro ? 'text-amarillo' : 'text-cafe')}>Ver detalle y términos</button>
      </div>
      {conOveja && <ImagenOpcional src="assets/oveja-beneficios.webp" className="hidden w-[200px] shrink-0 self-end object-contain p-4 lg:block" />}
      {publico ? sinSesion.modal : conSesion.modales}
    </div>
  );
}

const FONDO_PREMIO = ['bg-amarillo', 'bg-rosa', 'bg-azul', 'bg-verde'];

export function CardPremio({ p, i, color, className = 'w-[260px] shrink-0 lg:w-auto', conSesion }: { p: { id?: string; categoria: string; premio: string; fecha: string; enDias: string; foto?: string; descripcion?: string; specs?: string[] }; i: number; color?: boolean; className?: string; conSesion?: boolean }) {
  const usuario = useUsuario();
  const detalle: DetallePremio = { premio: p.premio, fecha: p.fecha, foto: p.foto, descripcion: p.descripcion, specs: p.specs,
    terminos: p.categoria === 'MOVILIDAD' || /moto|camioneta|auto/i.test(p.premio) ? TERMINOS_VEHICULO : undefined };
  const publico = useDetallePublico(detalle);
  const sesion = usePremioConSesion(detalle, { id: p.id ?? '', premio: p.premio, fecha: p.fecha.replace(/^Sorteo /, ''), corte: '', chancesActuales: usuario.chancesPorPlan });
  return (
    <article className={cx('flex h-full flex-col overflow-hidden rounded-2xl bg-n0 shadow-card', className)}>
      <button type="button" onClick={conSesion ? sesion.verDetalle : publico.abrir} aria-label={`Ver detalle de ${p.premio}`}
        className={cx('relative h-[150px] overflow-hidden text-left lg:h-[170px]', color || conSesion ? FONDO_PREMIO[i % FONDO_PREMIO.length] : 'bg-fondo')}>
        {(color || conSesion) && <><Nube className="-left-[26px] bottom-[-46px] w-[100px] text-fondo" /><Nube className="-right-[30px] bottom-[-58px] w-[124px] text-fondo" /></>}
        {p.foto && <img src={asset(p.foto)} alt={p.premio} loading="lazy" draggable={false} onError={(e) => { e.currentTarget.style.display = 'none'; }} className={cx('absolute z-10 object-contain', color || conSesion ? 'bottom-[4%] right-[5%] h-[96%] w-auto max-w-[80%] object-bottom drop-shadow-[0_8px_10px_rgba(33,20,3,0.18)]' : 'inset-0 m-auto h-full w-auto max-w-[80%] py-2')} />}
        <span className="absolute left-2.5 top-2.5 z-20 rounded-pill bg-amarillo px-2.5 py-1 text-xs font-bold text-cafe">{p.enDias}</span>
      </button>
      {conSesion ? (
        <div className="flex flex-1 flex-col gap-3 px-4 py-3.5">
          <div className="flex min-w-0 flex-col gap-1">
            <p className="text-[9px] font-bold tracking-[1px] text-n60">{p.categoria}</p>
            <p className="text-sm font-bold leading-[18px] text-cafe">{p.premio}</p>
            <p className="text-xs font-medium text-n60">{p.fecha} · tienes {usuario.chancesPorPlan} chances</p>
          </div>
          <div className="mt-auto flex flex-col gap-1.5">
            <button type="button" onClick={sesion.sumarChances} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-pill bg-cafe text-sm font-bold text-fondo"><Icon name="ticket" size={18} />Sumar chances</button>
            <button type="button" onClick={sesion.verDetalle} className="h-8 text-[13px] font-bold text-cafe underline">{detalle.terminos ? 'Ver detalle y términos' : 'Ver detalle'}</button>
          </div>
          {sesion.modales}
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-between gap-3 px-4 py-3.5">
          <div className="flex min-w-0 flex-col gap-1">
            <p className="text-[9px] font-bold tracking-[1px] text-n60">{p.categoria}</p>
            <p className="text-sm font-bold leading-[18px] text-cafe">{p.premio}</p>
            <p className="text-xs font-medium text-n60">{p.fecha}</p>
          </div>
          <button type="button" onClick={publico.abrir} className="inline-flex h-11 shrink-0 items-center whitespace-nowrap rounded-pill bg-cafe px-3 text-sm font-bold text-n0 transition hover:brightness-125">Ver detalle</button>
          {publico.modal}
        </div>
      )}
    </article>
  );
}

export function CardGanador({ g, i, sorteo = 'SORTEO MIÉ 23 SET', className = 'w-[calc(50%-6px)] lg:w-auto' }: { g: { nombre: string; premio: string; usuario: string; chances: number; foto?: string }; i: number; sorteo?: string; className?: string }) {
  return (
    <div className={cx('flex flex-col rounded-[20px] bg-cafe p-2.5 shadow-card', className)}>
      <Foto src={g.foto} alt={g.premio} tono={i} className="h-[150px] rounded-[14px] [&_img]:object-top">
        <span className="absolute bottom-2 left-2 rounded-md bg-amarillo px-2 py-[3px] text-[10px] font-bold text-cafe">★ GANADOR</span>
      </Foto>
      <div className="flex flex-1 flex-col gap-1 px-1.5 pb-1 pt-2.5">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-[11px] font-bold text-amarillo">{sorteo}</p>
          {g.chances > 0 && <span className="shrink-0 rounded-pill bg-n0/10 px-2 py-0.5 text-[11px] font-bold text-n0">{g.chances} {g.chances === 1 ? 'chance' : 'chances'}</span>}
        </div>
        <p className="truncate text-[16px] font-black leading-6 text-amarillo" title={g.nombre}>{g.nombre}</p>
        <p className="truncate text-[14px] font-bold leading-5 text-n0" title={g.premio}>{g.premio}</p>
        <p className="truncate text-[12px] text-n0/70">Usuario {g.usuario}</p>
        <div className="mt-auto border-t border-n0/10 pt-2">
          <Link to="/ganadores" className="inline-flex items-center gap-1 whitespace-nowrap text-[13px] font-bold text-n0">Ver participantes <Icon name="flecha" size={14} /></Link>
        </div>
      </div>
    </div>
  );
}

export function BannerVip() {
  const desafioVip = useDesafioVip();
  if (!desafioVip.hayAcceso) return null;
  const hechas = desafioVip.requisitos.filter((r) => r.hecha).length;
  const total = desafioVip.requisitos.length;
  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-[24px] border-2 border-rosa bg-[radial-gradient(110%_120%_at_85%_30%,#3D2A08_0%,#211402_65%)] sm:flex-row">
      <div className="relative z-10 flex flex-1 flex-col justify-center gap-2.5 p-5 lg:p-7">
        <span className="w-fit rounded-pill bg-rosa px-2.5 py-1 text-xs font-bold text-cafe"><Tx k="vip.badge" /></span>
        <p className="text-[24px] font-black leading-tight text-n0 lg:text-[30px]"><Tx k="vip.titulo" /></p>
        <p className="text-sm leading-5 text-n0/85"><Tx k="vip.bajada" /></p>
        <div className="flex max-w-[320px] flex-col gap-1.5">
          <Barra valor={hechas} total={total} color="amarillo" fondo="claro" />
          <p className="text-[13px] font-semibold text-amarillo">Llevas {hechas} de {total} misiones VIP</p>
        </div>
        <Link to="/sorteos" state={{ vista: 'vip' }} className="mt-1 w-full sm:w-fit"><ButtonCompacto variant="amarillo" iconRight="flecha" className="!h-12 w-full whitespace-nowrap"><Tx k="vip.cta" /></ButtonCompacto></Link>
      </div>
      <div className="relative h-[170px] shrink-0 sm:h-auto sm:w-[40%]">
        <img src={asset('assets/3d/vip-3d.webp')} alt="Premios de sorteos VIP" className="absolute inset-0 m-auto max-h-[92%] max-w-[96%] object-contain" />
      </div>
    </div>
  );
}

export function CardBilletera({ etiquetaCanje = 'Canjear', conOveja }: { etiquetaCanje?: string; conOveja?: boolean }) {
  const billetera = useBilletera();
  const canjear = etiquetaCanje === 'Canjear';
  const botones = (
    <>
      <Link to={canjear ? '/beneficios' : '/misiones'} className={conOveja ? 'w-full' : 'flex-1'}><ButtonCompacto variant={canjear ? 'amarillo' : 'blanco'} icon={canjear ? 'regalo' : 'misiones'} full>{etiquetaCanje}</ButtonCompacto></Link>
      <Link to="/mi-cuenta" state={{ seccion: 'Mis Lanas' }} className={conOveja ? 'w-full' : 'flex-1'}><ButtonCompacto variant="outline-claro" full>Movimientos</ButtonCompacto></Link>
    </>
  );
  if (conOveja) {
    return (
      <div className="flex h-full flex-col gap-3 overflow-hidden rounded-[24px] bg-hero-brand p-5">
        <p className="text-[10px] font-bold tracking-[1.4px] text-n0">MI BILLETERA</p>
        <div className="flex items-center gap-2.5">
          <MonedaLana size={38} />
          <p className="text-[44px] font-black leading-[46px] text-amarillo">{formatoLanas(billetera.saldo)}</p>
        </div>
        <ul className="flex flex-col gap-2">
          <li className="flex items-center gap-2.5 rounded-xl bg-n0/[.08] px-3 py-2 text-[14px] text-n0"><Icon name="ticket" size={18} className="text-amarillo" /><span><b className="text-amarillo">1 Lana = 1 chance</b> en cualquier sorteo</span></li>
          {billetera.porVencer.lanas > 0 && <li className="flex items-center gap-2.5 rounded-xl bg-n0/[.08] px-3 py-2 text-[14px] text-n0"><Icon name="reloj" size={18} className="text-amarillo" /><span><b className="text-amarillo">{formatoLanas(billetera.porVencer.lanas)} Lanas</b> vencen el {billetera.porVencer.fecha}</span></li>}
        </ul>
        {!billetera.puedeGastar && <p className="text-xs font-semibold text-amarillo">Reactiva tu plan para usar tus Lanas.</p>}
        <div className="mt-auto flex items-end gap-3">
          <div className="flex flex-1 flex-col gap-2.5">{botones}</div>
          <ImagenOpcional src="assets/oveja-08.webp" className="oveja-quieta -mb-2 -mr-2 h-[132px] w-auto shrink-0 object-contain" />
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3 rounded-[24px] bg-hero-brand p-5">
      <p className="text-[10px] font-bold tracking-[1.4px] text-n0">MI BILLETERA</p>
      <div className="flex items-center gap-2.5">
        <MonedaLana size={38} />
        <p className="text-[44px] font-black leading-[46px] text-amarillo">{formatoLanas(billetera.saldo)}</p>
      </div>
      <p className="text-[13px] leading-[19px] text-n40">
        1 Lana = 1 chance{billetera.porVencer.lanas > 0 && ` · ${billetera.porVencer.lanas} Lanas vencen el ${billetera.porVencer.fecha}`}
      </p>
      {!billetera.puedeGastar && <p className="text-xs font-semibold text-amarillo">Reactiva tu plan para usar tus Lanas{billetera.bloqueadas > 0 ? ` (${formatoLanas(billetera.bloqueadas)} bloqueadas)` : ''}.</p>}
      <div className="flex gap-2.5">{botones}</div>
    </div>
  );
}

const CICLO: Record<string, string> = { SEMANAL: '↻ CADA SEMANA', MENSUAL: '↻ CADA MES', 'ÚNICA': '★ UNA SOLA VEZ', UNICA: '★ UNA SOLA VEZ', SIEMPRE: '∞ SIEMPRE' };
export function CardMision({ m }: { m: Mision }) {
  const [copiado, setCopiado] = useState(false);
  const usuario = { codigoReferido: useReferidos().codigo };
  const accion = m.cta.variant === 'link' ? (
    <ButtonCompacto
      variant="link"
      className="self-start"
      icon={m.id === 'referidos' ? 'copiar' : undefined}
      iconRight="flecha"
      onClick={() => {
        if (m.id === 'referidos') { navigator.clipboard?.writeText(usuario.codigoReferido).catch(() => {}); setCopiado(true); }
      }}
    >
      {m.id === 'referidos' && copiado ? '¡Código copiado!' : m.cta.texto}
    </ButtonCompacto>
  ) : (
    <ButtonCompacto variant="oscuro" iconRight="flecha" className="self-start">{m.cta.texto}</ButtonCompacto>
  );
  return (
    <div className={cx('flex h-full flex-col gap-2.5 rounded-2xl bg-n0 p-5', m.destacada && 'ring-[2.5px] ring-inset ring-amarillo')}>
      <div className="flex items-center gap-2">
        {m.destacada ? <Badge tone="rosa" className="w-fit">★ MAYOR RECOMPENSA</Badge> : <Badge tone="base" className="w-fit">{CICLO[(m.ciclo ?? '').toUpperCase()] ?? m.ciclo}</Badge>}
        <div className="flex-1" />
        {m.recompensa && <Badge tone="verde">{m.recompensa}</Badge>}
      </div>
      <p className="text-lg font-extrabold leading-6 text-cafe">{m.titulo}{m.destacada && m.ciclo && <span className="ml-2 align-middle text-[11px] font-bold text-n60">· {m.ciclo}</span>}</p>
      <p className="text-[13px] leading-[19px] text-n60">{m.descripcion}</p>
      <div className="flex items-center gap-2.5">
        <Barra valor={m.avance} total={m.meta} />
        <span className="shrink-0 text-[13px] font-bold text-cafe">{m.etiquetaAvance ?? `${m.avance}/${m.meta}`}</span>
      </div>
      <div className="mt-auto">{m.cta.to ? <Link to={m.cta.to} className="w-fit">{accion}</Link> : accion}</div>
    </div>
  );
}

export function CardProgresoMisiones() {
  const desafioVip = useDesafioVip();
  if (!desafioVip.requisitos.length) return null;
  const hechas = desafioVip.requisitos.filter((r) => r.hecha).length;
  const total = desafioVip.requisitos.length;
  return (
    <div className="flex flex-col gap-4 rounded-[24px] bg-n0 p-6">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-n60">MISIONES DE {desafioVip.mes}</p>
        <span className="rounded-pill bg-amarillo px-2.5 py-1 text-[13px] font-bold text-cafe">{hechas} de {total}</span>
      </div>
      <p className="text-[22px] font-black text-cafe">Llevas {hechas} de {total} misiones VIP</p>
      <Barra valor={hechas} total={total} alto={10} />
      <div className="flex items-center gap-2.5 text-cafe">
        <Icon name="trofeo" size={20} />
        <p className="flex-1 text-sm font-medium">Completa las {total} antes del {desafioVip.cierre} y elige tu sorteo VIP gratis.</p>
      </div>
      <Link to="/misiones" className="w-fit"><ButtonCompacto variant="oscuro" iconRight="flecha">Ver mis misiones</ButtonCompacto></Link>
    </div>
  );
}

export function CardRequisitosVip() {
  const desafioVip = useDesafioVip();
  if (!desafioVip.hayAcceso) return null;
  if (!desafioVip.requisitos.length) {
    return <div className="rounded-[20px] bg-hero-brand p-5 text-n0"><p className="text-xl font-extrabold">Sorteos VIP · Próximamente</p><p className="text-sm text-n0/80">Te avisaremos cuando se abra el próximo desafío.</p></div>;
  }
  const hechas = desafioVip.requisitos.filter((r) => r.hecha).length;
  const total = desafioVip.requisitos.length;
  const faltan = total - hechas;
  return (
    <div className="flex h-full flex-col gap-3.5 rounded-[20px] bg-hero-brand p-5">
      <div className="flex items-center gap-3">
        <div className="flex flex-1 flex-col gap-0.5">
          <p className="text-[11px] font-bold text-n0/70">MISIONES VIP DE {desafioVip.mes}</p>
          <p className="text-xl font-extrabold leading-6 text-n0">Llevas {hechas} de {total} misiones VIP</p>
        </div>
        <span className="rounded-pill bg-amarillo px-2.5 py-1.5 text-sm font-black text-cafe">{hechas}/{total}</span>
      </div>
      <Barra valor={hechas} total={total} color="amarillo" fondo="claro" />
      {faltan > 0 && (
        <div className="flex items-center gap-2.5 rounded-xl border border-amarillo/35 bg-amarillo/[.14] px-3.5 py-3 text-amarillo">
          <Icon name="alerta" size={20} />
          <p className="flex-1 text-sm font-semibold leading-[19px]">Te falta {faltan} para entrar a los Sorteos VIP. Cierra el {desafioVip.cierre}</p>
        </div>
      )}
      <ul className="flex flex-col gap-2">
        {desafioVip.requisitos.map((r) => (
          <li key={r.texto} className="flex items-center gap-2.5 rounded-xl bg-n0/[.08] px-3 py-2.5">
            <span className="flex rounded-pill bg-n0/[.12] p-1.5 text-n0"><Icon name={r.icono as IconName} size={16} /></span>
            <span className="flex-1 text-sm font-semibold text-n0">{r.texto}</span>
            <span className="text-[13px] font-bold text-amarillo">{r.estado}</span>
            <Icon name="chevron" size={18} className="text-n0/70" />
          </li>
        ))}
      </ul>
      <p className="text-[13px] leading-[19px] text-n0/80">Al completar el desafío eliges un sorteo VIP gratis. Los demás sorteos VIP se pagan solo con Lanas.</p>
    </div>
  );
}

export function CodigoReferido({ grande }: { grande?: boolean }) {
  const [copiado, setCopiado] = useState(false);
  const usuario = { codigoReferido: useReferidos().codigo };
  return (
    <div className="flex min-h-[72px] items-center gap-3 rounded-2xl border-[1.5px] border-dashed border-amarillo bg-crema py-3 pl-4 pr-2.5">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="text-[10px] font-bold tracking-[1.4px] text-n60">TU CÓDIGO</p>
        <p className={cx('whitespace-nowrap font-black leading-tight tracking-[-0.2px] text-cafe', grande ? 'text-[14px] min-[380px]:text-[15px] min-[400px]:text-lg sm:text-xl lg:text-2xl' : 'text-[14px] min-[380px]:text-[15px]')}>{usuario.codigoReferido}</p>
      </div>
      <button
        onClick={() => { navigator.clipboard?.writeText(usuario.codigoReferido).catch(() => {}); setCopiado(true); }}
        className="flex shrink-0 items-center gap-1.5 rounded-pill bg-cafe px-3.5 py-3 text-sm font-bold text-n0 min-[400px]:px-4"
      >
        <Icon name="copiar" size={16} />{copiado ? 'Copiado' : 'Copiar'}
      </button>
    </div>
  );
}

type BeneficioVista = { id?: string; titulo: string; comercio: string; logo?: string; ubicacion?: string; uso: string; etiqueta: string; ahorro: string; foto?: string; agotado?: boolean };

function ModalUsarBeneficio({ b, abierto, onCerrar }: { b: BeneficioVista; abierto: boolean; onCerrar: () => void }) {
  const { logueado } = useSesion();
  const usuario = useUsuario();
  const { detalle: dt, cargando } = useDetalleBeneficio(b.id, abierto);
  const [res, setRes] = useState<{ codigo?: string; enlace?: string; qr?: string } | null>(null);
  const [soloSuscriptores, setSoloSuscriptores] = useState(false);
  const [verTerminos, setVerTerminos] = useState(false);
  const externo = dt?.metodo === 'EXTERNAL';
  const usar = useAccion(async () => {
    if (externo) {
      const c = await beneficiosApi.canjearExterno(b.id!).catch(() => beneficiosApi.cuponExterno(b.id!));
      return { promoCode: c?.coupon?.code, qr: c?.coupon?.qrUrl ?? undefined } as T.Activacion & { qr?: string };
    }
    return beneficiosApi.activar(b.id!);
  }, (r) => {
    const x = r as (T.Activacion & { qr?: string }) | null;
    setRes(x ? { codigo: x.promoCode, enlace: x.redirectUrl, qr: x.qr } : { codigo: 'AKITA-DEMO' });
    if (x?.redirectUrl && !x.promoCode) window.open(x.redirectUrl, '_blank', 'noopener');
    invalidar('misiones');
    invalidar(`beneficio:${b.id}`);
  }, (e) => { if (e instanceof ApiError && e.code === 'BENEFIT_ACTIVATION_SUBSCRIBERS_ONLY') setSoloSuscriptores(true); });
  const yaActivo = res ?? dt?.activado ?? null;
  const textoBoton = dt?.metodo === 'REDIRECT_LINK' ? 'Ir al comercio' : dt?.metodo === 'IN_PERSON' ? 'Usar beneficio' : externo ? 'Generar mi cupón' : 'Obtener código';
  const noDisponible = (dt && !dt.disponible) || (b.agotado && !yaActivo);
  return (
    <Modal abierto={abierto} onCerrar={onCerrar}>
      <div className="flex flex-col gap-4 pt-2">
        <div className="flex items-center gap-3 pr-8">
          <LogoMarca src={b.logo} nombre={b.comercio} />
          <div className="flex min-w-0 flex-col">
            {b.etiqueta && <span className="w-fit rounded-md bg-verde px-[7px] py-[2px] text-[11px] font-black text-cafe">{b.etiqueta}</span>}
            <h2 className="text-2xl font-black text-cafe">{b.titulo}</h2>
            <p className="text-sm text-n60">{b.comercio} · {b.uso}{b.ubicacion ? ` · ${b.ubicacion}` : ''}</p>
          </div>
        </div>
        {dt?.descripcion && <p className="text-[15px] leading-[22px] text-cafe">{dt.descripcion}</p>}
        <dl className="grid grid-cols-[110px_1fr] gap-x-3 gap-y-2 rounded-2xl bg-n5 p-4 text-[13px]">
          {dt?.vigencia && <><dt className="text-n60">Vigencia</dt><dd className="font-semibold text-cafe">{dt.vigencia}</dd></>}
          <dt className="text-n60">Dónde</dt><dd className="font-semibold text-cafe">{dt?.cobertura || b.comercio || 'Marcas aliadas'}</dd>
          <dt className="text-n60">Cómo se usa</dt><dd className="font-semibold text-cafe">{dt?.metodo === 'IN_PERSON' ? 'Presenta tu DNI en el comercio' : b.uso}</dd>
          {logueado && dt?.usos && <><dt className="text-n60">Usos</dt><dd className="font-semibold text-cafe">{dt.usos}</dd></>}
          {!dt && <><dt className="text-n60">Condiciones</dt><dd className="font-semibold text-cafe">{cargando ? 'Cargando…' : 'Incluido en tu suscripción.'}</dd></>}
        </dl>
        {dt && dt.condiciones.length > 0 && (
          <ul className="flex flex-col gap-1.5 text-[13px] leading-[19px] text-n60">
            {dt.condiciones.map((c) => <li key={c} className="flex gap-2"><span className="mt-[7px] size-1 shrink-0 rounded-pill bg-n60" />{c}</li>)}
          </ul>
        )}
        {dt?.nota && <p className="text-xs leading-[17px] text-n60">{dt.nota}</p>}
        {dt && (dt.terminos || dt.terminosUrl) && (dt.terminosUrl && !dt.terminos
          ? <a href={dt.terminosUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 self-start text-[13px] font-bold underline"><Icon name="info" size={16} />Términos y condiciones</a>
          : <div className="flex flex-col gap-1.5">
              <button type="button" onClick={() => setVerTerminos((v) => !v)} aria-expanded={verTerminos} className="flex items-center gap-1.5 self-start text-[13px] font-bold underline"><Icon name="info" size={16} />Términos y condiciones</button>
              {verTerminos && <p className="rounded-xl bg-n5 p-3 text-[13px] leading-[19px] text-n60">{dt.terminos}</p>}
            </div>)}
        {!logueado || soloSuscriptores || (logueado && !usuario.tieneSuscripcion && !yaActivo) ? (
          <>
            <p className="text-[13px] text-n60">Este beneficio es para suscriptores. Actívalo desde tu primer mes.</p>
            <Link to="/planes" onClick={onCerrar}><Button full>Suscríbete</Button></Link>
          </>
        ) : (
          <>
            {yaActivo && (
              <div className="flex flex-col gap-3 rounded-2xl bg-n0 p-4">
                <span className="w-fit rounded-pill bg-verde/30 px-2.5 py-1 text-xs font-bold text-cafe">Ya lo activaste</span>
                {yaActivo.codigo && <CodigoCopiable codigo={yaActivo.codigo} />}
                {'qr' in yaActivo && yaActivo.qr && <img src={yaActivo.qr} alt="Código QR del cupón" className="mx-auto size-40 rounded-xl bg-n0 object-contain p-2" />}
                {yaActivo.enlace && <a href={yaActivo.enlace} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-error underline">Ir al comercio</a>}
                {!yaActivo.codigo && !yaActivo.enlace && <p className="text-sm text-cafe">Muestra tu DNI en el comercio para usar este beneficio.</p>}
              </div>
            )}
            {usar.error && !soloSuscriptores && <p role="alert" className="text-xs font-semibold text-error">{usar.error}</p>}
            <Button full disabled={usar.enviando || !!noDisponible} className="disabled:opacity-40" onClick={usar.ejecutar}>
              {noDisponible ? 'No disponible' : usar.enviando ? 'Generando…' : textoBoton}
            </Button>
          </>
        )}
      </div>
    </Modal>
  );
}

export function CardBeneficioMini({ b, i, ancho = 140, conCta }: { b: BeneficioVista; i: number; ancho?: number; conCta?: boolean }) {
  const [abierto, setAbierto] = useState(false);
  return (
    <div role="button" tabIndex={0} onClick={() => setAbierto(true)} onKeyDown={(e) => e.key === 'Enter' && setAbierto(true)}
      className={cx('flex shrink-0 cursor-pointer flex-col overflow-hidden rounded-2xl bg-n0 text-left transition hover:shadow-card', conCta ? 'lg:flex-1' : '')} style={conCta ? undefined : { width: ancho }}>
      <Foto src={b.foto} alt={b.titulo} tono={i + 1} className={conCta ? 'h-[86px] lg:h-[180px]' : 'h-[86px]'}>
        <span className="absolute left-2 top-2 z-10 rounded-md bg-verde px-[7px] py-[3px] text-[11px] font-black text-cafe">{b.etiqueta}</span>
        {b.logo && (b.foto
          ? <LogoMarca src={b.logo} nombre={b.comercio} tamano="sm" className="absolute bottom-2 right-2 z-10" />
          : <span className="absolute inset-0 z-10 flex items-center justify-center"><LogoMarca src={b.logo} nombre={b.comercio} tamano="lg" /></span>)}
      </Foto>
      <div className={cx('flex items-center justify-between gap-2', conCta ? 'px-2.5 py-2 lg:p-4' : 'px-2.5 py-2')}>
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className={cx('font-bold leading-[16px] text-cafe', conCta ? 'text-[13px] lg:text-base lg:leading-5' : 'text-[13px]')}>{b.titulo}</p>
          <p className="text-[11px] leading-[14px] text-n60 lg:text-xs">{b.comercio} · {b.uso}</p>
        </div>
        {conCta && <ButtonCompacto variant="oscuro" className="hidden lg:inline-flex" onClick={() => setAbierto(true)}><Tx k="beneficios.cta.ver" /></ButtonCompacto>}
      </div>
      {conCta && <div className="px-2.5 pb-2.5 lg:hidden"><ButtonCompacto variant="oscuro" full className="!h-9 !text-xs" onClick={() => setAbierto(true)}><Tx k="beneficios.cta.ver" /></ButtonCompacto></div>}
      <span onClick={(e) => e.stopPropagation()}><ModalUsarBeneficio b={b} abierto={abierto} onCerrar={() => setAbierto(false)} /></span>
    </div>
  );
}

export function CardCanje({ c }: { c: { id?: string; costo: number; titulo: string; detalle: string; bloqueado?: boolean } }) {
  const billetera = useBilletera();
  const [confirmar, setConfirmar] = useState(false);
  const [codigo, setCodigo] = useState<string | null>(null);
  const canje = useAccion(() => lanasApi.canjear(c.id!), (r) => {
    setCodigo(r?.code ?? r?.redemptionInstructions ?? 'Listo');
    invalidar('lanas');
  });
  const falta = !c.bloqueado && c.costo > billetera.saldo ? c.costo - billetera.saldo : 0;
  return (
    <div className={cx('flex w-[150px] shrink-0 flex-col gap-1.5 rounded-2xl p-3.5 lg:w-auto', c.bloqueado ? 'border border-n10 bg-n5' : 'bg-n0')}>
      <div className="flex items-center gap-1.5">
        <MonedaLana />
        <span className={cx('text-lg font-extrabold', c.bloqueado ? 'text-n40' : 'text-cafe')}>{formatoLanas(c.costo)}</span>
      </div>
      <p className={cx('text-[15px] font-bold leading-[19px]', c.bloqueado ? 'text-n40' : 'text-cafe')}>{c.titulo}</p>
      <p className={cx('text-xs leading-4', c.bloqueado ? 'text-n40' : 'text-n60')}>{c.detalle}</p>
      {c.bloqueado ? (
        <span className="flex items-center gap-1 text-[11px] font-bold text-n40"><Icon name="candado" size={14} />BLOQUEADO</span>
      ) : falta > 0 ? (
        <span className="text-xs font-bold text-n60">TE FALTAN {formatoLanas(falta)}</span>
      ) : codigo ? (
        <span className="break-all text-xs font-black text-verde-texto">✓ {codigo}</span>
      ) : confirmar ? (
        <span className="flex flex-col gap-1">
          <span className="text-[11px] text-n60">Se descuentan {formatoLanas(c.costo)} Lanas. No se puede deshacer.</span>
          <span className="flex gap-3">
            <button className="text-xs font-bold text-error" disabled={canje.enviando} onClick={canje.ejecutar}>{canje.enviando ? 'CANJEANDO…' : 'CONFIRMAR'}</button>
            <button className="text-xs font-bold text-n60" onClick={() => setConfirmar(false)}>CANCELAR</button>
          </span>
          {canje.error && <span role="alert" className="text-[11px] font-semibold text-error">{canje.error}</span>}
        </span>
      ) : (
        <button className="w-fit text-xs font-bold text-error" disabled={!billetera.puedeGastar} onClick={() => setConfirmar(true)}>CANJEAR</button>
      )}
    </div>
  );
}
