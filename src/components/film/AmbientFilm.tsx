"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useVideoAllowed, useIsPortrait } from "@/lib/video/capabilities";

export type AmbientFilmProps = {
  /** Landscape source, e.g. "/films/hero.mp4" */
  src: string;
  /** Portrait source. Falls back to `src` when omitted. */
  srcPortrait?: string;
  /** Still frame shown until the video paints, and permanently when it can't. */
  poster: string;
  /** Portrait still. Falls back to `poster`. */
  posterPortrait?: string;
  className?: string;
  /** Extra styles merged onto the <video> element. */
  videoStyle?: React.CSSProperties;
};

/**
 * AmbientFilm — the ONE video on the site.
 *
 * Rules this component exists to enforce:
 *
 *  1. The video plays itself at its natural rate. Scroll never touches
 *     `currentTime`. There is no requestAnimationFrame here.
 *  2. It loops, and it **restarts from frame 0 every time it re-enters the
 *     viewport**, so a visitor scrolling back up sees the shot from its opening
 *     rather than resuming mid-motion.
 *  3. The still is a real `next/image` layer underneath, not the `poster`
 *     attribute. Chrome renders `poster` letterboxed regardless of `object-fit`,
 *     which put black bands down every hero on the old build. The video paints
 *     over the still once it has real frames.
 *
 * Every other surface on the site uses `ParallaxImage` instead of this.
 */
export function AmbientFilm({
  src,
  srcPortrait,
  poster,
  posterPortrait,
  className,
  videoStyle,
}: AmbientFilmProps) {
  const videoAllowed = useVideoAllowed();
  const isPortrait = useIsPortrait();

  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [painting, setPainting] = useState(false);

  const resolvedSrc = isPortrait && srcPortrait ? srcPortrait : src;
  const resolvedPoster = isPortrait && posterPortrait ? posterPortrait : poster;

  /* ── Attach the source once permission is granted. ── */
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoAllowed) return;

    video.muted = true; // some mobile browsers ignore the JSX attribute
    video.loop = true;

    const absolute = new URL(resolvedSrc, window.location.href).href;
    if (video.currentSrc !== absolute) {
      video.src = resolvedSrc;
      video.load();
    }

    return () => {
      video.pause();
    };
  }, [videoAllowed, resolvedSrc]);

  /* ── Play/pause on visibility, and rewind on every re-entry. ── */
  useEffect(() => {
    const video = videoRef.current;
    const wrapper = wrapperRef.current;
    if (!video || !wrapper || !videoAllowed) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          // Rewind so the clip always opens on its first frame.
          try {
            video.currentTime = 0;
          } catch {
            /* seeking before metadata is harmless to skip */
          }
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.15 }
    );
    io.observe(wrapper);

    const onPlaying = () => setPainting(true);
    const onVisibility = () => {
      if (document.visibilityState === "hidden") video.pause();
      else if (isInViewport(wrapper) && video.src) video.play().catch(() => {});
    };

    video.addEventListener("playing", onPlaying);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      io.disconnect();
      video.removeEventListener("playing", onPlaying);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [videoAllowed]);

  /* ── Release the download on unmount. ── */
  useEffect(() => {
    const video = videoRef.current;
    return () => {
      if (!video) return;
      video.pause();
      video.removeAttribute("src");
      video.load();
    };
  }, []);

  return (
    // Positioning comes from `className` only. An inline `position` here would
    // beat an `absolute inset-0` class and collapse the box to zero height,
    // which stops the IntersectionObserver from ever firing.
    <div
      ref={wrapperRef}
      className={className ?? "relative h-full w-full"}
      style={{ overflow: "hidden" }}
    >
      {/* Still layer — always present, always correctly covered. */}
      <Image
        src={resolvedPoster}
        alt=""
        fill
        priority
        sizes="100vw"
        quality={82}
        style={{ objectFit: "cover", objectPosition: "center" }}
      />

      <video
        ref={videoRef}
        muted
        playsInline
        disablePictureInPicture
        disableRemotePlayback
        preload="auto"
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: painting ? 1 : 0,
          transition: "opacity 700ms var(--ease-out-soft)",
          ...videoStyle,
        }}
      />
    </div>
  );
}

function isInViewport(el: Element): boolean {
  const r = el.getBoundingClientRect();
  return r.bottom > 0 && r.top < window.innerHeight;
}
