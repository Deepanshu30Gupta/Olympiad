"use client";

import { useState, useRef, MouseEvent, ReactNode } from "react";

interface RippleWrapperProps {
  children: ReactNode;
  className?: string;
}

export function RippleWrapper({ children, className = "" }: RippleWrapperProps) {
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);
  const nextId = useRef(0);

  function handleMouseDown(e: MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = nextId.current++;
    setRipples((prev) => [...prev, { x, y, id }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 600);
  }

  return (
    <div
      onMouseDown={handleMouseDown}
      className={`relative inline-flex overflow-hidden transition-all duration-[220ms] ease-out hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-[0.97] ${className}`}
    >
      {children}
      {ripples.map((r) => (
        <span
          key={r.id}
          className="pointer-events-none absolute rounded-full bg-white/40"
          style={{
            left: r.x,
            top: r.y,
            width: 10,
            height: 10,
            transform: "translate(-50%, -50%)",
            animation: "ripple-expand 600ms ease-out",
          }}
        />
      ))}
      <style>{`
        @keyframes ripple-expand {
          from { transform: translate(-50%, -50%) scale(0); opacity: 0.6; }
          to { transform: translate(-50%, -50%) scale(22); opacity: 0; }
        }
      `}</style>
    </div>
  );
}