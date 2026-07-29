"use client";

import { useEffect, useRef, useState } from "react";
import { m, AnimatePresence } from "framer-motion";

const SESSION_KEY = "elhegazi:intro-seen";
const MIN_MS = 520;   // the fill needs to be *seen*, not endured
const MAX_MS = 2600;  // hard ceiling — the page is never held hostage
const FADE_MS = 520;

/**
 * Preloader — the brand fill, shown once per session on first paint.
 *
 * Three things were wrong before:
 *
 *  1. It ran on **every** route, so navigating from the home page to /projects
 *     replayed a full-screen wordmark on top of a page that was already loaded.
 *     It is now gated on sessionStorage: first visit only.
 *  2. It waited on `readyState === "complete"`, which does not fire until every
 *     image and video on the page has finished. On a page with heavy media that
 *     meant several seconds of black, and it capped the counter at 96% while it
 *     waited — so the number visibly stalled. It now gates on fonts only, with a
 *     2.6s ceiling.
 *  3. It exited by sliding the panel up, which dragged a full-viewport opaque
 *     layer across the freshly painted hero. It now fades and scales out.
 *
 * SSR renders nothing; the panel mounts on the client only if this session has
 * not seen it, so there is no flash for returning visitors.
 */
/** Reads and claims the once-per-session slot. Runs during the lazy state
 *  initialiser, which only happens on the client — this component is imported
 *  with `ssr: false`, so there is no server render to mismatch. */
function claimIntroSlot(): boolean {
  try {
    if (sessionStorage.getItem(SESSION_KEY) === "1") return false;
    sessionStorage.setItem(SESSION_KEY, "1");
    return true;
  } catch {
    return false; // private mode — skip the intro rather than replay it
  }
}

export function Preloader() {
  const [active, setActive] = useState(claimIntroSlot);
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
      if (ratio >= 1 && fontsReady) return finish();
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
          <div className="relative leading-none" dir="rtl">
            <span className="font-display-ar text-[14vw] font-semibold text-bone-muted/12 sm:text-[8vw]">
              الحجازي
            </span>
            <span
              className="font-display-ar absolute inset-0 text-[14vw] font-semibold sm:text-[8vw]"
              style={{
                backgroundImage: `linear-gradient(to top, var(--color-brass) ${pct}%, transparent ${pct}%)`,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
              }}
            >
              الحجازي
            </span>
          </div>

          <div className="mt-7 h-px w-40 bg-bone/10">
            <div
              className="h-px bg-brass"
              style={{ width: `${pct}%`, transition: "width 120ms linear" }}
            />
          </div>
          <div className="mt-3 font-mono text-[0.6rem] uppercase tracking-[0.42em] text-bone-muted/60">
            ELHEGAZI
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
