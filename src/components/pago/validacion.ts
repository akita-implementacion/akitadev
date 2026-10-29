export const soloDigitos = (v: string) => v.replace(/\D/g, '');
export const formatoTarjeta = (v: string) => soloDigitos(v).slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ');
export const formatoVenc = (v: string) => { const d = soloDigitos(v).slice(0, 4); return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d; };
export const formatoCvv = (v: string) => soloDigitos(v).slice(0, 3);
export const sinTildes = (v: string) => v.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z ]/g, '').toUpperCase().slice(0, 26);
export const formatoCelular = (v: string) => soloDigitos(v).slice(0, 9);
export const formatoCodigoYape = (v: string) => soloDigitos(v).slice(0, 6);

export function luhn(d: string) {
  let suma = 0;
  for (let i = 0; i < d.length; i++) { let n = +d[d.length - 1 - i]; if (i % 2) { n *= 2; if (n > 9) n -= 9; } suma += n; }
  return suma % 10 === 0;
}

export type DatosTarjeta = { numero: string; venc: string; cvv: string; nombre: string };
export type DatosYape = { celular: string; codigo: string };

export function erroresTarjeta(t: DatosTarjeta) {
  const e: Partial<Record<keyof DatosTarjeta, string>> = {};
  const d = soloDigitos(t.numero);
  if (d.length !== 16) e.numero = 'Ingresa los 16 dígitos de tu tarjeta.';
  const m = /^(\d{2})\/(\d{2})$/.exec(t.venc);
  if (!m || +m[1] < 1 || +m[1] > 12) e.venc = 'Escribe el mes y el año (MM/AA).';
  else { const hoy = new Date(); const fin = new Date(2000 + +m[2], +m[1], 0, 23, 59); if (fin < hoy) e.venc = 'Esta tarjeta ya venció.'; }
  if (!/^\d{3}$/.test(t.cvv)) e.cvv = 'Son 3 dígitos, al reverso.';
  if (t.nombre.trim().length < 3) e.nombre = 'Escribe el nombre como aparece en tu tarjeta.';
  return e;
}

export function erroresYape(y: DatosYape) {
  const e: Partial<Record<keyof DatosYape, string>> = {};
  if (!/^9\d{8}$/.test(y.celular)) e.celular = 'Ingresa el celular de 9 dígitos registrado en Yape.';
  if (!/^\d{6}$/.test(y.codigo)) e.codigo = 'El código de aprobación tiene 6 dígitos.';
  return e;
}
