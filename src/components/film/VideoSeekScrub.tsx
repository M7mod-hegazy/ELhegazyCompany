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
 * Last-resort fallback using <video> currentTime seeking.
 * Cleaned-up version of the original approach with proper idle detection.
 */
export const VideoSeekScrub = forwardRef<VideoScrubHandle, Props>(
  function VideoSeekScrub(
    { desktopSrc, mobileSrc, poster, onReady, onError },
    ref,
  ) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const targetProgressRef = useRef(0);
    const inViewRef = useRef(true);
    const visibleRef = useRef(true);
    const rafRef = useRef(0);
    const curRef = useRef(0);
    const isMobile = isMobileDevice();

    useImperativeHandle(ref, () => ({
      seek: (progress: number) => {
        targetProgressRef.current = progress;
      },
    }));

    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      video.src = isMobile ? mobileSrc : desktopSrc;
      video.load();

      video.addEventListener("loadedmetadata", () => {
        onReady?.({ duration: video.duration });
      });
      video.addEventListener("error", () => onError?.());

      // Scrub loop with easing — same logic as original but with idle detection
      let settledCount = 0;
      let lastTime = -1;

      const tick = () => {
        if (inViewRef.current && visibleRef.current) {
          if (video.readyState >= 1 && Number.isFinite(video.duration)) {
            const target =
              targetProgressRef.current * Math.max(0, video.duration - 0.05);
            curRef.current += (target - curRef.current) * 0.16;

            if (Math.abs(video.currentTime - curRef.current) > 0.002) {
              try {
                video.currentTime = curRef.current;
              } catch {
                /* seek can throw mid-load */
              }
              settledCount = 0;
            } else if (Math.abs(video.currentTime - lastTime) < 0.001) {
              settledCount++;
            }
            lastTime = video.currentTime;
          }
        }

        // Idle after 3 settled frames
        if (settledCount < 3) {
          rafRef.current = requestAnimationFrame(tick);
        } else {
          // Restart on next scroll event
          const restart = () => {
            settledCount = 0;
            rafRef.current = requestAnimationFrame(tick);
            window.removeEventListener("scroll", restart);
          };
          window.addEventListener("scroll", restart, { passive: true, once: true });
        }
      };
      rafRef.current = requestAnimationFrame(tick);

      // IntersectionObserver
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
    }, [desktopSrc, mobileSrc, poster, onReady, onError, isMobile]);

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
