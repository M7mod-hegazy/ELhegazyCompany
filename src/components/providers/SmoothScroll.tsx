"use client";

import { ReactLenis } from "lenis/react";

/** App-wide Lenis smooth scroll. GSAP ScrollTriggers sync to this. */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis root options={{ lerp: 0.25, smoothWheel: true, touchMultiplier: 1.5 }}>
      {children}
    </ReactLenis>
  );
}
