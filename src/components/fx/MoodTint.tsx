"use client";

import { useEffect, useState } from "react";
import { subscribeActive } from "@/lib/scrollSections";
import { brand } from "@/lib/brand";

const ACCENTS: Record<string, string> = {
  hero: brand.colors.brass.base,
  marketing: brand.worlds.marketing.accent,
  pos: brand.worlds.pos.accent,
  ecommerce: brand.worlds.ecommerce.accent,
};

/** The whole background slowly re-tints to the active section's accent. */
export function MoodTint() {
  const [color, setColor] = useState(ACCENTS.hero);
  useEffect(() => {
    return subscribeActive(({ id }) => {
      if (id && ACCENTS[id]) setColor(ACCENTS[id]);
    });
  }, []);
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-[9] opacity-[0.1] mix-blend-soft-light"
      style={{ backgroundColor: color, transition: "background-color 1200ms ease" }}
    />
  );
}
