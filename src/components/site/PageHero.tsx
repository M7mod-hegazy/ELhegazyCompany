"use client";

import { useEffect, useRef, useState } from "react";
import { m, useReducedMotion, useScroll, useMotionValueEvent } from "framer-motion";
import { AmbientFilm } from "@/components/film/AmbientFilm";

export type PageHeroVideoKey = "marketing" | "pos" | "ecommerce" | "projects" | "contact" | "none";
export type PageHeroZone = "bottom-left" | "bottom-right" | "center" | "bottom-center";

export type PageHeroProps = {
  videoKey?: PageHeroVideoKey;
  kicker: string;
  title: string;
  subtitle?: string;
  numberTag?: string;
  chips?: readonly string[] | string[];
  zone?: PageHeroZone;
  accent?: string;
  actions?: React.ReactNode;
  bridge?: React.ReactNode;
  className?: string;
};

const ZONE_ALIGN: Record<PageHeroZone, string> = {
  "bottom-left": "items-start text-start max-w-3xl",
  "bottom-right": "items-end text-end max-w-3xl ms-auto",
  "center": "items-center text-center max-w-4xl mx-auto",
  "bottom-center": "items-center text-center max-w-4xl mx-auto",
};

const ease = [0.16, 1, 0.3, 1] as const;

/**
 * PageHero — Full-screen cinematic video hero for inner pages.
 * Runs AmbientFilm video background, handles scroll-driven parallax,
 * and seamlessly blends into page content without isolated island boxes.
 */
export function PageHero({
  videoKey,
  kicker,
  title,
  subtitle,
  numberTag,
  chips,
  zone = "bottom-left",
  accent = "var(--color-brass)",
  actions,
  bridge,
  className = "",
}: PageHeroProps) {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const filmRef = useRef<HTMLDivElement>(null);
  const barTopRef = useRef<HTMLDivElement>(null);
  const barBottomRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (reduced) return;
    if (filmRef.current) {
      filmRef.current.style.transform = `translate3d(0, ${p * -10}%, 0) scale(${1 + p * 0.05})`;
      filmRef.current.style.opacity = String(1 - p * 0.35);
    }
    const bar = `${p * 10}svh`;
    if (barTopRef.current) barTopRef.current.style.height = bar;
    if (barBottomRef.current) barBottomRef.current.style.height = bar;
  });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-label={title}
      className={`relative h-[100svh] min-h-[100svh] w-full overflow-hidden flex flex-col justify-between ${!videoKey || videoKey === "none" ? "bg-transparent" : "bg-ink-900"} ${className}`}
    >
      {/* ── 1. Full-screen Video Background (AmbientFilm) ── */}
      {videoKey && videoKey !== "none" && (
        <div ref={filmRef} className="parallax-layer absolute inset-0">
          <AmbientFilm
            src={`/films/page-${videoKey}-v2.mp4`}
            srcPortrait={`/films/page-${videoKey}-v2-portrait.mp4`}
            poster={`/films/page-${videoKey}-v2.jpg`}
            posterPortrait={`/films/page-${videoKey}-v2-portrait.jpg`}
            className="absolute inset-0"
          />
        </div>
      )}

      {/* ── 2. Legibility Scrims & Bottom Gradient Dissolve ── */}
      <div
        aria-hidden
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: videoKey && videoKey !== "none" ?
            "radial-gradient(ellipse 85% 75% at 50% 45%, rgba(10,10,11,0.88) 0%, rgba(10,10,11,0.6) 55%, rgba(10,10,11,0.35) 100%)" :
            "linear-gradient(to bottom, rgba(10,10,11,0.9) 0%, rgba(10,10,11,0.4) 100%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-1/2 z-10 pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, rgba(10,10,11,1) 0%, rgba(10,10,11,0.75) 40%, transparent 100%)",
        }}
      />

      {/* Letterbox curtain bars that close slightly on scroll */}
      <div ref={barTopRef} aria-hidden className="absolute inset-x-0 top-0 z-15 bg-ink-900 pointer-events-none" style={{ height: 0 }} />
      <div ref={barBottomRef} aria-hidden className="absolute inset-x-0 bottom-0 z-15 bg-ink-900 pointer-events-none" style={{ height: 0 }} />

      {/* ── 3. Content Copy Container with Safe Navbar & Scroll Padding ── */}
      <div className="relative z-20 flex h-full w-full flex-col justify-center px-6 pt-28 pb-20 sm:px-12 sm:pt-36 sm:pb-24 lg:px-20 max-w-7xl mx-auto">
        <div className={`flex flex-col w-full ${ZONE_ALIGN[zone]}`}>
          <m.div
            initial={reduced ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.1 }}
            className="flex items-center gap-3 mb-3"
          >
            {numberTag && (
              <>
                <span className="font-mono text-base sm:text-lg font-bold" style={{ color: accent }}>
                  {numberTag}
                </span>
                <span className="h-px w-8 bg-brass/30" />
              </>
            )}
            <span
              className="font-mono text-[0.7rem] sm:text-xs uppercase tracking-[0.3em] font-semibold"
              style={{ color: accent }}
            >
              {kicker}
            </span>
          </m.div>

          <m.h1
            initial={reduced ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 0.18 }}
            className="font-display text-3xl sm:text-5xl lg:text-6xl font-semibold leading-[1.12] text-bone tracking-tight"
          >
            {title}
          </m.h1>

          {subtitle && (
            <m.p
              initial={reduced ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease, delay: 0.3 }}
              className="mt-4 max-w-xl text-sm sm:text-base lg:text-lg leading-relaxed text-bone-muted"
            >
              {subtitle}
            </m.p>
          )}

          {chips && chips.length > 0 && (
            <m.div
              initial={reduced ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease, delay: 0.42 }}
              className="mt-5 flex flex-wrap gap-2"
            >
              {chips.map((c) => (
                <span
                  key={c}
                  className="rounded-full border border-brass/25 bg-ink-900/70 px-3.5 py-1 text-[0.72rem] sm:text-xs font-medium text-bone backdrop-blur-md"
                >
                  {c}
                </span>
              ))}
            </m.div>
          )}

          {actions && (
            <m.div
              initial={reduced ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease, delay: 0.52 }}
              className="mt-6 flex flex-wrap items-center gap-3.5"
            >
              {actions}
            </m.div>
          )}
        </div>
      </div>

      {/* ── 4. Bridge or Scroll Cue ── */}
      {bridge ? (
        <div className="relative z-20 w-full pb-4">{bridge}</div>
      ) : (
        !scrolled && (
          <m.div
            aria-hidden
            className="absolute bottom-4 left-1/2 z-20 hidden -translate-x-1/2 flex-col items-center gap-1.5 sm:flex pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <m.div
              className="h-6 w-px origin-top bg-brass/80"
              animate={
                reduced
                  ? {}
                  : { scaleY: [0, 1, 0], transition: { duration: 2.2, repeat: Infinity, ease: "easeInOut" } }
              }
            />
            <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-brass/80">
              SCROLL
            </span>
          </m.div>
        )
      )}
    </section>
  );
}


