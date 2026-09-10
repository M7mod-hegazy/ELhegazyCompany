"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { ResilientImage } from "@/components/media/ResilientImage";

type CoverImageProps = {
  src: string;
  alt: string;
  sizes: string;
  quality?: number;
  priority?: boolean;
  /** Opacity applied to the whole cover (backdrop + subject together). */
  opacity?: number;
  /** Animate `opacity` changes (used by the collapsed/expanded panel state). */
  transitionOpacity?: boolean;
  /** Adds a subtle zoom on `.group:hover` — for grid tiles that already zoom on hover. */
  hoverZoom?: boolean;
  style?: CSSProperties;
};

/**
 * CoverImage — fills its container without ever cropping the subject.
 *
 * Plain `object-fit: cover` looks great on a landscape website screenshot but
 * butchers a portrait one (a phone/app screenshot, a mobile mockup): forced
 * into a wide, short panel, cover zooms in until only a sliver of the middle
 * survives — which is exactly what happened to Wesal's cover, a portrait app
 * screenshot, inside the home strip's wide hero panel.
 *
 * Fix: a blurred, scaled-up copy of the same image fills the container edge
 * to edge as a backdrop (so there's never an empty letterbox bar), and the
 * real image sits on top at `object-fit: contain` — fully visible, centered,
 * whatever its aspect ratio. Works the same for a wide desktop screenshot and
 * a tall phone screenshot with zero per-project configuration.
 */
export function CoverImage({
  src,
  alt,
  sizes,
  quality = 78,
  priority,
  opacity = 1,
  transitionOpacity,
  hoverZoom,
  style,
}: CoverImageProps) {
  return (
    <div
      className={`absolute inset-0 overflow-hidden ${
        hoverZoom ? "transition-transform duration-500 group-hover:scale-[1.04]" : ""
      }`}
      style={{
        opacity,
        transition: transitionOpacity ? "opacity 0.48s ease" : undefined,
        ...style,
      }}
    >
      {/* Backdrop — blurred, never seen sharp, purely fills the frame. */}
      <Image
        src={src}
        alt=""
        aria-hidden="true"
        fill
        sizes={sizes}
        quality={30}
        style={{
          objectFit: "cover",
          filter: "blur(32px) saturate(1.2)",
          transform: "scale(1.15)",
        }}
      />
      {/* Subject — always shown whole, never cropped. */}
      <ResilientImage
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        quality={quality}
        priority={priority}
        style={{ objectFit: "contain" }}
      />
    </div>
  );
}
