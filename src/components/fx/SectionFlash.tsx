"use client";

import { useEffect, useRef, useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { subscribeActive } from "@/lib/scrollSections";

/** A soft brass light sweeps across whenever the active section changes. */
export function SectionFlash() {
  const [k, setK] = useState(0);
  const last = useRef<string | null>("hero");
  useEffect(() => {
    return subscribeActive(({ id }) => {
      if (id && id !== last.current) {
        last.current = id;
        setK((v) => v + 1);
      }
    });
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
