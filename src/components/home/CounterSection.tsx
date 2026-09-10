"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { useScroll, useMotionValueEvent, useReducedMotion } from "framer-motion";
import { ResilientImage } from "@/components/media/ResilientImage";

/**
 * CounterSection — parallax #1, "خلف الكاونتر".
 *
 * Two redesigns back: four dots on the photograph, each hiding its label
 * behind a hover/tap — nothing readable at a glance. That became a visible
 * 4-up card grid instead, but it floated disconnected from the photo it sat
 * under, and one of the four ("the oak counter") was a tangent to the
 * section's actual claim (we run our own tech, not "we also make furniture").
 *
 * Now: three numbered pins sit directly on the real objects in the photo
 * (the screen, the printer, the ledger), and a matching numbered legend
 * below spells each one out — same "nothing hidden" principle, but the
 * numbers visually tie the claim to the actual photo instead of a floating
 * grid. Pins are children of the same parallax layer as the image, so they
 * track it exactly as it pans. They're hidden below `sm`: object-fit:cover
 * crops unpredictably on portrait phone aspect ratios, so a pin could easily
 * land off its object — the legend alone carries mobile.
 */

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

  // Numbered proof points. x/y are % of the parallax image layer (same box
  // the <Image fill> occupies), eyeballed against /bg/counter.jpg: the
  // screen glowing left-of-center, the receipt printer right of it, the
  // closed ledger (with the pen on top) low and left of the screen.
  const items = [
    { id: "hotspot1", num: 1, x: 38, y: 33 },
    { id: "hotspot2", num: 2, x: 57, y: 55 },
    { id: "hotspot3", num: 3, x: 33, y: 65 },
  ] as const;

  return (
    <section
      ref={sectionRef}
      className="relative isolate overflow-hidden"
      style={{ minHeight: "min(100svh, 900px)" }}
      aria-labelledby="counter-heading"
    >
      {/* ── Parallax image layer ── */}
      <div
        ref={layerRef}
        className="parallax-layer absolute inset-x-0"
        style={{ top: "-15%", height: "130%" }}
      >
        <ResilientImage
          src="/bg/counter.jpg"
          alt=""
          fill
          sizes="100vw"
          quality={82}
          style={{ objectFit: "cover", objectPosition: "center 60%" }}
        />

        {/* Numbered pins on the real objects — sits in the same box as the
            image so it parallax-scrolls with it. Hidden below `sm`: object-
            fit:cover crops unpredictably on portrait phones, so a pin could
            land off its object there. */}
        <div aria-hidden className="pointer-events-none absolute inset-0 hidden sm:block">
          {items.map((item) => (
            <span
              key={item.id}
              className="seal-round absolute flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center border border-brass bg-ink-900/70 font-mono text-xs text-brass-hi shadow-[0_0_0_4px_rgba(10,10,11,0.35)]"
              style={{ left: `${item.x}%`, top: `${item.y}%` }}
            >
              {item.num}
            </span>
          ))}
        </div>
      </div>

      {/* Legibility scrim — heavier now: it has to hold a full text block,
          not just a headline, over the photo's busy midground. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(10,10,11,0.94) 0%, rgba(10,10,11,0.72) 40%, rgba(10,10,11,0.55) 62%, rgba(10,10,11,0.88) 100%)",
        }}
      />

      {/* ── Copy + proof, all in the open ── */}
      <div className="relative z-20 mx-auto max-w-7xl px-6 py-[10svh]">
        <p className="mb-4 font-mono text-xs uppercase tracking-[0.28em] text-brass/80">
          {t("kicker")}
        </p>
        <h2
          id="counter-heading"
          className="max-w-[20ch] text-3xl font-semibold leading-[1.15] text-bone sm:text-4xl md:text-5xl"
        >
          {t("title")}
        </h2>
        <p className="mt-5 max-w-[52ch] leading-relaxed text-bone-muted">
          {t("body")}
        </p>

        {/* The legend matching the pins above — numbers instead of a
            repeated dot, so the eye can jump photo → number → text. */}
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {items.map((item) => (
            <div key={item.id} className="border border-brass/15 bg-ink-900/60 p-5 backdrop-blur-sm">
              <span
                aria-hidden
                className="seal-round mb-3 flex h-6 w-6 items-center justify-center border border-brass font-mono text-2xs text-brass"
              >
                {item.num}
              </span>
              <p className="mb-1.5 text-sm font-semibold text-bone">{t(`${item.id}.title`)}</p>
              <p className="text-xs leading-relaxed text-bone-muted">{t(`${item.id}.body`)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
