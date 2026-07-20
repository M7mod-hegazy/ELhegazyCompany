import type { CSSProperties, ReactNode } from "react";
import { WorldAtmosphere } from "./WorldAtmosphere";
import { BackToTop, StickyCTA, WhatsAppOrb, WorldRail } from "./widgets";

/**
 * Per-world page wrapper. Exposes the world's accent as `--world-accent` so
 * every child (headings, frames, rim glows) tints consistently while keeping
 * the shared ink+brass DNA, and mounts the world's living background.
 */
export function WorldShell({
  accent,
  worldKey,
  children,
}: {
  accent: string;
  worldKey: string;
  children: ReactNode;
}) {
  return (
    <main
      className="relative z-10 overflow-x-clip"
      style={{ "--world-accent": accent } as CSSProperties}
    >
      <WorldAtmosphere />
      {children}
      <WorldRail />
      <BackToTop />
      <WhatsAppOrb worldKey={worldKey} />
      <StickyCTA worldKey={worldKey} />
    </main>
  );
}
