"use client";

import { useEffect, useState } from "react";
import { hasWebGL } from "@/lib/webgl";

export type Quality = "high" | "mid" | "poster";

/** Decides the 3D fidelity once per session: GPU tier + reduced-motion +
 *  WebGL availability. `?hero=high|mid|poster` forces a value for QA. */
export function useAdaptiveQuality(): Quality | null {
  const [quality, setQuality] = useState<Quality | null>(null);

  useEffect(() => {
    const forced = new URLSearchParams(window.location.search).get("hero");
    if (forced === "poster" || forced === "mid" || forced === "high") {
      setQuality(forced as Quality);
      return;
    }
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !hasWebGL()
    ) {
      setQuality("poster");
      return;
    }
    let active = true;
    import("detect-gpu")
      .then(({ getGPUTier }) => getGPUTier())
      .then((tier) => {
        if (!active) return;
        if (tier.tier >= 3 && !tier.isMobile) setQuality("high");
        else if (tier.tier >= 2) setQuality("mid");
        else setQuality("poster");
      })
      .catch(() => active && setQuality("mid"));
    return () => {
      active = false;
    };
  }, []);

  return quality;
}
