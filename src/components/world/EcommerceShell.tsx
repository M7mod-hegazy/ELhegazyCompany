import type { CSSProperties, ReactNode } from "react";
import { ShowroomAtmosphere } from "./ShowroomAtmosphere";
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
      <ShowroomAtmosphere />
      {children}
      <WorldRail />
      <BackToTop />
      <WhatsAppOrb worldKey={worldKey} />
      <StickyCTA worldKey={worldKey} />
    </main>
  );
}
