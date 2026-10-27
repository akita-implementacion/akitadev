export type PlanId = 'lanita' | 'lanota' | 'lanaza';
export type Periodo = 'mensual' | 'semestral' | 'anual';

export type Plan = {
  id: PlanId;
  nombre: string;
  etiqueta: string;
  subtitulo: string;
  chances: number;
  precios: Record<Periodo, number>;
  color: 'verde' | 'amarillo' | 'rosa';
  oscuro?: boolean;
  imagen: string;
};

export const PLANES: Plan[] = [
  { id: 'lanita', nombre: 'LANITA', etiqueta: 'TU PRIMERA LANA', subtitulo: 'Empieza a participar', chances: 1,
    precios: { mensual: 7.5, semestral: 28, anual: 50 }, color: 'verde', imagen: 'img/oveja-plan-lanita.webp' },
  { id: 'lanota', nombre: 'LANOTA', etiqueta: 'RECOMENDADO', subtitulo: 'Más oportunidades', chances: 3,
    precios: { mensual: 12.5, semestral: 54, anual: 95 }, color: 'amarillo', imagen: 'img/oveja-plan-lanota.webp' },
  { id: 'lanaza', nombre: 'LANAZA', etiqueta: 'MÁS CHANCES', subtitulo: 'Vive la experiencia completa', chances: 5,
    precios: { mensual: 17.5, semestral: 80, anual: 125 }, color: 'rosa', oscuro: true, imagen: 'img/oveja-plan-lanaza.webp' },
];

export const PERIODOS: { id: Periodo; label: string; meses: number; sufijo: string }[] = [
  { id: 'mensual', label: 'Mensual', meses: 1, sufijo: 'al mes' },
  { id: 'semestral', label: 'Semestral', meses: 6, sufijo: 'cada 6 meses' },
  { id: 'anual', label: 'Anual', meses: 12, sufijo: 'al año' },
];

export function ahorro(plan: Plan, periodo: Periodo): number {
  const meses = PERIODOS.find((p) => p.id === periodo)!.meses;
  if (meses === 1) return 0;
  return Math.round((1 - plan.precios[periodo] / (plan.precios.mensual * meses)) * 100);
}

export function soles(n: number): string {
  return `S/ ${Number.isInteger(n) ? n : n.toFixed(2)}`;
}

export const planPorId = (id: string | null | undefined) => PLANES.find((p) => p.id === id) ?? PLANES[1];

export const MEDIOS_PAGO: Record<Periodo, ('tarjeta' | 'yape')[]> = {
  mensual: ['tarjeta'],
  semestral: ['tarjeta', 'yape'],
  anual: ['tarjeta', 'yape'],
};

export const PRECIO_CHANCE = { lanas: 1, soles: 1 };
export const VIGENCIA_LANAS_MESES = 3;

export const FLAGS = {
  codigoChances: true,
  miAnio: false,
  loginSocial: false,
  ahorroEstimado: false,
};
