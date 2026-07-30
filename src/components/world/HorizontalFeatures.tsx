"use client";

import { useEffect, useRef, useState } from "react";
import { m, useScroll, useTransform } from "framer-motion";
import { useTranslations } from "next-intl";

/**
 * Pinned horizontal-scroll gallery. Direction-aware (scrolls the natural way in
 * RTL and LTR), with a generous scroll distance so cards advance one-by-one, a
 * progress bar, and premium cards. A signature agency moment that surfaces many
 * more capabilities.
 *
 * Accepts an optional `ids` array per world; defaults to POS feature IDs.
 */
export function HorizontalFeatures({ worldKey, ids }: { worldKey: string; ids?: string[] }) {
  const IDS = ids ?? [
    "purchases", "sales", "accounts", "vat", "employees", "promotions", "cheques",
    "import", "labels", "analytics", "search", "branches", "theming", "workspaces",
  ];
  const t = useTranslations(`Worlds.${worldKey}`);
  const ref = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [maxScroll, setMaxScroll] = useState(0);
  const [rtl, setRtl] = useState(false);
  const [vh, setVh] = useState(900);

  useEffect(() => {
    setRtl(document.documentElement.dir === "rtl");
    const el = trackRef.current;
    if (!el) return;
    const measure = () => {
      setVh(window.innerHeight);
      setMaxScroll(Math.max(0, el.scrollWidth - window.innerWidth));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    const settle = setTimeout(measure, 350);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
      clearTimeout(settle);
    };
  }, []);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], [0, rtl ? maxScroll : -maxScroll]);
  const progress = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  // With 12–14 cards, 1.35× the overflow pinned the page for 7-8 screens of
  // wheel-scrolling before it moved on — on a mouse (not a trackpad) that read
  // as the scroll dying. Capped to at most 4 screens of travel.
  const sectionH = maxScroll > 0 ? `${Math.min(maxScroll * 0.9 + vh, vh * 4)}px` : "100vh";

  return (
    <section ref={ref} style={{ height: sectionH }} className="relative">
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden py-10">
        <div className="mx-auto mb-10 w-full max-w-6xl px-6 text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-brass">{t("hfeaturesKicker")}</p>
          <h2 className="font-display mx-auto mt-3 max-w-3xl text-3xl font-semibold text-bone sm:text-5xl">
            {t("hfeaturesTitle")}
          </h2>
        </div>

        <m.div ref={trackRef} style={{ x }} className="flex gap-6 px-[8vw]">
          {IDS.map((id, i) => (
            <article
              key={id}
              className="group relative flex h-[56vh] w-[80vw] shrink-0 flex-col justify-between overflow-hidden rounded-[1.75rem] border border-brass/15 bg-gradient-to-b from-ink-800/90 to-ink-900/95 p-8 transition-colors duration-500 hover:border-brass/45 sm:w-[58vw] md:w-[40vw] lg:w-[28vw]"
            >
              {/* top accent bar */}
              <span
                className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
                style={{ background: "linear-gradient(90deg, var(--world-accent), transparent)" }}
              />
              {/* hover glow */}
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{ background: "radial-gradient(70% 55% at 30% 0%, color-mix(in oklab, var(--world-accent,#C9A86A) 26%, transparent), transparent 70%)" }}
              />
              {/* giant number watermark */}
              <span
                className="pointer-events-none absolute -bottom-6 -end-2 font-display text-[10rem] font-bold leading-none opacity-[0.06]"
                style={{ color: "var(--world-accent)" }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>

              <div className="relative">
                <span className="font-display text-2xl font-bold" style={{ color: "var(--world-accent)" }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="ms-3 inline-block h-px w-10 translate-y-[-6px] bg-brass/40" />
                <h3 className="font-display mt-6 text-2xl font-semibold text-bone sm:text-3xl">
                  {t(`hfeatures.${id}.title`)}
                </h3>
                <p className="mt-4 max-w-sm leading-relaxed text-bone-muted">
                  {t(`hfeatures.${id}.desc`)}
                </p>
              </div>
              <div className="relative flex items-center gap-2 text-xs text-brass/80">
                <span className="grid h-6 w-6 place-items-center rounded-full border border-brass/30">✦</span>
                {t("hfeaturesTag")}
              </div>
            </article>
          ))}
        </m.div>

        {/* progress bar */}
        <div className="mx-auto mt-10 h-[3px] w-[70vw] max-w-3xl overflow-hidden rounded-full bg-ink-700">
          <m.div className="h-full rounded-full" style={{ width: progress, background: "var(--world-accent)" }} />
        </div>
      </div>
    </section>
  );
}
