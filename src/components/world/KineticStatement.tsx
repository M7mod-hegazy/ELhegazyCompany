"use client";

import { useRef } from "react";
import { m, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";

/**
 * A statement beat between sections. The line reveals word-by-word as it
 * enters view. Previously pinned for 220vh of scroll-scrubbing — on a
 * touchpad or a smoothed scroller that read as the page "getting stuck" on
 * one sentence. It's a quick 60vh pass now: still a beat, not a hostage.
 */
export function KineticStatement({ worldKey }: { worldKey: string }) {
  const t = useTranslations(`Worlds.${worldKey}`);
  const ref = useRef<HTMLDivElement>(null);
  const words = t("statement").split(" ");
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "start 0.25"] });

  return (
    <section ref={ref} className="relative flex min-h-[60vh] items-center overflow-hidden py-20 sm:py-28">
      {/* Was a single radial glow centered at 50% — at wide viewports the
          ellipse never reached the edges, so the outer ~15% of the section on
          both sides read as flat, empty black next to the lit center. Two
          softer glows anchored off-center plus a wash across the full width
          keep every edge lightly lit instead of one hard void. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(90% 90% at 50% 50%, color-mix(in oklab, var(--world-accent,#C9A86A) 10%, transparent), transparent 75%), radial-gradient(45% 70% at 12% 40%, color-mix(in oklab, var(--world-accent,#C9A86A) 8%, transparent), transparent 70%), radial-gradient(45% 70% at 88% 60%, color-mix(in oklab, var(--world-accent,#C9A86A) 8%, transparent), transparent 70%)",
        }}
      />
      <p className="font-display relative mx-auto max-w-5xl px-6 text-center text-4xl font-semibold leading-[1.15] sm:text-6xl lg:text-7xl">
        {words.map((w, i) => {
          const start = reduced ? 0 : i / words.length;
          const end = reduced ? 0 : (i + 1) / words.length;
          return <Word key={i} progress={scrollYProgress} range={[start, end]} text={w} reduced={!!reduced} />;
        })}
      </p>
    </section>
  );
}

function Word({
  progress,
  range,
  text,
  reduced,
}: {
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  range: [number, number];
  text: string;
  reduced: boolean;
}) {
  const opacity = useTransform(progress, range, [0.25, 1]);
  const color = useTransform(progress, range, ["#4a463d", "#EDE7DA"]);
  if (reduced) {
    return <span className="inline-block text-bone">{text} </span>;
  }
  return (
    <>
      <m.span style={{ opacity, color }} className="inline-block">
        {text}
      </m.span>{" "}
    </>
  );
}
