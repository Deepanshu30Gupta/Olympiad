export function HeroIllustration() {
  return (
    <svg viewBox="0 0 500 460" className="mx-auto w-full max-w-md">
      <circle cx="270" cy="230" r="195" fill="#FFE8D6" opacity="0.55" />
      <circle cx="270" cy="230" r="150" fill="#FFDCC0" opacity="0.6" />
      <circle cx="270" cy="230" r="105" fill="#FFD0A8" opacity="0.45" />

      <g transform="translate(270 235)">
        <rect x="-38" y="98" width="76" height="16" rx="4" fill="#3B2C82" />
        <rect x="-26" y="72" width="52" height="30" rx="4" fill="#4C3AA0" />
        <rect x="-16" y="80" width="32" height="14" rx="3" fill="#FFB238" />
        <path d="M -55 -60 L 55 -60 L 44 25 Q 44 60 0 60 Q -44 60 -55 25 Z" fill="#FFC93C" />
        <path d="M -50 -25 L -50 15 Q -50 30 -35 32" stroke="#F5A623" strokeWidth="4" fill="none" opacity="0.5" />
        <path d="M -55 -48 L -88 -48 Q -100 -48 -100 -25 Q -100 2 -70 2" stroke="#FFC93C" strokeWidth="12" fill="none" strokeLinecap="round" />
        <path d="M 55 -48 L 88 -48 Q 100 -48 100 -25 Q 100 2 70 2" stroke="#FFC93C" strokeWidth="12" fill="none" strokeLinecap="round" />
        <path
          d="M 0 -22 L 7 -4 L 27 -2 L 12 11 L 16 30 L 0 20 L -16 30 L -12 11 L -27 -2 L -7 -4 Z"
          fill="#FFF3D6"
        />
      </g>

      <g className="parallax-layer" style={{ ["--depth" as string]: 1 }}>
        <g transform="translate(90 105) rotate(-10)" style={{ animation: "float-a 7s ease-in-out infinite" }}>
          <rect x="-32" y="-32" width="64" height="64" rx="16" fill="#4C3AA0" />
          <text x="0" y="14" fontSize="34" fill="white" textAnchor="middle" fontFamily="var(--font-fredoka), sans-serif">
            π
          </text>
        </g>
      </g>

      <g className="parallax-layer" style={{ ["--depth" as string]: 0.7 }}>
        <g transform="translate(412 135) rotate(8)" style={{ animation: "float-b 8.5s ease-in-out infinite" }}>
          <rect x="-28" y="-28" width="56" height="56" rx="14" fill="#6FCF52" />
          <text x="0" y="12" fontSize="26" fill="white" textAnchor="middle" fontFamily="var(--font-fredoka), sans-serif">
            √x
          </text>
        </g>
      </g>

      <g className="parallax-layer" style={{ ["--depth" as string]: 1.2 }}>
        <g transform="translate(70 325) rotate(6)" style={{ animation: "float-c 6.5s ease-in-out infinite" }}>
          <rect x="-30" y="-30" width="60" height="60" rx="15" fill="#FF6B4A" />
          <text x="0" y="13" fontSize="30" fill="white" textAnchor="middle" fontFamily="var(--font-fredoka), sans-serif">
            Σ
          </text>
        </g>
      </g>

      <g className="parallax-layer" style={{ ["--depth" as string]: 0.85 }}>
        <g transform="translate(428 335) rotate(-8)" style={{ animation: "float-d 7.8s ease-in-out infinite" }}>
          <rect x="-30" y="-30" width="60" height="60" rx="15" fill="#4C3AA0" />
          <text x="0" y="12" fontSize="30" fill="white" textAnchor="middle" fontFamily="var(--font-fredoka), sans-serif">
            ×
          </text>
        </g>
      </g>

      <path d="M 190 40 l 5 12 l 12 5 l -12 5 l -5 12 l -5 -12 l -12 -5 l 12 -5 Z" fill="#FF6B4A" />
      <path d="M 355 400 l 4 9 l 9 4 l -9 4 l -4 9 l -4 -9 l -9 -4 l 9 -4 Z" fill="#6FCF52" />
      <rect x="245" y="25" width="9" height="9" fill="#FF6B4A" transform="rotate(45 250 30)" />
      <rect x="465" y="200" width="7" height="7" fill="#4C3AA0" transform="rotate(45 468 203)" />
      <circle cx="30" cy="205" r="4" fill="#6FCF52" />
      <circle cx="465" cy="60" r="3.5" fill="#4C3AA0" />
      <circle cx="15" cy="140" r="3" fill="#FF6B4A" />
      <circle cx="480" cy="290" r="6" stroke="#FF6B4A" strokeWidth="2" fill="none" />
      <path d="M 130 250 Q 138 240 146 250" stroke="#4C3AA0" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M 385 90 Q 393 80 401 90" stroke="#FF6B4A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M 60 380 Q 68 370 76 380" stroke="#6FCF52" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M 410 220 Q 418 210 426 220" stroke="#4C3AA0" strokeWidth="2.5" strokeLinecap="round" fill="none" />

      <style>{`
        @keyframes float-a { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(2px, -4px); } }
        @keyframes float-b { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(-3px, 3px); } }
        @keyframes float-c { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(3px, 2px); } }
        @keyframes float-d { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(-2px, -3px); } }
        .parallax-layer {
          transform: translate(
            calc(var(--parallax-x, 0px) * var(--depth, 1)),
            calc(var(--parallax-y, 0px) * var(--depth, 1))
          );
        }
      `}</style>
    </svg>
  );
}