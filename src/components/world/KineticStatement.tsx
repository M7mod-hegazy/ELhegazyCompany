"use client";

import { useRef } from "react";
import { m, useScroll, useTransform } from "framer-motion";
import { useTranslations } from "next-intl";

/**
 * A full-screen pinned statement moment. The line is revealed word-by-word,
 * scrubbed by scroll — a big cinematic beat between sections.
 */
export function KineticStatement({ worldKey }: { worldKey: string }) {
  const t = useTranslations(`Worlds.${worldKey}`);
  const ref = useRef<HTMLDivElement>(null);
  const words = t("statement").split(" ");
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  return (
    <section ref={ref} className="relative h-[220vh]">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 60% at 50% 50%, color-mix(in oklab, var(--world-accent,#C9A86A) 12%, transparent), transparent 70%)",
          }}
        />
        <p className="font-display relative mx-auto max-w-5xl px-6 text-center text-4xl font-semibold leading-[1.15] sm:text-6xl lg:text-7xl">
          {words.map((w, i) => {
            const start = i / words.length;
            const end = (i + 1) / words.length;
            return <Word key={i} progress={scrollYProgress} range={[start, end]} text={w} />;
          })}
        </p>
      </div>
    </section>
  );
}

function Word({
  progress,
  range,
  text,
}: {
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  range: [number, number];
  text: string;
}) {
  const opacity = useTransform(progress, range, [0.12, 1]);
  const color = useTransform(progress, range, ["#4a463d", "#EDE7DA"]);
  return (
    <>
      <m.span style={{ opacity, color }} className="inline-block">
        {text}
      </m.span>{" "}
    </>
  );
}
