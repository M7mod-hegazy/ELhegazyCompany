"use client";

import React, { useCallback, useLayoutEffect, useRef, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useScroll, useMotionValueEvent, useReducedMotion, m, useInView } from "framer-motion";
import { useLenis } from "lenis/react";
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

/** All three panels lead with real product material, full-bleed (a small
 * device-framed box centered in an otherwise-empty panel doesn't fill the
 * section the way a photo does — that framed treatment lives in
 * Grid/Compare instead, where reading the screenshot's detail is the
 * point). POS used to be a mood photo of receipts on a desk — evocative but
 * not actually the product. It's now the app's real login screen, which
 * doubles as a brand moment (the ELHEGAZI wordmark + phone number render
 * inside the screenshot itself). */
const REAL_SHOT: Partial<Record<PanelKey, string>> = {
  pos: "/shots/pos/login-full.png",
  ecommerce: "/shots/ecommerce/storefront.png",
  marketing: "/shots/marketing/ad-mockup.jpg",
};

/** All three are real UI screenshots, not mood photos — cropping any of
 * them into `cover` hides actual content (POS: the wordmark and the pitch
 * copy; ecommerce: whole product tiles and the promo banner's own edge;
 * marketing: the ad mockup's frame). `contain` shows the whole screenshot,
 * unedited, letterboxed by the plate's own dark background instead of
 * zoomed or cropped into. */
const REAL_SHOT_FIT: Partial<Record<PanelKey, "cover" | "contain">> = {
  pos: "contain",
  ecommerce: "contain",
  marketing: "contain",
};

/** `top` (the default below) is a `cover` framing choice — with `contain`
 * there's no crop to anchor away from, so plain centring reads best. */
const REAL_SHOT_POSITION: Partial<Record<PanelKey, string>> = {
  pos: "center",
  ecommerce: "center",
  marketing: "center",
};

/** The default 1.05 static zoom is a `cover`-only trick (it crops in from
 * every edge) — meaningless, and actively wrong, on a `contain` image. */
const REAL_SHOT_SCALE: Partial<Record<PanelKey, number>> = {
  pos: 1,
  ecommerce: 1,
  marketing: 1,
};

const ease = [0.22, 1, 0.36, 1] as const;

export function InstrumentsSection() {
  const t = useTranslations("Offerings");
  const locale = useLocale();
  const reduced = useReducedMotion();
  const lenis = useLenis();

  const trackRef = useRef<HTMLDivElement>(null);
  const panel0 = useRef<HTMLDivElement>(null);
  const panel1 = useRef<HTMLDivElement>(null);
  const panel2 = useRef<HTMLDivElement>(null);
  const panelRefs = React.useMemo(() => [panel0, panel1, panel2] as const, []);

  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);

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
          // Past panel: fully hidden, not dimmed. It used to sit at 30%
          // opacity in the exact same spot as the incoming panel — same
          // copy column, same position — so its headline/bullets/button
          // visibly double-exposed under the new panel's own copy. Gone
          // instead of ghosted, and unclickable so it can't steal a tap
          // meant for the panel now on top of it.
          panel.style.opacity = "0";
          panel.style.transform = "scale(0.94)";
          panel.style.zIndex = String(10 + i);
          panel.style.pointerEvents = "none";
        } else if (v >= start) {
          panel.style.opacity = "1";
          panel.style.transform = "scale(1)";
          panel.style.zIndex = String(20 + i);
          panel.style.pointerEvents = "auto";
        } else {
          panel.style.opacity = "1";
          panel.style.transform = "translateY(100%)";
          panel.style.zIndex = String(10 + i);
          panel.style.pointerEvents = "none";
        }
      });

      // Which panel the progress dots should light up. Only written to state
      // (a re-render) when the index actually changes, not on every scroll
      // frame — the dots don't need to track continuously, just snap to
      // whichever panel is current.
      const idx = Math.min(PANELS.length - 1, Math.max(0, Math.floor(v * PANELS.length)));
      if (idx !== activeIndexRef.current) {
        activeIndexRef.current = idx;
        setActiveIndex(idx);
      }
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

  // Progress dots jump to the middle of a panel's dwell range, not its exact
  // start — landing right on a boundary can round back into the previous
  // panel by a pixel. Goes through Lenis (when mounted) so the jump gets the
  // same eased scroll as everything else instead of a native hard snap.
  const jumpToPanel = useCallback(
    (index: number) => {
      const trackEl = trackRef.current;
      if (!trackEl) return;
      const trackTop = trackEl.getBoundingClientRect().top + window.scrollY;
      const targetProgress = (index + 0.5) / PANELS.length;
      const targetY = trackTop + targetProgress * (trackEl.offsetHeight - window.innerHeight);
      if (lenis) {
        lenis.scrollTo(targetY, { duration: 1.1 });
      } else {
        window.scrollTo({ top: targetY, behavior: "smooth" });
      }
    },
    [lenis]
  );

  // Reduced motion: skip the pinned/stacking stage entirely rather than
  // leave it inert. `apply()` never runs when `reduced` is true (correctly —
  // it's all scroll-jacking transforms), but the sticky stage still mounted
  // all three panels stacked with no styles applied, so two of the three
  // were simply invisible underneath the last one in DOM order with no way
  // to see them. The plain stacked sequence below (same one mobile always
  // uses) has no scroll-linked motion to disable in the first place.
  if (reduced) {
    return (
      <div aria-label={t("title")}>
        {PANELS.map((key, i) => (
          <PanelMobile
            key={key}
            panelKey={key}
            num={formatOrdinal(i + 1, locale)}
            t={t}
          />
        ))}
      </div>
    );
  }

  return (
    <>
      {/* ── Desktop: sticky stacking ──
          320vh previously — three screens of wheel-scrolling pinned in place
          before the page moved again, which read as the scroll getting stuck.
          180vh still gives each panel its own stretch of scroll to land on. */}
      <div
        ref={trackRef}
        className="relative hidden sm:block"
        style={{ height: "180vh" }}
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

          {/* Progress dots — the only way, besides scrolling, to tell you're
              mid-sequence or to jump straight to a panel. */}
          <div className="pointer-events-none absolute inset-x-0 bottom-6 z-40 flex justify-center gap-1 sm:bottom-8">
            {PANELS.map((key, i) => (
              <button
                key={key}
                type="button"
                onClick={() => jumpToPanel(i)}
                aria-label={t(`${key}.title`)}
                aria-current={activeIndex === i}
                className="pointer-events-auto flex items-center p-2"
              >
                <span
                  aria-hidden
                  className="h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width: activeIndex === i ? "1.75rem" : "0.375rem",
                    background: activeIndex === i ? PANEL_ACCENTS[key] : "var(--color-bone)",
                    opacity: activeIndex === i ? 1 : 0.3,
                  }}
                />
              </button>
            ))}
          </div>
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

/** The plate + the one stat that matters, over it.
 *
 * `travel` defaults to 0 (a static plate) because PanelPlate is used inside
 * the desktop stage, which is `position: sticky`. ParallaxImage computes its
 * own drift from *its host's* position in the viewport — but a sticky host
 * stops moving the instant it pins, so that drift freezes at whatever
 * arbitrary offset it had the moment the pin engaged, permanently shifting
 * the crop away from the intended `objectPosition`. That's what made the
 * ecommerce shot show a random strip of mid-page content instead of the
 * store's own header. PanelMobile (plain scroll flow, no sticky ancestor)
 * opts back into real parallax by passing `travel` explicitly. */
function PanelPlate({
  panelKey,
  t,
  travel = 0,
}: {
  panelKey: PanelKey;
  t: PanelProps["t"];
  travel?: number;
}) {
  const accent = PANEL_ACCENTS[panelKey];
  const realSrc = REAL_SHOT[panelKey];

  return (
    <div className="absolute inset-0 overflow-hidden bg-ink-900">
      <ParallaxImage
        src={realSrc ?? `/films/${PANEL_PLATE[panelKey]}.jpg`}
        travel={travel}
        scale={REAL_SHOT_SCALE[panelKey] ?? 1.05}
        quality={85}
        sizes="(max-width: 640px) 100vw, 50vw"
        objectPosition={realSrc ? (REAL_SHOT_POSITION[panelKey] ?? "top") : "center"}
        objectFit={REAL_SHOT_FIT[panelKey] ?? "cover"}
        className="absolute inset-0 overflow-hidden"
      />

      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to top, rgba(10,10,11,0.94) 0%, rgba(10,10,11,0.25) 48%, transparent 100%), radial-gradient(ellipse at 50% 100%, ${accent}22 0%, transparent 65%)`,
        }}
      />

      {/* Stat card. `py-5` + text-2xl — the old text-3xl overflowed the border.
          Smaller on mobile: the aspect-[4/3] plate is short enough that the
          full-size card ate into the shot above it (the pos login card's
          own bottom edge) — a tighter footprint below `sm:` keeps clear. */}
      <div className="absolute inset-x-3 bottom-3 border border-brass/20 bg-ink-900/85 px-3 py-2 sm:inset-x-8 sm:bottom-8 sm:px-5 sm:py-5">
        <p className="font-mono text-[0.55rem] uppercase tracking-[0.2em] text-bone-muted sm:text-[0.65rem]">
          {t(`${panelKey}.statLabel`)}
        </p>
        <p className="mt-0.5 font-mono text-lg font-semibold leading-none sm:mt-1.5 sm:text-2xl" style={{ color: accent }}>
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

      <h3 className="mb-3 max-w-[20ch] text-3xl font-semibold leading-snug text-bone">
        {t(`${panelKey}.goal`)}
      </h3>
      <p className="mb-6 max-w-[46ch] text-sm leading-relaxed text-bone-muted">
        {t(`${panelKey}.panelBody`)}
      </p>

      <ul className="mb-8 space-y-2.5">
        {bullets.map((item) => (
          <li key={item} className="flex items-center gap-3">
            <span aria-hidden className="h-px w-4 shrink-0" style={{ background: accent }} />
            <span className="text-sm text-bone-muted">{item}</span>
          </li>
        ))}
      </ul>

      {/* A real button, not a text link — this is the one action the panel
          exists to drive, so it should look like it. */}
      <Link
        href={PANEL_HREF[panelKey]}
        className="inline-flex w-fit items-center gap-2 self-start bg-brass px-6 py-3 font-mono text-xs font-semibold text-ink-900 transition-colors hover:bg-brass-hi"
      >
        {t("details")}
      </Link>
    </>
  );
}

/* ── Desktop panel ─────────────────────────────────────────────── */
const PanelDesktop = React.forwardRef<HTMLDivElement, PanelProps>(
  ({ panelKey, num, t }, ref) => (
    // `apply()` below only ever writes one of three fixed states per panel
    // (waiting / active / past) — never a value that continuously tracks
    // scroll position — so a short CSS transition has nothing to chase: it
    // plays once when a panel crosses a threshold, then sits still until the
    // next crossing. That turns the stack swap from an instant hard cut
    // into the soft cross-fade the section was always meant to read as.
    <div
      ref={ref}
      className="absolute inset-0 grid grid-cols-2 bg-ink-900 transition-[opacity,transform] duration-300 ease-out"
    >
      <div className="relative overflow-hidden bg-ink-800">
        <PanelPlate panelKey={panelKey} t={t} />
        <div
          aria-hidden
          className="absolute end-0 top-0 h-full w-px"
          style={{ backgroundColor: PANEL_ACCENTS[panelKey], opacity: 0.4 }}
        />
      </div>

      <div className="relative flex flex-col justify-center px-10 py-16 lg:px-16">
        {/* Accent glow — the copy half was flat opaque black; this ties it to
            the panel's own colour instead of reading as a dead zone. */}
        <div
          aria-hidden
          className="pointer-events-none absolute -end-24 top-1/3 -z-10 h-72 w-72 rounded-full opacity-[0.14] blur-[100px]"
          style={{ background: PANEL_ACCENTS[panelKey] }}
        />
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
        <PanelPlate panelKey={panelKey} t={t} travel={20} />
      </div>
      <PanelCopy panelKey={panelKey} num={num} t={t} />
    </m.div>
  );
}
