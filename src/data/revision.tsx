import { createContext, useContext, useState, type ReactNode } from 'react';
import { estadoTexto, tx, type ClaveTexto } from './textos';
import { initRevision } from './assets';

export type EstadoCofre = 'disponible' | 'pocos' | 'agotado';
export type EstadoFlash = 'disponible' | 'pocos' | 'opcionAgotada' | 'agotado';

type Demo = {
  revision: boolean; setRevision: (v: boolean) => void;
  cofre: EstadoCofre; setCofre: (v: EstadoCofre) => void;
  flash: EstadoFlash; setFlash: (v: EstadoFlash) => void;
  eleccionCofre: Eleccion; setEleccionCofre: (v: Eleccion) => void;
  eleccionFlash: Eleccion; setEleccionFlash: (v: Eleccion) => void;
  saldoLanas: SaldoLanas; setSaldoLanas: (v: SaldoLanas) => void;
  sumadas: Record<string, number>; sumarChances: (premio: string, n: number) => void;
};
export type Eleccion = null | 'premio' | 'lanas';
export type SaldoLanas = 'normal' | 'poco' | 'cero';

const Ctx = createContext<Demo | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [revision, setRevision] = useState(initRevision?.revision ?? false);
  const [cofre, setCofre] = useState<EstadoCofre>((initRevision?.cofre as EstadoCofre) ?? 'disponible');
  const [flash, setFlash] = useState<EstadoFlash>((initRevision?.flash as EstadoFlash) ?? 'disponible');
  const [eleccionCofre, setEleccionCofre] = useState<Eleccion>(null);
  const [eleccionFlash, setEleccionFlash] = useState<Eleccion>(null);
  const [saldoLanas, setSaldoLanas] = useState<SaldoLanas>('normal');
  const [sumadas, setSumadas] = useState<Record<string, number>>({});
  const sumarChances = (premio: string, n: number) => setSumadas((s) => ({ ...s, [premio]: (s[premio] ?? 0) + n }));
  return (
    <Ctx.Provider value={{ revision, setRevision, cofre, setCofre: (v) => { setCofre(v); setEleccionCofre(null); }, flash, setFlash: (v) => { setFlash(v); setEleccionFlash(null); }, eleccionCofre, setEleccionCofre, eleccionFlash, setEleccionFlash,
      saldoLanas, setSaldoLanas, sumadas, sumarChances }}>
      {children}
    </Ctx.Provider>
  );
}

export function useDemoOpcional() { return useContext(Ctx); }

export function useDemo() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useDemo fuera de DemoProvider');
  return c;
}

export function Tx({ k, v }: { k: ClaveTexto; v?: Record<string, string | number> }) {
  const { revision } = useDemo();
  const estado = estadoTexto(k);
  const texto = tx(k, v);
  if (!revision || estado === 'final') return <>{texto}</>;
  return (
    <span
      title={`${estado === 'provisional' ? 'Provisional (PDF v2)' : 'Por validar con negocio'} · ${k}`}
      className={estado === 'provisional'
        ? 'rounded-sm bg-rosa/25 outline outline-2 outline-offset-1 outline-dashed outline-rosa-fuerte'
        : 'rounded-sm bg-azul/20 outline outline-2 outline-offset-1 outline-dashed outline-azul'}
    >
      {texto}
    </span>
  );
}
