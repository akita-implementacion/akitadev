
export const usuario = {
  nombre: 'Camila',
  nombreCompleto: 'Camila Rojas',
  nombreCorto: 'Camila R.',
  inicial: 'C',
  plan: 'LANOTA',
  chancesPorPlan: 3,
  codigoReferido: 'YK-7K2M9QX4A1B2',
  perfilPct: 75,
  idUsuario: 'AK-102938',
};

export const billetera = {
  saldo: 1240,
  porVencer: { lanas: 40, fecha: '31 ene 2027' },
};

export const formatoLanas = (n: number) => n.toLocaleString('es-PE').replace(/,/g, '.');

export type Periodo = 'mensual' | 'semestral' | 'anual';
export const planes = [
  { nombre: 'LANITA', chances: 1, precios: { mensual: 7.5, semestral: 28, anual: 50 } },
  { nombre: 'LANOTA', chances: 3, precios: { mensual: 12.5, semestral: 54, anual: 95 }, recomendado: true },
  { nombre: 'LANAZA', chances: 5, precios: { mensual: 17.5, semestral: 80, anual: 125 } },
] as const;
export const meses: Record<Periodo, number> = { mensual: 1, semestral: 6, anual: 12 };
export const ahorro = (mensual: number, total: number, periodo: Periodo) => mensual * meses[periodo] - total;
export const soles = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2));

export const flash = {
  descuento: '90%',
  detalle: 'en todas las gafas',
  detalleCorto: 'OFF en gafas',
  comercio: 'Óptica Andes',
  vence: 'vence hoy a las 11:59 p. m.',
  terminaEn: '04:54:26',
  usados: 312,
  cupo: 500,
  lanas: { cantidad: 50, entregadas: 60, cupo: 100 },
};

export const cofre = {
  cierra: 'mar 11:59 p. m.',
  abre: 'mié 8:00 a. m.',
  premios: { entregados: 412, cupo: 500 },
  resultado: { titulo: '2x1 en Cinépolis', detalle: 'Código QR · vence dom 25 oct, 11:59 p. m.', quedan: 37, cupo: 150 },
  alternativaLanas: { cantidad: 80, quedan: 12, cupo: 100 },
};
export const UMBRAL_POCOS = 0.1;

export const TERMINOS_VEHICULO = [
  'El premio se entrega a nombre del ganador, que debe ser mayor de edad y presentar su DNI.',
  'Incluye SOAT y placa. No incluye seguro vehicular ni gastos de mantenimiento.',
  'El ganador tiene 30 días para reclamar el premio desde la publicación de resultados.',
  'Se entrega en Lima. La imagen es referencial.',
];

export const sorteoDestacado = {
  premio: 'Camioneta KIA Niro EV',
  fecha: 'Sorteo mié 30 set · 4:00 p. m.',
  cierraEn: 'cierra en 1 d 14 h',
  horaCorta: 'Mié 4:00 p. m.',
  corte: 'mié 11:59 a. m.',
  foto: 'assets/premio-kia-banner.webp',
  descripcion: 'SUV 100 % eléctrica, 0 km, con SOAT y placa incluidos.',
  specs: ['Autonomía de hasta 460 km', 'Color sujeto a disponibilidad', 'Se entrega en Lima'],
  terminos: TERMINOS_VEHICULO as string[] | undefined,
};

export const proximosSorteos: { categoria: string; premio: string; fecha: string; enDias: string; foto?: string; descripcion?: string; specs?: string[] }[] = [
  { categoria: 'MOVILIDAD', premio: 'Camioneta KIA Niro EV', fecha: 'Sorteo mié 7 oct', enDias: 'En 6 días', foto: 'assets/premios/kia.webp', descripcion: 'SUV 100 % eléctrica, 0 km, con SOAT y placa incluidos.', specs: ['Autonomía de hasta 460 km', 'Se entrega en Lima'] },
  { categoria: 'TECNOLOGÍA', premio: 'iPhone 17 Pro Max', fecha: 'Sorteo mié 7 oct', enDias: 'En 6 días', foto: 'assets/premios/iphone.webp', descripcion: 'iPhone 17 Pro Max de 256 GB, nuevo y sellado.', specs: ['Garantía oficial de 1 año', 'Color sujeto a stock'] },
  { categoria: 'ENTRETENIMIENTO', premio: 'PlayStation 5', fecha: 'Sorteo mié 7 oct', enDias: 'En 6 días', foto: 'assets/premios/ps5.webp', descripcion: 'Consola PlayStation 5 Slim con un control.', specs: ['Incluye 1 juego', 'Garantía de 1 año'] },
  { categoria: 'MOVILIDAD', premio: 'Moto Honda Navi', fecha: 'Sorteo mié 7 oct', enDias: 'En 6 días', foto: 'assets/premios/moto.webp', descripcion: 'Moto Honda Navi 110 cc, 0 km.', specs: ['Incluye SOAT y placa', 'La imagen es referencial'] },
  { categoria: 'DEPORTE', premio: 'Bicicleta todo terreno', fecha: 'Sorteo mié 7 oct', enDias: 'En 6 días', foto: 'assets/premios/bici.webp' },
  { categoria: 'MOVILIDAD', premio: 'Scooter eléctrico', fecha: 'Sorteo mié 7 oct', enDias: 'En 6 días', foto: 'assets/premios/scooter.webp' },
];

export const fechasSorteo = [7, 14, 21, 28];

export const ganadores = [
  { nombre: 'Juan Ca*** Pe*** Go***', premio: 'Camioneta KIA Niro EV', usuario: 'YK-7F3K…A29', chances: 3, foto: 'assets/ganadores/kia.webp' },
  { nombre: 'Rocío Va*** Me***', premio: 'iPhone 17 Pro', usuario: 'YK-2M9Q…C11', chances: 5, foto: 'assets/ganadores/iphone.webp' },
  { nombre: 'María Lu*** Ca***', premio: 'Moto eléctrica', usuario: 'YK-9P1T…B07', chances: 1, foto: 'assets/ganadores/moto.webp' },
  { nombre: 'Paola Ch*** Ro***', premio: 'PlayStation 5', usuario: 'YK-4H6D…E52', chances: 3, foto: 'assets/ganadores/ps5.webp' },
];

const logoDe = (m: string) => `assets/marcas/${m}.webp`;
export const beneficios: { titulo: string; destacado?: boolean; descripcion?: string; comercio: string; logo?: string; uso: string; etiqueta: string; ahorro: string; categoria: string; ubicacion: string; foto?: string }[] = [
  { titulo: 'Menú ejecutivo', destacado: true, descripcion: '30% en el menú del día, de lunes a viernes en Franklin Kitchen & Bar.', comercio: 'Franklin', logo: logoDe('franklin'), uso: 'Código', etiqueta: '30%', ahorro: 'S/ 13', categoria: 'Restaurantes', ubicacion: 'Lima', foto: 'assets/beneficios/menu.webp' },
  { titulo: 'Entradas de cine', destacado: true, descripcion: '2x1 en entradas 2D de lunes a jueves, en salas tradicionales.', comercio: 'Cinemark', logo: logoDe('cinemark'), uso: 'QR', etiqueta: '2x1', ahorro: 'S/ 18', categoria: 'Entretenimiento', ubicacion: 'En todo el Perú', foto: 'assets/beneficios/cine.webp' },
  { titulo: 'Consulta dermatológica', destacado: true, descripcion: '65% en tu consulta. Previa cita, presentando tu DNI.', comercio: 'Dermohelp', logo: logoDe('dermohelp'), uso: 'DNI', etiqueta: '65%', ahorro: 'S/ 31', categoria: 'Salud', ubicacion: 'Lima', foto: 'assets/beneficios/farmacia.webp' },
  { titulo: 'Corte y barba', comercio: 'Barba Negra', logo: logoDe('barba-negra'), uso: 'Código', etiqueta: '40%', ahorro: 'S/ 24', categoria: 'Belleza', ubicacion: 'Lima' },
  { titulo: 'Combo hamburguesa', destacado: true, descripcion: '25% en combos en local o delivery desde su web.', comercio: 'Hollyfood', logo: logoDe('hollyfood'), uso: 'Código', etiqueta: '25%', ahorro: 'S/ 9', categoria: 'Restaurantes', ubicacion: 'En todo el Perú', foto: 'assets/beneficios/comida.webp' },
  { titulo: 'Depilación láser', comercio: 'Aquamed', logo: logoDe('aquamed'), uso: 'DNI', etiqueta: '50%', ahorro: 'S/ 120', categoria: 'Belleza', ubicacion: 'Lima' },
  { titulo: 'Terapia online', comercio: 'Psicoturay', logo: logoDe('psicoturay'), uso: 'Código', etiqueta: '35%', ahorro: 'S/ 42', categoria: 'Salud', ubicacion: 'En todo el Perú', foto: 'assets/beneficios/fitness.webp' },
  { titulo: 'Lavado de auto', comercio: 'Repsol', logo: logoDe('repsol'), uso: 'QR', etiqueta: '20%', ahorro: 'S/ 8', categoria: 'Auto', ubicacion: 'Provincias' },
  { titulo: 'Lentes de sol', destacado: true, descripcion: '30% en lentes de sol seleccionados en tiendas Arthur & Sons.', comercio: 'Arthur & Sons', logo: logoDe('arthur-sons'), uso: 'Código', etiqueta: '30%', ahorro: 'S/ 90', categoria: 'Moda', ubicacion: 'Lima' },
  { titulo: 'Café y postre', comercio: 'Franklin', logo: logoDe('franklin'), uso: 'DNI', etiqueta: '20%', ahorro: 'S/ 10', categoria: 'Restaurantes', ubicacion: 'Lima', foto: 'assets/beneficios/cafe.webp' },
  { titulo: 'Combo cine', comercio: 'Cinemark', logo: logoDe('cinemark'), uso: 'QR', etiqueta: '30%', ahorro: 'S/ 12', categoria: 'Entretenimiento', ubicacion: 'Provincias', foto: 'assets/beneficios/cine.webp' },
  { titulo: 'Chequeo de piel', comercio: 'Dermohelp', logo: logoDe('dermohelp'), uso: 'DNI', etiqueta: '45%', ahorro: 'S/ 40', categoria: 'Salud', ubicacion: 'Provincias', foto: 'assets/beneficios/farmacia.webp' },
];

export const categoriasBeneficios = ['Todos', 'Restaurantes', 'Salud', 'Belleza', 'Entretenimiento', 'Moda', 'Auto'];
export const ubicaciones = ['Todas', 'Lima', 'Provincias'];

export type PromoMarca = { id: string; logo: string; marca: string; etiqueta: string; titulo: string; bajada: string; color: string; oscuro?: boolean; imagen?: string; fondo?: string; destacado?: string; enlace?: string };
export const promosBeneficios: PromoMarca[] = [
  { id: 'pb1', logo: logoDe('cinemark'), marca: 'Cinemark', etiqueta: 'MARCA ALIADA', titulo: '2x1 en Cinemark', bajada: 'De lunes a jueves en salas tradicionales. Úsalo con tu código AKITÁ.', color: 'linear-gradient(110deg, #FF86E8 0%, #FF6FE0 55%, #E04FC7 100%)', imagen: 'assets/banners/cinemark-prod.webp', fondo: 'assets/banners/cinemark-fondo.webp', destacado: 'Cinemark' },
  { id: 'pb2', logo: logoDe('franklin'), marca: 'Franklin', etiqueta: 'NUEVO BENEFICIO', titulo: '30% en tu menú', bajada: 'Almuerzos de lunes a viernes en Franklin Kitchen & Bar.', color: 'linear-gradient(110deg, #211402 0%, #2C1607 60%, #3D2A08 100%)', oscuro: true, imagen: 'assets/banners/franklin-prod.webp', fondo: 'assets/banners/franklin-fondo.webp', destacado: 'tu menú' },
];
export const promosSorteos: PromoMarca[] = [
  { id: 'ps1', logo: logoDe('repsol'), marca: 'Repsol', etiqueta: 'PREMIO AUSPICIADO', titulo: 'Gana un año de combustible', bajada: 'Repsol se suma a los sorteos de noviembre. Suma chances y participa.', color: 'linear-gradient(110deg, #FFE45A 0%, #FDDF45 55%, #FFC233 100%)', imagen: 'assets/banners/repsol-prod.webp', fondo: 'assets/banners/repsol-fondo.webp' },
  { id: 'ps2', logo: logoDe('arthur-sons'), marca: 'Arthur & Sons', etiqueta: 'MARCA ALIADA', titulo: 'Lentes de sol de regalo', bajada: 'Arthur & Sons premia a 10 ganadores en el sorteo del miércoles.', color: 'linear-gradient(110deg, #4FE592 0%, #45E586 55%, #2ECF73 100%)', imagen: 'assets/banners/arthur-prod.webp', fondo: 'assets/banners/arthur-fondo.webp' },
];

export const canjes = [
  { costo: 1000, titulo: 'Gift card S/ 50', detalle: 'Marcas del Jockey Plaza' },
  { costo: 300, titulo: '50% OFF en Cinépolis', detalle: 'Código QR con instructivo' },
  { costo: 1000, titulo: 'Gift card S/ 50', detalle: 'Marcas del Jockey Plaza · código al instante' },
  { costo: 4000, titulo: 'Gift card S/ 200', detalle: 'Código único · se ve en Mis Cupones' },
  { costo: 20, titulo: 'Gift card S/ 500', detalle: 'Disponible en el plan superior', bloqueado: true },
];

export const misCupones = 42;

export const desafioVip = {
  mes: 'OCTUBRE',
  cierre: 'sáb 31 oct · 11:59 p. m.',
  requisitos: [
    { icono: 'calendario' as const, texto: 'Visita AKITÁ 4 semanas', estado: 'hecha ✓', hecha: true },
    { icono: 'compartir' as const, texto: 'Refiere 1 amigo más', estado: 'falta 1', hecha: false },
    { icono: 'cofre' as const, texto: 'Abre tu cofre de la semana', estado: 'hecha ✓', hecha: true },
  ],
};

export type Ciclo = 'SIEMPRE' | 'SEMANAL' | 'MENSUAL' | 'ÚNICA';
export type Mision = {
  id: string; titulo: string; ciclo: Ciclo; recompensa: string; descripcion: string;
  avance: number; meta: number; etiquetaAvance?: string; destacada?: boolean;
  cta: { texto: string; variant: 'link' | 'oscuro'; to?: string };
};

export const misiones: Mision[] = [
  { id: 'referidos', titulo: 'Refiere a un amigo', ciclo: 'SIEMPRE', recompensa: '+500', destacada: true,
    descripcion: 'Cada 3 amigos que hagan su primer pago = +500 Lanas. Se reinicia y puedes volver a ganar.',
    avance: 2, meta: 3, cta: { texto: 'Copiar mi código', variant: 'link' } },
  { id: 'cofre', titulo: 'Cofre semanal', ciclo: 'SEMANAL', recompensa: '+ premio',
    descripcion: 'Cada jueves a las 8:00 a. m. hay un cofre nuevo. Ábrelo hasta el miércoles 11:59 p. m.; si se agota, vuelve el jueves.',
    avance: 0, meta: 1, cta: { texto: 'Ir a Hoy', variant: 'link', to: '/' } },
  { id: 'visita', titulo: 'Visita semanal', ciclo: 'SEMANAL', recompensa: '+150',
    descripcion: 'Entra a AKITÁ una vez por semana durante 4 semanas (de miércoles a martes).',
    avance: 2, meta: 4, cta: { texto: 'Ir a Hoy', variant: 'link', to: '/' } },
  { id: 'perfil', titulo: 'Completa tu perfil', ciclo: 'ÚNICA', recompensa: '+150',
    descripcion: 'Solo falta tu distrito. Complétalo y recibe tus Lanas.',
    avance: 75, meta: 100, etiquetaAvance: '75 %', cta: { texto: 'Completar perfil', variant: 'link', to: '/mi-cuenta?s=Mi%20perfil' } },
  { id: 'beneficio', titulo: 'Activa un beneficio', ciclo: 'MENSUAL', recompensa: '+100',
    descripcion: 'Genera el código o QR de cualquier beneficio este mes.',
    avance: 0, meta: 1, cta: { texto: 'Ver beneficios', variant: 'oscuro', to: '/beneficios' } },
];

export const menuCuenta = [
  { texto: 'Mi plan y pagos' },
  { texto: 'Mis participaciones' },
  { texto: 'Mis Cupones', contador: '42' },
  { texto: 'Historial de recompensas', contador: '18' },
  { texto: 'Mi perfil' },
  { texto: 'Cerrar sesión' },
];

export const miAnio = { cupones: 42, sorteos: 12 };

export const checkout = {
  primerCobro: 'Hoy, 17 oct',
  proximoCobro: { mensual: '17 nov', semestral: '17 abr 2027', anual: '17 oct 2027' } as Record<Periodo, string>,
  primerSorteo: 'Mié 21 oct, 4:00 p. m.',
  tarjeta: 'Visa •••• 4821',
};

export const historicoSorteos = [
  { fecha: 'Mié 23 set', mes: 'Setiembre', participantes: 1310, premios: [
    { premio: 'Camioneta KIA Niro EV', ganador: 'Juan Ca*** Pe*** Go***', usuario: 'YK-2D9Q…F11', foto: 'assets/premio-kia.webp', mayor: true },
    { premio: 'iPhone 17 Pro Max', ganador: 'Rocío Va*** Me***', usuario: 'YK-2M9Q…C11', foto: 'assets/premio-iphone.webp', extra: 'y 2 ganadores más' },
    { premio: 'PlayStation 5', ganador: 'María Lu*** Ca***', usuario: 'YK-9P1T…B07', foto: 'assets/premio-ps5.webp' },
  ] },
  { fecha: 'Mié 16 set', mes: 'Setiembre', participantes: 1240, premios: [
    { premio: 'Moto Honda Navi', ganador: 'Carlos Ra*** Tu***', usuario: 'YK-5T2R…D40', foto: 'assets/premio-moto.webp', fotoGanador: 'assets/ganadores/moto.webp', mayor: true },
    { premio: 'Bicicleta todo terreno', ganador: 'Ana Pé***', usuario: 'YK-8K1L…A02', foto: 'assets/premio-bicicleta.webp', fotoGanador: 'assets/beneficios/fitness.webp', extra: 'y 2 ganadores más' },
  ] },
  { fecha: 'Mié 9 set', mes: 'Setiembre', participantes: 1180, premios: [
    { premio: 'Scooter eléctrico', ganador: 'Luis Qu*** Ma***', usuario: 'YK-3J7W…K18', foto: 'assets/premio-scooter.webp', fotoGanador: 'assets/ganadores/iphone.webp', mayor: true },
    { premio: 'Camioneta KIA Niro EV', ganador: 'Paola Ch*** Ro***', usuario: 'YK-4H6D…E52', foto: 'assets/premio-kia.webp', fotoGanador: 'assets/ganadores/kia.webp' },
  ] },
  { fecha: 'Mié 26 ago', mes: 'Agosto', participantes: 1095, premios: [
    { premio: 'PlayStation 5', ganador: 'Diego Ma*** Sa***', usuario: 'YK-6N3B…H21', foto: 'assets/premio-ps5.webp', fotoGanador: 'assets/ganadores/ps5.webp', mayor: true },
  ] },
];

export const consultaCodigo = {
  codigo: 'YK-7F3K…A29', nombre: 'Camila R***',
  participaciones: [
    { sorteo: 'Mié 23 set', premio: 'Camioneta KIA Niro EV', chances: 3, estado: 'No ganó' },
    { sorteo: 'Mié 30 set', premio: 'Camioneta KIA Niro EV', chances: 3, estado: 'Participa hoy', vigente: true },
  ],
};

export const marcasAliadas = [
  { nombre: 'Aquamed', logo: 'assets/marcas/aquamed.webp' },
  { nombre: 'Arthur & Sons', logo: 'assets/marcas/arthur-sons.webp' },
  { nombre: 'Barba Negra', logo: 'assets/marcas/barba-negra.webp' },
  { nombre: 'Cinemark', logo: 'assets/marcas/cinemark.webp' },
  { nombre: 'Dermohelp', logo: 'assets/marcas/dermohelp.webp' },
  { nombre: 'Franklin', logo: 'assets/marcas/franklin.webp' },
  { nombre: 'Hollyfood', logo: 'assets/marcas/hollyfood.webp' },
  { nombre: 'Psicoturay', logo: 'assets/marcas/psicoturay.webp' },
  { nombre: 'Repsol', logo: 'assets/marcas/repsol.webp' },
];

export const movimientosLanas = [
  { id: 'm1', titulo: 'Chances para Camioneta KIA Niro EV', origen: 'Sumar chances', fecha: '28 oct', lanas: -30, vence: '', lotes: 1, mes: 'Octubre 2026' },
  { id: 'm2', titulo: 'Cofre de la semana', origen: 'Elegiste Lanas', fecha: '22 oct', lanas: 30, vence: '31 ene 2027', lotes: 1, mes: 'Octubre 2026' },
  { id: 'm3', titulo: 'Beneficio Flash', origen: 'Elegiste Lanas', fecha: '16 oct', lanas: 40, vence: '31 ene 2027', lotes: 1, mes: 'Octubre 2026' },
  { id: 'm4', titulo: 'Refiere a un amigo', origen: 'Misión · 3 amigos', fecha: '12 oct', lanas: 500, vence: '31 ene 2027', lotes: 1, mes: 'Octubre 2026' },
  { id: 'm5', titulo: 'Activa un beneficio', origen: 'Misión', fecha: '8 oct', lanas: 200, vence: '31 ene 2027', lotes: 1, mes: 'Octubre 2026' },
  { id: 'm6', titulo: 'Chances para iPhone 17 Pro Max', origen: 'Sumar chances', fecha: '29 set', lanas: -30, vence: '', lotes: 1, mes: 'Setiembre 2026' },
  { id: 'm7', titulo: 'Cofre de la semana', origen: 'Elegiste Lanas', fecha: '24 set', lanas: 30, vence: '31 dic 2026', lotes: 1, mes: 'Setiembre 2026' },
  { id: 'm8', titulo: 'Completa tus datos', origen: 'Misión', fecha: '15 set', lanas: 150, vence: '31 dic 2026', lotes: 1, mes: 'Setiembre 2026' },
  { id: 'm9', titulo: 'Visita AKITÁ cada semana', origen: 'Misión', fecha: '10 set', lanas: 100, vence: '31 dic 2026', lotes: 1, mes: 'Setiembre 2026' },
  { id: 'm10', titulo: 'Bienvenida al rebaño', origen: 'Al suscribirte', fecha: '1 set', lanas: 250, vence: '31 dic 2026', lotes: 1, mes: 'Setiembre 2026' },
];

export const cuponesUsuario = [
  { id: 'c1', titulo: 'Entradas para Cinemark', comercio: 'Cinemark', logo: 'assets/marcas/cinemark.webp', origen: 'Cofre', codigo: 'CINE-7K2M', instrucciones: 'Envíanos por WhatsApp al 934 123 456 este código junto con tu ID de usuario hasta el miércoles 11 nov y te enviamos tus entradas. Si no lo envías a tiempo, pierdes el premio.', fecha: '22 oct 2026', vence: '11 nov 2026', lanas: 0, conLanas: false, estado: 'disponible' as const, tipo: 'codigo' as const },
  { id: 'c2', titulo: '90% OFF en lentes y monturas', comercio: 'Arthur & Sons', logo: 'assets/marcas/arthur-sons.webp', origen: 'Beneficio Flash', codigo: 'AKT-LENTES90', instrucciones: '', fecha: '16 oct 2026', vence: '30 nov 2026', lanas: 0, conLanas: false, estado: 'disponible' as const, tipo: 'codigo' as const },
  { id: 'c3', titulo: '25% en combos', comercio: 'Hollyfood', logo: 'assets/marcas/hollyfood.webp', origen: 'Beneficio', codigo: 'HOLLY25', enlace: 'https://example.com', instrucciones: '', fecha: '10 oct 2026', vence: '31 dic 2026', lanas: 0, conLanas: false, estado: 'disponible' as const, tipo: 'enlace' as const },
  { id: 'c4', titulo: 'Gift card S/ 50', comercio: 'Jockey Plaza', origen: 'Canje', codigo: 'JP-GC50-9Q2M', instrucciones: 'Muestra el código en caja de cualquier tienda afiliada.', fecha: '2 oct 2026', vence: '31 ene 2027', lanas: 1000, conLanas: true, estado: 'disponible' as const, tipo: 'codigo' as const },
  { id: 'c5', titulo: '30% en el menú ejecutivo', comercio: 'Franklin', logo: 'assets/marcas/franklin.webp', origen: 'Beneficio', codigo: 'MENU30', instrucciones: '', fecha: '14 oct 2026', vence: '31 dic 2026', lanas: 0, conLanas: false, estado: 'usado' as const, tipo: 'codigo' as const },
  { id: 'c6', titulo: '65% en consulta dermatológica', comercio: 'Dermohelp', logo: 'assets/marcas/dermohelp.webp', origen: 'Beneficio', codigo: '', instrucciones: 'Muestra tu DNI en el comercio para usarlo.', fecha: '2 oct 2026', vence: '31 dic 2026', lanas: 0, conLanas: false, estado: 'usado' as const, tipo: 'dni' as const },
  { id: 'c7', titulo: '40% en corte y barba', comercio: 'Barba Negra', logo: 'assets/marcas/barba-negra.webp', origen: 'Beneficio Flash', codigo: 'BARBA40', instrucciones: '', fecha: '18 set 2026', vence: '30 set 2026', lanas: 0, conLanas: false, estado: 'vencido' as const, tipo: 'codigo' as const },
];

export const recompensasUsuario = [
  { id: 'r1', titulo: '30 Lanas', origen: 'Cofre', fecha: 'jue 22 oct', lanas: 30, vence: '31 ene 2027' },
  { id: 'r2', titulo: '40 Lanas', origen: 'Beneficio Flash', fecha: 'vie 16 oct', lanas: 40, vence: '31 ene 2027' },
  { id: 'r3', titulo: 'Entradas para Cinemark · Cinemark', origen: 'Cofre', fecha: 'jue 15 oct', lanas: 0, vence: '15 nov 2026' },
  { id: 'r4', titulo: '90% OFF en lentes · Arthur & Sons', origen: 'Beneficio Flash', fecha: 'vie 9 oct', lanas: 0, vence: '30 nov 2026' },
  { id: 'r5', titulo: '3 amigos se suscribieron con tu código', origen: 'Referidos', fecha: '8 oct 2026', lanas: 500, vence: '31 ene 2027' },
  { id: 'r6', titulo: '30 Lanas', origen: 'Cofre', fecha: 'jue 1 oct', lanas: 30, vence: '31 dic 2026' },
];

export const participacionesActivas = [
  { fecha: 'mié 4 nov', sorteos: [
    { id: 's2', premio: 'iPhone 17 Pro Max', chances: 3, ganador: false, renovacion: true, detalle: '3 plan', plan: 3, sumadas: 0, regalo: 0 },
    { id: 's3', premio: 'PlayStation 5', chances: 23, ganador: false, renovacion: true, detalle: '3 plan · 10 compradas · 10 promo', plan: 3, sumadas: 10, regalo: 10 },
  ] },
  { fecha: 'mié 25 nov', sorteos: [
    { id: 's1', premio: 'Camioneta KIA Niro EV', chances: 33, ganador: false, renovacion: true, detalle: '3 plan · 30 con Lanas', plan: 3, sumadas: 30, regalo: 0 },
  ] },
];
export const participacionesHistoricas = [
  { fecha: 'mié 28 oct', sorteos: [{ id: 'h1', premio: 'Moto Honda Navi', chances: 3, ganador: false, renovacion: false, detalle: '3 plan', plan: 3, sumadas: 0, regalo: 0 }] },
  { fecha: 'mié 21 oct', sorteos: [{ id: 'h2', premio: 'Gift card S/ 200', chances: 8, ganador: true, renovacion: false, detalle: '3 plan · 5 con Lanas', plan: 3, sumadas: 5, regalo: 0 }] },
  { fecha: 'mié 30 set', sorteos: [{ id: 'h3', premio: 'Camioneta KIA Niro EV', chances: 33, ganador: false, renovacion: false, detalle: '3 plan · 30 con Lanas', plan: 3, sumadas: 30, regalo: 0 }] },
];

export const perfilEditable = {
  direccion: 'Av. Larco 123', genero: 'Femenino', distrito: '', placa: '',
  correo: 'camila@example.com', telefono: '987654321', nombre: 'Camila Rojas Pérez', documento: 'DNI 12345678',
};

export const ubigeo = {
  departamentos: [{ codigo: '15', nombre: 'Lima' }, { codigo: '04', nombre: 'Arequipa' }],
  provincias: [{ codigo: '1501', nombre: 'Lima' }, { codigo: '1507', nombre: 'Huarochirí' }, { codigo: '0401', nombre: 'Arequipa' }],
  distritos: [
    { codigo: '150122', nombre: 'Miraflores' }, { codigo: '150131', nombre: 'San Isidro' }, { codigo: '150140', nombre: 'Santiago de Surco' },
    { codigo: '150104', nombre: 'Barranco' }, { codigo: '150701', nombre: 'Matucana' }, { codigo: '040101', nombre: 'Arequipa' }, { codigo: '040103', nombre: 'Cayma' },
  ],
};

export type OpcionRecompensa = {
  id: 'premio' | 'lanas';
  etiqueta: string;
  titulo: string;
  lugar: string;
  quedan: number | null;
  total: number | null;
  lanas?: number;
};

const PLAZO_COFRE = 'mié 11 nov · 11:59 p. m.';
export const cofreSemana = {
  entregadosLista: [
    { titulo: 'Entradas para Cinemark', logo: 'assets/marcas/cinemark.webp', cantidad: 60 },
    { titulo: '+30 Lanas', cantidad: 40 },
    { titulo: 'Almuerzo hasta S/ 70 · La Bodega de la Trattoria', cantidad: 20 },
  ],
  logo: 'assets/marcas/cinemark.webp',
  cierraEn: '2 d 14 h',
  proximo: 'jue 8:00 a. m.',
  proximoLargo: 'el jue a las 8:00 a. m.',
  entregados: 28,
  totalPremios: 40,
  auspicia: 'LOGO',
  opciones: [
    { id: 'premio', etiqueta: 'PREMIO', titulo: 'Entradas para Cinemark', lugar: 'Cinemark · todo el Perú', quedan: 21, total: 60 },
    { id: 'lanas', etiqueta: 'LANAS', titulo: '+30 Lanas', lugar: 'Se suman a tu billetera al instante', quedan: 12, total: 40, lanas: 30 },
  ] as OpcionRecompensa[],
  detalles: [
    ['Dónde', 'Salas Cinemark de todo el Perú.'],
    ['Canjéalo hasta', PLAZO_COFRE],
  ] as [string, string][],
  usoCorto: `Canjéalo hasta el ${PLAZO_COFRE}: envía el código por WhatsApp.`,
  codigo: 'CINE-7K2M',
  instrucciones: 'Envíanos por WhatsApp al 934 123 456 este código junto con tu ID de usuario hasta el miércoles 11 nov y te enviamos tus entradas. Si no lo envías a tiempo, pierdes el premio.',
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
};

export const flashSemana = {
  descuento: '40%',
  oferta: 'OFF en tu farmacia',
  marca: 'Botica Bienestar',
  logo: undefined as string | undefined,
  imagen: 'assets/3d/flash-farmacia-3d.webp',
  eligeHasta: '06:12:16',
  proximo: 'vie 6 nov · 8:00 a. m.',
  usoNota: 'El beneficio se usa hasta el 30 nov · 11:59 p. m., aunque el Flash cierre antes.',
  opciones: [
    { id: 'premio', etiqueta: 'BENEFICIO', titulo: '40% OFF en farmacia', lugar: 'Botica Bienestar · locales de Lima', quedan: 188, total: 500 },
    { id: 'lanas', etiqueta: 'LANAS', titulo: '+40 Lanas', lugar: 'Se suman a tu billetera al instante', quedan: 64, total: 100, lanas: 40 },
  ] as OpcionRecompensa[],
  detalles: [
    ['Elige hasta', 'Hoy · 11:59 p. m. (06:12:16)'],
    ['Úsalo hasta', '30 nov · 11:59 p. m.'],
    ['Dónde', 'Botica Bienestar · locales de Lima.'],
    ['Condiciones', 'No aplica a productos con receta médica. Un uso por persona.'],
  ] as [string, string][],
  usoCorto: 'Úsalo hasta el 30 nov · 11:59 p. m.',
  codigo: 'AKT-FARMA40',
  terminos: 'Válido en medicamentos de venta libre, vitaminas y cuidado personal en locales de Lima. No aplica a productos con receta médica ni a leches infantiles. Un uso por persona. No acumulable con otras promociones.',
};

export const flashSemana2: typeof flashSemana = {
  ...flashSemana,
  descuento: '2x1', oferta: 'en entradas de cine', marca: 'Cinemark', logo: 'assets/marcas/cinemark.webp', imagen: '', eligeHasta: '07:12:40',
  opciones: [
    { id: 'premio', etiqueta: 'BENEFICIO', titulo: '2x1 en entradas de cine', lugar: 'Cinemark · salas tradicionales', quedan: 160, total: 300 },
    { id: 'lanas', etiqueta: 'LANAS', titulo: '+25 Lanas', lugar: 'Se suman a tu billetera al instante', quedan: 30, total: 60, lanas: 25 },
  ] as OpcionRecompensa[],
  codigo: 'AKT-CINE2X1',
  terminos: 'Válido de lunes a jueves en salas tradicionales de Cinemark. Un uso por persona.',
};
