"use client";

import { useEffect, useRef, useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { shotsLoading } from "@/lib/shotProgress";
import { PreloaderPanel } from "@/components/fx/PreloaderPanel";

const MIN_MS = 520;   // the fill needs to be *seen*, not endured
const MAX_MS = 4000;  // hard ceiling — the page is never held hostage
const FADE_MS = 520;

/**
 * Preloader — the brand fill, shown on every full page load.
 *
 * It waits on fonts and the few critical screenshots registered through
 * `registerShot`, with a 4s ceiling. Everything else is lazily loaded and never
 * blocks the intro. Client-side route changes keep using RoutePreloader; this
 * component stays mounted in the locale layout, so it only restarts when the
 * browser performs a real reload.
 *
 * It previously waited on `readyState === "complete"`, which does not fire until every
 *     image and video on the page has finished. On a page with heavy media that
 *     meant several seconds of black, and it capped the counter at 96% while it
 *     waited — so the number visibly stalled. It also exited by sliding the
 *     panel up, which dragged a full-viewport opaque
 *     layer across the freshly painted hero. It now fades and scales out.
 *
 * `active` starts `true` on both the server and the first client render, which
 * keeps hydration deterministic and makes the wordmark visible immediately.
 */
export function Preloader() {
  const [active, setActive] = useState(true);
  const [pct, setPct] = useState(0);
  const doneRef = useRef(false);

  useEffect(() => {
    if (!active) return;

    document.body.style.overflow = "hidden";

    let fontsReady = false;
    document.fonts?.ready?.then(() => {
      fontsReady = true;
    });

    const start = performance.now();
    let raf = 0;

    const finish = () => {
      if (doneRef.current) return;
      doneRef.current = true;
      cancelAnimationFrame(raf);
      setPct(100);
      document.body.style.overflow = "";
      setActive(false);
    };

    const ceiling = setTimeout(finish, MAX_MS);

    const tick = (now: number) => {
      const elapsed = now - start;
      const ratio = Math.min(1, elapsed / MIN_MS);
      // Ease-out so the count decelerates into 100 instead of stopping dead.
      setPct(Math.round((1 - Math.pow(1 - ratio, 3)) * 100));
      if (ratio >= 1 && fontsReady && !shotsLoading()) return finish();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(ceiling);
      document.body.style.overflow = "";
    };
  }, [active]);

  return (
    <AnimatePresence>
      {active && (
        <m.div
          key="preloader"
          className="fixed inset-0 z-[130] flex flex-col items-center justify-center bg-ink-900"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: FADE_MS / 1000, ease: [0.22, 1, 0.36, 1] }}
        >
          <PreloaderPanel pct={pct} />
        </m.div>
      )}
    </AnimatePresence>
  );
}
