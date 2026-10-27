export function LogoYape({ size = 28 }: { size?: number }) {
  return (
    <span className="inline-flex shrink-0 items-center justify-center rounded-[8px] bg-[#742284] font-black italic leading-none text-n0" style={{ height: size, padding: `0 ${size * 0.22}px`, fontSize: size * 0.48 }} aria-label="Yape">yape</span>
  );
}

export function LogosTarjeta({ size = 28 }: { size?: number }) {
  const h = size;
  return (
    <span className="inline-flex shrink-0 items-center gap-1" aria-label="Visa y Mastercard">
      <span className="inline-flex items-center justify-center rounded-[6px] border border-n10 bg-n0 font-black italic leading-none text-[#1A1F71]" style={{ height: h, width: h * 1.55, fontSize: h * 0.42 }}>VISA</span>
      <span className="inline-flex items-center justify-center rounded-[6px] border border-n10 bg-n0" style={{ height: h, width: h * 1.55 }}>
        <svg viewBox="0 0 38 24" style={{ height: h * 0.62 }} aria-hidden>
          <circle cx="14" cy="12" r="9" fill="#EB001B" /><circle cx="24" cy="12" r="9" fill="#F79E1B" fillOpacity=".9" />
        </svg>
      </span>
    </span>
  );
}
