"use client";

import { useEffect, useRef, useState } from "react";
import { ReactLenis, type LenisRef } from "lenis/react";
import { cancelFrame, frame } from "framer-motion";

/**
 * App-wide Lenis smooth scroll tuned for responsive scroll performance.
 *
 * Lenis ran its own independent requestAnimationFrame loop (the default,
 * `autoRaf: true`) while every scroll-linked animation on the site — the
 * panel stacking in InstrumentsSection, the parallax plates, StoryChapter's
 * scroll transforms — reads scroll position through Framer Motion's own
 * frame scheduler. Two separate rAF loops racing each other one frame apart
 * is exactly what read as stuttery/laggy scrolling: Lenis would move the
 * page, then Framer Motion's *next* tick would catch up to where Lenis
 * already was, one frame late, every frame. Driving Lenis from inside
 * Framer Motion's own scheduler (`autoRaf: false` + `frame.update`) puts
 * both on the same tick, which is Lenis's documented integration path for
 * Framer Motion.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);
  const lenisRef = useRef<LenisRef>(null);

  useEffect(() => {
    setIsMobile(window.innerWidth < 640);
  }, []);

  useEffect(() => {
    function update({ timestamp }: { timestamp: number }) {
      lenisRef.current?.lenis?.raf(timestamp);
    }
    frame.update(update, true);
    return () => cancelFrame(update);
  }, []);

  return (
    <ReactLenis
      root
      ref={lenisRef}
      options={{
        lerp: isMobile ? 0.12 : 0.14,
        smoothWheel: true,
        touchMultiplier: isMobile ? 1.0 : 1.2,
        autoRaf: false,
      }}
    >
      {children}
    </ReactLenis>
  );
}

