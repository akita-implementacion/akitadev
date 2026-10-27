import { useEffect, useState } from 'react';

const ACTIVO = false;
export function useScrollPorVistas() {
  useEffect(() => {
    if (!ACTIVO) return;
    const html = document.documentElement;
    html.classList.add('snap-vistas');
    return () => { html.classList.remove('snap-vistas'); };
  }, []);
}

export function useOcultarAlBajar(umbral = 72) {
  const [oculto, setOculto] = useState(false);
  useEffect(() => {
    let ultimo = window.scrollY;
    let subida = 0;
    let pendiente = false;
    const revisar = () => {
      pendiente = false;
      const y = window.scrollY;
      const delta = y - ultimo;
      const alFinal = y + window.innerHeight >= document.documentElement.scrollHeight - 140;
      if (y < umbral) { setOculto(false); subida = 0; }
      else if (alFinal) { setOculto(true); subida = 0; }
      else if (delta > 4) { setOculto(true); subida = 0; }
      else if (delta < 0) { subida -= delta; if (subida > 56) setOculto(false); }
      ultimo = y;
    };
    const onScroll = () => { if (!pendiente) { pendiente = true; requestAnimationFrame(revisar); } };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); };
  }, [umbral]);
  return oculto;
}
