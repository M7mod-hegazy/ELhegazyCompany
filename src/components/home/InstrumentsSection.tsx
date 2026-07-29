"use client";

import React, { useCallback, useLayoutEffect, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useScroll, useMotionValueEvent, useReducedMotion, m, useInView } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { ParallaxImage } from "@/components/fx/ParallaxImage";
import { formatOrdinal } from "@/lib/num";

/**
 * InstrumentsSection — the three things we sell, one panel each.
 *
 * Desktop (≥640px): 320vh track, sticky stage, panels stacking.
 * Mobile (<640px): plain vertical sequence.
 *
 * Two fixes from the previous version:
 *
 *  - Panel transforms were written only inside the scroll subscription, so
 *    before the first scroll event no panel had any style and the LAST one in
 *    DOM order painted on top. Arriving at the section showed panel 3 first.
 *    The layout effect below applies the same state on mount.
 *  - Each panel mounted its own <video>. They are stills now; the plate drifts
 *    on scroll instead of decoding frames.
 */

const PANELS = ["pos", "ecommerce", "marketing"] as const;
type PanelKey = (typeof PANELS)[number];

const PANEL_ACCENTS: Record<PanelKey, string> = {
  pos: "var(--color-slate)",
  ecommerce: "var(--color-oxblood-tint)",
  marketing: "var(--color-brass)",
};

const PANEL_HREF: Record<PanelKey, string> = {
  pos: "/products/pos",
  ecommerce: "/products/ecommerce",
  marketing: "/services/marketing",
};

const PANEL_PLATE: Record<PanelKey, string> = {
  pos: "page-pos",
  ecommerce: "page-ecommerce",
  marketing: "page-marketing",
};

const ease = [0.22, 1, 0.36, 1] as const;

export function InstrumentsSection() {
  const t = useTranslations("Offerings");
  const locale = useLocale();
  const reduced = useReducedMotion();

  const trackRef = useRef<HTMLDivElement>(null);
  const panel0 = useRef<HTMLDivElement>(null);
  const panel1 = useRef<HTMLDivElement>(null);
  const panel2 = useRef<HTMLDivElement>(null);
  const panelRefs = React.useMemo(() => [panel0, panel1, panel2] as const, []);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  const apply = useCallback(
    (v: number) => {
      PANELS.forEach((_, i) => {
        const panel = panelRefs[i].current;
        if (!panel) return;
        const start = i / PANELS.length;
        const end = (i + 1) / PANELS.length;
        if (v >= end) {
          panel.style.opacity = "0.3";
          panel.style.transform = "scale(0.94)";
          panel.style.zIndex = String(10 + i);
        } else if (v >= start) {
          panel.style.opacity = "1";
          panel.style.transform = "scale(1)";
          panel.style.zIndex = String(20 + i);
        } else {
          panel.style.opacity = "1";
          panel.style.transform = "translateY(100%)";
          panel.style.zIndex = String(10 + i);
        }
      });
    },
    [panelRefs]
  );

  // Seed the stacking state before first paint. Without this the section opens
  // on whichever panel is last in the DOM.
  useLayoutEffect(() => {
    if (reduced) return;
    apply(scrollYProgress.get());
  }, [apply, reduced, scrollYProgress]);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (reduced) return;
    apply(v);
  });

  return (
    <>
      {/* ── Desktop: sticky stacking ── */}
      <div
        ref={trackRef}
        className="relative hidden sm:block"
        style={{ height: "320vh" }}
        aria-label={t("title")}
      >
        <div className="sticky top-0 h-svh overflow-hidden">
          {PANELS.map((key, i) => (
            <PanelDesktop
              key={key}
              ref={panelRefs[i]}
              panelKey={key}
              num={formatOrdinal(i + 1, locale)}
              t={t}
            />
          ))}
        </div>
      </div>

      {/* ── Mobile: stacked sequence ── */}
      <div className="block sm:hidden">
        {PANELS.map((key, i) => (
          <PanelMobile
            key={key}
            panelKey={key}
            num={formatOrdinal(i + 1, locale)}
            t={t}
          />
        ))}
      </div>
    </>
  );
}

/* ── Shared bits ────────────────────────────────────────────────── */
type PanelProps = {
  panelKey: PanelKey;
  num: string;
  t: ReturnType<typeof useTranslations>;
};

/** The plate + the one stat that matters, over it. */
function PanelPlate({ panelKey, t }: { panelKey: PanelKey; t: PanelProps["t"] }) {
  const accent = PANEL_ACCENTS[panelKey];

  return (
    <div className="absolute inset-0 overflow-hidden">
      <ParallaxImage
        src={`/films/${PANEL_PLATE[panelKey]}.jpg`}
        travel={10}
        scale={1.05}
        quality={80}
        sizes="(max-width: 640px) 100vw, 50vw"
        className="absolute inset-0 overflow-hidden"
      />

      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to top, rgba(10,10,11,0.94) 0%, rgba(10,10,11,0.25) 48%, transparent 100%), radial-gradient(ellipse at 50% 100%, ${accent}22 0%, transparent 65%)`,
        }}
      />

      {/* Stat card. `py-5` + text-2xl — the old text-3xl overflowed the border. */}
      <div className="absolute inset-x-6 bottom-6 border border-brass/20 bg-ink-900/85 px-5 py-5 sm:inset-x-8 sm:bottom-8">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-bone-muted">
          {t(`${panelKey}.statLabel`)}
        </p>
        <p className="mt-1.5 font-mono text-2xl font-semibold leading-none" style={{ color: accent }}>
          {t(`${panelKey}.stat`)}
        </p>
      </div>
    </div>
  );
}

/** Shared copy column. */
function PanelCopy({ panelKey, num, t }: PanelProps) {
  const accent = PANEL_ACCENTS[panelKey];
  const bullets = t.raw(`${panelKey}.bullets`) as string[];

  return (
    <>
      <p className="mb-4 flex items-baseline gap-3">
        <span className="font-mono text-lg font-semibold text-bone/30">{num}</span>
        <span
          className="font-mono text-xs uppercase tracking-[0.22em]"
          style={{ color: accent }}
        >
          {t(`${panelKey}.title`)}
        </span>
      </p>

      <h3 className="mb-3 max-w-[24ch] text-2xl font-semibold leading-snug text-bone">
        {t(`${panelKey}.goal`)}
      </h3>
      <p className="mb-6 max-w-[46ch] text-sm leading-relaxed text-bone-muted">
        {t(`${panelKey}.desc`)}
      </p>

      <ul className="mb-8 space-y-2.5">
        {bullets.map((item) => (
          <li key={item} className="flex items-center gap-3">
            <span aria-hidden className="h-px w-4 shrink-0" style={{ background: accent }} />
            <span className="text-sm text-bone-muted">{item}</span>
          </li>
        ))}
      </ul>

      {/* No arrow glyph: a hardcoded → points backwards in RTL. */}
      <Link
        href={PANEL_HREF[panelKey]}
        className="group inline-flex flex-col self-start font-mono text-xs text-brass"
      >
        {t("details")}
        <span aria-hidden className="rail-underline mt-1 h-px w-full bg-brass" />
      </Link>
    </>
  );
}

/* ── Desktop panel ─────────────────────────────────────────────── */
const PanelDesktop = React.forwardRef<HTMLDivElement, PanelProps>(
  ({ panelKey, num, t }, ref) => (
    <div
      ref={ref}
      className="absolute inset-0 grid grid-cols-2 bg-ink-900"
      style={{ transition: "opacity 0.42s ease, transform 0.42s ease" }}
    >
      <div className="relative overflow-hidden bg-ink-800">
        <PanelPlate panelKey={panelKey} t={t} />
        <div
          aria-hidden
          className="absolute end-0 top-0 h-full w-px"
          style={{ backgroundColor: PANEL_ACCENTS[panelKey], opacity: 0.4 }}
        />
      </div>

      <div className="flex flex-col justify-center px-10 py-16 lg:px-16">
        <PanelCopy panelKey={panelKey} num={num} t={t} />
      </div>
    </div>
  )
);
PanelDesktop.displayName = "PanelDesktop";

/* ── Mobile panel ──────────────────────────────────────────────── */
function PanelMobile({ panelKey, num, t }: PanelProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduced = useReducedMotion();

  return (
    <m.div
      ref={ref}
      className="relative border-t border-brass/10 px-6 py-14"
      initial={reduced ? false : { opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease }}
    >
      <span
        aria-hidden
        className="absolute inset-y-0 start-0 w-px"
        style={{ background: PANEL_ACCENTS[panelKey], opacity: 0.35 }}
      />
      <div className="relative mb-7 aspect-[4/3] w-full overflow-hidden border border-brass/15 bg-ink-800">
        <PanelPlate panelKey={panelKey} t={t} />
      </div>
      <PanelCopy panelKey={panelKey} num={num} t={t} />
    </m.div>
  );
}
