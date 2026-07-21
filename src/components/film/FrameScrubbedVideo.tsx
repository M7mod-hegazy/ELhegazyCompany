"use client";

import { useEffect, useRef } from "react";
import { FrameDecoderManager } from "@/lib/video/frame-decoder";
import { CanvasRenderer } from "@/lib/video/canvas-renderer";
import { FrameBuffer } from "@/lib/video/frame-buffer";
import { ScrollController } from "@/lib/video/scroll-controller";
import { isMobileDevice } from "@/lib/video/capabilities";

interface Props {
  desktopSrc: string;
  mobileSrc: string;
  poster: string;
  totalFrames: number;
  fps: number;
  onReady?: (info: { duration: number; frameCount: number }) => void;
  onError?: () => void;
}

/**
 * WebCodecs-based frame scrubber.
 * Decodes video frames in a Web Worker, draws to <canvas>.
 * RAF loop idles when scroll settles — zero CPU when static.
 */
export function FrameScrubbedVideo({
  desktopSrc,
  mobileSrc,
  poster,
  totalFrames,
  fps,
  onReady,
  onError,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<CanvasRenderer | null>(null);
  const bufferRef = useRef<FrameBuffer | null>(null);
  const decoderRef = useRef<FrameDecoderManager | null>(null);
  const controllerRef = useRef<ScrollController | null>(null);
  const posterImgRef = useRef<HTMLImageElement | null>(null);
  const isMobile = useRef(isMobileDevice());
  const lastDrawnFrame = useRef(-1);

  // Initialize everything
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const maxDpr = isMobile.current ? 1.0 : 1.5;
    const bufferCapacity = isMobile.current ? 30 : 60;

    const renderer = new CanvasRenderer(canvas, maxDpr);
    const buffer = new FrameBuffer(bufferCapacity);
    const controller = new ScrollController(totalFrames);

    rendererRef.current = renderer;
    bufferRef.current = buffer;
    controllerRef.current = controller;

    // Size canvas
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        renderer.resize(width, height);
        // Redraw current frame if any
        if (lastDrawnFrame.current >= 0) {
          const frame = buffer.get(lastDrawnFrame.current);
          if (frame) renderer.drawFrame(frame);
        }
      }
    });
    resizeObserver.observe(canvas.parentElement!);

    // Load poster image
    const posterImg = new Image();
    posterImg.src = poster;
    posterImg.onload = () => {
      posterImgRef.current = posterImg;
      // Draw poster to fill canvas while video loads
      renderer.drawImage(posterImg);
    };

    // Set up frame decoding
    const decoder = new FrameDecoderManager();
    decoderRef.current = decoder;

    const src = isMobile.current ? mobileSrc : desktopSrc;

    decoder.init(src, {
      onReady: (info) => {
        onReady?.({ duration: info.duration, frameCount: info.frameCount });
      },
      onFrame: (frameIndex, frame) => {
        buffer.set(frameIndex, frame);

        // If this is the frame we're currently seeking to, draw it
        if (frameIndex === controller.frameIndex) {
          renderer.drawFrame(frame);
          lastDrawnFrame.current = frameIndex;
        }

        // Evict frames far from current position
        buffer.evictBeyond(controller.frameIndex, isMobile.current ? 15 : 30);
      },
      onError: (msg) => {
        console.error("Frame decoder error:", msg);
        onError?.();
      },
    });

    // Set up scroll controller
    controller.onFrame((frameIndex) => {
      const frame = buffer.get(frameIndex);
      if (frame) {
        renderer.drawFrame(frame);
        lastDrawnFrame.current = frameIndex;
      }

      // Trigger preload of nearby frames
      const direction = frameIndex > (lastDrawnFrame.current || 0) ? "forward" : "backward";
      decoder.preload(frameIndex, direction);
    });

    return () => {
      resizeObserver.disconnect();
      decoder.destroy();
      renderer.destroy();
      buffer.clear();
      controller.destroy();
    };
  }, [desktopSrc, mobileSrc, poster, totalFrames, fps, onReady, onError]);

  return (
    <div className="absolute inset-0 h-full w-full">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full object-cover"
      />
    </div>
  );
}
