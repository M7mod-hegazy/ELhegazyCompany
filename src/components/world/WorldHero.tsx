"use client";

import dynamic from "next/dynamic";
import { m } from "framer-motion";
import { useTranslations } from "next-intl";
import { Stage } from "@/components/three/Stage";
import { MotifPoster } from "@/components/three/MotifPoster";
import { SplitWords } from "@/components/fx/SplitWords";
import { PlanButtons } from "./PlanButtons";

const SCENES = {
  pos: dynamic(() => import("@/components/three/scenes/PosScene"), { ssr: false }),
  marketing: dynamic(() => import("@/components/three/scenes/MarketingScene"), { ssr: false }),
  ecommerce: dynamic(() => import("@/components/three/scenes/EcommerceScene"), { ssr: false }),
} as const;

export function WorldHero({
  worldKey,
  num,
  accent,
}: {
  worldKey: "pos" | "marketing" | "ecommerce";
  num: string;
  accent: string;
}) {
  const t = useTranslations(`Worlds.${worldKey}`);
  const Scene = SCENES[worldKey];

  return (
    <section className="relative flex min-h-[92vh] items-center overflow-hidden">
      {/* 3D motif behind the copy */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <Stage className="absolute inset-0" poster={<MotifPoster accent={accent} />}>
          {(progress) => <Scene progress={progress} />}
        </Stage>
      </div>
      {/* accent atmosphere + readability scrim */}
      <div
        aria-hidden
        className="absolute inset-0 z-0"
        style={{
          background: `radial-gradient(60% 60% at 50% 40%, color-mix(in oklab, ${accent} 16%, transparent), transparent 70%)`,
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 z-0 bg-gradient-to-t from-ink-900 via-ink-900/40 to-transparent md:via-transparent"
      />
      {/* localized scrim so the headline stays legible over the 3D */}
      <div
        aria-hidden
        className="absolute inset-y-0 z-[5] w-full md:w-2/3 ltr:left-0 rtl:right-0"
        style={{
          background:
            "radial-gradient(70% 80% at 50% 55%, rgba(10,10,11,0.82), transparent 75%)",
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pt-28">
        <m.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-4"
        >
          <span className="font-display text-xl font-bold" style={{ color: accent }}>
            {num}
          </span>
          <span className="h-px w-10 bg-brass/40" />
          <span className="text-xs font-semibold uppercase tracking-[0.35em] text-brass">
            {t("kicker")}
          </span>
        </m.div>

        <SplitWords
          text={t("hero")}
          className="font-display mt-6 max-w-3xl text-5xl font-semibold leading-[1.05] text-bone sm:text-7xl lg:text-8xl"
        />

        <m.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mt-7 max-w-xl text-lg leading-relaxed text-bone-muted sm:text-xl"
        >
          {t("promise")}
        </m.p>

        <m.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 flex flex-wrap gap-2.5"
        >
          {(t.raw("heroChips") as string[]).map((c) => (
            <span
              key={c}
              className="rounded-full border border-brass/25 bg-ink-900/50 px-4 py-2 text-xs font-semibold text-bone backdrop-blur-sm"
            >
              {c}
            </span>
          ))}
        </m.div>

        <m.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="mt-9"
        >
          <PlanButtons worldKey={worldKey} />
        </m.div>
      </div>

      {/* scroll cue */}
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1.5 text-brass/70"
      >
        <span className="text-[0.6rem] tracking-[0.3em]">{t("scroll")}</span>
        <m.span
          animate={{ y: [0, 7, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="text-lg leading-none"
        >
          ↓
        </m.span>
      </m.div>
    </section>
  );
}
