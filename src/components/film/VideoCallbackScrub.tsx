"use client";

import { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import { CanvasRenderer } from "@/lib/video/canvas-renderer";
import { isMobileDevice } from "@/lib/video/capabilities";

interface Props {
  desktopSrc: string;
  mobileSrc: string;
  poster: string;
  onReady?: (info: { duration: number }) => void;
  onError?: () => void;
}

export interface VideoScrubHandle {
  seek: (progress: number) => void;
}

/**
 * Fallback scrubber using requestVideoFrameCallback + Canvas.
 * For browsers without WebCodecs (Firefox Android, older Safari).
 */
export const VideoCallbackScrub = forwardRef<VideoScrubHandle, Props>(
  function VideoCallbackScrub(
    { desktopSrc, mobileSrc, poster, onReady, onError },
    ref,
  ) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const rendererRef = useRef<CanvasRenderer | null>(null);
    const targetProgressRef = useRef(0);
    const videoDurationRef = useRef(0);
    const inViewRef = useRef(true);
    const visibleRef = useRef(true);
    const rafRef = useRef(0);
    const isMobile = isMobileDevice();

    useImperativeHandle(ref, () => ({
      seek: (progress: number) => {
        targetProgressRef.current = progress;
      },
    }));

    useEffect(() => {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (!canvas || !video) return;

      const renderer = new CanvasRenderer(canvas, isMobile ? 1.0 : 1.5);
      rendererRef.current = renderer;

      const ro = new ResizeObserver((entries) => {
        for (const e of entries) {
          renderer.resize(e.contentRect.width, e.contentRect.height);
        }
      });
      ro.observe(canvas.parentElement!);

      video.src = isMobile ? mobileSrc : desktopSrc;
      video.load();

      const onMeta = () => {
        videoDurationRef.current = video.duration;
        onReady?.({ duration: video.duration });
        renderer.drawImage(video);
      };
      video.addEventListener("loadedmetadata", onMeta);
      video.addEventListener("error", () => onError?.());

      // Per-frame draw loop
      const tick = () => {
        if (!inViewRef.current || !visibleRef.current || video.readyState < 2) {
          rafRef.current = requestAnimationFrame(tick);
          return;
        }

        const targetTime = targetProgressRef.current * videoDurationRef.current;
        const diff = Math.abs(video.currentTime - targetTime);
        if (diff > 0.016) {
          video.currentTime = targetTime;
        }

        if (video.readyState >= 2) {
          renderer.drawImage(video);
        }

        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);

      // IntersectionObserver
      const section = canvas.closest("section");
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
        ro.disconnect();
        observer?.disconnect();
        document.removeEventListener("visibilitychange", onVis);
        cancelAnimationFrame(rafRef.current);
        renderer.destroy();
      };
    }, [desktopSrc, mobileSrc, poster, onReady, onError, isMobile]);

    return (
      <div className="absolute inset-0 h-full w-full">
        <video ref={videoRef} muted playsInline preload="auto" className="hidden" aria-hidden />
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full object-cover" />
      </div>
    );
  },
);
