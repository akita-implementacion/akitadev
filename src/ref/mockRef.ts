import type { MarcaId } from './LogoMarca';

export const flash = {
  imagen: 'img/3d/flash-lentes-3d.webp' as string | undefined,
  descuento: '90%',
  detalle: 'en lentes y monturas',
  detalleCorto: 'OFF en lentes',
  comercio: 'Arthur & Sons',
  marca: 'arthur-sons' as MarcaId,
  proximo: 'vie 6 nov · 8:00 a. m.',
  vence: 'vence hoy a las 11:59 p. m.',
  terminaEn: '04:54:26',
  usados: 312,
  cupo: 500,
  lanas: 40,
  lanasStock: 64,
  lanasTotal: 100,
  codigo: 'AKT-90OFF',
  terminos: 'Válido en tiendas Arthur & Sons. Un uso por persona. No acumulable con otras promociones.',
};

export const flash2: typeof flash = {
  imagen: undefined, descuento: '2x1', detalle: 'en entradas de cine', detalleCorto: '2x1 en cine', comercio: 'Cinemark', marca: 'cinemark' as MarcaId,
  proximo: 'vie 6 nov · 8:00 a. m.', vence: 'vence hoy a las 11:59 p. m.', terminaEn: '07:12:40', usados: 140, cupo: 300,
  lanas: 25, lanasStock: 30, lanasTotal: 60, codigo: 'AKT-CINE2X1', terminos: 'Válido de lunes a jueves en salas tradicionales de Cinemark. Un uso por persona.',
};

export const cofre = {
  disponibleHasta: 'mié 11:59 p. m.',
  proximo: 'jue 8:00 a. m.',
  quedan: 38,
  total: 120,
  premio: { titulo: '2x1 en entradas de cine', comercio: 'Cinemark', marca: 'cinemark' as MarcaId, vence: 'dom 15 nov · 11:59 p. m.', codigo: 'CINE-2X1-7K', quedan: 21,
    terminos: 'Válido de lunes a jueves en salas tradicionales de Cinemark de todo el Perú. No válido en estrenos, 3D, XD ni salas premium. Un uso por persona. Sujeto a stock.' },
  alternativa: { lanas: 30, quedan: 12 },
  entregados: [
    { titulo: '2x1 en entradas de cine', marca: 'cinemark' as MarcaId, cantidad: 60 },
    { titulo: '30 Lanas', cantidad: 40 },
    { titulo: '20% OFF en tu cena', marca: 'franklin' as MarcaId, cantidad: 20 },
  ],
};
