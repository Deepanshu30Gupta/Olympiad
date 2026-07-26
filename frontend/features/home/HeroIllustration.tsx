export function HeroIllustration() {
  return (
    <svg viewBox="0 0 500 460" className="mx-auto w-full max-w-md">
      {/* Soft glow circle behind trophy */}
      <circle cx="270" cy="230" r="150" fill="#FFE8D6" opacity="0.6" />

      {/* Trophy */}
      <g transform="translate(270 240)">
        <rect x="-30" y="90" width="60" height="30" rx="6" fill="#4C3AA0" />
        <rect x="-15" y="65" width="30" height="30" fill="#FFB238" />
        <path
          d="M -55 -60 L 55 -60 L 45 20 Q 45 55 0 55 Q -45 55 -55 20 Z"
          fill="#FFC93C"
        />
        <path d="M -55 -50 L -85 -50 Q -95 -50 -95 -30 Q -95 0 -55 0 Z" fill="#FFC93C" />
        <path d="M 55 -50 L 85 -50 Q 95 -50 95 -30 Q 95 0 55 0 Z" fill="#FFC93C" />
        <path
          d="M 0 -20 L 8 -3 L 27 -1 L 13 12 L 17 31 L 0 21 L -17 31 L -13 12 L -27 -1 L -8 -3 Z"
          fill="#FFF3D6"
        />
      </g>

      {/* Floating math-symbol badges */}
      <g transform="translate(90 110) rotate(-10)">
        <rect x="-32" y="-32" width="64" height="64" rx="16" fill="#4C3AA0" />
        <text x="0" y="14" fontSize="34" fill="white" textAnchor="middle" fontFamily="var(--font-fredoka), sans-serif">
          π
        </text>
      </g>
      <g transform="translate(410 140) rotate(8)">
        <rect x="-28" y="-28" width="56" height="56" rx="14" fill="#6FCF52" />
        <text x="0" y="12" fontSize="26" fill="white" textAnchor="middle" fontFamily="var(--font-fredoka), sans-serif">
          √x
        </text>
      </g>
      <g transform="translate(75 320) rotate(6)">
        <rect x="-30" y="-30" width="60" height="60" rx="15" fill="#FF6B4A" />
        <text x="0" y="13" fontSize="30" fill="white" textAnchor="middle" fontFamily="var(--font-fredoka), sans-serif">
          Σ
        </text>
      </g>
      <g transform="translate(425 330) rotate(-8)">
        <rect x="-30" y="-30" width="60" height="60" rx="15" fill="#4C3AA0" />
        <text x="0" y="12" fontSize="30" fill="white" textAnchor="middle" fontFamily="var(--font-fredoka), sans-serif">
          ×
        </text>
      </g>

      {/* Decorative dots/sparkles */}
      <circle cx="250" cy="30" r="4" fill="#FF6B4A" />
      <circle cx="470" cy="60" r="3" fill="#4C3AA0" />
      <circle cx="30" cy="200" r="3" fill="#6FCF52" />
      <path d="M 190 45 l 4 10 l 10 4 l -10 4 l -4 10 l -4 -10 l -10 -4 l 10 -4 Z" fill="#FF6B4A" />
      <path d="M 350 400 l 3 8 l 8 3 l -8 3 l -3 8 l -3 -8 l -8 -3 l 8 -3 Z" fill="#6FCF52" />
    </svg>
  );
}