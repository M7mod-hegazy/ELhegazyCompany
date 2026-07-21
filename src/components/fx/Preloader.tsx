"use client";

import { useEffect, useRef, useState } from "react";
import { m, AnimatePresence } from "framer-motion";

const MIN_MS = 1500;
const MAX_MS = 12000;
const HOLD_AT_ZERO_MS = 200;

/**
 * Real preloader that gates on actual page readiness:
 *   1. document.readyState === "complete" (all resources loaded)
 *   2. document.fonts.ready (web fonts loaded)
 *   3. Forced minimum duration (cinematic fill animation)
 *
 * On cold load / reload, the preloader stays until ALL three conditions pass.
 * This prevents the "flash of empty page" when navigation transitions dismiss
 * before content is actually painted.
 */
export function Preloader() {
  const [shown, setShown] = useState(0);
  const [hidden, setHidden] = useState(false);
  const stateRef = useRef({
    fontsReady: false,
    domComplete: false,
    started: false,
  });

  useEffect(() => {
    // Track font readiness
    document.fonts?.ready?.then(() => {
      stateRef.current.fontsReady = true;
    });

    // Track DOM readiness
    if (document.readyState === "complete") {
      stateRef.current.domComplete = true;
    } else {
      const onLoaded = () => {
        stateRef.current.domComplete = true;
      };
      window.addEventListener("load", onLoaded, { once: true });
    }

    let raf = 0;
    let start: number | null = null;
    const max = setTimeout(() => setHidden(true), MAX_MS);

    const tick = (now: number) => {
      if (start === null) {
        start = now;
        stateRef.current.started = true;
      }
      const elapsed = Math.max(0, now - start - HOLD_AT_ZERO_MS);
      const timePct = Math.min(100, (elapsed / MIN_MS) * 100);

      const s = stateRef.current;
      const ready = s.fontsReady && s.domComplete;

      // Counter ramps up smoothly; caps at 96% until everything is genuinely ready
      const next = Math.floor(ready ? timePct : Math.min(timePct, 96));
      setShown(next);

      if (ready && elapsed >= MIN_MS) {
        setHidden(true);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(max);
    };
  }, []);

  return (
    <AnimatePresence>
      {!hidden && (
        <m.div
          className="fixed inset-0 z-[130] flex flex-col items-center justify-center bg-ink-900"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="relative leading-none" dir="rtl">
            <span className="font-display-ar text-[16vw] font-semibold text-bone-muted/12 sm:text-[10vw]">
              الحجازي
            </span>
            <span
              className="font-display-ar absolute inset-0 text-[16vw] font-semibold sm:text-[10vw]"
              style={{
                backgroundImage: `linear-gradient(to top, var(--color-brass) ${shown}%, transparent ${shown}%)`,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
              }}
            >
              الحجازي
            </span>
          </div>
          <div className="mt-6 flex items-baseline gap-1 font-display text-2xl font-semibold text-brass">
            {shown}
            <span className="text-sm">%</span>
          </div>
          <div className="mt-2 text-[0.65rem] uppercase tracking-[0.4em] text-bone-muted/60">
            ELHEGAZI
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
