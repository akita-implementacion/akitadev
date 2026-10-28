const img = (f: string) => `${import.meta.env.BASE_URL}img/${f}`;

export type Premio = { id: string; categoria: string; nombre: string; fechaSorteo: string; enDias: string; foto: string; fondo: 'amarillo' | 'rosa' | 'azul' | 'verde'; descripcion?: string; specs?: string[];  fecha?: Date };
export type Ganador = { id: string; nombre: string; premio: string; premioCorto?: string; usuario: string; chances: number; fechaSorteo: string; foto: string };
export type Beneficio = { id: string; titulo: string; comercio: string; uso: string; etiqueta: string; categoria: string; foto?: string; logo?: string;  marca?: string };
export type Canje = { id: string; costo: number; titulo: string; detalle: string };
export type Marca = { nombre: string; logo: string };
export type Pregunta = { pregunta: string; respuesta: string };

export type Slide = { id: number; etiqueta: string; titulo: string[]; bajada: string;  dato?: string;
  bajadaCorta?: string; datoCorto?: string; foto: string; tipo: 'personas' | 'premio'; fondo: string; cta: string; to: string; premioMes?: boolean };
export const slides: Slide[] = [
  { id: 1, etiqueta: 'SORTEOS EN VIVO CADA MIÉRCOLES', titulo: ['VIVE', 'GANANDO'],
    bajada: 'Sorteos, descuentos, Cofre y Flash cada miércoles, y Lanas por tus misiones.',
    bajadaCorta: 'Sorteos, descuentos, Cofre y Flash cada miércoles.',
    dato: 'Desde S/7.50 al mes', foto: img('hero-personas.webp'), tipo: 'personas', fondo: '#45E586', cta: 'Elegir mi plan', to: '/planes' },
  { id: 2, etiqueta: 'PREMIO GRANDE DEL MES', titulo: ['GANA UNA', 'KIA NIRO EV'], bajada: 'Camioneta 100 % eléctrica, 0 km, con SOAT y placa.', bajadaCorta: 'Camioneta eléctrica 0 km, con SOAT y placa.',
    foto: img('premio-kia.webp'), tipo: 'premio', fondo: '#FFD400', cta: 'Elige tu plan y participa', to: '/planes?premio=kia', premioMes: true },
  { id: 3, etiqueta: 'CADA MIÉRCOLES', titulo: ['COFRE', 'Y FLASH'], bajada: 'Elige un premio o Lanas en el Cofre y aprovecha el Beneficio Flash.',
    bajadaCorta: 'Elige un premio o Lanas y aprovecha el Flash.',
    dato: '¡Cupos limitados cada semana!', datoCorto: '¡Cupos limitados!', foto: img('3d/cofre-slide.webp'), tipo: 'premio', fondo: '#FF88F7', cta: 'Elegir mi plan', to: '/planes' },
];

export const propuestaValor = [
  { icono: 'estrella' as const, titulo: 'Sorteos en vivo', texto: 'Transmitidos por nuestras redes.' },
  { icono: 'regalo' as const, titulo: 'Beneficios a diario', texto: 'Descuentos en tus marcas favoritas.' },
  { icono: 'buscar' as const, titulo: 'Resultados publicados', texto: 'Publicamos a cada ganador, con su nombre protegido.' },
  { icono: 'oveja' as const, titulo: 'Únete al rebaño', texto: 'La comunidad AKITÁ te espera.' },
];

export const mesSorteos = { mes: 'Octubre 2026', fechas: [7, 14, 21, 28] };

export type MesSorteo = { mes: string; corto: string; anio: number; indice: number; fechas: number[] };
export const mesesSorteos: MesSorteo[] = [
  { mes: 'Octubre 2026', corto: 'oct', anio: 2026, indice: 9, fechas: [7, 14, 21, 28] },
  { mes: 'Noviembre 2026', corto: 'nov', anio: 2026, indice: 10, fechas: [4, 11, 18, 25] },
  { mes: 'Diciembre 2026', corto: 'dic', anio: 2026, indice: 11, fechas: [2, 9, 16, 23, 30] },
];

export const premiosDelMes: Premio[] = [
  { id: 'p1', categoria: 'MOVILIDAD', nombre: 'Camioneta KIA Niro EV', fechaSorteo: 'Sorteo mié 7 oct', enDias: 'En 6 días', foto: img('premio-kia.webp'), fondo: 'amarillo' },
  { id: 'p2', categoria: 'TECNOLOGÍA', nombre: 'iPhone 17 Pro Max', fechaSorteo: 'Sorteo mié 7 oct', enDias: 'En 6 días', foto: img('premio-iphone.webp'), fondo: 'rosa' },
  { id: 'p3', categoria: 'ENTRETENIMIENTO', nombre: 'PlayStation 5', fechaSorteo: 'Sorteo mié 7 oct', enDias: 'En 6 días', foto: img('premio-ps5.webp'), fondo: 'azul' },
  { id: 'p4', categoria: 'MOVILIDAD', nombre: 'Moto Honda Navi', fechaSorteo: 'Sorteo mié 7 oct', enDias: 'En 6 días', foto: img('premio-moto.webp'), fondo: 'verde' },
  { id: 'p5', categoria: 'DEPORTE', nombre: 'Bicicleta todo terreno', fechaSorteo: 'Sorteo mié 7 oct', enDias: 'En 6 días', foto: img('premio-bici.webp'), fondo: 'amarillo' },
  { id: 'p6', categoria: 'MOVILIDAD', nombre: 'Scooter eléctrico', fechaSorteo: 'Sorteo mié 7 oct', enDias: 'En 6 días', foto: img('premio-scooter.webp'), fondo: 'rosa' },
];

export const premioMes = {
  id: 'kia', categoria: 'MOVILIDAD', nombre: 'Camioneta KIA Niro EV', foto: img('premio-kia.webp'),
  descripcion: 'SUV 100 % eléctrica, 0 km, con SOAT y placa incluidos.',
  specs: ['Autonomía de hasta 460 km', 'Color sujeto a disponibilidad', 'Se entrega en Lima'],
  terminos: ['El premio se entrega a nombre del ganador, que debe ser mayor de edad y presentar su DNI.', 'Incluye SOAT y placa. No incluye seguro vehicular ni gastos de mantenimiento.', 'El ganador tiene 30 días para reclamar el premio desde la publicación de resultados.', 'Se entrega en Lima. La imagen es referencial.'],
};

export const premioDestacado = {
  nombre: 'Camioneta KIA Niro EV',
  fecha: 'Sorteo mié 30 set · 4:00 p. m. · en vivo',
  nota: 'Participa desde 1 chance con cualquier plan',
  pie: 'En vivo por nuestras redes · queda grabado',
  foto: img('premio-destacado.webp'),
};

export const ultimoSorteo = { fecha: 'Mié 23 set', detalle: 'transmitido en vivo · nombres protegidos' };

export const ganadores: Ganador[] = [
  { id: 'g1', nombre: 'Juan Ca*** Pe*** Go***', premio: 'Camioneta KIA Niro EV', premioCorto: 'Camioneta KIA Niro', usuario: 'YK-7F3K…A29', chances: 3, fechaSorteo: 'SORTEO MIÉ 23 SET', foto: img('ganador-1.webp') },
  { id: 'g2', nombre: 'Rocío Va*** Me***', premio: 'iPhone 17 Pro Max', usuario: 'YK-2M9Q…C11', chances: 5, fechaSorteo: 'SORTEO MIÉ 23 SET', foto: img('ganador-2.webp') },
  { id: 'g3', nombre: 'María Lu*** Ca***', premio: 'Moto Honda Navi', usuario: 'YK-9P1T…B07', chances: 1, fechaSorteo: 'SORTEO MIÉ 23 SET', foto: img('ganador-3.webp') },
  { id: 'g4', nombre: 'Paola Ch*** Ro***', premio: 'PlayStation 5', usuario: 'YK-4H6D…E52', chances: 3, fechaSorteo: 'SORTEO MIÉ 23 SET', foto: img('ganador-4.webp') },
];

export const historicoGanadores = [
  { grupo: 'MIÉ 16 SET · 1.240 PARTICIPANTES', filas: [
    { premio: 'Moto Honda Navi', ganador: 'Carlos Ra*** Tu***', foto: img('ganador-3.webp') },
    { premio: 'Bicicleta todo terreno · 3 ganadores', ganador: 'Ana Pé*** y 2 más', foto: img('beneficio-1.webp') },
  ] },
  { grupo: 'MIÉ 9 SET · 1.180 PARTICIPANTES', filas: [
    { premio: 'Scooter eléctrico', ganador: 'Luis Qu*** Ma***', foto: img('ganador-2.webp') },
    { premio: 'Camioneta KIA Niro EV', ganador: 'Paola Ch*** Ro***', foto: img('ganador-1.webp') },
  ] },
];

export const beneficios: Beneficio[] = [
  { id: 'b1', titulo: 'Packs de fitness', comercio: 'Andes Gym', uso: 'Código · Lima', etiqueta: '60%', categoria: 'Fitness', foto: img('beneficio-1.webp') },
  { id: 'b2', titulo: 'Entradas de cine', comercio: 'Cinemark', marca: 'cinemark', uso: 'QR · todo el Perú', etiqueta: '2x1', categoria: 'Entretenimiento', foto: img('beneficio-2.webp') },
  { id: 'b3', titulo: 'Consulta dermatológica', comercio: 'Dermohelp', marca: 'dermohelp', uso: 'DNI · Lima', etiqueta: '65%', categoria: 'Salud', foto: img('beneficio-3.webp') },
  { id: 'b4', titulo: 'Menú ejecutivo', comercio: 'Franklin', marca: 'franklin', uso: 'Código · Lima', etiqueta: '30%', categoria: 'Comida', foto: img('beneficio-4.webp') },
  { id: 'b5', titulo: 'Tratamiento facial', comercio: 'Aquamed', marca: 'aquamed', uso: 'DNI · Lima', etiqueta: '65%', categoria: 'Salud', logo: img('marcas/dermohelp.png') },
  { id: 'b6', titulo: 'Corte y barba', comercio: 'Barba Negra', marca: 'barba-negra', uso: 'Código · Lima', etiqueta: '40%', categoria: 'Belleza', logo: img('marcas/barba-negra.png') },
  { id: 'b7', titulo: 'Combo hamburguesa', comercio: 'Hollyfood', marca: 'hollyfood', uso: 'Código · Lima', etiqueta: '25%', categoria: 'Comida', logo: img('marcas/hollyfood.png') },
  { id: 'b8', titulo: 'Combustible', comercio: 'Repsol', marca: 'repsol', uso: 'App · todo el Perú', etiqueta: '50%', categoria: 'Belleza', logo: img('marcas/aquamed.png') },
];

export const categoriasBeneficios = ['Todos', 'Salud', 'Belleza', 'Fitness', 'Comida', 'Entretenimiento'];

export const canjesEjemplo: Canje[] = [
  { id: 'c1', costo: 300, titulo: '50% OFF en Cinépolis', detalle: 'Código QR con instructivo' },
  { id: 'c2', costo: 1000, titulo: 'Gift card S/ 50', detalle: 'Marcas del Jockey Plaza' },
  { id: 'c3', costo: 4000, titulo: 'Gift card S/ 200', detalle: 'Código único al instante' },
  { id: 'c4', costo: 500, titulo: '+500 chances', detalle: '1 Lana = 1 chance en el sorteo que elijas' },
];

export const marcas: Marca[] = [
  'aquamed', 'arthur-sons', 'barba-negra', 'cinemark', 'dermohelp', 'franklin', 'hollyfood', 'psicoturay', 'repsol',
].map((m) => ({ nombre: m.replace('-', ' '), logo: img(`marcas/${m}.png`) }));

export const pasos = [
  { titulo: 'Elige tu plan', texto: 'LANITA, LANOTA o LANAZA: 1, 3 o 5 chances por sorteo regular.', img: img('paso-1.webp') },
  { titulo: 'Activa tu plan', texto: 'Paga con tarjeta, o con Yape en los planes semestral y anual. Tu plan se activa al confirmarse el pago.', img: img('paso-2.webp') },
  { titulo: 'Usa tus beneficios', texto: 'Descuentos a diario y, cada miércoles, el **Cofre** y el **Beneficio Flash**: eliges un premio o Lanas, según disponibilidad.', img: img('paso-4.webp') },
  { titulo: 'Participa y gana', texto: 'Sorteos en vivo cada miércoles y sorteos VIP si cumples las misiones del mes. Revisa los resultados en Ganadores.', img: img('paso-3.webp') },
];

export const preguntas: Pregunta[] = [
  { pregunta: '¿Puedo participar desde cualquier parte del Perú?', respuesta: 'Sí. Puedes suscribirte y participar en los sorteos desde todo el Perú. Cada beneficio indica las provincias o canales donde puedes usarlo.' },
  { pregunta: '¿Cuándo y cómo se realizan los sorteos?', respuesta: 'Cada miércoles transmitimos los sorteos en vivo por nuestras redes. La lista de participantes cierra ese día a las 11:59 a. m. Después publicamos los resultados en Ganadores.' },
  { pregunta: '¿Qué son las Lanas?', respuesta: 'Son la moneda de recompensas de AKITÁ. Las ganas con misiones y promociones; no se compran. Con un plan activo, puedes canjearlas por chances o beneficios. Consulta tu saldo y fecha de vencimiento en tu billetera.' },
  { pregunta: '¿Qué son los sorteos VIP?', respuesta: 'Son sorteos adicionales para suscriptores. Necesitas un plan activo y completar las misiones VIP del mes para participar, sin costo adicional.' },
  { pregunta: '¿Qué pasa si cancelo mi suscripción?', respuesta: 'Puedes cancelar la renovación desde Mi cuenta → Mi plan y pagos. Conservarás los beneficios hasta que termine el periodo pagado. Cuando venza, necesitarás reactivar tu plan para volver a acceder a ellos.' },
  { pregunta: '¿Cómo recibo mi premio?', respuesta: 'Te contactamos por los datos de tu cuenta para coordinar la entrega. Revisa las bases de cada sorteo.' },
  { pregunta: '¿Qué sucede si necesito ayuda de cualquier tipo?', respuesta: 'Escríbenos a contacto@akita.pe y te respondemos lo antes posible.' },
];

export const redes = [
  { id: 'tiktok' as const, label: 'TikTok', href: '#' },
  { id: 'instagram' as const, label: 'Instagram', href: '#' },
  { id: 'facebook' as const, label: 'Facebook', href: '#' },
  { id: 'youtube' as const, label: 'YouTube', href: '#' },
];

export function premiosDeFecha(m: MesSorteo, dia: number, hoy = new Date()): Premio[] {
  const fecha = new Date(m.anio, m.indice, dia, 16);
  const cierre = new Date(m.anio, m.indice, dia, 11, 59);
  const dias = Math.round((new Date(m.anio, m.indice, dia).getTime() - new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()).getTime()) / 86400000);
  const enDias = fecha < hoy ? 'Ya se sorteó' : cierre < hoy ? 'Participación cerrada' : dias === 0 ? 'Hoy' : dias === 1 ? 'Mañana' : `En ${dias} días`;
  const semanales = premiosDelMes.filter((p) => p.id !== 'p1');
  const k = (m.indice * 7 + dia) % semanales.length;
  const lista = [...semanales.slice(k), ...semanales.slice(0, k)];
  return lista.map((p) => ({ ...p, id: `${p.id}-${m.corto}${dia}`, fechaSorteo: `Sorteo mié ${dia} ${m.corto}`, enDias, fecha }));
}

export function proximaFecha(hoy = new Date(), meses = mesesSorteos): { m: number; dia: number } {
  for (let i = 0; i < meses.length; i++) {
    const m = meses[i];
    for (const d of m.fechas) if (new Date(m.anio, m.indice, d, 11, 59) >= hoy) return { m: i, dia: d };
  }
  return { m: 0, dia: meses[0].fechas[0] };
}
