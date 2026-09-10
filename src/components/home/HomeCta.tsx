"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { useScroll, useMotionValueEvent, useReducedMotion } from "framer-motion";
import { siteConfig } from "@/config/site";
import { ParallaxImage } from "@/components/fx/ParallaxImage";
import { Link } from "@/i18n/navigation";

/**
 * HomeCta — the closing plate.
 *
 * Was a second full-bleed <video>. It is now a parallax still, so the page ends
 * with the same drift language it opened with but without a second decoder
 * running the whole way down the page.
 *
 * The copy used to be pinned to `right: 0` while every other section sits inside
 * `max-w-7xl`, so it read as falling off the edge of the page. It is on the grid
 * now, anchored to the inline-end column.
 */
export function HomeCta() {
  const t = useTranslations("Home");
  const reduced = useReducedMotion();

  const sectionRef = useRef<HTMLElement>(null);
  const topBarRef = useRef<HTMLDivElement>(null);
  const botBarRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (reduced) return;
    const letterbox = Math.max(0, (v - 0.7) / 0.3);
    if (topBarRef.current) topBarRef.current.style.transform = `scaleY(${letterbox})`;
    if (botBarRef.current) botBarRef.current.style.transform = `scaleY(${letterbox})`;
  });

  const waHref = `https://wa.me/${siteConfig.contact.whatsapp}`;

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[88svh] overflow-hidden bg-ink-900"
      aria-labelledby="cta-heading"
    >
      <ParallaxImage
        src="/films/hero-outro.jpg"
        travel={26}
        scale={1.06}
        quality={82}
        className="absolute inset-0 overflow-hidden"
      />

      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(10,10,11,0.94) 0%, rgba(10,10,11,0.55) 45%, rgba(10,10,11,0.25) 100%)",
        }}
      />

      <div ref={topBarRef} aria-hidden className="absolute inset-x-0 top-0 z-[5] h-[10svh] origin-top scale-y-0 bg-ink-900" />
      <div ref={botBarRef} aria-hidden className="absolute inset-x-0 bottom-0 z-[5] h-[10svh] origin-bottom scale-y-0 bg-ink-900" />

      {/* On the grid, anchored to the inline-end column. */}
      <div className="relative z-10 mx-auto flex min-h-[88svh] max-w-7xl items-end px-6 pb-16 pt-28 sm:pb-24">
        <div className="w-full max-w-[46ch] ms-auto">
          <h2 id="cta-heading" className="text-3xl font-semibold leading-[1.15] text-bone sm:text-4xl">
            {t("statement1")}
            <br />
            <span className="text-mask">{t("statement2")}</span>
          </h2>
          <p className="mt-4 max-w-[42ch] leading-relaxed text-bone-muted">{t("lead")}</p>
          <div className="rule-seal my-7 w-32" />

          <div className="flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="bg-brass px-7 py-3.5 font-mono text-sm font-semibold text-ink-900 transition-colors hover:bg-brass-hi"
            >
              {t("cta")}
            </Link>
            {/* Real <a>, not window.open — iOS blocks popups. */}
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-bone/30 px-7 py-3.5 font-mono text-sm text-bone transition-colors hover:border-brass hover:text-brass"
            >
              {t("ctaWhatsapp")}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
