"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import { useTranslations } from "next-intl";
import { brand } from "@/lib/brand";
import { ShotFrame } from "./ShotFrame";

// swatch color only — no names (the real theme names come with the screenshots)
const THEMES = [
  { id: "theme-dark", sw: "#1E1E22" },
  { id: "theme-gold", sw: "#C9A86A" },
  { id: "theme-light", sw: "#EDE7DA" },
  { id: "theme-blue", sw: "#3A4A5A" },
];

/** Big themes preview — one large frame that auto-cycles through theme
 *  placeholders (the app "re-skinning"), driven by color swatch dots. Owner
 *  drops real screenshots at public/shots/pos/theme-*.png. */
export function ThemesShowcase({ worldKey }: { worldKey: string }) {
  const t = useTranslations(`Worlds.${worldKey}`);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setActive((a) => (a + 1) % THEMES.length), 3200);
    return () => clearInterval(id);
  }, [paused]);

  const accent = THEMES[active].sw;

  return (
    <section className="relative overflow-hidden py-28">
      <div
        aria-hidden
        className="absolute inset-0 transition-colors duration-700"
        style={{ background: `radial-gradient(75% 60% at 50% 0%, ${accent}22, transparent 70%)` }}
      />
      <div className="relative mx-auto max-w-5xl px-6">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-brass">{t("themesKicker")}</p>
          <h2 className="font-display mx-auto mt-4 max-w-3xl text-4xl font-semibold text-bone sm:text-6xl">
            {t("themesTitle")}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-bone-muted">{t("themesBody")}</p>
        </div>

        {/* big cycling preview */}
        <div
          className="relative mx-auto mt-14 w-full max-w-4xl"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* fanned "poker cards" behind, for depth */}
          <div className="relative">
            <span aria-hidden className="absolute inset-0 z-0 rounded-[1.5rem] border border-brass/12 bg-ink-800/50" style={{ transform: "rotate(-8deg) scale(0.95)", transformOrigin: "50% 100%" }} />
            <span aria-hidden className="absolute inset-0 z-0 rounded-[1.5rem] border border-brass/12 bg-ink-800/60" style={{ transform: "rotate(7deg) scale(0.95)", transformOrigin: "50% 100%" }} />
            <span aria-hidden className="absolute inset-0 z-0 rounded-[1.5rem] border border-brass/10 bg-ink-800/40" style={{ transform: "rotate(-3deg) scale(0.98)", transformOrigin: "50% 100%" }} />

            <div
              className="relative z-10 rounded-[1.5rem] p-1 transition-shadow duration-700"
              style={{ boxShadow: `0 50px 130px -60px ${accent}, 0 0 0 1px ${accent}55` }}
            >
              <AnimatePresence mode="wait">
                <m.div
                  key={THEMES[active].id}
                  initial={{ opacity: 0, scale: 0.985 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.01 }}
                  transition={{ duration: 0.6, ease: brand.ease.cinematic }}
                >
                  <ShotFrame
                    world={worldKey}
                    shot={THEMES[active].id}
                    device="app"
                    label={t(`shots.${THEMES[active].id}`)}
                  />
                </m.div>
              </AnimatePresence>
            </div>
          </div>

          {/* swatch dots (color only) */}
          <div className="mt-8 flex items-center justify-center gap-4">
            {THEMES.map((th, i) => (
              <button
                key={th.id}
                type="button"
                aria-label={`Theme ${i + 1}`}
                data-cursor
                onClick={() => setActive(i)}
                className="grid place-items-center rounded-full transition-transform duration-300 hover:scale-110"
                style={{
                  padding: 4,
                  boxShadow: active === i ? `0 0 0 2px ${th.sw}` : "0 0 0 1px rgba(163,156,142,0.3)",
                }}
              >
                <span
                  className="block rounded-full transition-all duration-300"
                  style={{ width: active === i ? 22 : 16, height: active === i ? 22 : 16, background: th.sw, border: "1px solid rgba(201,168,106,0.4)" }}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
