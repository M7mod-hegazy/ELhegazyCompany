"use client";

import { useEffect, useRef, useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { resolveActive } from "@/lib/scrollSections";

/** A soft brass light sweeps across whenever the active section changes. */
export function SectionFlash() {
  const [k, setK] = useState(0);
  const last = useRef<string | null>("hero");
  useEffect(() => {
    let raf = 0;
    let lastCheck = 0;
    const check = () => {
      const now = performance.now();
      if (now - lastCheck > 250) {
        lastCheck = now;
        const a = resolveActive().id;
        if (a && a !== last.current) {
          last.current = a;
          setK((v) => v + 1);
        }
      }
      raf = requestAnimationFrame(check);
    };
    raf = requestAnimationFrame(check);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <AnimatePresence>
      <m.div
        key={k}
        aria-hidden
        className="pointer-events-none fixed inset-0 z-30 overflow-hidden"
      >
        <m.div
          className="absolute inset-y-0 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-brass/12 to-transparent"
          initial={{ x: "-160%" }}
          animate={{ x: "260%" }}
          transition={{ duration: 0.9, ease: "easeInOut" }}
        />
      </m.div>
    </AnimatePresence>
  );
}
