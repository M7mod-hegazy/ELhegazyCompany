"use client";

import { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import { isMobileDevice } from "@/lib/video/capabilities";
import type { VideoScrubHandle } from "./VideoCallbackScrub";

interface Props {
  desktopSrc: string;
  mobileSrc: string;
  poster: string;
  onReady?: (info: { duration: number }) => void;
  onError?: () => void;
}

/**
 * Scroll-scrubbed <video> — sets currentTime directly from scroll progress.
 * No easing (scroll from framer-motion is already smooth).
 * RAF loop idles when scroll settles — zero CPU when static.
 */
export const VideoSeekScrub = forwardRef<VideoScrubHandle, Props>(
  function VideoSeekScrub(
    { desktopSrc, mobileSrc, onReady, onError },
    ref,
  ) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const targetProgressRef = useRef(0);
    const inViewRef = useRef(true);
    const visibleRef = useRef(true);
    const rafRef = useRef(0);
    const isMobile = isMobileDevice();

    // Store callbacks in refs so they never trigger useEffect re-run
    const onReadyRef = useRef(onReady);
    onReadyRef.current = onReady;
    const onErrorRef = useRef(onError);
    onErrorRef.current = onError;

    useImperativeHandle(ref, () => ({
      seek: (progress: number) => {
        targetProgressRef.current = progress;
      },
    }));

    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      const src = isMobile ? mobileSrc : desktopSrc;
      video.src = src;
      video.load();

      const onMeta = () => onReadyRef.current?.({ duration: video.duration });
      const onErr = () => onErrorRef.current?.();
      video.addEventListener("loadedmetadata", onMeta);
      video.addEventListener("error", onErr);

      let settledCount = 0;

      const tick = () => {
        if (inViewRef.current && visibleRef.current && video.readyState >= 2 && Number.isFinite(video.duration)) {
          const target = targetProgressRef.current * Math.max(0, video.duration - 0.05);

          // Only seek if the difference is meaningful (> 30ms)
          if (Math.abs(video.currentTime - target) > 0.03) {
            try {
              video.currentTime = target;
            } catch { /* seek can throw mid-load */ }
            settledCount = 0;
          } else {
            settledCount++;
          }
        }

        if (settledCount < 3) {
          rafRef.current = requestAnimationFrame(tick);
        } else {
          const restart = () => {
            settledCount = 0;
            rafRef.current = requestAnimationFrame(tick);
            window.removeEventListener("scroll", restart);
          };
          window.addEventListener("scroll", restart, { passive: true, once: true });
        }
      };
      rafRef.current = requestAnimationFrame(tick);

      const section = video.closest("section");
      const observer = section
        ? new IntersectionObserver(
            ([e]) => { inViewRef.current = e.isIntersecting; },
            { threshold: 0 },
          )
        : null;
      if (section && observer) observer.observe(section);

      const onVis = () => { visibleRef.current = !document.hidden; };
      document.addEventListener("visibilitychange", onVis);

      return () => {
        observer?.disconnect();
        document.removeEventListener("visibilitychange", onVis);
        cancelAnimationFrame(rafRef.current);
      };
    }, [desktopSrc, mobileSrc, isMobile]);

    return (
      <video
        ref={videoRef}
        muted
        playsInline
        preload="metadata"
        className="absolute inset-0 h-full w-full object-cover"
      />
    );
  },
);
