"use client";

import { useState, useRef, useCallback } from "react";
import { useLocale } from "next-intl";

export type VideoItem = {
  youtubeId: string;
  labelAr: string;
  labelEn: string;
};

export type VideoChapter = {
  time: string;
  seconds: number;
  labelAr: string;
  labelEn: string;
};

export function VideoWalkthrough({
  title,
  subtitle,
  videos,
  chapters,
  chapterHeading,
  playlistId,
}: {
  title: string;
  subtitle: string;
  videos: [VideoItem, ...VideoItem[]];
  chapters: VideoChapter[];
  chapterHeading: string;
  playlistId?: string;
}) {
  const [activeIdx, setActiveIdx] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const isAr = useLocale() === "ar";
  const active = videos[activeIdx];

  const seekTo = useCallback(
    (seconds: number) => {
      if (iframeRef.current) {
        iframeRef.current.src =
          `https://www.youtube-nocookie.com/embed/${active.youtubeId}?rel=0&modestbranding=1&start=${seconds}&autoplay=1`;
      }
    },
    [active.youtubeId],
  );

  const switchVideo = useCallback((idx: number) => {
    setActiveIdx(idx);
  }, []);

  return (
    <section className="border-t border-brass/12 bg-ink-900">
      <div className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
        {/* heading */}
        <h2 className="font-display text-3xl font-semibold text-brass sm:text-4xl">
          {title}
        </h2>
        <p className="mt-3 max-w-2xl leading-relaxed text-bone-muted">
          {subtitle}
        </p>

        {/* video embed */}
        <div className="relative mt-10 aspect-video w-full border border-brass/20 bg-ink-800">
          <iframe
            ref={iframeRef}
            src={`https://www.youtube-nocookie.com/embed/${active.youtubeId}?rel=0&modestbranding=1`}
            title={isAr ? active.labelAr : active.labelEn}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        </div>

        {/* video tabs */}
        {videos.length > 1 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {videos.map((v, i) => {
              const active = i === activeIdx;
              return (
                <button
                  key={v.youtubeId + i}
                  type="button"
                  onClick={() => switchVideo(i)}
                  className={`px-5 py-2.5 font-mono text-xs tracking-wider transition-colors ${
                    active
                      ? "bg-brass text-ink-900"
                      : "border border-brass/20 text-bone-muted hover:border-brass hover:text-brass"
                  }`}
                >
                  {isAr ? v.labelAr : v.labelEn}
                </button>
              );
            })}
          </div>
        )}

        {/* chapter list */}
        <div className="mt-12">
          <div className="rule-seal w-full max-w-md" />
          <h3 className="mt-6 font-mono text-xs uppercase tracking-[0.25em] text-bone-muted/70">
            {chapterHeading}
          </h3>
          <ul className="mt-5 grid gap-1.5 sm:grid-cols-2">
            {chapters.map((ch) => (
              <li key={ch.time}>
                <button
                  type="button"
                  onClick={() => seekTo(ch.seconds)}
                  className="group flex w-full items-center gap-3 py-2 text-left transition-colors hover:text-brass"
                >
                  <span className="font-mono text-sm tabular-nums text-brass/70 group-hover:text-brass">
                    {ch.time}
                  </span>
                  <span className="h-px flex-1 bg-brass/10 group-hover:bg-brass/30" />
                  <span className="text-sm text-bone-muted group-hover:text-bone">
                    {isAr ? ch.labelAr : ch.labelEn}
                  </span>
                </button>
              </li>
            ))}
          </ul>

          {playlistId && (
            <a
              href={`https://www.youtube.com/playlist?list=${playlistId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-brass/70 transition-colors hover:text-brass"
            >
              <span>{isAr ? "شاهد كل الفيديوهات" : "View all videos"}</span>
              <span aria-hidden>→</span>
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
