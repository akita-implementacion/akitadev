const DIAS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'set', 'oct', 'nov', 'dic'];
const MESES_LARGO = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'setiembre', 'octubre', 'noviembre', 'diciembre'];

export const fechaCorta = (d: Date) => `${DIAS[d.getDay()]} ${d.getDate()} ${MESES[d.getMonth()]}`;
export const fechaLarga = (d: Date) => `${d.getDate()} de ${MESES_LARGO[d.getMonth()]} de ${d.getFullYear()}`;
export const fechaNum = (d: Date) => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;

export const cierreDe = (sorteo: Date) => new Date(sorteo.getFullYear(), sorteo.getMonth(), sorteo.getDate(), 11, 59);

function ultimoMiercoles(anio: number, mes: number) {
  const d = new Date(anio, mes + 1, 0, 16);
  while (d.getDay() !== 3) d.setDate(d.getDate() - 1);
  return d;
}

export function fechaPremioMes(hoy = new Date()) {
  const este = ultimoMiercoles(hoy.getFullYear(), hoy.getMonth());
  return hoy <= cierreDe(este) ? este : ultimoMiercoles(hoy.getFullYear(), hoy.getMonth() + 1);
}

export function proximoSorteoAbierto(hoy = new Date()) {
  const d = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 16);
  while (d.getDay() !== 3 || hoy > cierreDe(d)) d.setDate(d.getDate() + 1);
  return d;
}

export function sumarMeses(d: Date, meses: number) {
  const r = new Date(d); r.setMonth(r.getMonth() + meses); return r;
}
