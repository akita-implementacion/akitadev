
export type TipoDoc = 'DNI' | 'CE' | 'Pasaporte';

export const DOCUMENTO: Record<TipoDoc, { max: number; min: number; soloDigitos: boolean; ayuda: string }> = {
  DNI: { min: 8, max: 8, soloDigitos: true, ayuda: '8 dígitos' },
  CE: { min: 9, max: 12, soloDigitos: true, ayuda: '9 a 12 dígitos' },
  Pasaporte: { min: 6, max: 12, soloDigitos: false, ayuda: '6 a 12 letras o números' },
};

const LETRAS = /[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]/g;
const CORREO = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/;

function luhn(numero: string) {
  let suma = 0;
  [...numero].reverse().forEach((c, i) => {
    let d = Number(c);
    if (i % 2) { d *= 2; if (d > 9) d -= 9; }
    suma += d;
  });
  return suma % 10 === 0;
}

const digitos = (v: string) => v.replace(/\D/g, '');

export const limpiar = {
  documento: (v: string, tipo: TipoDoc) => {
    const r = DOCUMENTO[tipo];
    return (r.soloDigitos ? digitos(v) : v.replace(/[^A-Za-z0-9]/g, '').toUpperCase()).slice(0, r.max);
  },
  nombre: (v: string) => v.replace(LETRAS, '').replace(/\s{2,}/g, ' ').slice(0, 60),
  celular: (v: string) => digitos(v).slice(0, 9).replace(/(\d{3})(?=\d)/g, '$1 '),
  correo: (v: string) => v.replace(/\s/g, '').slice(0, 100),
  tarjeta: (v: string) => digitos(v).slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 '),
  vencimiento: (v: string) => {
    const d = digitos(v).slice(0, 4);
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  },
  cvv: (v: string, numeroTarjeta = '') => digitos(v).slice(0, digitos(numeroTarjeta).length === 15 ? 4 : 3),
  codigo6: (v: string) => digitos(v).slice(0, 6),
  referido: (v: string) => v.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 20),
  placa: (v: string) => v.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 7),
};

export const validar = {
  documento: (v: string, tipo: TipoDoc) => {
    const r = DOCUMENTO[tipo];
    if (!v) return 'Ingresa tu número de documento';
    if (v.length < r.min || v.length > r.max) return `El ${tipo === 'Pasaporte' ? 'pasaporte' : tipo} debe tener ${r.ayuda}`;
    return '';
  },
  nombre: (v: string, campo: string) => {
    const t = v.trim();
    if (!t) return `Ingresa tus ${campo}`;
    if (t.length < 2) return `Revisa tus ${campo}`;
    return '';
  },
  correo: (v: string) => (!v ? 'Ingresa tu correo' : CORREO.test(v) ? '' : 'Revisa tu correo (ej. nombre@correo.com)'),
  celular: (v: string) => {
    const d = digitos(v);
    if (!d) return 'Ingresa tu celular';
    if (d.length !== 9 || d[0] !== '9') return 'El celular debe tener 9 dígitos y empezar con 9';
    return '';
  },
  clave: (v: string) => (v.length >= 8 && /[A-Z]/.test(v) && /\d/.test(v) ? '' : 'La contraseña debe tener 8 caracteres, una mayúscula y un número'),
  claveIngreso: (v: string) => (!v ? 'Ingresa tu contraseña' : v.length < 8 ? 'La contraseña tiene al menos 8 caracteres' : ''),
  tarjeta: (v: string) => {
    const d = digitos(v);
    if (!d) return 'Ingresa el número de tu tarjeta';
    if (d.length < 15 || !luhn(d)) return 'Revisa el número de tu tarjeta';
    return '';
  },
  vencimiento: (v: string) => {
    const m = /^(\d{2})\/(\d{2})$/.exec(v);
    if (!m) return 'Usa el formato MM/AA';
    const mes = Number(m[1]), anio = 2000 + Number(m[2]);
    if (mes < 1 || mes > 12) return 'El mes debe estar entre 01 y 12';
    const hoy = new Date();
    if (anio < hoy.getFullYear() || (anio === hoy.getFullYear() && mes < hoy.getMonth() + 1)) return 'Esta tarjeta está vencida';
    return '';
  },
  cvv: (v: string, numeroTarjeta = '') => {
    const largo = digitos(numeroTarjeta).length === 15 ? 4 : 3;
    return v.length === largo ? '' : `El CVV tiene ${largo} dígitos`;
  },
  titular: (v: string) => (v.trim().length >= 3 ? '' : 'Escribe el nombre como aparece en la tarjeta'),
  codigo6: (v: string) => (/^\d{6}$/.test(v) ? '' : 'Ingresa los 6 dígitos'),
  referido: (v: string) => (!v || /^[A-Z0-9-]{4,20}$/.test(v) ? '' : 'Revisa el código de tu amigo'),
  placa: (v: string) => (!v.trim() || /^[A-Z0-9]{3}-?[A-Z0-9]{3}$/.test(v.trim()) ? '' : 'Revisa la placa: usa el formato ABC-123'),
};
