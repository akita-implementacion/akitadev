import { createContext, useContext, type ReactNode } from 'react';
import { config } from '../api/config';
import { asset } from '../data/assets';
import { useFechasSorteo, useProximosSorteos, useSorteoDestacado } from '../data/datos';
import { mesesSorteos, premiosDeFecha, type MesSorteo, type Premio } from './publico';

export type FuenteSorteos = {
  meses: MesSorteo[];
  premiosDe: (m: MesSorteo, dia: number) => Premio[];
  mes?: { nombre?: string; foto?: string; descripcion?: string; basesUrl?: string };
};

const REFERENCIA: FuenteSorteos = { meses: mesesSorteos, premiosDe: premiosDeFecha };
const Ctx = createContext<FuenteSorteos>(REFERENCIA);
export const useFuenteSorteos = () => useContext(Ctx);

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'set', 'oct', 'nov', 'dic'];
const FONDOS: Premio['fondo'][] = ['amarillo', 'rosa', 'azul', 'verde'];
const iso = (d: Date) => d.toLocaleDateString('en-CA', { timeZone: 'America/Lima' });

function enDias(fecha: Date, hoy = new Date()) {
  const cierre = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), 11, 59);
  const dias = Math.round((new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()).getTime() - new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()).getTime()) / 86400000);
  return fecha < hoy ? 'Ya se sorteó' : cierre < hoy ? 'Participación cerrada' : dias === 0 ? 'Hoy' : dias === 1 ? 'Mañana' : `En ${dias} días`;
}

function useFuenteApi(): FuenteSorteos {
  const fechas = useFechasSorteo();
  const proximos = useProximosSorteos();
  const destacado = useSorteoDestacado();
  const hoy = iso(new Date());
  const futuras = fechas.filter((d) => iso(d) >= hoy).sort((a, b) => a.getTime() - b.getTime());
  const meses: MesSorteo[] = [];
  for (const d of futuras) {
    const anio = d.getFullYear(); const indice = d.getMonth();
    let m = meses.find((x) => x.anio === anio && x.indice === indice);
    if (!m) { m = { mes: `${MESES[indice]} ${anio}`, corto: CORTOS[indice], anio, indice, fechas: [] }; meses.push(m); }
    if (!m.fechas.includes(d.getDate())) m.fechas.push(d.getDate());
  }
  if (!meses.length) return REFERENCIA;
  const premiosDe = (m: MesSorteo, dia: number): Premio[] => {
    const clave = `${m.anio}-${String(m.indice + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    const fecha = new Date(m.anio, m.indice, dia, 16);
    const delDia = proximos.filter((p) => 'fechaIso' in p && p.fechaIso === clave);
    if (!delDia.length) return premiosDeFecha(m, dia);
    return delDia.map((p, k) => ({
      id: `${p.id || p.premio}-${clave}`, categoria: p.categoria || 'PREMIO', nombre: p.premio, fondo: FONDOS[k % FONDOS.length],
      fechaSorteo: `Sorteo mié ${dia} ${m.corto}`, enDias: enDias(fecha), fecha, foto: p.foto ? asset(p.foto) : '',
    }));
  };
  const mes = destacado.id ? { nombre: destacado.premio || undefined, foto: destacado.foto ? asset(destacado.foto) : undefined, descripcion: destacado.descripcion, basesUrl: destacado.terminosUrl } : undefined;
  return { meses, premiosDe, mes };
}

export function FuenteSorteosApi({ children }: { children: ReactNode }) {
  const fuente = useFuenteApi();
  return <Ctx.Provider value={config.usarMock ? REFERENCIA : fuente}>{children}</Ctx.Provider>;
}
