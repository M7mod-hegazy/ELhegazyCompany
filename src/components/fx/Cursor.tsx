"use client";

import { useEffect, useRef } from "react";

const TRAIL = 10;

/** Custom brass cursor with a comet trail; grows over interactive elements. */
export function Cursor() {
  const ring = useRef<HTMLDivElement>(null);
  const dots = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer:fine)").matches) return;
    if (containerRef.current) containerRef.current.style.display = "";
    let x = innerWidth / 2;
    let y = innerHeight / 2;
    let scale = 1;
    let target = 1;
    let raf = 0;
    let last = 0;
    let idleFrames = 0;
    const FRAME_MS = 33;
    const IDLE_THRESHOLD = 0.1;
    const IDLE_LIMIT = 4;
    let running = false;
    const pts = Array.from({ length: TRAIL }, () => ({ x, y }));

    const move = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      const el = (e.target as HTMLElement)?.closest(
        "a,button,input,textarea,select,[data-cursor]",
      );
      target = el ? 2.4 : 1;
      if (!running) startLoop();
    };

    const loop = (now: number) => {
      if (now - last < FRAME_MS) {
        raf = requestAnimationFrame(loop);
        return;
      }
      last = now;

      const prevX = pts[0]?.x ?? x;
      const prevY = pts[0]?.y ?? y;

      let px = x;
      let py = y;
      pts.forEach((p, i) => {
        p.x += (px - p.x) * 0.35;
        p.y += (py - p.y) * 0.35;
        px = p.x;
        py = p.y;
        const d = dots.current[i];
        if (d) {
          const s = 1 - i / TRAIL;
          d.style.transform = `translate(${p.x}px,${p.y}px) translate(-50%,-50%) scale(${s})`;
          d.style.opacity = `${s * 0.5}`;
        }
      });
      scale += (target - scale) * 0.15;
      if (ring.current) {
        ring.current.style.transform = `translate(${x}px,${y}px) translate(-50%,-50%) scale(${scale})`;
      }

      const dx = Math.abs(pts[0].x - prevX);
      const dy = Math.abs(pts[0].y - prevY);
      if (dx < IDLE_THRESHOLD && dy < IDLE_THRESHOLD) {
        idleFrames++;
        if (idleFrames >= IDLE_LIMIT) {
          running = false;
          return;
        }
      } else {
        idleFrames = 0;
      }
      raf = requestAnimationFrame(loop);
    };

    function startLoop() {
      running = true;
      idleFrames = 0;
      last = 0;
      raf = requestAnimationFrame(loop);
    }

    window.addEventListener("mousemove", move, { passive: true });
    startLoop();
    return () => {
      window.removeEventListener("mousemove", move);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={containerRef} style={{ display: "none" }}>
      {Array.from({ length: TRAIL }).map((_, i) => (
        <div
          key={i}
          ref={(el) => {
            dots.current[i] = el;
          }}
          aria-hidden
          className="pointer-events-none fixed left-0 top-0 z-[115] h-2 w-2 rounded-full bg-brass"
          style={{ opacity: 0, willChange: "transform" }}
        />
      ))}
      <div
        ref={ring}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[120] h-7 w-7 rounded-full border border-brass mix-blend-difference"
        style={{ willChange: "transform" }}
      />
    </div>
  );
}
