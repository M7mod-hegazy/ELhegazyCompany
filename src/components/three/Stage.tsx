"use client";

import { Canvas } from "@react-three/fiber";
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { useAdaptiveQuality } from "./useAdaptiveQuality";
import { CanvasErrorBoundary } from "./CanvasErrorBoundary";

type StageChildren =
  | ReactNode
  | ((progress: RefObject<number>) => ReactNode);

/**
 * Mounts an R3F canvas ONLY while the section is near the viewport, so many
 * sections can each have their own 3D without keeping every WebGL context
 * alive. Falls back to `poster` on weak/no-WebGL devices or on error.
 *
 * Provides a live scroll-progress ref (0 → 1 as the section travels through
 * the viewport) to function children, so scenes can be scroll-reactive.
 */
export function Stage({
  children,
  poster,
  className,
  camera = { position: [0, 0, 5], fov: 42 },
}: {
  children: StageChildren;
  poster?: ReactNode;
  className?: string;
  camera?: { position: [number, number, number]; fov: number };
}) {
  const quality = useAdaptiveQuality();
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const progress = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Continuously track how far the section has travelled through the viewport
  // (works with Lenis since we read layout each frame). Only while in view.
  useEffect(() => {
    if (!inView) return;
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let alive = true;
    const tick = () => {
      if (!alive) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      progress.current = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
    };
  }, [inView]);

  const show3D = quality === "high" || quality === "mid";

  return (
    <div ref={ref} className={className}>
      {show3D && inView ? (
        <CanvasErrorBoundary fallback={poster ?? null}>
          <Canvas
            dpr={quality === "high" ? [1, 2] : [1, 1.4]}
            camera={camera}
            gl={{ antialias: true, alpha: true }}
            style={{ background: "transparent" }}
          >
            {typeof children === "function" ? children(progress) : children}
          </Canvas>
        </CanvasErrorBoundary>
      ) : (
        (poster ?? null)
      )}
    </div>
  );
}
