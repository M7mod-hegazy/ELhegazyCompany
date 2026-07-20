"use client";

import { useEffect, useRef, useState, forwardRef } from "react";
import {
  m,
  useScroll,
  useMotionValueEvent,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { useLenis } from "lenis/react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import { siteConfig } from "@/config/site";
import {
  homeFilm,
  totalVh,
  chapterStarts,
  type FilmChapterDef,
} from "@/config/film";
import { Magnetic } from "@/components/fx/Magnetic";

/**
 * The home page IS a film: one pinned full-screen video scrubbed by scroll,
 * five chapters (intro → marketing → pos → ecommerce → outro). Offering
 * chapters (2-4) have sub-beats that cycle through as scroll progresses,
 * revealing different aspects of the service step by step.
 *
 * Fallbacks: prefers-reduced-motion or a video load failure render the
 * chapters as stacked poster sections with the same copy — nothing breaks.
 */
export function HomeFilm() {
  const reduced = useReducedMotion();
  const [videoFailed, setVideoFailed] = useState(false);

  if (reduced || videoFailed) return <StackedFallback />;
  return <ScrubbedFilm onVideoError={() => setVideoFailed(true)} />;
}

/* ------------------------------------------------------------------ */

function ScrubbedFilm({ onVideoError }: { onVideoError: () => void }) {
  const trackRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const targetRef = useRef(0);
  const [active, setActive] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const t = useTranslations("Film");

  const n = homeFilm.chapters.length;
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  // Detect mobile on mount
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    targetRef.current = v;
    const idx = Math.min(n - 1, Math.floor(v * n));
    setActive((prev) => (prev === idx ? prev : idx));
  });

  // Scrub loop: ease the playhead toward the scroll target every frame.
  // The film is encoded all-keyframe, so seeking is cheap and smooth.
  useEffect(() => {
    let raf = 0;
    let cur = 0;
    const tick = () => {
      const vid = videoRef.current;
      if (vid && vid.readyState >= 1 && Number.isFinite(vid.duration)) {
        const target = targetRef.current * Math.max(0, vid.duration - 0.05);
        cur += (target - cur) * 0.16;
        if (Math.abs(vid.currentTime - cur) > 0.002) {
          try {
            vid.currentTime = cur;
          } catch {
            /* seek can throw mid-load; next frame retries */
          }
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const lenis = useLenis();
  const scrollToChapter = (i: number) => {
    const el = trackRef.current;
    if (!el) return;
    const top = el.offsetTop;
    const usable = el.offsetHeight - window.innerHeight;
    // land mid-chapter so the copy is fully on. Scroll THROUGH Lenis —
    // a raw window.scrollTo would fight its internal target.
    const target = top + usable * ((i + 0.5) / n);
    if (lenis) lenis.scrollTo(target, { duration: 1.2 });
    else window.scrollTo({ top: target, behavior: "smooth" });
  };

  return (
    <section
      ref={trackRef}
      className="relative"
      style={{ height: `${totalVh}vh` }}
      aria-label={t("filmLabel")}
    >
      <div className="sticky top-0 h-screen overflow-hidden bg-ink-900">
        <video
          ref={videoRef}
          src={isMobile ? homeFilm.srcMobile : homeFilm.src}
          poster={homeFilm.poster}
          muted
          playsInline
          preload="auto"
          onError={onVideoError}
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* cinematic letterbox + legibility scrim */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(10,10,11,0.72), transparent 18%, transparent 55%, rgba(10,10,11,0.78))",
          }}
        />

        {/* mobile-only extra darkening — video is too bright for small screens */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-black/30 sm:hidden"
        />

        {homeFilm.chapters.map((ch, i) => (
          <ChapterOverlay
            key={ch.id}
            chapter={ch}
            index={i}
            total={n}
            progress={scrollYProgress}
            isActive={active === i}
          />
        ))}

        <ChapterRail active={active} progress={scrollYProgress} onSelect={scrollToChapter} />

        {/* film progress hairline (mobile + desktop) */}
        <m.div
          aria-hidden
          className="absolute inset-x-0 bottom-0 z-20 h-[2px] origin-left bg-brass/70"
          style={{ scaleX: scrollYProgress }}
        />

        {/* scroll cue — only during the intro */}
        <ScrollCue progress={scrollYProgress} label={t("scroll")} />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

/** Piecewise-linear interpolation (clamped) — the tiny core of useTransform,
 *  applied imperatively so re-renders (active-chapter state) can never detach
 *  the scroll subscription from the element. */
function ramp(v: number, inputs: number[], outputs: number[]): number {
  if (v <= inputs[0]) return outputs[0];
  for (let i = 1; i < inputs.length; i++) {
    if (v <= inputs[i]) {
      const f = (v - inputs[i - 1]) / (inputs[i] - inputs[i - 1] || 1);
      return outputs[i - 1] + (outputs[i] - outputs[i - 1]) * f;
    }
  }
  return outputs[outputs.length - 1];
}

function ChapterOverlay({
  chapter,
  index,
  total,
  progress,
  isActive,
}: {
  chapter: FilmChapterDef;
  index: number;
  total: number;
  progress: MotionValue<number>;
  isActive: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const beats = chapter.subBeats;
  const beatCount = beats?.length ?? 0;

  // Proportional scroll range for this chapter
  const chapterStart = chapterStarts[index] / totalVh;
  const chapterEnd = (chapterStarts[index] + chapter.vh) / totalVh;
  const w = chapterEnd - chapterStart;
  const first = index === 0;
  const last = index === total - 1;

  const apply = (v: number) => {
    const el = ref.current;
    if (!el) return;
    const opacity = first
      ? ramp(v, [0, chapterEnd - 0.15 * w, chapterEnd - 0.02 * w], [1, 1, 0])
      : last
        ? ramp(v, [chapterStart + 0.02 * w, chapterStart + 0.15 * w, 1], [0, 1, 1])
        : ramp(
            v,
            [
              chapterStart + 0.02 * w,
              chapterStart + 0.15 * w,
              chapterEnd - 0.15 * w,
              chapterEnd - 0.02 * w,
            ],
            [0, 1, 1, 0],
          );
    const y = first || last ? 0 : ramp(v, [chapterStart, chapterEnd], [30, -30]);
    el.style.opacity = String(opacity);
    el.style.transform = `translateY(${y}px)`;
    el.style.visibility = opacity < 0.02 ? "hidden" : "visible";
  };

  useMotionValueEvent(progress, "change", apply);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => apply(progress.get()), []);

  const hasSubBeats = (chapter.subBeats?.length ?? 0) > 0;

  // Sub-beat chapters: mobile = compact header + full-height beat cards,
  // desktop = two-column cinematic layout
  if (hasSubBeats) {
    return (
      <div
        ref={ref}
        className="pointer-events-none absolute inset-0 z-10 flex flex-col sm:flex-col sm:items-center sm:justify-center sm:px-10 lg:px-16"
      >
        <div
          className="pointer-events-auto relative flex flex-col w-full h-full sm:h-auto sm:max-w-6xl sm:self-center"
          style={{ ["--accent" as string]: chapter.accent }}
        >
          <SubBeatChapter
            chapter={chapter}
            index={index}
            progress={progress}
            chapterStart={chapterStart}
            chapterEnd={chapterEnd}
          />
        </div>
      </div>
    );
  }

  // Non-sub-beat chapters: zone-based positioning using the video's negative space
  const zoneClass =
    chapter.zone === "center"
      ? "items-center justify-center text-center"
      : cn(
          "items-end justify-center pb-[13vh] text-center sm:pb-[15vh] sm:text-start",
          chapter.zone === "bottom-left"
            ? "sm:justify-start sm:rtl:justify-end"
            : "sm:justify-end sm:rtl:justify-start",
        );

  return (
    <div
      ref={ref}
      className={cn(
        "pointer-events-none absolute inset-0 z-10 flex px-6 sm:px-14",
        zoneClass,
      )}
    >
      <div
        className="pointer-events-auto relative max-w-xl"
        style={{ ["--accent" as string]: chapter.accent }}
      >
        <div
          aria-hidden
          className="absolute -inset-10 -z-10 sm:-inset-14"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(10,10,11,0.62) 0%, rgba(10,10,11,0.32) 55%, transparent 78%)",
          }}
        />
        <ChapterCopy chapter={chapter} isActive={isActive} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

/**
 * Offering chapters with sub-beats.
 *
 * DESKTOP (sm+): two-column cinematic layout — persistent header left,
 * sub-beats cycling right. Clip-path wipe transitions.
 *
 * MOBILE: completely different layout — ultra-compact single-line header
 * at the top, beat cards fill the remaining height, opacity-only
 * transitions, no images, fully readable.
 */
function SubBeatChapter({
  chapter,
  index,
  progress,
  chapterStart,
  chapterEnd,
}: {
  chapter: FilmChapterDef;
  index: number;
  progress: MotionValue<number>;
  chapterStart: number;
  chapterEnd: number;
}) {
  const beats = chapter.subBeats!;
  const beatCount = beats.length;
  const w = chapterEnd - chapterStart;

  const subBeatStart = chapterStart + 0.10 * w;
  const beatRange = (chapterEnd - subBeatStart) / beatCount;

  // Separate refs for mobile and desktop (both render, CSS hides one)
  const mobileOverviewRef = useRef<HTMLDivElement>(null);
  const desktopOverviewRef = useRef<HTMLDivElement>(null);
  const mobileBeatRefs = useRef<(HTMLDivElement | null)[]>([]);
  const desktopBeatRefs = useRef<(HTMLDivElement | null)[]>([]);

  const applyBeat = (el: HTMLDivElement, v: number, bStart: number, bEnd: number, isMobile: boolean) => {
    const beatW = bEnd - bStart;
    const enterEnd = bStart + 0.22 * beatW;
    const exitStart = bEnd - 0.35 * beatW;

    const opacity = Math.min(
      ramp(v, [bStart, enterEnd], [0, 1]),
      ramp(v, [exitStart, bEnd], [1, 0]),
    );

    el.style.opacity = String(opacity);
    el.style.visibility = opacity < 0.02 ? "hidden" : "visible";

    if (isMobile) {
      // Mobile: opacity only — clean fade, no clip/scale
      el.style.clipPath = "none";
      el.style.transform = "none";
    } else {
      // Desktop: cinematic clip-path wipe + scale + Y drift
      const clipEnter = ramp(v, [bStart, enterEnd], [100, 0]);
      const clipExit = ramp(v, [exitStart, bEnd], [0, 100]);
      const clipLeft = clipEnter > clipExit ? clipEnter : clipExit;
      const scaleIn = ramp(v, [bStart, enterEnd], [0.97, 1]);
      const scaleOut = ramp(v, [exitStart, bEnd], [1, 1.03]);
      const scale = scaleOut > scaleIn ? scaleOut : scaleIn;
      const y = ramp(v, [bStart, bEnd], [24, -24]);
      el.style.clipPath = `inset(0 ${clipLeft}% 0 0)`;
      el.style.transform = `translateY(${y}px) scale(${scale})`;
    }
  };

  const applyAll = (v: number) => {
    // Animate overview headers (mobile + desktop — only visible one shows)
    for (const ovEl of [mobileOverviewRef.current, desktopOverviewRef.current]) {
      if (ovEl) {
        const ovOpacity = ramp(
          v,
          [chapterStart, chapterStart + 0.05 * w, chapterStart + 0.10 * w],
          [0, 1, 1],
        );
        ovEl.style.opacity = String(ovOpacity);
        ovEl.style.visibility = ovOpacity < 0.02 ? "hidden" : "visible";
      }
    }

    // Animate mobile beats
    for (let i = 0; i < beatCount; i++) {
      const el = mobileBeatRefs.current[i];
      if (!el) continue;
      const bStart = subBeatStart + i * beatRange;
      applyBeat(el, v, bStart, bStart + beatRange, true);
    }

    // Animate desktop beats
    for (let i = 0; i < beatCount; i++) {
      const el = desktopBeatRefs.current[i];
      if (!el) continue;
      const bStart = subBeatStart + i * beatRange;
      applyBeat(el, v, bStart, bStart + beatRange, false);
    }
  };

  useMotionValueEvent(progress, "change", applyAll);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => applyAll(progress.get()), []);

  const contentBg = "rgba(10,10,11,0.55)";
  const contentBorder = "rgba(201,168,106,0.08)";

  return (
    <>
      {/* ── MOBILE: ultra-compact header strip ── */}
      <div className="sm:hidden pointer-events-auto">
        <div
          className="flex items-center gap-2 border-b px-4 pt-[env(safe-area-inset-top)] pb-2.5"
          style={{ backgroundColor: contentBg, borderColor: contentBorder }}
        >
          <div ref={mobileOverviewRef} className="flex items-center gap-2 min-w-0">
            <MobileChapterHeader chapter={chapter} />
          </div>
        </div>
      </div>

      {/* ── MOBILE: beat cards fill remaining space ── */}
      <div className="sm:hidden relative flex-1 min-h-0 pb-[env(safe-area-inset-bottom)]">
        {beats.map((beat, i) => (
          <MobileBeatCard
            key={beat.tKey}
            ref={(el) => { mobileBeatRefs.current[i] = el; }}
            chapter={chapter}
            beatIndex={i}
          />
        ))}
      </div>

      {/* ── DESKTOP: two-column layout (unchanged) ── */}
      <div className="hidden sm:flex sm:h-[78vh] sm:flex-row sm:items-stretch sm:gap-0 rtl:sm:flex-row-reverse">
        {/* Persistent header — fades in and NEVER hides */}
        <div className="relative flex-none flex flex-col justify-center sm:w-[42%] sm:pe-8 lg:pe-12">
          <div
            className="relative rounded-2xl border px-8 py-6"
            style={{ backgroundColor: contentBg, borderColor: contentBorder }}
          >
            <div ref={desktopOverviewRef}>
              <ChapterHeader chapter={chapter} />
            </div>
          </div>
        </div>

        {/* Thin vertical divider */}
        <div
          aria-hidden
          className="w-px self-stretch my-8 bg-brass/15"
        />

        {/* Sub-beats animate here */}
        <div className="relative min-h-0 flex-1 sm:w-[58%]">
          {beats.map((beat, i) => (
            <SubBeatSlide
              key={beat.tKey}
              ref={(el) => { desktopBeatRefs.current[i] = el; }}
              chapter={chapter}
              beatIndex={i}
            />
          ))}
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */

/** Image with always-visible file name label ON TOP. */
function ScreenshotPlaceholder({ src }: { src: string }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="sm:w-[180px] sm:flex-none lg:w-[220px] relative overflow-hidden rounded-lg" style={{ aspectRatio: "4/3" }}>
      {/* image — loads behind the label */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        aria-hidden
        onLoad={() => setLoaded(true)}
        className={cn(
          "absolute inset-0 h-full w-full object-cover transition-opacity duration-500",
          loaded ? "opacity-100" : "opacity-0",
        )}
      />
      {/* label — ALWAYS on top */}
      <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg border border-dashed border-brass/25 bg-ink-900/70 p-3 text-center backdrop-blur-sm">
        <span className="mb-1 inline-block rounded-full bg-brass/15 px-2 py-0.5 text-[0.5rem] font-semibold tracking-widest text-brass">
          لقطة · SHOT
        </span>
        <p dir="ltr" className="text-[0.55rem] leading-tight text-bone-muted/70">
          {src}
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
const SubBeatSlide = forwardRef<
  HTMLDivElement,
  { chapter: FilmChapterDef; beatIndex: number }
>(function SubBeatSlide({ chapter, beatIndex }, ref) {
  const tOff = useTranslations("Offerings");
  const key = chapter.id;
  const beatNum = beatIndex + 1;
  const totalBeats = chapter.subBeats?.length ?? 4;
  const features = tOff.raw(`${key}.beat${beatNum}.features`) as string[] | undefined;
  const href = chapter.href ?? "/start";
  const img = chapter.subBeats?.[beatIndex]?.img;

  return (
    <div
      ref={ref}
      className="absolute inset-0 flex items-center px-3 sm:px-6 lg:px-10"
    >
      <div
        className="flex w-full flex-col gap-3 rounded-2xl border px-4 py-3 sm:max-w-2xl sm:flex-row sm:items-center sm:gap-6 sm:px-8 sm:py-6"
        style={{
          backgroundColor: "rgba(10,10,11,0.55)",
          borderColor: "rgba(201,168,106,0.08)",
        }}
      >
        {/* Text content */}
        <div className="flex-1 min-w-0">
          {/* Step progress dots */}
          <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
            {Array.from({ length: totalBeats }).map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1 sm:h-1.5 rounded-full transition-all duration-500",
                  i < beatNum
                    ? "w-4 sm:w-6 bg-brass"
                    : i === beatNum - 1
                      ? "w-5 sm:w-8 bg-brass/80"
                      : "w-2 sm:w-3 bg-white/20",
                )}
              />
            ))}
            <span className="ml-1 text-[0.55rem] uppercase tracking-[0.15em] text-white/50 sm:ml-2 sm:text-[0.6rem] sm:tracking-[0.2em]">
              {beatNum} / {totalBeats}
            </span>
          </div>

          <h3 className="font-display-ar text-base font-semibold text-white sm:text-xl sm:font-medium lg:text-2xl">
            {tOff(`${key}.beat${beatNum}.title`)}
          </h3>

          <div className="mt-1.5 sm:mt-2 flex items-baseline gap-2">
            <span className="font-display-en text-xl font-bold tracking-tight text-brass sm:text-2xl lg:text-3xl">
              {tOff(`${key}.beat${beatNum}.stat`)}
            </span>
            <span className="text-[0.55rem] uppercase tracking-[0.12em] text-white/50 sm:text-[0.6rem] sm:tracking-[0.15em]">
              {tOff(`${key}.beat${beatNum}.statLabel`)}
            </span>
          </div>

          <p className="mt-1.5 sm:mt-2 text-xs leading-relaxed text-white/70 sm:text-sm">
            {tOff(`${key}.beat${beatNum}.desc`)}
          </p>

          {Array.isArray(features) && (
            <ul className="mt-1.5 sm:mt-2 flex flex-col gap-0.5 text-[0.65rem] text-white/60 sm:text-xs lg:text-sm">
              {features.map((f: string) => (
                <li key={f} className="flex items-center gap-1.5 sm:gap-2">
                  <span aria-hidden className="h-0.5 w-0.5 sm:h-1 sm:w-1 rounded-full bg-brass" />
                  {f}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-3 sm:mt-4">
            <Link
              href={href}
              className="inline-flex items-center gap-1.5 rounded-full bg-brass px-4 py-1.5 text-[0.65rem] font-semibold text-ink-900 transition-all duration-300 hover:-translate-y-0.5 hover:bg-brass-hi sm:px-5 sm:py-2 sm:text-xs lg:px-6 lg:text-sm"
            >
              {tOff(`${key}.beat${beatNum}.cta`)}
              <span aria-hidden className="text-[0.8em]">→</span>
            </Link>
          </div>
        </div>

        {/* Screenshot — shown when img is set */}
        {img && (
          <ScreenshotPlaceholder src={img} />
        )}
      </div>
    </div>
  );
});

/* ------------------------------------------------------------------ */

/** Ultra-compact mobile header — single line: "01 ── Title ── 3.8x" */
function MobileChapterHeader({ chapter }: { chapter: FilmChapterDef }) {
  const tOff = useTranslations("Offerings");
  const key = chapter.id;

  return (
    <>
      <span
        className="font-display-en text-lg font-semibold leading-none"
        style={{ color: "var(--accent)" }}
      >
        {chapter.num}
      </span>
      <span aria-hidden className="h-px w-4 shrink-0 bg-brass/40" />
      <span className="font-display-ar text-sm font-medium text-bone truncate min-w-0">
        {tOff(`${key}.title`)}
      </span>
      <span className="ms-auto shrink-0 font-display-en text-base font-bold text-brass">
        {tOff(`${key}.stat`)}
      </span>
    </>
  );
}

/* ------------------------------------------------------------------ */

/**
 * Mobile beat card — fills the remaining viewport height below the header.
 * No images, no clip-path, clean centered layout, opacity-only transitions.
 * Large touch targets for CTA.
 */
const MobileBeatCard = forwardRef<
  HTMLDivElement,
  { chapter: FilmChapterDef; beatIndex: number }
>(function MobileBeatCard({ chapter, beatIndex }, ref) {
  const tOff = useTranslations("Offerings");
  const key = chapter.id;
  const beatNum = beatIndex + 1;
  const totalBeats = chapter.subBeats?.length ?? 4;
  const features = tOff.raw(`${key}.beat${beatNum}.features`) as string[] | undefined;
  const href = chapter.href ?? "/start";
  const img = chapter.subBeats?.[beatIndex]?.img;

  return (
      <div
        ref={ref}
        className="absolute inset-0 flex items-center justify-center px-6"
      >
        <div
          className="flex w-full flex-col items-center text-center max-w-sm rounded-2xl px-5 py-6"
          style={{
            backgroundColor: "rgba(10,10,11,0.65)",
            boxShadow: "0 0 60px 20px rgba(10,10,11,0.4)",
          }}
        >
        {/* Step dots — prominent on mobile */}
        <div className="flex items-center gap-2.5 mb-2">
          {Array.from({ length: totalBeats }).map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all duration-500",
                i === beatNum - 1
                  ? "w-8 bg-brass"
                  : i < beatNum - 1
                    ? "w-5 bg-brass/60"
                    : "w-3 bg-white/15",
              )}
            />
          ))}
        </div>

        <span className="text-[0.6rem] uppercase tracking-[0.25em] text-white/35 mb-4">
          {beatNum} / {totalBeats}
        </span>

        <h3 className="font-display-ar text-lg font-semibold text-white leading-snug">
          {tOff(`${key}.beat${beatNum}.title`)}
        </h3>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-display-en text-3xl font-bold tracking-tight text-brass">
            {tOff(`${key}.beat${beatNum}.stat`)}
          </span>
          <span className="text-[0.6rem] uppercase tracking-[0.15em] text-white/45">
            {tOff(`${key}.beat${beatNum}.statLabel`)}
          </span>
        </div>

        <p className="mt-3 text-[0.8rem] leading-relaxed text-white/55 max-w-[260px]">
          {tOff(`${key}.beat${beatNum}.desc`)}
        </p>

        {Array.isArray(features) && features.length > 0 && (
          <ul className="mt-3 flex flex-col items-center gap-1 text-[0.7rem] text-white/45">
            {features.slice(0, 3).map((f: string) => (
              <li key={f} className="flex items-center gap-1.5">
                <span aria-hidden className="h-0.5 w-0.5 rounded-full bg-brass/60" />
                {f}
              </li>
            ))}
          </ul>
        )}

        {/* CTA — large touch target */}
        <Link
          href={href}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-brass px-8 py-3 text-sm font-semibold text-ink-900 min-h-[48px]"
        >
          {tOff(`${key}.beat${beatNum}.cta`)}
          <span aria-hidden className="text-[0.8em]">→</span>
        </Link>

        {/* Screenshot preview (small) */}
        {img && (
          <div className="mt-4 w-full max-w-[200px]">
            <ScreenshotPlaceholder src={img} />
          </div>
        )}
      </div>
    </div>
  );
});

/* ------------------------------------------------------------------ */

/** Compact persistent header for offering chapters — always visible, never hides. */
function ChapterHeader({ chapter }: { chapter: FilmChapterDef }) {
  const locale = useLocale();
  const display = locale === "ar" ? "font-display-ar" : "font-display-en";
  const tOff = useTranslations("Offerings");
  const tCommon = useTranslations("Common");
  const tFilm = useTranslations("Film");
  const key = chapter.id;
  const bullets = tOff.raw(`${key}.bullets`) as string[] | undefined;

  return (
    <div className="flex flex-col gap-2 sm:gap-4">
      <p className="flex items-center gap-3">
        <span
          className="font-display-en text-xl font-semibold leading-none sm:text-3xl"
          style={{ color: "var(--accent)" }}
        >
          {chapter.num}
        </span>
        <span aria-hidden className="h-px w-8 sm:w-10 bg-brass/50" />
        <span className="text-[0.6rem] uppercase tracking-[0.3em] text-bone-muted sm:text-[0.65rem] sm:tracking-[0.35em]">
          {tOff("kicker")}
        </span>
      </p>

      <h2 className={`${display} text-xl font-medium leading-[1.1] text-bone sm:text-4xl`}>
        {tOff(`${key}.title`)}
      </h2>

      <div className="flex items-baseline gap-2 sm:gap-3">
        <span className="font-display-en text-2xl font-bold tracking-tight text-brass sm:text-4xl">
          {tOff(`${key}.stat`)}
        </span>
        <span className="text-[0.6rem] uppercase tracking-[0.15em] text-bone-muted sm:text-xs sm:tracking-[0.2em]">
          {tOff(`${key}.statLabel`)}
        </span>
      </div>

      <p className="hidden sm:block max-w-sm text-sm leading-relaxed text-bone-muted">
        {tOff(`${key}.goal`)}
      </p>

      {Array.isArray(bullets) && (
        <ul className="hidden sm:flex flex-col gap-1 text-sm text-bone-muted/80">
          {bullets.map((b: string) => (
            <li key={b} className="flex items-center gap-2">
              <span aria-hidden className="h-1 w-1 rounded-full bg-brass/60" />
              {b}
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1">
        {chapter.href && (
          <Link
            href={chapter.href}
            className="inline-flex items-center gap-1.5 rounded-full bg-brass px-4 py-2 text-xs font-semibold text-ink-900 transition-all duration-300 hover:-translate-y-0.5 hover:bg-brass-hi sm:px-6 sm:text-sm"
          >
            {tOff("details")}
            <span aria-hidden className="text-[0.8em]">→</span>
          </Link>
        )}
        {key === "pos" && (
          <Link
            href="/products/pos/download"
            className="inline-flex items-center gap-1.5 rounded-full border border-brass/40 px-4 py-2 text-xs font-semibold text-bone transition-colors duration-300 hover:border-brass hover:text-brass sm:px-6 sm:text-sm"
          >
            {tCommon("download")}
          </Link>
        )}
        {key === "ecommerce" && (
          <a
            href={siteConfig.store.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-brass/40 px-4 py-2 text-xs font-semibold text-bone transition-colors duration-300 hover:border-brass hover:text-brass sm:px-6 sm:text-sm"
          >
            {tFilm("visitStore")}
            <span aria-hidden className="text-[0.8em]">↗</span>
          </a>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

/** Staggered title-sequence reveal for one element. */
function Stag({
  on,
  step,
  children,
  className,
}: {
  on: boolean;
  step: number;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
        on ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0",
        className,
      )}
      style={{ transitionDelay: on ? `${step * 110}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}

function ChapterCopy({
  chapter,
  isActive,
}: {
  chapter: FilmChapterDef;
  isActive: boolean;
}) {
  const locale = useLocale();
  const display = locale === "ar" ? "font-display-ar" : "font-display-en";
  const tHome = useTranslations("Home");
  const tOff = useTranslations("Offerings");
  const tCta = useTranslations("CTA");
  const tFilm = useTranslations("Film");
  const tCommon = useTranslations("Common");
  const whatsappHref = `https://wa.me/${siteConfig.contact.whatsapp}`;

  const btnPrimary =
    "inline-block rounded-full bg-brass px-6 py-3 min-h-[48px] text-sm font-semibold text-ink-900 transition-all duration-300 hover:-translate-y-0.5 hover:bg-brass-hi sm:px-7 sm:py-3.5";
  const btnGhost =
    "inline-block rounded-full border border-brass/40 px-6 py-3 min-h-[48px] text-sm font-semibold text-bone transition-colors duration-300 hover:border-brass hover:text-brass sm:px-7 sm:py-3.5";

  if (chapter.id === "intro") {
    return (
      <div className="flex flex-col items-center">
        <Stag on={isActive} step={0}>
          <p className="text-[0.65rem] uppercase tracking-[0.35em] text-brass sm:text-xs">
            {tHome("kicker")}
          </p>
        </Stag>
        <Stag on={isActive} step={1}>
          <h1
            className={`${display} mt-4 text-4xl font-medium leading-[1.05] text-bone sm:text-6xl lg:text-7xl`}
          >
            <span className="block">{tHome("headlineLine1")}</span>
            <span className="text-mask block">{tHome("headlineLine2")}</span>
          </h1>
        </Stag>
        <Stag on={isActive} step={2}>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-bone-muted sm:text-lg">
            {tHome("lead")}
          </p>
        </Stag>
        <Stag on={isActive} step={3} className="mt-8">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Magnetic className="inline-block">
              <Link href="/start" className={btnPrimary}>
                {tHome("cta")}
              </Link>
            </Magnetic>
            <Magnetic className="inline-block">
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className={btnGhost}>
                {tHome("ctaWhatsapp")}
              </a>
            </Magnetic>
          </div>
        </Stag>
      </div>
    );
  }

  if (chapter.id === "outro") {
    return (
      <div>
        <Stag on={isActive} step={0}>
          <span aria-hidden className="block h-px w-14 bg-brass/70" />
        </Stag>
        <Stag on={isActive} step={1}>
          <h2 className={`${display} mt-5 text-3xl font-medium leading-tight text-bone sm:text-5xl`}>
            {tCta("title")}
          </h2>
        </Stag>
        <Stag on={isActive} step={2}>
          <p className="mt-4 max-w-md text-base leading-relaxed text-bone-muted">
            {tCta("subtitle")}
          </p>
        </Stag>
        <Stag on={isActive} step={3} className="mt-7">
          <div className="flex flex-wrap gap-4">
            <Link href="/start" className={btnPrimary}>
              {tCta("primary")}
            </Link>
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className={btnGhost}>
              {tCta("whatsapp")}
            </a>
          </div>
        </Stag>
      </div>
    );
  }

  // offering chapters: 01 marketing / 02 pos / 03 ecommerce
  const key = chapter.id;
  const bullets = tOff.raw(`${key}.bullets`) as string[] | undefined;
  return (
    <div>
      <Stag on={isActive} step={0}>
        <p className="flex items-center gap-3">
          <span
            className="font-display-en text-xl font-semibold leading-none sm:text-2xl"
            style={{ color: "var(--accent)" }}
          >
            {chapter.num}
          </span>
          <span aria-hidden className="h-px w-10 bg-brass/50" />
          <span className="text-[0.65rem] uppercase tracking-[0.35em] text-bone-muted">
            {tOff("kicker")}
          </span>
        </p>
      </Stag>
      <Stag on={isActive} step={1}>
        <h2 className="font-display-ar mt-4 text-3xl font-medium leading-[1.1] text-bone sm:text-5xl">
          {tOff(`${key}.title`)}
        </h2>
      </Stag>
      <Stag on={isActive} step={1.5}>
        <div className="mt-4 flex items-baseline gap-3">
          <span className="font-display-en text-4xl font-bold tracking-tight text-brass sm:text-5xl">
            {tOff(`${key}.stat`)}
          </span>
          <span className="text-xs uppercase tracking-[0.2em] text-bone-muted sm:text-sm">
            {tOff(`${key}.statLabel`)}
          </span>
        </div>
      </Stag>
      <Stag on={isActive} step={2}>
        <p className="mt-3 max-w-md text-base leading-relaxed text-bone-muted sm:text-lg">
          {tOff(`${key}.goal`)} — {tOff(`${key}.desc`)}
        </p>
      </Stag>
      {Array.isArray(bullets) && (
        <Stag on={isActive} step={2.5}>
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-bone-muted/80 sm:text-base">
            {bullets.map((b: string) => (
              <li key={b} className="flex items-center gap-2">
                <span aria-hidden className="h-1 w-1 rounded-full bg-brass/60" />
                {b}
              </li>
            ))}
          </ul>
        </Stag>
      )}
      <Stag on={isActive} step={3} className="mt-6">
        <div className="flex flex-wrap items-center justify-center gap-4 sm:justify-start">
          {chapter.href && (
            <Link
              href={chapter.href}
              className="inline-block rounded-full bg-brass px-7 py-3 text-sm font-semibold text-ink-900 transition-all duration-300 hover:-translate-y-0.5 hover:bg-brass-hi"
            >
              {tOff("details")}
            </Link>
          )}
          {key === "pos" && (
            <Link
              href="/products/pos/download"
              className="inline-block rounded-full border border-brass/40 px-7 py-3 text-sm font-semibold text-bone transition-colors duration-300 hover:border-brass hover:text-brass"
            >
              {tCommon("download")}
            </Link>
          )}
          {key === "ecommerce" && (
            <a
              href={siteConfig.store.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-full border border-brass/40 px-7 py-3 text-sm font-semibold text-bone transition-colors duration-300 hover:border-brass hover:text-brass"
            >
              {tFilm("visitStore")}
            </a>
          )}
        </div>
      </Stag>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function ChapterRail({
  active,
  progress,
  onSelect,
}: {
  active: number;
  progress: MotionValue<number>;
  onSelect: (i: number) => void;
}) {
  const t = useTranslations("Film");
  const fillRef = useRef<HTMLSpanElement>(null);

  useMotionValueEvent(progress, "change", (v) => {
    if (fillRef.current) fillRef.current.style.transform = `scaleY(${v})`;
  });

  return (
    <nav
      aria-label={t("railLabel")}
      className="absolute top-1/2 z-20 hidden -translate-y-1/2 md:block ltr:right-8 rtl:left-8"
    >
      {/* track */}
      <span
        aria-hidden
        className="absolute top-2 bottom-2 w-px bg-brass/10 ltr:right-[5px] rtl:left-[5px]"
      >
        {/* fill — scaleY driven by scroll */}
        <span
          ref={fillRef}
          className="absolute inset-x-0 top-0 h-full origin-top bg-brass/50"
          style={{ transform: "scaleY(0)" }}
        />
      </span>
      <ul className="relative flex flex-col gap-7">
        {homeFilm.chapters.map((ch, i) => {
          const on = active === i;
          return (
            <li key={ch.id}>
              <button
                type="button"
                onClick={() => onSelect(i)}
                aria-current={on ? "step" : undefined}
                aria-label={t(`rail.${ch.id}`)}
                className="group relative block p-0"
              >
                <span
                  aria-hidden
                  className={cn(
                    "mx-auto block rounded-full transition-[background-color,box-shadow] duration-300",
                    on
                      ? "h-3.5 w-3.5 bg-brass shadow-[0_0_10px_2px_rgba(201,168,106,0.4)]"
                      : "h-2.5 w-2.5 bg-bone-muted/20 group-hover:bg-bone-muted/40",
                  )}
                />
                <span
                  className={cn(
                    "absolute top-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-ink-900/80 px-3 py-1",
                    "text-[0.62rem] uppercase tracking-[0.22em]",
                    "transition-[opacity,transform] duration-300 ease-[var(--ease-cinematic)]",
                    "pointer-events-none",
                    on
                      ? "text-brass opacity-100 ltr:right-full ltr:mr-3 rtl:left-full rtl:ml-3"
                      : "text-bone-muted opacity-0 ltr:right-full ltr:mr-1 rtl:left-full rtl:ml-1 ltr:translate-x-2 rtl:-translate-x-2 group-hover:opacity-100 ltr:group-hover:translate-x-0 rtl:group-hover:translate-x-0",
                  )}
                >
                  {t(`rail.${ch.id}`)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Intro scroll cue, faded out imperatively for the same re-render immunity. */
function ScrollCue({
  progress,
  label,
}: {
  progress: MotionValue<number>;
  label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const apply = (v: number) => {
    const el = ref.current;
    if (!el) return;
    const o = ramp(v, [0, 0.06], [1, 0]);
    el.style.opacity = String(o);
    el.style.visibility = o < 0.02 ? "hidden" : "visible";
  };
  useMotionValueEvent(progress, "change", apply);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => apply(progress.get()), []);

  return (
    <div
      ref={ref}
      className="absolute inset-x-0 bottom-6 z-10 flex flex-col items-center gap-2 text-bone-muted"
    >
      <span className="text-[0.6rem] uppercase tracking-[0.4em]">{label}</span>
      <m.span
        aria-hidden
        className="block h-8 w-px bg-brass/60"
        animate={{ scaleY: [0.3, 1, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */

/** Poster image with always-visible file name label ON TOP. */
function PosterImage({ src }: { src: string }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      {/* image — loads behind the label */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        aria-hidden
        onLoad={() => setLoaded(true)}
        className={cn(
          "absolute inset-0 h-full w-full object-cover transition-opacity duration-500",
          loaded ? "opacity-60" : "opacity-0",
        )}
      />
      {/* label — ALWAYS on top */}
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <div className="text-center rounded-xl border border-dashed border-brass/25 bg-ink-900/70 px-5 py-3 backdrop-blur-sm">
          <span className="mb-1 inline-block rounded-full bg-brass/15 px-2 py-0.5 text-[0.55rem] font-semibold tracking-widest text-brass">
            صورة · POSTER
          </span>
          <p dir="ltr" className="text-[0.6rem] text-bone-muted/60">
            {src}
          </p>
        </div>
      </div>
    </>
  );
}

/** Reduced-motion / video-failure fallback: the same five chapters as calm
 *  stacked poster sections. */
function StackedFallback() {
  return (
    <div>
      {homeFilm.chapters.map((ch) => (
        <section
          key={ch.id}
          className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-24"
        >
          <PosterImage src={`${homeFilm.posterDir}/${ch.id}.jpg`} />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(10,10,11,0.8), rgba(10,10,11,0.45) 50%, rgba(10,10,11,0.85))",
            }}
          />
          <div className="relative z-10 mx-auto w-full max-w-3xl text-center">
            <div className="inline-block text-start">
              <ChapterCopy chapter={ch} isActive />
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
