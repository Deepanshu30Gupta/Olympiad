"use client";

import { useRef, MouseEvent } from "react";
import { HeroIllustration } from "./HeroIllustration";

const MAX_SHIFT = 9; // px — matches the "8-10px max" spec

export function HeroParallax() {
  const ref = useRef<HTMLDivElement>(null);

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.setProperty("--parallax-x", `${nx * MAX_SHIFT * 2}px`);
    el.style.setProperty("--parallax-y", `${ny * MAX_SHIFT * 2}px`);
  }

  function handleMouseLeave() {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--parallax-x", "0px");
    el.style.setProperty("--parallax-y", "0px");
  }

  return (
    <div ref={ref} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      <HeroIllustration />
    </div>
  );
}