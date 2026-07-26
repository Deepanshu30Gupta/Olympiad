export function Sparkle({
  size = 16,
  color = "#FF6B4A",
  className = "",
}: {
  size?: number;
  color?: string;
  className?: string;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <path
        d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z"
        fill={color}
      />
    </svg>
  );
}

/** Hand-drawn wavy underline, sits beneath a word/heading */
export function Squiggle({
  width = 90,
  color = "#4C3AA0",
  className = "",
}: {
  width?: number;
  color?: string;
  className?: string;
}) {
  return (
    <svg width={width} height="10" viewBox="0 0 90 10" className={className} preserveAspectRatio="none">
      <path
        d="M2 6 Q 12 1 22 6 T 42 6 T 62 6 T 88 6"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

/** Small cluster of dots, arranged in a loose grid */
export function DotGrid({
  color = "#FF6B4A",
  className = "",
  rows = 3,
  cols = 3,
}: {
  color?: string;
  className?: string;
  rows?: number;
  cols?: number;
}) {
  const spacing = 12;
  const dots = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      dots.push(
        <circle key={`${r}-${c}`} cx={c * spacing + 4} cy={r * spacing + 4} r="2.5" fill={color} opacity={0.6} />
      );
    }
  }
  return (
    <svg width={cols * spacing} height={rows * spacing} className={className}>
      {dots}
    </svg>
  );
}

/** Small ring/circle outline decoration */
export function RingDot({ size = 14, color = "#4C3AA0", className = "" }: { size?: number; color?: string; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" className={className}>
      <circle cx="7" cy="7" r="5" stroke={color} strokeWidth="2" fill="none" />
    </svg>
  );
}

/** Short diagonal motion-lines, used near icon circles to suggest "new/highlight" */
export function MotionLines({ color = "#FF6B4A", className = "" }: { color?: string; className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" className={className}>
      <line x1="12" y1="8" x2="18" y2="2" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <line x1="14" y1="12" x2="20" y2="9" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <line x1="9" y1="4" x2="12" y2="-2" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** Large soft blob/wave shape for section backgrounds — positioned via wrapper */
export function Blob({ color = "#FF6B4A", className = "" }: { color?: string; className?: string }) {
  return (
    <svg viewBox="0 0 400 400" className={className} preserveAspectRatio="none">
      <path
        d="M0 400 L0 220 Q 80 180 140 230 Q 210 290 280 250 Q 350 210 400 260 L400 400 Z"
        fill={color}
      />
    </svg>
  );
}

/** Dotted squiggly path ending in a small circle — decorative doodle */
export function DottedPath({ color = "#4C3AA0", className = "" }: { color?: string; className?: string }) {
  return (
    <svg width="140" height="90" viewBox="0 0 140 90" className={className}>
      <path
        d="M5 5 Q 40 10 55 35 T 100 55"
        stroke={color}
        strokeWidth="2"
        strokeDasharray="4 5"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="105" cy="58" r="6" stroke={color} strokeWidth="2" fill="none" />
      <line x1="15" y1="2" x2="21" y2="8" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <line x1="21" y1="2" x2="15" y2="8" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** Paper airplane with a dotted curved trail — decorative doodle */
export function PaperAirplane({ color = "#4C3AA0", className = "" }: { color?: string; className?: string }) {
  return (
    <svg width="90" height="70" viewBox="0 0 90 70" className={className}>
      <path
        d="M5 55 Q 30 60 45 40 T 65 15"
        stroke={color}
        strokeWidth="2"
        strokeDasharray="4 5"
        strokeLinecap="round"
        fill="none"
      />
      <g transform="translate(62 8) rotate(35)">
        <path d="M0 0 L18 6 L0 12 L4 6 Z" fill={color} />
      </g>
    </svg>
  );
}