import type { MarcaId } from './LogoMarca';

export const flash = {
  imagen: 'img/3d/flash-farmacia-3d.webp' as string | undefined,
  descuento: '40%',
  detalle: 'en tu farmacia',
  detalleCorto: 'OFF en farmacia',
  comercio: 'Botica Bienestar',
  marca: 'botica' as MarcaId,
  proximo: 'vie 6 nov · 8:00 a. m.',
  vence: 'vence hoy a las 11:59 p. m.',
  terminaEn: '04:54:26',
  usados: 312,
  cupo: 500,
  lanas: 40,
  lanasStock: 64,
  lanasTotal: 100,
  codigo: 'AKT-FARMA40',
  terminos: 'Válido en medicamentos de venta libre, vitaminas y cuidado personal en locales de Lima. No aplica a productos con receta médica ni a leches infantiles. Un uso por persona. No acumulable con otras promociones.',
};

export const flash2: typeof flash = {
  imagen: undefined, descuento: '2x1', detalle: 'en entradas de cine', detalleCorto: '2x1 en cine', comercio: 'Cinemark', marca: 'cinemark' as MarcaId,
  proximo: 'vie 6 nov · 8:00 a. m.', vence: 'vence hoy a las 11:59 p. m.', terminaEn: '07:12:40', usados: 140, cupo: 300,
  lanas: 25, lanasStock: 30, lanasTotal: 60, codigo: 'AKT-CINE2X1', terminos: 'Válido de lunes a jueves en salas tradicionales de Cinemark. Un uso por persona.',
};

const PLAZO_COFRE = 'mié 11 nov · 11:59 p. m.';
const WHATSAPP_COFRE = '934 123 456';

export const premiosCofre = {
  cinemark: {
    lineas: ['Salas Cinemark de todo el Perú', 'Recibes un código y lo canjeas por WhatsApp con tu ID de usuario. Un uso por persona.'],
    titulo: 'Entradas para Cinemark', comercio: 'Cinemark', marca: 'cinemark' as MarcaId, vence: PLAZO_COFRE, codigo: 'CINE-7K2M', quedan: 21,
    instrucciones: `Envíanos por WhatsApp al ${WHATSAPP_COFRE} este código junto con tu ID de usuario hasta el miércoles 11 nov y te enviamos tus entradas. Si no lo envías a tiempo, pierdes el premio.`,
    terminos: [
      'Válido a nivel nacional, de lunes a domingo, incluidos feriados.',
      'No aplica la primera semana de estreno o el tiempo que indique el distribuidor.',
      'No válido para salas 3D, XD, Mega Pantalla, butacas D-BOX ni salas Confort.',
      'No válido para contenido alternativo.',
      'Válido para canje presencial o virtual (incluye la comisión de canje virtual).',
      'Vigencia de 3 a 4 meses. Las entradas no son renovables.',
      'Hasta agotar stock.',
      'Tienes hasta el miércoles siguiente a la apertura del cofre para enviarnos por WhatsApp el código junto con tu ID de usuario. Si no lo envías a tiempo, pierdes el premio.',
    ],
  },
  trattoria: {
    lineas: ['La Bodega de la Trattoria · Jockey Plaza', 'Recibes un código y lo canjeas por WhatsApp. Luego recoges tu vale en el Jockey Plaza.'],
    titulo: 'Almuerzo hasta S/ 70', comercio: 'La Bodega de la Trattoria', marca: 'trattoria' as MarcaId, vence: PLAZO_COFRE, codigo: 'TRAT-4P9X', quedan: 9,
    instrucciones: `Envíanos por WhatsApp al ${WHATSAPP_COFRE} este código junto con tu ID de usuario hasta el miércoles 11 nov. Luego recoge tu vale en el Jockey Plaza y preséntalo en físico con tu DNI en el local. Si no lo envías a tiempo, pierdes el premio.`,
    terminos: [
      'Hasta S/ 70 de consumo. Si el consumo es mayor, pagas la diferencia.',
      'Válido solo en el local del Jockey Plaza.',
      'El vale es válido hasta el 1 de diciembre de 2026.',
      'No aplica con otras promociones ni descuentos.',
      'Recoge tu vale en el Jockey Plaza. Para usarlo, presenta tu DNI y el vale en físico.',
      'Hasta agotar stock.',
      'Tienes hasta el miércoles siguiente a la apertura del cofre para enviarnos por WhatsApp el código junto con tu ID de usuario. Si no lo envías a tiempo, pierdes el premio.',
    ],
  },
};

export const cofre = {
  disponibleHasta: 'mié 11:59 p. m.',
  proximo: 'jue 8:00 a. m.',
  quedan: 38,
  total: 120,
  premio: premiosCofre.cinemark,
  alternativa: { lanas: 30, quedan: 12 },
  entregados: [
    { titulo: 'Entradas para Cinemark', marca: 'cinemark' as MarcaId, cantidad: 60 },
    { titulo: '30 Lanas', cantidad: 40 },
    { titulo: 'Almuerzo hasta S/ 70', marca: 'trattoria' as MarcaId, cantidad: 20 },
  ],
};
