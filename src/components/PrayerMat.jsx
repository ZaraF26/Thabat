// A respectful illustrated prayer mat (SVG). No sacred text or symbols.
export default function PrayerMat({ style, locked = false, className = "" }) {
  const base = locked ? "#d6d0c8" : style.base;
  const accent = locked ? "#c4bdb2" : style.accent;
  const pattern = style?.pattern || "diamond";

  return (
    <svg viewBox="0 0 120 80" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`g-${style.id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={base} />
          <stop offset="100%" stopColor={locked ? "#bdb5a9" : shade(base)} />
        </linearGradient>
      </defs>
      {/* mat body */}
      <rect x="6" y="8" width="108" height="64" rx="8" fill={`url(#g-${style.id})`} stroke={accent} strokeWidth="1.5" />
      <rect x="12" y="14" width="96" height="52" rx="4" fill="none" stroke={accent} strokeWidth="1" opacity="0.7" />
      {/* mihrab arch */}
      <path
        d="M60 18 C50 18 46 28 46 36 L46 60 L74 60 L74 36 C74 28 70 18 60 18 Z"
        fill={locked ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.18)"}
        stroke={accent}
        strokeWidth="1.2"
      />
      {pattern === "diamond" && (
        <g stroke={accent} strokeWidth="1" fill="none" opacity="0.8">
          <path d="M60 30 L66 36 L60 42 L54 36 Z" />
          <path d="M30 50 L34 54 L30 58 L26 54 Z" />
          <path d="M90 50 L94 54 L90 58 L86 54 Z" />
        </g>
      )}
      {pattern === "geometric" && (
        <g stroke={accent} strokeWidth="1" fill="none" opacity="0.8">
          <path d="M30 44 L40 38 L50 44 L40 50 Z" />
          <path d="M70 44 L80 38 L90 44 L80 50 Z" />
        </g>
      )}
      {pattern === "floral" && (
        <g fill={accent} opacity="0.7">
          <circle cx="30" cy="50" r="2.5" />
          <circle cx="90" cy="50" r="2.5" />
          <circle cx="60" cy="48" r="2" />
        </g>
      )}
      {/* fringe */}
      <g stroke={accent} strokeWidth="1.2" opacity="0.8">
        {Array.from({ length: 11 }).map((_, i) => (
          <line key={i} x1={10 + i * 10} y1={72} x2={10 + i * 10} y2={76} />
        ))}
      </g>
    </svg>
  );
}

function shade(hex) {
  // darken a hex color slightly
  const c = hex.replace("#", "");
  const num = parseInt(c, 16);
  let r = (num >> 16) - 28;
  let g = ((num >> 8) & 0xff) - 28;
  let b = (num & 0xff) - 28;
  r = Math.max(0, r); g = Math.max(0, g); b = Math.max(0, b);
  return `rgb(${r},${g},${b})`;
}