export function DashboardMascot() {
  return (
    <svg viewBox="0 0 300 300" className="mx-auto w-full max-w-[260px]">
      <circle cx="150" cy="150" r="130" fill="#FFF3E0" opacity="0.6" />

      <path d="M 100 130 Q 60 220 90 260 L 150 220 Z" fill="#FF6B4A" />
      <path d="M 200 130 Q 240 220 210 260 L 150 220 Z" fill="#D9502F" />

      <path
        d="M 150 60
           C 110 60 90 95 90 135
           C 90 175 110 200 150 210
           C 190 200 210 175 210 135
           C 210 95 190 60 150 60 Z"
        fill="#4C3AA0"
      />
      <ellipse cx="150" cy="140" rx="45" ry="42" fill="#FFF3D6" />
      <circle cx="132" cy="135" r="5" fill="#2B2118" />
      <circle cx="168" cy="135" r="5" fill="#2B2118" />
      <path d="M 130 155 Q 150 168 170 155" stroke="#2B2118" strokeWidth="4" strokeLinecap="round" fill="none" />
      <circle cx="118" cy="150" r="7" fill="#FF9478" opacity="0.6" />
      <circle cx="182" cy="150" r="7" fill="#FF9478" opacity="0.6" />

      <path d="M 105 190 Q 90 210 100 225" stroke="#4C3AA0" strokeWidth="16" strokeLinecap="round" fill="none" />
      <path d="M 195 190 Q 210 210 200 225" stroke="#4C3AA0" strokeWidth="16" strokeLinecap="round" fill="none" />

      <g transform="translate(150 225)">
        <rect x="-20" y="30" width="40" height="10" rx="3" fill="#3B2C82" />
        <rect x="-10" y="18" width="20" height="14" fill="#4C3AA0" />
        <path d="M -26 -25 L 26 -25 L 20 15 Q 20 30 0 30 Q -20 30 -26 15 Z" fill="#FFC93C" />
        <path d="M -26 -20 L -38 -20 Q -44 -20 -44 -8 Q -44 5 -30 5" stroke="#FFC93C" strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M 26 -20 L 38 -20 Q 44 -20 44 -8 Q 44 5 30 5" stroke="#FFC93C" strokeWidth="6" fill="none" strokeLinecap="round" />
      </g>

      <text x="45" y="70" fontSize="26" fill="#4C3AA0" fontFamily="var(--font-fredoka), sans-serif">π</text>
      <text x="240" y="90" fontSize="24" fill="#2E6B1B" fontFamily="var(--font-fredoka), sans-serif">Σ</text>
      <text x="250" y="230" fontSize="26" fill="#4C3AA0" fontFamily="var(--font-fredoka), sans-serif">∞</text>
      <path d="M 40 220 l 12 5 l 12 -5 l -6 12 l 6 12 l -12 -5 l -12 5 l 6 -12 Z" fill="#6FCF52" />

      <circle cx="70" cy="110" r="3" fill="#FFB238" />
      <circle cx="230" cy="150" r="2.5" fill="#FF6B4A" />
      <circle cx="90" cy="250" r="2.5" fill="#4C3AA0" />
    </svg>
  );
}