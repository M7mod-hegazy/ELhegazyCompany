"use client";

import { useRef, useState, useId } from "react";
import { useTranslations } from "next-intl";
import { useScroll, useMotionValueEvent, useReducedMotion } from "framer-motion";
import Image from "next/image";

/**
 * CounterSection — parallax #1, "خلف الكاونتر".
 *
 * Full-bleed photograph of a real shop counter with four tappable hotspots.
 * Copy sits in the upper third, which the image reserves as dark empty space.
 *
 * Parallax: the image is 130% of the section height and travels 22% of the
 * section height as it passes through the viewport. The previous ±60px was
 * imperceptible on a 800px-tall section, which is why it read as "not working".
 * Travel is written straight to element.style — never React state.
 */

/** Percentage positions measured against the real 16:9 photograph. */
const HOTSPOTS = [
  { id: "hotspot1", x: 37, y: 38 }, // the screen
  { id: "hotspot2", x: 55, y: 57 }, // the receipt printer
  { id: "hotspot3", x: 33, y: 73 }, // the ledger notebook
  { id: "hotspot4", x: 65, y: 77 }, // the brass keys
] as const;

export function CounterSection() {
  const t = useTranslations("Counter");
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Subscribe to scrollYProgress directly and do the math here. Every other
  // working section in this project uses this pattern.
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const layer = layerRef.current;
    if (!layer || reduced) return;
    // Image is 130% tall; travel the spare 30% across the full pass.
    const travel = (p - 0.5) * -28; // −14% … +14% of section height
    layer.style.transform = `translate3d(0, ${travel}%, 0)`;
  });

  return (
    <section
      ref={sectionRef}
      className="relative isolate overflow-hidden"
      style={{ minHeight: "min(100svh, 820px)" }}
      aria-labelledby="counter-heading"
    >
      {/* ── Parallax image layer ── */}
      <div
        ref={layerRef}
        className="parallax-layer absolute inset-x-0"
        style={{ top: "-15%", height: "130%" }}
      >
        <Image
          src="/bg/counter.jpg"
          alt=""
          fill
          sizes="100vw"
          quality={82}
          style={{ objectFit: "cover", objectPosition: "center 60%" }}
        />
      </div>

      {/* Legibility scrim — heaviest at the top where the copy sits. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(10,10,11,0.92) 0%, rgba(10,10,11,0.55) 34%, rgba(10,10,11,0.15) 58%, rgba(10,10,11,0.75) 100%)",
        }}
      />

      {/* ── Hotspots, positioned over the photograph ── */}
      <div className="absolute inset-0">
        {HOTSPOTS.map(({ id, x, y }) => (
          <Hotspot
            key={id}
            x={x}
            y={y}
            title={t(`${id}.title`)}
            body={t(`${id}.body`)}
          />
        ))}
      </div>

      {/* ── Copy, upper third ── */}
      <div className="relative z-20 mx-auto max-w-7xl px-6 pt-[10svh]">
        <p className="mb-4 font-mono text-xs uppercase tracking-[0.28em] text-brass/80">
          {t("kicker")}
        </p>
        <h2
          id="counter-heading"
          className="max-w-[18ch] text-3xl font-semibold leading-[1.15] text-bone sm:text-4xl md:text-5xl"
        >
          {t("title")}
        </h2>
        <p className="mt-5 max-w-[46ch] leading-relaxed text-bone-muted">
          {t("body")}
        </p>
        <p className="mt-6 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-brass/70">
          {t("hint")}
        </p>
      </div>
    </section>
  );
}

/* ── Hotspot ──────────────────────────────────────────────────────── */

function Hotspot({
  x,
  y,
  title,
  body,
}: {
  x: number;
  y: number;
  title: string;
  body: string;
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  // Flip the panel to the other side when the dot sits past the middle.
  const flip = x > 52;

  return (
    <div
      className="absolute z-20"
      style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={title}
        onClick={() => setOpen((o) => !o)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="relative grid h-11 w-11 place-items-center"
      >
        <span className="seal-round relative grid h-5 w-5 place-items-center border border-brass bg-ink-900/90">
          <span className="seal-round h-1.5 w-1.5 bg-brass" />
        </span>
      </button>

      {/* Always-visible short label — the name shouldn't be locked behind a hover. */}
      {!open && (
        <span
          aria-hidden
          className="pointer-events-none absolute top-full mt-1.5 whitespace-nowrap border border-brass/20 bg-ink-900/80 px-2 py-1 font-mono text-[0.65rem] text-bone-muted"
          style={flip ? { right: 0 } : { left: "50%", transform: "translateX(-50%)" }}
        >
          {title}
        </span>
      )}

      <div
        id={panelId}
        role="tooltip"
        hidden={!open}
        className="absolute top-1/2 w-56 -translate-y-1/2 border border-brass/25 bg-ink-900/95 p-3.5 text-start"
        style={flip ? { right: "calc(100% + 10px)" } : { left: "calc(100% + 10px)" }}
      >
        <p className="text-sm font-medium text-bone">{title}</p>
        <p className="mt-1.5 text-xs leading-relaxed text-bone-muted">{body}</p>
      </div>
    </div>
  );
}
