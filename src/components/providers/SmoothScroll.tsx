"use client";

import { useEffect, useState } from "react";
import { ReactLenis } from "lenis/react";

/** App-wide Lenis smooth scroll tuned for responsive scroll performance. */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    setIsMobile(window.innerWidth < 640);
  }, []);
  return (
    <ReactLenis
      root
      options={{
        lerp: isMobile ? 0.12 : 0.14,
        smoothWheel: true,
        touchMultiplier: isMobile ? 1.0 : 1.2,
      }}
    >
      {children}
    </ReactLenis>
  );
}

