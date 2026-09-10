"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { registerShot } from "@/lib/shotProgress";
import type { ShotDevice } from "@/config/worlds";

/** Tried in order until one loads. Covers whatever format a dropped-in photo
 *  happens to be — the owner shouldn't have to re-export to .png by hand. */
const SHOT_EXTS = ["png", "jpg", "jpeg", "webp"] as const;

/**
 * Shows a real screenshot from `public/shots/<world>/<shot>.png` when present;
 * otherwise a premium, labelled placeholder that tells the owner EXACTLY what
 * to capture. The placeholder is the base layer and the image is overlaid and
 * only revealed once it actually loads — so a missing file shows the clean
 * placeholder (never a broken-image icon).
 *
 * `device` picks the frame chrome (app window / thermal receipt / phone / browser / A4).
 */
export function ShotFrame({
  world,
  shot,
  device,
  label,
  className,
  onExpand,
  priority = false,
}: {
  world: string;
  shot: string;
  device: ShotDevice;
  label: string;
  className?: string;
  onExpand?: () => void;
  /** Above-the-fold shot: starts fetching immediately at high priority, and the
   *  brand preloader holds until it lands (see lib/shotProgress.ts). */
  priority?: boolean;
}) {
  const [loaded, setLoaded] = useState(false);
  // Index into SHOT_EXTS — advances on error so any dropped-in format is
  // found without the caller (or the owner) needing to know it up front.
  const [extIndex, setExtIndex] = useState(0);
  const exhausted = extIndex >= SHOT_EXTS.length;
  const src = exhausted ? "" : `/shots/${world}/${shot}.${SHOT_EXTS[extIndex]}`;
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (priority && src) registerShot(src);
  }, [priority, src]);

  // A cached image can finish loading (and fire `load`) before React attaches
  // the onLoad listener below — the browser doesn't replay that event, so
  // onLoad alone silently never fires and the placeholder never clears, even
  // though the photo is sitting right there decoded and ready. Catch that
  // already-complete case explicitly whenever the src changes.
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth > 0) setLoaded(true);
  }, [src]);

  const aspect =
    device === "thermal"
      ? "aspect-[9/16] max-w-[240px]"
      : device === "phone"
        ? "aspect-[9/19] max-w-[260px]"
        : device === "a4"
          ? "aspect-[1/1.414] max-w-[380px]"
          : "aspect-[16/10]";

  const chrome = device === "app" || device === "browser";

  return (
    <div
      className={cn(
        "group relative mx-auto flex w-full flex-col overflow-hidden rounded-xl border border-brass/20 bg-ink-800/70",
        aspect,
        onExpand && "cursor-pointer",
        className,
      )}
      onClick={onExpand}
      style={{
        boxShadow:
          "0 30px 80px -40px rgba(0,0,0,0.9), inset 0 0 0 1px color-mix(in oklab, var(--world-accent, #C9A86A) 22%, transparent)",
      }}
    >
      {chrome && (
        <div className="flex items-center gap-1.5 border-b border-brass/12 bg-ink-900/80 px-3 py-2">
          <span className="h-2.5 w-2.5 rounded-full bg-brass/50" />
          <span className="h-2.5 w-2.5 rounded-full bg-brass/30" />
          <span className="h-2.5 w-2.5 rounded-full bg-brass/20" />
          {device === "browser" && <span className="ms-3 h-4 flex-1 rounded bg-ink-700/70" />}
        </div>
      )}

      <div className="relative flex-1 overflow-hidden">
        {/* real screenshot — loads behind the label. Both layers crossfade
         * together (not "hard-swap the instant `loaded` flips") — the
         * placeholder eases out while the photo eases in and settles from a
         * slight scale, so a landing shot reads as a deliberate reveal
         * instead of a pop-in flash. The placeholder stays mounted the whole
         * time (never unmounts then remounts) so there's no flicker gap. */}
        {!exhausted && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={imgRef}
          src={src}
          alt={label}
          onLoad={() => setLoaded(true)}
          onError={() => setExtIndex((i) => i + 1)}
          fetchPriority={priority ? "high" : "auto"}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className={cn(
            "absolute inset-0 h-full w-full object-cover object-top transition-[opacity,transform] duration-700 ease-out",
            loaded ? "scale-100 opacity-100" : "scale-[1.03] opacity-0",
          )}
        />
        )}

        {/* placeholder overlay — crossfades out instead of unmounting */}
        <div
          aria-hidden={loaded}
          className={cn(
            "absolute inset-0 z-10 flex items-center justify-center p-4 transition-opacity duration-500",
            loaded ? "pointer-events-none opacity-0" : "opacity-100",
          )}
        >
            {["top-2 start-2 border-t border-s", "top-2 end-2 border-t border-e", "bottom-2 start-2 border-b border-s", "bottom-2 end-2 border-b border-e"].map(
              (pos) => (
                <span
                  key={pos}
                  aria-hidden
                  className={cn("pointer-events-none absolute h-4 w-4 border-brass/40", pos)}
                />
              ),
            )}
            <div className="max-w-[88%] rounded-lg border border-dashed border-brass/30 bg-ink-900/70 px-4 py-5 text-center backdrop-blur-sm">
              <span className="mb-2 inline-block rounded-full bg-brass/15 px-2.5 py-0.5 text-[0.6rem] font-semibold tracking-widest text-brass">
                لقطة شاشة · SHOT
              </span>
              <p className="text-xs leading-relaxed text-bone-muted">{label}</p>
              <p dir="ltr" className="mt-2 rounded bg-ink-900/60 px-2 py-1 font-mono text-[0.65rem] font-medium text-brass/80">
                /shots/{world}/{shot}.*
              </p>
            </div>
        </div>

        {/* expand overlay on hover */}
        {onExpand && loaded && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-ink-900/0 opacity-0 transition-all duration-300 group-hover:bg-ink-900/50 group-hover:opacity-100">
            <span className="flex h-12 w-12 items-center justify-center rounded-full border border-brass/50 bg-ink-900/70 text-brass backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M8 3H3V8" />
                <path d="M12 3H17V8" />
                <path d="M8 17H3V12" />
                <path d="M12 17H17V12" />
              </svg>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
