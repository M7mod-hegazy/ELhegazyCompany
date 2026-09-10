"use client";

import { useRef, useState } from "react";
import { m, useScroll, useTransform } from "framer-motion";
import { useTranslations } from "next-intl";
import { brand } from "@/lib/brand";
import { cn } from "@/lib/cn";
import { ShotFrame } from "./ShotFrame";
import { GalleryLightbox } from "./GalleryLightbox";
import type { Chapter } from "@/config/worlds";

export function StoryChapter({
  worldKey,
  chapter,
  index,
}: {
  worldKey: string;
  chapter: Chapter;
  index: number;
}) {
  const t = useTranslations(`Worlds.${worldKey}`);
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const shotY = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const glowY = useTransform(scrollYProgress, [0, 1], [-40, 40]);

  const allShots = [
    chapter.shot,
    ...(chapter.extraShots ?? []),
  ].map((s) => ({ world: worldKey, shot: s.id, device: s.device, label: t(`shots.${s.id}`) }));

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const bullets = (t.raw(`chapters.${chapter.id}.bullets`) as string[] | undefined) ?? [];
  const onRight = chapter.layout === "right";

  return (
    <section ref={ref} className="relative overflow-hidden py-24 md:py-32">
      {/* giant chapter number watermark */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute top-1/2 -z-0 -translate-y-1/2 font-display text-[28vw] font-bold leading-none opacity-[0.04] md:text-[16rem]",
          onRight ? "start-0 -ms-6" : "end-0 -me-6",
        )}
        style={{ color: "var(--world-accent)" }}
      >
        {String(index + 1).padStart(2, "0")}
      </span>

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 md:grid-cols-2 md:gap-20">
        {/* copy */}
        <m.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: brand.ease.cinematic }}
          className={cn("relative", onRight ? "md:order-1" : "md:order-2")}
        >
          <span
            aria-hidden
            className="absolute -start-6 top-1 hidden h-24 w-[3px] rounded-full md:block"
            style={{ background: "linear-gradient(var(--world-accent), transparent)" }}
          />
          <div className="flex items-center gap-3">
            <span className="font-display text-lg font-bold" style={{ color: "var(--world-accent)" }}>
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="h-px w-8 bg-brass/40" />
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-brass">
              {t(`chapters.${chapter.id}.kicker`)}
            </span>
          </div>
          <h2 className="font-display mt-5 text-4xl font-semibold leading-[1.1] text-bone sm:text-5xl lg:text-6xl">
            {t(`chapters.${chapter.id}.title`)}
          </h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-bone-muted">
            {t(`chapters.${chapter.id}.body`)}
          </p>
          {bullets.length > 0 && (
            <ul className="mt-7 flex flex-wrap gap-2.5">
              {bullets.map((b) => (
                <li
                  key={b}
                  className="rounded-full border border-brass/20 bg-ink-800/50 px-4 py-2 text-sm text-bone transition-colors hover:border-brass/50"
                >
                  {b}
                </li>
              ))}
            </ul>
          )}
        </m.div>

        {/* shot(s) with a soft accent panel behind */}
        <div className={cn("relative", onRight ? "md:order-2" : "md:order-1")}>
          <m.div
            aria-hidden
            style={{ y: glowY }}
            className="pointer-events-none absolute -inset-8 -z-0 rounded-[2.5rem] blur-2xl"
          >
            <div
              className="h-full w-full rounded-[2.5rem] opacity-40"
              style={{ background: "radial-gradient(60% 60% at 50% 40%, color-mix(in oklab, var(--world-accent,#C9A86A) 40%, transparent), transparent 70%)" }}
            />
          </m.div>
          <m.div
            style={{ y: shotY }}
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: brand.ease.cinematic }}
            className="relative"
          >
            <ShotFrame
              world={worldKey}
              shot={chapter.shot.id}
              device={chapter.shot.device}
              label={t(`shots.${chapter.shot.id}`)}
              priority={index === 0}
              onExpand={() => setLightboxIndex(0)}
            />
            {chapter.extraShots?.map((s, i) => (
              <div key={s.id} className="relative z-10 mx-auto mt-4 w-[74%] md:-mt-12 md:ms-auto md:me-0 md:w-[58%]">
                <ShotFrame world={worldKey} shot={s.id} device={s.device} label={t(`shots.${s.id}`)} priority={index === 0} onExpand={() => setLightboxIndex(i + 1)} />
              </div>
            ))}
          </m.div>
        </div>
      </div>

      {lightboxIndex !== null && (
        <GalleryLightbox
          shots={allShots}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onIndexChange={setLightboxIndex}
        />
      )}
    </section>
  );
}
