import { config } from '../api/config';
import { useState } from 'react';
import { Contenido } from '../components/layout/Hero';
import { HeroCarrusel } from '../components/layout/HeroCarrusel';
import { promosSorteos } from '../data/mock';
import { BannerVip, CardPremio, CardRequisitosVip, CardSorteoDestacado } from '../components/cards/cards';
import { FilaAuto } from '../components/ui/Carrusel';
import { cx } from '../components/ui/primitives';
import { Tx } from '../data/revision';
import { Icon } from '../components/ui/Icon';
import { useLocation } from 'react-router-dom';
import { useBanners, useFechasSorteo, useProximosSorteos, useUltimosGanadores, useUsuario } from '../data/datos';
import { EstadoVacio, GanadoresUltimoSorteo } from '../components/publico/Secciones';
import { useSesion } from '../data/sesion';

const iso = (d: Date) => d.toLocaleDateString('en-CA', { timeZone: 'America/Lima' });

export default function Sorteos() {
  const { modoMock } = useSesion();
  const usuario = useUsuario();
  type Vista = 'premios' | 'exclusivos' | 'ganadores';
  const pedida = (useLocation().state as { vista?: 'vip' | Vista } | null)?.vista;
  const [vista, setVista] = useState<Vista>(pedida === 'vip' ? 'exclusivos' : pedida ?? 'premios');
  const pestanas = ([['premios', 'Premios'], ['exclusivos', 'Exclusivos'], ['ganadores', 'Ganadores']] as const)
    .filter(([id]) => id !== 'exclusivos' || usuario.tieneSuscripcion);
  const todasLasFechas = useFechasSorteo();
  const hoy = iso(new Date());
  const vigentes = modoMock ? todasLasFechas : todasLasFechas.filter((d) => iso(d) >= hoy);
  const meses = [...new Set(vigentes.map((d) => iso(d).slice(0, 7)))];
  const [mesSel, setMes] = useState<string>();
  const mesActual = mesSel && meses.includes(mesSel) ? mesSel : meses[0] ?? '';
  const fechasSorteo = vigentes.filter((d) => iso(d).startsWith(mesActual));
  const proximos = useProximosSorteos();
  const [fechaSel, setFecha] = useState<string>();
  const fecha = fechaSel && fechasSorteo.some((d) => iso(d) === fechaSel) ? fechaSel : (fechasSorteo[0] ? iso(fechasSorteo[0]) : '');
  const mes = fechasSorteo[0]?.toLocaleDateString('es-PE', { month: 'long', year: 'numeric', timeZone: 'America/Lima' }) ?? '';
  const iMes = meses.indexOf(mesActual);
  const banners = useBanners(usuario.tieneSuscripcion ? ['PRIZES_LOGGED'] : ['RAFFLES_MAIN', 'PRIZES_LOGGED']);
  const proximosSorteos = proximos.filter((p) => !('fechaIso' in p) || !fecha || p.fechaIso === fecha);

  return (
    <>
      <HeroCarrusel color="#FF88F7" titulo={<Tx k="sorteos.hero.titulo" />} bajada={<Tx k="sorteos.hero.bajada" />} pose="sorteos"
        promos={config.usarMock ? promosSorteos : []} banners={config.usarMock ? [] : banners.imagenes} />
      <Contenido>
        <div className="flex w-full gap-1.5 rounded-pill bg-n0 p-1.5 lg:w-fit" role="tablist">
          {pestanas.map(([id, label]) => (
            <button key={id} role="tab" aria-selected={vista === id} onClick={() => setVista(id)}
              className={cx('flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-pill px-3 py-2.5 text-sm font-bold lg:flex-none lg:px-6 lg:text-[15px]', vista === id ? 'bg-cafe text-amarillo' : 'text-cafe')}>
              {id === 'exclusivos' && <Icon name="corona" size={16} className="text-amarillo" />}{label}
            </button>
          ))}
        </div>

        {vista === 'premios' && (
          <>
            <CardSorteoDestacado />

            <h2 className="text-[22px] font-extrabold lg:text-2xl"><Tx k="sorteos.proximos" /></h2>
            <div className="flex w-fit max-w-full flex-col items-stretch gap-2">
              <div className="flex items-center justify-between gap-2 rounded-pill border border-n10 bg-n0 p-1">
                <button aria-label="Mes anterior" disabled={iMes <= 0} onClick={() => setMes(meses[iMes - 1])} className="flex size-7 items-center justify-center rounded-2xl bg-n5 text-base font-bold text-cafe disabled:opacity-30">‹</button>
                <span className="px-1 text-center text-[14px] font-bold capitalize text-cafe">{mes}</span>
                <button aria-label="Mes siguiente" disabled={iMes < 0 || iMes >= meses.length - 1} onClick={() => setMes(meses[iMes + 1])} className="flex size-7 items-center justify-center rounded-2xl bg-n5 text-base font-bold text-cafe disabled:opacity-30">›</button>
              </div>
              <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
                {fechasSorteo.map((d) => {
                  const activo = iso(d) === fecha;
                  return (
                    <button key={iso(d)} onClick={() => setFecha(iso(d))} aria-pressed={activo}
                      className={cx('flex h-[40px] w-[44px] shrink-0 flex-col items-center justify-center rounded-[12px]', activo ? 'bg-cafe' : 'border border-n10 bg-n0')}>
                      <span className={cx('text-[9px] font-bold uppercase leading-3 tracking-[0.8px]', activo ? 'text-amarillo' : 'text-n60')}>{d.toLocaleDateString('es-PE', { weekday: 'short', timeZone: 'America/Lima' }).replace('.', '')}</span>
                      <span className={cx('text-[16px] font-extrabold leading-5', activo ? 'text-n0' : 'text-cafe')}>{d.toLocaleDateString('es-PE', { day: 'numeric', timeZone: 'America/Lima' })}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <FilaAuto className="no-scrollbar -mx-6 flex snap-x gap-3 overflow-x-auto scroll-px-6 px-6 pb-1 lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-5 lg:overflow-visible lg:px-0 [&>*]:snap-start">
              {proximosSorteos.map((p, i) => <CardPremio key={p.premio + i} p={p} i={i} conSesion className="w-[220px] shrink-0 lg:w-auto" />)}
            </FilaAuto>
            {!proximosSorteos.length && <EstadoVacio titulo="Pronto anunciaremos los premios" detalle="Vuelve en unos días para ver los próximos sorteos." />}
          </>
        )}

        {vista === 'ganadores' && (<>
          <GanadoresUltimoSorteo />
          <EstadoVacioGanadores />
        </>)}

        {vista === 'exclusivos' && (
          <div className="grid gap-6 lg:grid-cols-2">
            <BannerVip />
            <CardRequisitosVip />
          </div>
        )}
      </Contenido>
    </>
  );
}

function EstadoVacioGanadores() {
  const { ganadores } = useUltimosGanadores();
  return ganadores.length ? null : <EstadoVacio titulo="Los ganadores se publican después de cada sorteo" detalle="Vuelve el miércoles por la noche." />;
}
