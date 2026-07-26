export function ChessKnight({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 260" className={className}>
      <rect x="50" y="220" width="100" height="24" rx="4" fill="#3B2C82" />
      <rect x="60" y="196" width="80" height="28" rx="4" fill="#5B4AB5" />
      <path
        d="M85 196
           C 70 180 60 155 65 130
           C 68 112 80 98 100 88
           C 90 78 82 68 85 55
           C 88 42 100 35 112 38
           C 108 45 108 52 112 58
           C 130 55 148 65 155 82
           C 162 98 158 115 145 128
           L 150 140
           L 138 145
           L 140 160
           L 120 155
           L 115 196 Z"
        fill="#6C5BC7"
      />
      <circle cx="128" cy="72" r="5" fill="#2E1F6B" />
      <path d="M95 88 Q 105 95 100 108" stroke="#2E1F6B" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}