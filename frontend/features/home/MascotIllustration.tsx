export function MascotIllustration({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 200" className={className}>
      <rect x="30" y="20" width="100" height="100" rx="24" fill="#FF6B4A" />
      <circle cx="60" cy="60" r="8" fill="white" />
      <circle cx="100" cy="60" r="8" fill="white" />
      <path d="M 55 85 Q 80 105 105 85" stroke="white" strokeWidth="6" strokeLinecap="round" fill="none" />
      <line x1="30" y1="70" x2="5" y2="50" stroke="#FF6B4A" strokeWidth="10" strokeLinecap="round" />
      <line x1="130" y1="70" x2="150" y2="50" stroke="#FF6B4A" strokeWidth="10" strokeLinecap="round" />
      <line x1="55" y1="120" x2="50" y2="160" stroke="#FF6B4A" strokeWidth="10" strokeLinecap="round" />
      <line x1="105" y1="120" x2="110" y2="160" stroke="#FF6B4A" strokeWidth="10" strokeLinecap="round" />
    </svg>
  );
}