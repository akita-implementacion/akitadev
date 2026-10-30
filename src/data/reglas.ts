
export const PRECIO_CHANCE = { lanas: 1, soles: 1 };

export const VIGENCIA_LANAS_MESES = 3;

export const REFERIDO = { prefijos: ['YK', 'AK'], largo: 12, lanasInvitado: 100 };

export const FLAGS = {
  codigoChances: true,
  miAnio: false,
};

export function soles(n: number): string {
  return `S/ ${Number.isInteger(n) ? n : n.toFixed(2)}`;
}
