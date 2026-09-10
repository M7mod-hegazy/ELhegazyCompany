"use client";

import { useRef } from "react";
import { useScroll, useMotionValueEvent, useReducedMotion } from "framer-motion";
import { ResilientImage } from "@/components/media/ResilientImage";

export type ParallaxImageProps = {
  src: string;
  /** Portrait source. Falls back to `src`. Rendered via <picture>-style CSS swap. */
  srcPortrait?: string;
  alt?: string;
  /**
   * How far the plate travels across a full pass through the viewport, as a
   * percentage of the section height. The layer is sized 100% + travel so the
   * edges never expose the ink behind it.
   */
  travel?: number;
  /** Static zoom applied on top of the travel. */
  scale?: number;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  className?: string;
  /** Object position, e.g. "center 60%". */
  objectPosition?: string;
  /** "cover" (default) fills the host, cropping overflow. "contain" shows
   *  the whole image letterboxed — for shots where nothing is safe to crop. */
  objectFit?: "cover" | "contain";
  /** Optional CSS filter, e.g. "grayscale(0.6) brightness(0.85)". */
  filter?: string;
};

/**
 * ParallaxImage — the site's single scroll-parallax primitive.
 *
 * This replaced the ambient <video> on every surface except the hero. Seven
 * simultaneously-decoding videos were the main reason the site felt heavy; a
 * still plate that drifts on scroll reads as the same cinematic language and
 * costs nothing to composite.
 *
 * Travel is written straight to element.style from a motion-value subscription —
 * never React state, so scrolling never triggers a render.
 */
export function ParallaxImage({
  src,
  srcPortrait,
  alt = "",
  travel = 28,
  scale = 1.05,
  priority = false,
  quality = 82,
  sizes = "100vw",
  className,
  objectPosition = "center",
  objectFit = "cover",
  filter,
}: ParallaxImageProps) {
  const reduced = useReducedMotion();
  const hostRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: hostRef,
    offset: ["start end", "end start"],
  });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const layer = layerRef.current;
    if (!layer || reduced) return;
    const y = (p - 0.5) * -travel;
    layer.style.transform = `translate3d(0, ${y}%, 0) scale(${scale})`;
  });

  // The layer is oversized by the travel distance and pulled up by half of it,
  // so at either end of the pass the plate still covers the whole host box.
  const over = reduced ? 0 : travel;

  return (
    <div ref={hostRef} className={className ?? "absolute inset-0 overflow-hidden"}>
      <div
        ref={layerRef}
        className="parallax-layer absolute inset-x-0"
        style={{ top: `-${over / 2}%`, height: `${100 + over}%` }}
      >
        <ResilientImage
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          quality={quality}
          priority={priority}
          className={srcPortrait ? "portrait:hidden" : undefined}
          style={{ objectFit, objectPosition, filter }}
        />
        {srcPortrait && (
          <ResilientImage
            src={srcPortrait}
            alt=""
            fill
            sizes={sizes}
            quality={quality}
            priority={priority}
            className="landscape:hidden"
            style={{ objectFit, objectPosition }}
          />
        )}
      </div>
    </div>
  );
}
