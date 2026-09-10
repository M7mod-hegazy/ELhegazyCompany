"use client";

import { useEffect, useState, useCallback } from "react";
import { AnimatePresence, m } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { brand } from "@/lib/brand";
import { ShotFrame } from "./ShotFrame";

export type ThemeSwatch = { id: string; sw: string; device?: "app" | "browser" | "phone" };

// swatch color only — no names (the real theme names come with the screenshots)
const POS_THEMES: ThemeSwatch[] = [
  { id: "theme-dark", sw: "#1E1E22" },
  { id: "theme-gold", sw: "#C9A86A" },
  { id: "theme-light", sw: "#EDE7DA" },
  { id: "theme-blue", sw: "#3A4A5A" },
  { id: "theme-rose", sw: "#7A2C26" },
  { id: "theme-emerald", sw: "#2F5D50" },
  { id: "theme-royal", sw: "#4A3A6A" },
];

/** Big themes preview — one large frame that auto-cycles through theme
 *  placeholders (the app "re-skinning"), driven by color swatch dots. Owner
 *  drops real screenshots at public/shots/<world>/<id>.png.
 *
 *  Defaults to POS's real color-skin set. Pass `themes` to reuse this same
 *  carousel for a different world with a different set of shots — e.g.
 *  e-commerce doesn't have a literal theme switcher, so it reuses real page
 *  screenshots that happen to carry distinct colors (offers' green, best
 *  sellers' orange...) instead of fabricating a "pick a color" feature that
 *  doesn't exist. */
export function ThemesShowcase({
  worldKey,
  themes = POS_THEMES,
}: {
  worldKey: string;
  themes?: ThemeSwatch[];
}) {
  const t = useTranslations(`Worlds.${worldKey}`);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setActive((a) => (a + 1) % themes.length), 3200);
    return () => clearInterval(id);
  }, [paused, themes.length]);

  const accent = themes[active].sw;
  const isAr = useLocale() === "ar";
  const total = themes.length;
  const prev = useCallback(() => setActive((v) => (v - 1 + total) % total), [total]);
  const next = useCallback(() => setActive((v) => (v + 1) % total), [total]);

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
                  key={themes[active].id}
                  initial={{ opacity: 0, scale: 0.985 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.01 }}
                  transition={{ duration: 0.6, ease: brand.ease.cinematic }}
                >
                  <ShotFrame
                    world={worldKey}
                    shot={themes[active].id}
                    device={themes[active].device ?? "app"}
                    label={t(`shots.${themes[active].id}`)}
                  />
                </m.div>
              </AnimatePresence>
            </div>
          </div>

          {/* arrows */}
          <button
            type="button"
            onClick={prev}
            aria-label={isAr ? "السابق" : "Previous"}
            className="absolute left-1 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-brass/30 bg-ink-900/80 text-brass transition-colors hover:border-brass hover:bg-ink-900"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d={isAr ? "m9 18 6-6-6-6" : "m15 18-6-6 6-6"} />
            </svg>
          </button>
          <button
            type="button"
            onClick={next}
            aria-label={isAr ? "التالي" : "Next"}
            className="absolute right-1 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-brass/30 bg-ink-900/80 text-brass transition-colors hover:border-brass hover:bg-ink-900"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d={isAr ? "m15 18-6-6 6-6" : "m9 18 6-6-6-6"} />
            </svg>
          </button>

          {/* dots — all one brass color */}
          <div className="mt-8 flex items-center justify-center gap-2.5">
            {themes.map((th, i) => (
              <button
                key={th.id}
                type="button"
                aria-label={`Theme ${i + 1}`}
                onClick={() => setActive(i)}
                className={`block rounded-full transition-all duration-300 ${
                  active === i ? "h-2 w-6 bg-brass" : "h-2 w-2 bg-brass/30 hover:bg-brass/60"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
