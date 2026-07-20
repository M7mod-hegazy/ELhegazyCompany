"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { m } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import HeroPoster from "@/components/three/HeroPoster";
import { CanvasErrorBoundary } from "@/components/three/CanvasErrorBoundary";
import { hasWebGL } from "@/lib/webgl";
import { siteConfig } from "@/config/site";
import { brand } from "@/lib/brand";

const Hero3D = dynamic(() => import("@/components/three/Hero3D"), {
  ssr: false,
  loading: () => null,
});

type Quality = "high" | "mid" | "poster";

export default function Hero() {
  const locale = useLocale();
  const t = useTranslations("Home");
  const display = locale === "ar" ? "font-display-ar" : "font-display-en";
  const [quality, setQuality] = useState<Quality | null>(null);

  useEffect(() => {
    // Dev/QA override: ?hero=poster|mid|high
    const forced = new URLSearchParams(window.location.search).get("hero");
    if (forced === "poster" || forced === "mid" || forced === "high") {
      setQuality(forced as Quality);
      return;
    }
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !hasWebGL()
    ) {
      setQuality("poster");
      return;
    }
    let active = true;
    import("detect-gpu")
      .then(({ getGPUTier }) => getGPUTier())
      .then((tier) => {
        if (!active) return;
        if (tier.tier >= 3 && !tier.isMobile) setQuality("high");
        else if (tier.tier >= 2) setQuality("mid");
        else setQuality("poster");
      })
      .catch(() => active && setQuality("mid"));
    return () => {
      active = false;
    };
  }, []);

  const whatsappHref = `https://wa.me/${siteConfig.contact.whatsapp}`;
  const show3D = quality === "high" || quality === "mid";

  const reveal = {
    hidden: { opacity: 0, y: 28 },
    show: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.9, delay: 0.15 + i * 0.12, ease: brand.ease.cinematic },
    }),
  };

  return (
    <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        {show3D ? (
          <CanvasErrorBoundary fallback={<HeroPoster />}>
            <Hero3D quality={quality === "high" ? "high" : "mid"} />
          </CanvasErrorBoundary>
        ) : (
          <HeroPoster />
        )}
      </div>

      {/* readability scrim */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-ink-900/50 via-ink-900/10 to-ink-900"
      />

      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <m.p
          custom={0}
          variants={reveal}
          initial="hidden"
          animate="show"
          className="mb-6 text-xs uppercase tracking-[0.35em] text-brass"
        >
          {t("kicker")}
        </m.p>

        <h1
          className={`${display} text-5xl font-medium leading-[1.05] text-bone sm:text-7xl lg:text-8xl`}
        >
          <m.span custom={1} variants={reveal} initial="hidden" animate="show" className="block">
            {t("headlineLine1")}
          </m.span>
          <m.span
            custom={2}
            variants={reveal}
            initial="hidden"
            animate="show"
            className="block text-brass"
          >
            {t("headlineLine2")}
          </m.span>
        </h1>

        <m.p
          custom={3}
          variants={reveal}
          initial="hidden"
          animate="show"
          className="mx-auto mt-8 max-w-xl text-base leading-relaxed text-bone-muted sm:text-lg"
        >
          {t("lead")}
        </m.p>

        <m.div
          custom={4}
          variants={reveal}
          initial="hidden"
          animate="show"
          className="mt-12 flex flex-wrap items-center justify-center gap-4"
        >
          <a
            href={`/${locale}/start`}
            className="rounded-full bg-brass px-8 py-3.5 text-sm font-semibold text-ink-900 transition-all duration-300 hover:-translate-y-0.5 hover:bg-brass-hi"
          >
            {t("cta")}
          </a>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-brass/40 px-8 py-3.5 text-sm font-semibold text-bone transition-colors duration-300 hover:border-brass hover:text-brass"
          >
            {t("ctaWhatsapp")}
          </a>
        </m.div>
      </div>

      {/* scroll cue */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className="h-10 w-px animate-pulse bg-gradient-to-b from-brass/60 to-transparent" />
      </div>
    </section>
  );
}
