"use client";

import { useEffect, useState } from "react";
import { ReactLenis } from "lenis/react";

/** App-wide Lenis smooth scroll. Lighter touch settings on mobile. */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    setIsMobile(window.innerWidth < 640);
  }, []);
  return (
    <ReactLenis
      root
      options={{
        lerp: isMobile ? 0.1 : 0.25,
        smoothWheel: true,
        touchMultiplier: isMobile ? 0.5 : 1.5,
      }}
    >
      {children}
    </ReactLenis>
  );
}
