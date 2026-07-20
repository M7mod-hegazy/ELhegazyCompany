"use client";

import { useState } from "react";
import { m } from "framer-motion";
import { useTranslations } from "next-intl";
import { brand } from "@/lib/brand";
import { cn } from "@/lib/cn";
import type { WorldVideo } from "@/config/worlds";

function fmt(t: number) {
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Builds the embed URL for the chosen provider, seeking to `start` seconds. */
function embedSrc(video: WorldVideo, start: number): string | null {
  if (!video.id) return null;
  switch (video.provider) {
    case "youtube":
      return `https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0&modestbranding=1&start=${Math.floor(start)}`;
    case "vimeo":
      return `https://player.vimeo.com/video/${video.id}?autoplay=1#t=${Math.floor(start)}s`;
    default:
      return null;
  }
}

export function VideoTheater({
  worldKey,
  video,
}: {
  worldKey: string;
  video: WorldVideo;
}) {
  const t = useTranslations(`Worlds.${worldKey}.video`);
  const [playing, setPlaying] = useState(false);
  const [start, setStart] = useState(0);
  const [active, setActive] = useState(0);
  const [posterLoaded, setPosterLoaded] = useState(false);
  const isLive = video.provider !== null && video.id !== null;

  function jump(sec: number, i: number) {
    setActive(i);
    setStart(sec);
    if (isLive) setPlaying(true);
  }

  const src = playing ? embedSrc(video, start) : null;

  return (
    <section className="relative mx-auto max-w-6xl px-6 py-16 md:py-24">
      <div className="mb-8 text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-brass">{t("kicker")}</p>
        <h2 className="font-display mt-4 text-3xl font-semibold text-bone sm:text-4xl">
          {t("title")}
        </h2>
      </div>

      <m.div
        initial={{ opacity: 0, scale: 0.97, y: 24 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.9, ease: brand.ease.cinematic }}
        className="relative overflow-hidden rounded-2xl border border-brass/25 bg-ink-900"
        style={{
          boxShadow:
            "0 50px 120px -50px rgba(0,0,0,0.95), inset 0 0 0 1px color-mix(in oklab, var(--world-accent, #C9A86A) 30%, transparent)",
        }}
      >
        {/* accent rim glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            background:
              "radial-gradient(60% 50% at 50% 0%, color-mix(in oklab, var(--world-accent,#C9A86A) 18%, transparent), transparent 70%)",
          }}
        />
        <div className="relative aspect-video w-full">
          {src ? (
            <iframe
              src={src}
              title={t("title")}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
            />
          ) : (
            <button
              type="button"
              onClick={() => isLive && setPlaying(true)}
              className="group absolute inset-0 grid place-items-center"
              aria-label={t("play")}
            >
              {/* poster image — loads behind the label */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={video.poster}
                alt=""
                onLoad={() => setPosterLoaded(true)}
                className={cn(
                  "absolute inset-0 h-full w-full object-cover transition-opacity duration-500",
                  posterLoaded ? "opacity-70" : "opacity-0",
                )}
              />
              {/* label — ALWAYS on top of the poster */}
              <div className="absolute inset-0 z-10 flex items-center justify-center">
                <div className="text-center rounded-xl border border-dashed border-brass/30 bg-ink-900/70 px-6 py-4 backdrop-blur-sm">
                  <span className="mb-2 inline-block rounded-full bg-brass/15 px-2.5 py-0.5 text-[0.6rem] font-semibold tracking-widest text-brass">
                    صورة · POSTER
                  </span>
                  <p dir="ltr" className="mt-2 text-[0.65rem] text-bone-muted/60">
                    {video.poster}
                  </p>
                </div>
              </div>
              <div
                aria-hidden
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(70% 60% at 50% 45%, transparent, rgba(10,10,11,0.75))",
                }}
              />
              <span className="relative flex flex-col items-center gap-4">
                <span className="grid h-20 w-20 place-items-center rounded-full border border-brass/40 bg-ink-900/60 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
                  <span className="ms-1 text-2xl text-brass">▶</span>
                </span>
                <span className="text-sm font-semibold text-bone">
                  {isLive ? t("play") : t("comingSoon")}
                </span>
              </span>
            </button>
          )}
        </div>
      </m.div>

      {/* chapter rail */}
      {video.chapters.length > 0 && (
        <div className="mt-6">
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-bone-muted">
            {t("chaptersTitle")}
          </p>
          <div className="flex snap-x gap-2 overflow-x-auto pb-2 md:flex-wrap md:overflow-visible">
            {video.chapters.map((c, i) => (
              <button
                key={c.id}
                type="button"
                onClick={() => jump(c.t, i)}
                className={cn(
                  "flex shrink-0 snap-start items-center gap-2 rounded-full border px-4 py-2 text-xs transition-colors",
                  active === i && playing
                    ? "border-brass bg-brass/15 text-brass"
                    : "border-brass/20 bg-ink-800/50 text-bone-muted hover:border-brass/50 hover:text-bone",
                )}
              >
                <span className="font-display tabular-nums" style={{ color: "var(--world-accent)" }}>
                  {fmt(c.t)}
                </span>
                {t(`chapters.${c.id}`)}
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
