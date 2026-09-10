"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, m } from "framer-motion";
import { brand } from "@/lib/brand";
import type { ShotDevice } from "@/config/worlds";

export type LightboxShot = {
  world: string;
  shot: string;
  device: ShotDevice;
  label: string;
};

export function GalleryLightbox({
  shots,
  index,
  onClose,
  onIndexChange,
}: {
  shots: LightboxShot[];
  index: number;
  onClose: () => void;
  onIndexChange: (i: number) => void;
}) {
  const current = shots[index];

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragX, setDragX] = useState(0);

  const isZoomed = zoom > 1;

  const rootRef = useRef<HTMLDivElement>(null);
  const pointerStart = useRef({ x: 0, y: 0, t: 0 });
  const panOrigin = useRef({ x: 0, y: 0 });
  const lastPinchDist = useRef(0);
  // The pointer is genuinely pressed — hover alone must never move the image.
  const isDownRef = useRef(false);
  // Whether the press began on the image stage (vs. the backdrop/buttons).
  const isSwipeRef = useRef(false);

  function resetView() {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setDragX(0);
  }

  const goTo = useCallback(
    (i: number) => {
      resetView();
      onIndexChange((i + shots.length) % shots.length);
    },
    [shots.length, onIndexChange],
  );

  const prev = useCallback(() => goTo(index - 1), [goTo, index]);
  const next = useCallback(() => goTo(index + 1), [goTo, index]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose, prev, next]);

  // Native, non-passive wheel listener: zoom the image without letting the
  // wheel event reach the page (React's onWheel is passive, so preventDefault
  // there is ignored and the page scrolls behind the lightbox).
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setZoom((z) => Math.max(1, Math.min(8, z - e.deltaY * 0.002)));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // ── drag / swipe ──────────────────────────────────────────
  function handlePointerDown(e: React.PointerEvent) {
    isDownRef.current = true;
    const target = e.target as HTMLElement;
    isSwipeRef.current = !!target.closest("[data-lb-stage]");
    pointerStart.current = { x: e.clientX, y: e.clientY, t: Date.now() };
    panOrigin.current = { x: pan.x, y: pan.y };
    target.setPointerCapture?.(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!isDownRef.current) return;
    const dx = e.clientX - pointerStart.current.x;
    const dy = e.clientY - pointerStart.current.y;

    if (isZoomed) {
      setPan({
        x: panOrigin.current.x + dx,
        y: panOrigin.current.y + dy,
      });
    } else if (isSwipeRef.current) {
      setDragX(dx);
    }
  }

  function handlePointerUp(e: React.PointerEvent) {
    if (!isDownRef.current) return;
    isDownRef.current = false;
    const dx = e.clientX - pointerStart.current.x;
    const dy = e.clientY - pointerStart.current.y;
    const dt = Date.now() - pointerStart.current.t;

    if (!isZoomed && isSwipeRef.current) {
      // Horizontal, deliberate swipe only — a plain click, a diagonal drag, or
      // a slow drag must not flip the image.
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.2 && dt < 500) {
        if (dx > 0) { prev(); } else { next(); }
      }
      setDragX(0);
    }
  }

  // ── touch pinch ────────────────────────────────────────────
  function handleTouchStart(e: React.TouchEvent) {
    if (e.touches.length === 2) {
      lastPinchDist.current = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
    }
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const scale = dist / lastPinchDist.current;
      lastPinchDist.current = dist;
      setZoom(z => Math.max(1, Math.min(8, z * scale)));
    }
  }

  // ── render ────────────────────────────────────────────────
  const content = (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-ink-900/95 backdrop-blur-lg select-none"
      style={{ isolation: "isolate" }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* close */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute end-3 top-3 z-30 flex h-9 w-9 items-center justify-center rounded-full border border-brass/25 bg-ink-900/70 text-base text-brass transition-colors hover:border-brass hover:bg-ink-900 md:end-6 md:top-6 md:h-10 md:w-10 md:text-xl"
      >
        ✕
      </button>

      {/* prev — desktop only */}
      <button
        type="button"
        onClick={prev}
        aria-label="Previous"
        className="absolute start-3 top-1/2 z-30 hidden -translate-y-1/2 md:flex h-10 w-10 items-center justify-center rounded-full border border-brass/25 bg-ink-900/60 text-brass opacity-60 transition-all hover:border-brass hover:bg-ink-900 hover:opacity-100"
      >
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M13 4L7 10L13 16" />
        </svg>
      </button>

      {/* next — desktop only */}
      <button
        type="button"
        onClick={next}
        aria-label="Next"
        className="absolute end-3 top-1/2 z-30 hidden -translate-y-1/2 md:flex h-10 w-10 items-center justify-center rounded-full border border-brass/25 bg-ink-900/60 text-brass opacity-60 transition-all hover:border-brass hover:bg-ink-900 hover:opacity-100"
      >
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M7 4L13 10L7 16" />
        </svg>
      </button>

      {/* image wrap */}
      <div
        data-lb-stage
        className="relative flex max-h-[85vh] max-w-[92vw] items-center justify-center overflow-hidden md:max-h-[90vh] md:max-w-[90vw]"
      >
        <AnimatePresence mode="wait">
          <m.div
            key={current.shot}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: brand.ease.cinematic }}
            className="flex items-center justify-center"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/shots/${current.world}/${current.shot}.png`}
              alt={current.label}
              onDoubleClick={resetView}
              draggable={false}
              className="max-h-[85vh] max-w-[92vw] rounded-xl object-contain shadow-2xl md:max-h-[90vh] md:max-w-[90vw]"
              style={{
                transform: isZoomed
                  ? `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`
                  : `translateX(${dragX}px)`,
                transition: isZoomed ? "none" : "transform 0.15s ease-out",
              }}
            />
          </m.div>
        </AnimatePresence>
      </div>

      {/* dots */}
      {shots.length > 1 && (
        <div className="absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 gap-2 md:bottom-6">
          {shots.map((s, i) => (
            <button
              key={s.shot}
              type="button"
              aria-label={`Go to ${s.label}`}
              onClick={() => goTo(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === index
                  ? "w-6 bg-brass"
                  : "w-1.5 bg-brass/30 hover:bg-brass/60"
              }`}
            />
          ))}
        </div>
      )}

      {/* counter */}
      <span className="absolute bottom-4 end-4 z-30 font-display text-xs text-brass/50 md:bottom-6 md:text-sm">
        {String(index + 1).padStart(2, "0")}/{String(shots.length).padStart(2, "0")}
      </span>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(content, document.body);
}
