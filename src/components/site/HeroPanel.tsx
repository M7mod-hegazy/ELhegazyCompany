"use client";

import { useEffect, useRef } from "react";
import { m } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { registerSection } from "@/lib/scrollSections";
import { siteConfig } from "@/config/site";
import { brand } from "@/lib/brand";
import { Magnetic } from "@/components/fx/Magnetic";

/**
 * Hero composition: headline at the top, the particle-ح brand mark (rendered
 * by the fixed 3D stage) in the centre gap, lead + CTAs at the bottom — so the
 * mark and the copy read as one connected unit, not overlapping layers.
 */
export function HeroPanel() {
  const t = useTranslations("Home");
  const locale = useLocale();
  const display = locale === "ar" ? "font-display-ar" : "font-display-en";
  const ref = useRef<HTMLDivElement>(null);
  const whatsappHref = `https://wa.me/${siteConfig.contact.whatsapp}`;

  useEffect(() => {
    if (ref.current) return registerSection("hero", ref.current);
  }, []);

  const reveal = {
    hidden: { opacity: 0, y: 26 },
    show: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.9, delay: 0.15 + i * 0.12, ease: brand.ease.cinematic },
    }),
  };

  return (
    <section ref={ref} id="hero" className="relative h-[140vh]">
      <div className="sticky top-0 flex h-screen flex-col items-center justify-between px-6 py-[12vh] text-center">
        {/* legibility scrim on top/bottom only — centre stays clear for the ح */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(10,10,11,0.55), transparent 32%, transparent 68%, rgba(10,10,11,0.55))",
          }}
        />

        {/* top: kicker + headline */}
        <div className="relative z-10 mx-auto max-w-4xl">
          <m.p
            custom={0}
            variants={reveal}
            initial="hidden"
            animate="show"
            className="mb-5 text-xs uppercase tracking-[0.35em] text-brass"
          >
            {t("kicker")}
          </m.p>
          <h1 className={`${display} text-4xl font-medium leading-[1.05] text-bone sm:text-6xl lg:text-7xl`}>
            <m.span custom={1} variants={reveal} initial="hidden" animate="show" className="block">
              {t("headlineLine1")}
            </m.span>
            <m.span custom={2} variants={reveal} initial="hidden" animate="show" className="text-mask block">
              {t("headlineLine2")}
            </m.span>
          </h1>
        </div>

        {/* bottom: lead + CTAs */}
        <div className="relative z-10 mx-auto max-w-xl">
          <m.p
            custom={3}
            variants={reveal}
            initial="hidden"
            animate="show"
            className="text-base leading-relaxed text-bone-muted sm:text-lg"
          >
            {t("lead")}
          </m.p>
          <m.div
            custom={4}
            variants={reveal}
            initial="hidden"
            animate="show"
            className="mt-8 flex flex-wrap items-center justify-center gap-4"
          >
            <Magnetic className="inline-block">
              <a
                href={`/${locale}/start`}
                className="inline-block rounded-full bg-brass px-8 py-3.5 text-sm font-semibold text-ink-900 transition-colors duration-300 hover:bg-brass-hi"
              >
                {t("cta")}
              </a>
            </Magnetic>
            <Magnetic className="inline-block">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded-full border border-brass/40 px-8 py-3.5 text-sm font-semibold text-bone transition-colors duration-300 hover:border-brass hover:text-brass"
              >
                {t("ctaWhatsapp")}
              </a>
            </Magnetic>
          </m.div>
        </div>
      </div>
    </section>
  );
}
