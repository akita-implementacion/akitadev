export function CofreIlustracion({ abierto, vacio, className }: { abierto?: boolean; vacio?: boolean; className?: string }) {
  const cuerpo = vacio ? '#B7BDBC' : '#B8702E';
  const banda = vacio ? '#E6E6E6' : '#FFD400';
  const tapa = vacio ? '#9EA4A3' : '#8E4F1B';
  const borde = vacio ? '#6A676A' : '#211402';
  return (
    <svg viewBox="0 0 160 140" className={className} aria-hidden>
      {!vacio && (
        <g opacity={abierto ? 1 : 0.85}>
          <circle cx="80" cy="62" r={abierto ? 56 : 46} fill="#FF88F7" opacity="0.35" />
          <path d="M80 6 l4 10 10 4 -10 4 -4 10 -4-10 -10-4 10-4z" fill="#FFD400" />
          <path d="M136 30 l3 7 7 3 -7 3 -3 7 -3-7 -7-3 7-3z" fill="#FFFFFF" />
          <path d="M24 34 l3 6 6 3 -6 3 -3 6 -3-6 -6-3 6-3z" fill="#FFD400" />
        </g>
      )}
      <ellipse cx="80" cy="130" rx="54" ry="6" fill="#211402" opacity="0.18" />
      <rect x="26" y="68" width="108" height="58" rx="10" fill={cuerpo} stroke={borde} strokeWidth="3" />
      <rect x="32" y="104" width="96" height="4" rx="2" fill={borde} opacity="0.18" />
      <rect x="26" y="84" width="108" height="10" fill={banda} />
      <rect x="44" y="68" width="10" height="58" fill={banda} />
      <rect x="106" y="68" width="10" height="58" fill={banda} />
      <rect x="70" y="80" width="20" height="22" rx="5" fill={banda} stroke={borde} strokeWidth="3" />
      <circle cx="80" cy="89" r="3" fill={borde} />
      <rect x="78.5" y="90" width="3" height="7" rx="1.5" fill={borde} />
      {abierto ? (
        <g transform="rotate(-18 26 66)">
          <path d="M26 66 Q26 34 80 34 Q134 34 134 66 Z" fill={tapa} stroke={borde} strokeWidth="3" />
          <rect x="44" y="38" width="10" height="28" fill={banda} />
          <rect x="106" y="38" width="10" height="28" fill={banda} />
        </g>
      ) : (
        <g>
          <path d="M22 70 Q22 36 80 36 Q138 36 138 70 Z" fill={tapa} stroke={borde} strokeWidth="3" />
          <rect x="44" y="40" width="10" height="30" fill={banda} />
          <rect x="106" y="40" width="10" height="30" fill={banda} />
          <rect x="22" y="64" width="116" height="8" rx="4" fill={banda} stroke={borde} strokeWidth="2" />
        </g>
      )}
    </svg>
  );
}
