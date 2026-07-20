"use client";

import { useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import { useTranslations } from "next-intl";
import { brand } from "@/lib/brand";
import { cn } from "@/lib/cn";
import { ShotFrame } from "./ShotFrame";
import type { WorldModule } from "@/config/worlds";

/** "One app, every shop type" — chips swap the shown module screenshot + copy. */
export function ModuleGallery({
  worldKey,
  modules,
}: {
  worldKey: string;
  modules: WorldModule[];
}) {
  const t = useTranslations(`Worlds.${worldKey}`);
  const [i, setI] = useState(0);
  const active = modules[i];

  return (
    <section className="relative overflow-hidden py-24">
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 60% at 50% 0%, color-mix(in oklab, var(--world-accent,#C9A86A) 12%, transparent), transparent 70%)",
        }}
      />
      <div className="relative mx-auto max-w-6xl px-6">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-brass">
            {t("modulesKicker")}
          </p>
          <h2 className="font-display mx-auto mt-4 max-w-3xl text-3xl font-semibold text-bone sm:text-5xl">
            {t("modulesTitle")}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-bone-muted">{t("modulesBody")}</p>
        </div>

        {/* chips */}
        <div className="mt-10 flex flex-wrap justify-center gap-2.5">
          {modules.map((m, idx) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setI(idx)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm transition-colors",
                idx === i
                  ? "border-brass bg-brass/15 text-brass"
                  : "border-brass/20 bg-ink-800/50 text-bone-muted hover:border-brass/50 hover:text-bone",
              )}
            >
              {t(`modules.${m.id}.name`)}
            </button>
          ))}
        </div>

        {/* stage */}
        <div className="mt-10 grid items-center gap-10 md:grid-cols-2 md:gap-16">
          <AnimatePresence mode="wait">
            <m.div
              key={active.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: brand.ease.cinematic }}
            >
              <h3 className="font-display text-2xl font-semibold text-bone sm:text-3xl">
                {t(`modules.${active.id}.name`)}
              </h3>
              <p className="mt-4 max-w-md leading-relaxed text-bone-muted">
                {t(`modules.${active.id}.desc`)}
              </p>
            </m.div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <m.div
              key={active.shot.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4, ease: brand.ease.cinematic }}
            >
              <ShotFrame
                world={worldKey}
                shot={active.shot.id}
                device={active.shot.device}
                label={t(`shots.${active.shot.id}`)}
              />
            </m.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
