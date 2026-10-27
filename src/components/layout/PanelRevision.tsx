import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDemo, type EstadoCofre, type EstadoFlash } from '../../data/revision';
import { useSesion } from '../../data/sesion';
import { cx } from '../ui/primitives';

const estadosCofre: { id: EstadoCofre; t: string }[] = [
  { id: 'disponible', t: 'Disponible' }, { id: 'pocos', t: 'Quedan pocos · Lanas agotadas' }, { id: 'agotado', t: 'Todo agotado' },
];
const estadosFlash: { id: EstadoFlash; t: string }[] = [
  { id: 'disponible', t: 'Disponible' }, { id: 'pocos', t: 'Quedan pocas' }, { id: 'opcionAgotada', t: 'Lanas agotadas' }, { id: 'agotado', t: 'Todo agotado' },
];

export function PanelRevision() {
  const d = useDemo();
  const sesion = useSesion();
  const navigate = useNavigate();
  const [abierto, setAbierto] = useState(false);
  return (
    <div className="fixed bottom-[96px] right-3 z-40 flex flex-col items-end lg:bottom-5 lg:right-5">
      {abierto && (
        <div className="mb-2 flex w-[280px] flex-col gap-3 rounded-2xl bg-n0 p-4 text-cafe shadow-card ring-1 ring-n10">
          <Grupo titulo="Perfil" valor={sesion.logueado ? 'con' : 'sin'} opciones={[{ id: 'sin', t: 'Sin sesión' }, { id: 'con', t: 'Con sesión' }]}
            onChange={async (v) => {
              if (v === 'con') { if (sesion.modoMock) { sesion.iniciar(); navigate('/'); } else navigate('/ingresar'); }
              else { await sesion.cerrar(); navigate('/'); }
            }} />
          <label className="flex items-center justify-between gap-3 text-sm font-bold">
            Resaltar textos
            <input type="checkbox" checked={d.revision} onChange={(e) => d.setRevision(e.target.checked)} className="size-5 accent-cafe" />
          </label>
          <div className="flex flex-col gap-1 text-[11px] leading-4 text-n60">
            <span><span className="mr-1.5 inline-block size-2.5 rounded-sm bg-rosa align-middle" />Provisional: cambia con el PDF v2</span>
            <span><span className="mr-1.5 inline-block size-2.5 rounded-sm bg-azul align-middle" />Por validar: depende de negocio</span>
            <span>Sin marca: texto cerrado</span>
          </div>
          <Grupo titulo="Cofre semanal" valor={d.cofre} opciones={estadosCofre} onChange={d.setCofre} />
          <Grupo titulo="Beneficio Flash" valor={d.flash} opciones={estadosFlash} onChange={d.setFlash} />
        </div>
      )}
      <button onClick={() => setAbierto(!abierto)}
        className="rounded-pill bg-cafe px-4 py-2.5 text-xs font-bold text-amarillo shadow-card">
        {abierto ? 'Cerrar revisión' : 'Modo revisión'}
      </button>
    </div>
  );
}

function Grupo<T extends string>({ titulo, valor, opciones, onChange }: { titulo: string; valor: T; opciones: { id: T; t: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-[11px] font-bold tracking-[1px] text-n60">{titulo.toUpperCase()}</p>
      <div className="flex flex-wrap gap-1.5">
        {opciones.map((o) => (
          <button key={o.id} onClick={() => onChange(o.id)}
            className={cx('rounded-pill px-2.5 py-1.5 text-[11px] font-bold', valor === o.id ? 'bg-cafe text-n0' : 'bg-fondo text-cafe')}>
            {o.t}
          </button>
        ))}
      </div>
    </div>
  );
}
