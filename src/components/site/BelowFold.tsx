"use client";

import dynamic from "next/dynamic";

const Stats = dynamic(
  () => import("@/components/site/Stats").then((m) => ({ default: m.Stats })),
  { ssr: false },
);
const SocialAdsBand = dynamic(
  () =>
    import("@/components/site/SocialAdsBand").then((m) => ({
      default: m.SocialAdsBand,
    })),
  { ssr: false },
);
const LogoMarquee = dynamic(
  () =>
    import("@/components/site/LogoMarquee").then((m) => ({
      default: m.LogoMarquee,
    })),
  { ssr: false },
);
const CtaBand = dynamic(
  () =>
    import("@/components/site/CtaBand").then((m) => ({ default: m.CtaBand })),
  { ssr: false },
);

export function BelowFold() {
  return (
    <>
      <Stats />
      <SocialAdsBand />
      <LogoMarquee />
      <CtaBand />
    </>
  );
}
