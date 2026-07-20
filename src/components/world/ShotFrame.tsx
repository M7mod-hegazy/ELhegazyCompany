"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import type { ShotDevice } from "@/config/worlds";

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
}: {
  world: string;
  shot: string;
  device: ShotDevice;
  label: string;
  className?: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const src = `/shots/${world}/${shot}.png`;

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
        "relative mx-auto flex w-full flex-col overflow-hidden rounded-xl border border-brass/20 bg-ink-800/70",
        aspect,
        className,
      )}
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
        {/* real screenshot — loads behind the label */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={label}
          onLoad={() => setLoaded(true)}
          className={cn(
            "absolute inset-0 h-full w-full object-cover object-top transition-opacity duration-500",
            loaded ? "opacity-100" : "opacity-0",
          )}
        />

        {/* label — ALWAYS on top of the image */}
        <div className="absolute inset-0 z-10 flex items-center justify-center p-4">
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
              /shots/{world}/{shot}.png
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
