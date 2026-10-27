import { config } from '../api/config';

export type TipoImagen = 'premio' | 'beneficio' | 'ganador' | 'logo' | 'banner' | 'banner-movil';

const PRUEBAS: Record<TipoImagen, string[]> = {
  premio: ['img/premio-destacado.webp', 'img/premio-iphone.webp', 'img/premio-moto.webp', 'img/premio-ps5.webp', 'img/premio-bici.webp', 'img/premio-scooter.webp'],
  beneficio: ['img/beneficio-1.webp', 'img/beneficio-2.webp', 'img/beneficio-3.webp', 'img/beneficio-4.webp'],
  ganador: ['img/ganador-1.webp', 'img/ganador-2.webp', 'img/ganador-3.webp', 'img/ganador-4.webp'],
  logo: ['img/marcas/arthur-sons.png', 'img/marcas/cinemark.png', 'img/marcas/franklin.png', 'img/marcas/repsol.png', 'img/marcas/hollyfood.png', 'img/marcas/aquamed.png', 'img/marcas/dermohelp.png', 'img/marcas/barba-negra.png', 'img/marcas/psicoturay.png'],
  banner: ['img/banners/arthur-fondo.webp', 'img/banners/cinemark-fondo.webp', 'img/banners/franklin-fondo.webp', 'img/banners/repsol-fondo.webp'],
  'banner-movil': ['img/banners/arthur-prod.webp', 'img/banners/cinemark-prod.webp', 'img/banners/franklin-prod.webp', 'img/banners/repsol-prod.webp'],
};

const indice = (semilla: string | number | undefined, n: number) => {
  const s = String(semilla ?? '');
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h % n;
};

export const sinImagen = (url?: string | null) => !url || !url.trim() || /^https?:\/\/(www\.)?example\.(com|org|net)\//i.test(url);

export function imagenPrueba(tipo: TipoImagen, semilla?: string | number): string | undefined {
  if (!config.imagenesPrueba) return undefined;
  const lista = PRUEBAS[tipo];
  return lista[indice(semilla, lista.length)];
}

export function conPrueba(url: string | null | undefined, tipo: TipoImagen, semilla?: string | number): string | undefined {
  return sinImagen(url) ? imagenPrueba(tipo, semilla) : url!;
}

const tipoPorUrl = (url: string): TipoImagen | null => {
  if (!/^https?:/.test(url) || url.startsWith(location.origin)) return null;
  if (/logo|merchant|brand|marca/i.test(url)) return 'logo';
  if (/banner/i.test(url)) return 'banner';
  if (/winner|ganador/i.test(url)) return 'ganador';
  if (/benefit|beneficio/i.test(url)) return 'beneficio';
  return 'premio';
};

export function instalarRespaldoImagenes() {
  if (!config.imagenesPrueba) return;
  document.addEventListener('error', (e) => {
    const img = e.target;
    if (!(img instanceof HTMLImageElement) || img.dataset.prueba) return;
    const tipo = tipoPorUrl(img.currentSrc || img.src);
    if (!tipo) return;
    const prueba = imagenPrueba(tipo, img.src);
    if (!prueba) return;
    e.stopPropagation();
    img.dataset.prueba = '1';
    const url = `${import.meta.env.BASE_URL}${prueba}`;
    if (img.parentElement instanceof HTMLPictureElement) img.parentElement.querySelectorAll('source').forEach((s) => { s.srcset = url; });
    if (img.srcset) img.srcset = url;
    img.src = url;
  }, true);
}
