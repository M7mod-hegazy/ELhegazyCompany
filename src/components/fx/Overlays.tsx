"use client";

import dynamic from "next/dynamic";

const Cursor = dynamic(
  () => import("@/components/fx/Cursor").then((m) => ({ default: m.Cursor })),
  { ssr: false },
);
const ScrollProgress = dynamic(
  () =>
    import("@/components/fx/ScrollProgress").then((m) => ({
      default: m.ScrollProgress,
    })),
  { ssr: false },
);
const SoundToggle = dynamic(
  () =>
    import("@/components/fx/SoundToggle").then((m) => ({
      default: m.SoundToggle,
    })),
  { ssr: false },
);

/** Client-only overlays: cursor, scroll bar, sound toggle. */
export function Overlays() {
  return (
    <>
      <Cursor />
      <ScrollProgress />
      <SoundToggle />
    </>
  );
}
