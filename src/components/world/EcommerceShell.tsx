import type { CSSProperties, ReactNode } from "react";
import { WorldAtmosphere } from "./WorldAtmosphere";
import { BackToTop, StickyCTA, WhatsAppOrb, WorldRail } from "./widgets";

export function EcommerceShell({
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
      {/* Was ShowroomAtmosphere — a custom off-center-orb background unique to
          this page. Same shared WorldAtmosphere as POS and the homepage now,
          so the whole site reads as one consistent background treatment. */}
      <WorldAtmosphere />
      {children}
      <WorldRail />
      <BackToTop />
      <WhatsAppOrb worldKey={worldKey} />
      <StickyCTA worldKey={worldKey} />
    </main>
  );
}
