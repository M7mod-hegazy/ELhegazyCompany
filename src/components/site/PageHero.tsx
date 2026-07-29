"use client";

import { m, useReducedMotion } from "framer-motion";
import { ParallaxImage } from "@/components/fx/ParallaxImage";

export type PageHeroVideoKey = "marketing" | "pos" | "ecommerce" | "projects" | "contact";
export type PageHeroZone = "bottom-left" | "bottom-right" | "center" | "bottom-center";

/**
 * `full`  — plate edge to edge, copy sitting in its dark reserved zone.
 * `split` — plate holds one half, copy the other, divided by an accent hairline.
 *           Reads like an instrument datasheet. For the product pages.
 * `index` — short plate, copy on the ink below it, joined by a rule. For pages
 *           that open onto a list rather than a story.
 */
export type PageHeroVariant = "full" | "split" | "index";

export type PageHeroProps = {
  /** Which plate to show. Named `videoKey` so existing callers keep working. */
  videoKey: PageHeroVideoKey;
  kicker: string;
  title: string;
  subtitle?: string;
  /**
   * Where the copy sits, for `full` only. PHYSICAL corners — not RTL-aware.
   * The plates are composed with a specific dark reserved zone; mirroring would
   * put the copy over the bright subject. Do NOT convert to logical properties.
   */
  zone?: PageHeroZone;
  variant?: PageHeroVariant;
  /** Accent hairline colour for this page — ties the hero to its own world. */
  accent?: string;
  actions?: React.ReactNode;
  /**
   * Content that overlaps the section below, welding the hero to what follows
   * instead of stacking two unrelated blocks. Rendered on the ink, breaking the
   * plate's bottom edge.
   */
  bridge?: React.ReactNode;
};

const ZONE_STYLE: Record<PageHeroZone, React.CSSProperties> = {
  "bottom-left":   { bottom: 0, left: 0, right: "auto", top: "auto" },
  "bottom-right":  { bottom: 0, right: 0, left: "auto", top: "auto" },
  "center":        { top: "50%", left: "50%", transform: "translate(-50%, -50%)" },
  "bottom-center": { bottom: 0, left: "50%", transform: "translateX(-50%)" },
};

const SCRIM: Record<PageHeroZone, string> = {
  "bottom-left":
    "linear-gradient(to top right, rgba(10,10,11,0.93) 0%, rgba(10,10,11,0.45) 55%, rgba(10,10,11,0.12) 100%)",
  "bottom-right":
    "linear-gradient(to top left, rgba(10,10,11,0.93) 0%, rgba(10,10,11,0.45) 55%, rgba(10,10,11,0.12) 100%)",
  "center":
    "radial-gradient(ellipse at center, rgba(10,10,11,0.74) 0%, rgba(10,10,11,0.3) 75%, rgba(10,10,11,0.1) 100%)",
  "bottom-center":
    "linear-gradient(to top, rgba(10,10,11,0.93) 0%, rgba(10,10,11,0.4) 58%, rgba(10,10,11,0.1) 100%)",
};

const ease = [0.16, 1, 0.3, 1] as const;

/**
 * PageHero — the opening of every nav page.
 *
 * Two things changed from the previous version.
 *
 * It no longer mounts a <video>. Five pages × two encodes meant the site was
 * decoding video almost everywhere, which is what made scrolling feel heavy.
 * The home hero is the only moving image on the site now; here the plate drifts
 * on scroll, which reads as the same language at none of the cost.
 *
 * And it is no longer one shape reused five times. `variant` changes the actual
 * composition, `accent` carries each page's own colour, and `bridge` lets the
 * hero overlap whatever comes next — so a page opens like it was built for that
 * page rather than like a shared banner with the words swapped.
 */
export function PageHero({
  videoKey,
  kicker,
  title,
  subtitle,
  zone = "bottom-center",
  variant = "full",
  accent = "var(--color-brass)",
  actions,
  bridge,
}: PageHeroProps) {
  const reduced = useReducedMotion();

  const plate = (
    <ParallaxImage
      src={`/films/page-${videoKey}.jpg`}
      srcPortrait={`/films/page-${videoKey}-portrait.jpg`}
      travel={variant === "split" ? 10 : 14}
      scale={1.04}
      priority
      quality={82}
      sizes={variant === "split" ? "(max-width: 1024px) 100vw, 50vw" : "100vw"}
      className="absolute inset-0 overflow-hidden"
    />
  );

  const copy = (
    <m.div
      initial={reduced ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease, delay: 0.12 }}
    >
      <p className="mb-3 font-mono text-xs uppercase tracking-[0.25em]" style={{ color: accent }}>
        {kicker}
      </p>
      <h1 className="text-3xl font-semibold leading-tight text-bone sm:text-4xl md:text-5xl">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-4 max-w-[44ch] leading-relaxed text-bone-muted">{subtitle}</p>
      )}
      <div className="rule-seal mt-6 w-20" />
      {actions && <div className="mt-6">{actions}</div>}
    </m.div>
  );

  /* ── split: plate one side, datasheet copy the other ── */
  if (variant === "split") {
    return (
      <section className="relative bg-ink-900" aria-label={title}>
        <div className="grid min-h-[72svh] grid-cols-1 lg:grid-cols-2">
          <div className="relative order-2 min-h-[44svh] overflow-hidden lg:order-1 lg:min-h-0">
            {plate}
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, rgba(10,10,11,0.55) 0%, transparent 55%)",
              }}
            />
            <span
              aria-hidden
              className="absolute inset-y-0 end-0 hidden w-px lg:block"
              style={{ background: accent, opacity: 0.45 }}
            />
          </div>
          <div className="order-1 flex flex-col justify-center px-6 pb-12 pt-28 sm:px-10 lg:order-2 lg:px-16 lg:py-24">
            {copy}
          </div>
        </div>
        {bridge}
      </section>
    );
  }

  /* ── index: short plate, copy on the ink beneath it ── */
  if (variant === "index") {
    return (
      <section className="relative bg-ink-900" aria-label={title}>
        <div className="relative h-[38svh] min-h-[240px] overflow-hidden">
          {plate}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(10,10,11,1) 0%, rgba(10,10,11,0.35) 60%, rgba(10,10,11,0.15) 100%)",
            }}
          />
        </div>
        <div className="relative mx-auto -mt-16 max-w-7xl px-6 pb-4 sm:-mt-20">{copy}</div>
        {bridge}
      </section>
    );
  }

  /* ── full: plate edge to edge ── */
  return (
    <section
      className="relative overflow-hidden bg-ink-900"
      style={{ minHeight: "max(420px, min(64svh + 8vw, 72svh))" }}
      aria-label={title}
    >
      {plate}
      <div aria-hidden className="absolute inset-0" style={{ background: SCRIM[zone] }} />
      <div
        className="absolute z-10 p-8 sm:p-12"
        style={{ ...ZONE_STYLE[zone], maxWidth: "min(100%, 560px)" }}
      >
        {copy}
      </div>
      {bridge}
    </section>
  );
}
