import { Children, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { cx } from './primitives';

export function Carrusel({ children, ancho, anchoClase, gap = 16, auto = 5000, puntos = true, puntosClase, flechas, tonoPuntos = 'amarillo', className, sangria = true }: {
  children: ReactNode; ancho?: number; anchoClase?: string; gap?: number; auto?: number; puntos?: boolean; puntosClase?: string; flechas?: boolean | 'lados';
  tonoPuntos?: 'amarillo' | 'cafe'; className?: string; sangria?: boolean;
}) {
  const items = Children.toArray(children);
  const ref = useRef<HTMLDivElement>(null);
  const [posiciones, setPosiciones] = useState<number[]>([0]);
  const [activa, setActiva] = useState(0);
  const pausa = useRef(false);
  const visible = useRef(true);

  const medir = useCallback(() => {
    const el = ref.current; if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const pad = parseFloat(getComputedStyle(el).paddingLeft) || 0;
    const ps: number[] = [];
    Array.from(el.children).forEach((c) => {
      const p = Math.min(max, Math.max(0, (c as HTMLElement).offsetLeft - pad));
      if (!ps.some((x) => Math.abs(x - p) < 8)) ps.push(p);
    });
    setPosiciones(ps.length ? ps : [0]);
    let mejor = 0;
    ps.forEach((p, i) => { if (Math.abs(p - el.scrollLeft) < Math.abs(ps[mejor] - el.scrollLeft)) mejor = i; });
    setActiva(mejor);
  }, []);

  useEffect(() => {
    const el = ref.current; if (!el) return;
    medir();
    el.addEventListener('scroll', medir, { passive: true });
    const ro = new ResizeObserver(medir); ro.observe(el);
    return () => { el.removeEventListener('scroll', medir); ro.disconnect(); };
  }, [medir, items.length]);

  const ir = useCallback((i: number) => {
    const el = ref.current; if (!el) return;
    el.scrollTo({ left: posiciones[Math.max(0, Math.min(i, posiciones.length - 1))], behavior: 'smooth' });
  }, [posiciones]);

  useEffect(() => {
    const el = ref.current; if (!el) return;
    let x0 = 0, s0 = 0, arrastrando = false, movido = false;
    const down = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      arrastrando = true; movido = false; x0 = e.clientX; s0 = el.scrollLeft; pausa.current = true;
    };
    const move = (e: PointerEvent) => {
      if (!arrastrando) return;
      const dx = e.clientX - x0;
      if (!movido && Math.abs(dx) > 5) { movido = true; el.style.scrollSnapType = 'none'; el.style.cursor = 'grabbing'; }
      if (movido) { el.scrollLeft = s0 - dx; e.preventDefault(); }
    };
    const up = () => {
      if (!arrastrando) return;
      arrastrando = false; el.style.cursor = '';
      if (movido) {
        const pad = parseFloat(getComputedStyle(el).paddingLeft) || 0;
        const hijos = Array.from(el.children) as HTMLElement[];
        const max = el.scrollWidth - el.clientWidth;
        let destino = 0, d = Infinity;
        hijos.forEach((c) => { const p = Math.min(max, Math.max(0, c.offsetLeft - pad)); if (Math.abs(p - el.scrollLeft) < d) { d = Math.abs(p - el.scrollLeft); destino = p; } });
        el.scrollTo({ left: destino, behavior: 'smooth' });
        window.setTimeout(() => { el.style.scrollSnapType = ''; }, 450);
      }
    };
    const click = (e: MouseEvent) => { if (movido) { e.preventDefault(); e.stopPropagation(); movido = false; } };
    const noArrastrarImg = (e: DragEvent) => e.preventDefault();
    el.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    el.addEventListener('click', click, true);
    el.addEventListener('dragstart', noArrastrarImg);
    return () => {
      el.removeEventListener('pointerdown', down); window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up); el.removeEventListener('click', click, true); el.removeEventListener('dragstart', noArrastrarImg);
    };
  }, []);

  useEffect(() => {
    if (!auto) return;
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { visible.current = e.isIntersecting; }, { threshold: 0.4 });
    io.observe(el);
    const t = window.setInterval(() => {
      if (pausa.current || !visible.current || document.hidden || posiciones.length < 2) return;
      ir(activa + 1 >= posiciones.length ? 0 : activa + 1);
    }, auto);
    return () => { window.clearInterval(t); io.disconnect(); };
  }, [auto, ir, activa, posiciones.length]);

  return (
    <div className={cx('flex flex-col gap-3', className)}
      onMouseEnter={() => { pausa.current = true; }} onMouseLeave={() => { pausa.current = false; }}
      onTouchStart={() => { pausa.current = true; }} onTouchEnd={() => { window.setTimeout(() => { pausa.current = false; }, 4000); }}>
      <div className="relative">
        <div ref={ref} className={cx('no-scrollbar relative flex cursor-grab snap-x snap-mandatory overflow-x-auto pb-2 pt-0.5 select-none',
          sangria ? '-mx-6 scroll-px-6 px-6 lg:mx-0 lg:scroll-px-0 lg:px-0' : '')} style={{ gap }}>
          {items.map((c, i) => <div key={i} className={cx('shrink-0 snap-start', anchoClase)} style={ancho ? { width: ancho } : undefined}>{c}</div>)}
        </div>
        {flechas === 'lados' && posiciones.length > 1 && (
          <>
            <button onClick={() => ir(activa - 1)} disabled={activa === 0} aria-label="Anterior"
              className="absolute -left-4 top-1/2 z-10 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-n0 text-xl font-bold text-cafe shadow-[0_4px_14px_rgba(33,20,3,0.2)] transition disabled:opacity-0 lg:flex">‹</button>
            <button onClick={() => ir(activa + 1 >= posiciones.length ? 0 : activa + 1)} aria-label="Siguiente"
              className="absolute -right-4 top-1/2 z-10 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-n0 text-xl font-bold text-cafe shadow-[0_4px_14px_rgba(33,20,3,0.2)] transition lg:flex">›</button>
          </>
        )}
      </div>
      {puntos && posiciones.length > 1 && (
        <div className={cx('flex items-center justify-center gap-1.5', puntosClase)} role="tablist" aria-label="Posición del carrusel">
          {flechas === true && (
            <button onClick={() => ir(activa - 1)} disabled={activa === 0} aria-label="Anterior"
              className="mr-2 hidden size-8 items-center justify-center rounded-full bg-n0 text-lg font-bold text-cafe shadow-card transition disabled:opacity-30 lg:flex">‹</button>
          )}
          {posiciones.map((_, i) => (
            <button key={i} onClick={() => ir(i)} aria-label={`Ir a ${i + 1}`} aria-selected={i === activa} role="tab"
              className={cx('h-2 rounded-[4px] transition-all', i === activa ? cx('w-5', tonoPuntos === 'cafe' ? 'bg-cafe' : 'bg-amarillo') : 'w-2 bg-cafe/25')} />
          ))}
          {flechas === true && (
            <button onClick={() => ir(activa + 1 >= posiciones.length ? 0 : activa + 1)} aria-label="Siguiente"
              className="ml-2 hidden size-8 items-center justify-center rounded-full bg-n0 text-lg font-bold text-cafe shadow-card transition lg:flex">›</button>
          )}
        </div>
      )}
    </div>
  );
}

export function useDesplazarSolo<T extends HTMLElement>(ms = 5000) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    let pausa = false, visible = false, reanudar = 0;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.4 });
    io.observe(el);
    const parar = () => { pausa = true; window.clearTimeout(reanudar); };
    const seguir = (d = 0) => { window.clearTimeout(reanudar); reanudar = window.setTimeout(() => { pausa = false; }, d); };
    const onTouchEnd = () => seguir(4000);
    const onLeave = () => seguir(0);
    el.addEventListener('touchstart', parar, { passive: true }); el.addEventListener('touchend', onTouchEnd);
    el.addEventListener('mouseenter', parar); el.addEventListener('mouseleave', onLeave);
    const t = window.setInterval(() => {
      const max = el.scrollWidth - el.clientWidth;
      if (pausa || !visible || document.hidden || max < 8) return;
      const pad = parseFloat(getComputedStyle(el).paddingLeft) || 0;
      const r0 = el.getBoundingClientRect().left;
      const ps = (Array.from(el.children) as HTMLElement[]).map((c) => Math.min(max, Math.max(0, c.getBoundingClientRect().left - r0 + el.scrollLeft - pad)));
      const sig = ps.find((p) => p > el.scrollLeft + 8);
      el.scrollTo({ left: sig === undefined ? 0 : sig, behavior: 'smooth' });
    }, ms);
    return () => { window.clearInterval(t); io.disconnect(); window.clearTimeout(reanudar);
      el.removeEventListener('touchstart', parar); el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('mouseenter', parar); el.removeEventListener('mouseleave', onLeave); };
  }, [ms]);
  return ref;
}

export function FilaAuto({ className, children, ms = 5000 }: { className?: string; children: ReactNode; ms?: number }) {
  const ref = useDesplazarSolo<HTMLDivElement>(ms);
  return <div ref={ref} className={className}>{children}</div>;
}
