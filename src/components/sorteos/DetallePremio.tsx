import { useCallback, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import { Button, Foto } from '../ui/primitives';
import { Bloque, Hoja } from '../ui/Hoja';
import { SumarChances, type SorteoParaChances } from './SumarChances';

export type DetallePremio = { premio: string; fecha: string; foto?: string; descripcion?: string; specs?: string[]; terminos?: string[]; terminosUrl?: string };

const SPECS_GENERALES = ['Participan todos los suscriptores con plan vigente', 'Te contactamos si ganas'];

function TerminosPremio({ terminos }: { terminos: string[] }) {
  const [ver, setVer] = useState(false);
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-n10 bg-n0 p-4">
      <button type="button" onClick={() => setVer((v) => !v)} aria-expanded={ver} className="flex items-center justify-between text-left text-sm font-bold">
        <span className="flex items-center gap-2"><Icon name="info" size={18} />Términos y condiciones del premio</span>
        <Icon name="chevron-abajo" size={18} className={ver ? 'rotate-180' : ''} />
      </button>
      {ver && (
        <ul className="flex flex-col gap-1.5 text-[13px] leading-[19px] text-n60">
          {terminos.map((t) => <li key={t} className="flex gap-2"><span className="mt-[7px] size-1 shrink-0 rounded-pill bg-n60" />{t}</li>)}
        </ul>
      )}
    </div>
  );
}

export function HojaPremio({ p, abierto, onCerrar, accion, nota }: { p: DetallePremio; abierto: boolean; onCerrar: () => void; accion: ReactNode; nota?: string }) {
  const specs = p.specs && p.specs.length ? p.specs : SPECS_GENERALES;
  return (
    <Hoja abierto={abierto} onCerrar={onCerrar} titulo={p.premio} subtitulo={`${p.fecha.replace(/^Sorteo /, '')} · en vivo`}>
      <Foto src={p.foto} alt={p.premio} tono={0} className="h-[180px] rounded-2xl bg-n0 [&_img]:!object-contain" />
      <Bloque>
        <p className="text-[15px] leading-[22px]">{p.descripcion || 'Premio nuevo, sorteado en vivo el miércoles por nuestras redes.'}</p>
        <ul className="flex flex-col gap-1.5">
          {specs.map((s) => <li key={s} className="flex items-center gap-2 text-sm"><Icon name="check" size={16} />{s}</li>)}
        </ul>
      </Bloque>
      {p.terminos && p.terminos.length > 0 && <TerminosPremio terminos={p.terminos} />}
      {p.terminosUrl && <a href={p.terminosUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 self-start text-sm font-bold underline"><Icon name="info" size={18} />Bases del sorteo</a>}
      {accion}
      {nota && <p className="text-center text-[13px] text-n60">{nota}</p>}
    </Hoja>
  );
}

export function usePremioConSesion(p: DetallePremio, sorteo: SorteoParaChances) {
  const [detalle, setDetalle] = useState(false);
  const [chances, setChances] = useState(false);
  const cerrarDetalle = useCallback(() => setDetalle(false), []);
  const cerrarChances = useCallback(() => setChances(false), []);
  const modales = (
    <>
      <HojaPremio p={p} abierto={detalle} onCerrar={cerrarDetalle} nota={`Tu plan ya te da ${sorteo.chancesActuales} chances en este sorteo.`}
        accion={<Button full onClick={() => { setDetalle(false); setChances(true); }}>Sumar chances</Button>} />
      <SumarChances sorteo={sorteo} abierto={chances} onCerrar={cerrarChances} />
    </>
  );
  return { verDetalle: () => setDetalle(true), sumarChances: () => setChances(true), modales };
}

export function useDetallePublico(p: DetallePremio) {
  const navigate = useNavigate();
  const [abierto, setAbierto] = useState(false);
  const cerrar = useCallback(() => setAbierto(false), []);
  const modal = (
    <HojaPremio p={p} abierto={abierto} onCerrar={cerrar} nota="Todos los planes incluyen chances en los sorteos regulares."
      accion={<Button full onClick={() => navigate('/planes')}>Suscríbete para participar</Button>} />
  );
  return { abrir: () => setAbierto(true), modal };
}
