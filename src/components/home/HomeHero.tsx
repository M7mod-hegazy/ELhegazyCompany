"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { m, useReducedMotion, useScroll, useMotionValueEvent } from "framer-motion";
import { AmbientFilm } from "@/components/film/AmbientFilm";
import { Link } from "@/i18n/navigation";
import { siteConfig } from "@/config/site";

/**
 * HomeHero — the only video on the site.
 *
 * One clip, looping, rewound to frame 0 every time the section re-enters the
 * viewport (see AmbientFilm). Scroll drives only the frame around it: the plate
 * lifts and two ink bars close in, so leaving the hero reads as a shot ending.
 * `currentTime` is never touched by scroll.
 *
 * Under the copy sits the offer rail — three hairline cells naming what the
 * company actually sells. Without it the hero states a thesis and never states
 * the offer, and a first-time visitor has to scroll blind to find out.
 */

const OFFERS = [
  { key: "pos", href: "/products/pos", accent: "var(--color-slate)" },
  { key: "ecommerce", href: "/products/ecommerce", accent: "var(--color-oxblood-tint)" },
  { key: "marketing", href: "/services/marketing", accent: "var(--color-brass)" },
] as const;

export function HomeHero() {
  const t = useTranslations("Home");
  const tOff = useTranslations("Offerings");
  const tFilm = useTranslations("Film");
  const tMedia = useTranslations("Media");
  const reduced = useReducedMotion();

  const sectionRef = useRef<HTMLElement>(null);
  const filmRef = useRef<HTMLDivElement>(null);
  const barTopRef = useRef<HTMLDivElement>(null);
  const barBottomRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [filmEnded, setFilmEnded] = useState(false);

  const handleFilmEnded = useCallback(() => setFilmEnded(true), []);
  const continueToContent = useCallback(() => {
    sectionRef.current?.nextElementSibling?.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "start",
    });
  }, [reduced]);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (reduced) return;
    if (filmRef.current) {
      filmRef.current.style.transform = `translate3d(0, ${p * -10}%, 0) scale(${1 + p * 0.05})`;
      filmRef.current.style.opacity = String(1 - p * 0.3);
    }
    if (barTopRef.current) barTopRef.current.style.transform = `scaleY(${p})`;
    if (barBottomRef.current) barBottomRef.current.style.transform = `scaleY(${p})`;
  });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const waHref = `https://wa.me/${siteConfig.contact.whatsapp}`;

  return (
    <section
      ref={sectionRef}
      aria-labelledby="hero-headline"
      className="relative h-[100svh] w-full overflow-hidden bg-ink-900"
    >
      <div ref={filmRef} className="parallax-layer absolute inset-0">
        {/* The one video on the site. Existing encode — swap the four paths
            when the new single-take hero clip lands. */}
        <AmbientFilm
          src="/films/hero-intro.mp4"
          srcPortrait="/films/hero-intro-portrait.mp4"
          poster="/films/hero-intro.jpg"
          posterPortrait="/films/hero-intro-portrait.jpg"
          className="absolute inset-0"
          onEnded={handleFilmEnded}
        />
      </div>

      {/* Legibility scrim. Heavier than before: the clip's brass seal sits behind
          the headline and its engraving was competing with the letterforms. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 78% 62% at 50% 46%, rgba(10,10,11,0.88) 0%, rgba(10,10,11,0.62) 52%, rgba(10,10,11,0.3) 100%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-2/5"
        style={{ background: "linear-gradient(to top, rgba(10,10,11,0.95), transparent)" }}
      />

      {/* Letterbox bars that close as the hero leaves. */}
      <div ref={barTopRef} aria-hidden className="absolute inset-x-0 top-0 h-[12svh] origin-top scale-y-0 bg-ink-900" />
      <div ref={barBottomRef} aria-hidden className="absolute inset-x-0 bottom-0 h-[12svh] origin-bottom scale-y-0 bg-ink-900" />

      {/* Copy — centred, the clip's reserved clear zone. */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-6 pb-[132px] pt-[72px] sm:pb-[112px]">
        <div className="w-full max-w-3xl text-center">
          <m.h1
            id="hero-headline"
            className="text-4xl font-semibold leading-[1.12] text-bone sm:text-5xl md:text-6xl"
            initial={reduced ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            {t("headlineLine1")}
            <br />
            <span className="text-mask">{t("headlineLine2")}</span>
          </m.h1>

          <m.p
            className="mx-auto mt-6 max-w-[48ch] leading-relaxed text-bone-muted"
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
          >
            {t("lead")}
          </m.p>

          <m.div
            className="mt-8 flex flex-wrap justify-center gap-3"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Link
              href="/contact"
              className="bg-brass px-7 py-3.5 font-mono text-sm font-semibold text-ink-900 transition-colors hover:bg-brass-hi"
            >
              {t("cta")}
            </Link>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-bone/30 px-7 py-3.5 font-mono text-sm text-bone transition-colors hover:border-brass hover:text-brass"
            >
              {t("ctaWhatsapp")}
            </a>
          </m.div>
        </div>
      </div>

      {/* ── Offer rail — what we actually sell, in the first viewport. ── */}
      <m.div
        className="absolute inset-x-0 bottom-0 z-20 border-t border-brass/15 bg-ink-900/80"
        initial={reduced ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.68, ease: [0.16, 1, 0.3, 1] }}
      >
        <ul className="mx-auto grid max-w-7xl grid-cols-1 sm:grid-cols-3">
          {OFFERS.map((o) => (
            <li key={o.key} className="border-b border-brass/10 last:border-b-0 sm:border-b-0 sm:border-s sm:border-brass/10 sm:first:border-s-0">
              <Link
                href={o.href}
                className="group relative flex items-baseline gap-3 px-6 py-3.5 transition-colors hover:bg-ink-800/60 sm:block sm:py-5"
              >
                <span
                  aria-hidden
                  className="rail-underline absolute inset-x-0 bottom-0 h-px"
                  style={{ backgroundColor: o.accent }}
                />
                <span className="font-mono text-xs uppercase tracking-[0.2em]" style={{ color: o.accent }}>
                  {tOff(`${o.key}.title`)}
                </span>
                <span className="text-sm text-bone-muted sm:mt-1.5 sm:block">
                  {tOff(`${o.key}.desc`)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </m.div>

      {/* Scroll cue — sits above the rail, and only while at the top. */}
      {!scrolled && (
        <m.button
          type="button"
          onClick={continueToContent}
          aria-label={tMedia("continue")}
          className={`absolute bottom-[176px] left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2 sm:bottom-[128px] ${
            filmEnded ? "text-brass-hi" : "text-brass"
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.1 }}
        >
          <m.div
            className="h-10 w-px origin-top bg-brass"
            animate={
              reduced
                ? {}
                : { scaleY: [0, 1, 0], transition: { duration: 2.4, repeat: Infinity, ease: "easeInOut" } }
            }
          />
          <span className="font-mono text-[10px] uppercase tracking-[0.25em]">
            {filmEnded ? tMedia("continue") : tFilm("scroll")}
          </span>
        </m.button>
      )}
    </section>
  );
}
