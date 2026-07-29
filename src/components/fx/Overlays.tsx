"use client";

import dynamic from "next/dynamic";

const Cursor = dynamic(
  () => import("@/components/fx/Cursor").then((m) => ({ default: m.Cursor })),
  { ssr: false },
);
const MobileActionBar = dynamic(
  () =>
    import("@/components/site/MobileActionBar").then((m) => ({
      default: m.MobileActionBar,
    })),
  { ssr: false },
);

/**
 * Client-only overlays.
 *
 * `ScrollProgress` was removed: the navbar now draws the progress hairline as
 * its own bottom border, so the page had two brass lines racing each other at
 * the top of the viewport.
 *
 * `SoundToggle` was removed: a Web Audio context and a permanent floating
 * button in the mobile thumb zone, on every page, for a feature almost nobody
 * turns on. Its slot is now the action bar, which is the thing a visitor on a
 * phone actually needs.
 */
export function Overlays() {
  return (
    <>
      <Cursor />
      <MobileActionBar />
    </>
  );
}
