"use client";

import { frame } from "framer-motion";

/**
 * Lightweight scroll-section registry: components call `registerSection(id, el)`
 * with their root element. On each rAF, we compute which section occupies the
 * viewport centre and expose it via `resolveActive()`.
 */

type Section = { id: string; el: HTMLElement; top: number; height: number };

const sections: Section[] = [];
let activeId: string | null = null;

/** Normalised pointer position (−1 → +1) for parallax effects. */
export const pointer = { x: 0, y: 0 };

/** Drag delta for 3D rotation (reset each frame by consumers). */
export const drag = { dx: 0, dy: 0 };

if (typeof window !== "undefined") {
  window.addEventListener("mousemove", (e) => {
    pointer.x = (e.clientX / innerWidth) * 2 - 1;
    pointer.y = (e.clientY / innerHeight) * 2 - 1;
  }, { passive: true });

  window.addEventListener("mousedown", (e) => {
    const onUp = () => {
      drag.dx = 0;
      drag.dy = 0;
      window.removeEventListener("mouseup", onUp);
    };
    const onMove = (me: MouseEvent) => {
      drag.dx += me.movementX * 0.004;
      drag.dy += me.movementY * 0.004;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", () => {
      window.removeEventListener("mousemove", onMove);
      onUp();
    }, { once: true });
  });
}

export function registerSection(id: string, el: HTMLElement) {
  const existing = sections.findIndex((s) => s.id === id);
  const entry: Section = { id, el, top: 0, height: el.offsetHeight };
  if (existing >= 0) sections[existing] = entry;
  else sections.push(entry);
}

export function getSections() {
  return sections.map((s) => ({ id: s.id, top: s.top, height: s.height }));
}

/** Recalculate positions and return the section whose centre is closest to
 *  the viewport midpoint. `local` is 0→1 progress within that section. */
export function resolveActive(): { id: string | null; local: number } {
  const scrollY = window.scrollY;
  const centre = scrollY + innerHeight / 2;

  let best: string | null = null;
  let bestDist = Infinity;
  let bestLocal = 0;

  for (const s of sections) {
    const rect = s.el.getBoundingClientRect();
    s.top = rect.top + scrollY;
    s.height = rect.height;

    const mid = s.top + s.height / 2;
    const dist = Math.abs(centre - mid);
    if (dist < bestDist) {
      bestDist = dist;
      best = s.id;
      bestLocal = Math.max(0, Math.min(1, (centre - s.top) / s.height));
    }
  }

  activeId = best;
  return { id: best, local: bestLocal };
}

/**
 * Shared 250ms ticker for "what section is active" consumers (MoodTint,
 * SectionFlash). Each of those used to run its own `requestAnimationFrame`
 * loop — spinning every single frame just to check whether 250ms had
 * elapsed — and, on top of that, each one called `resolveActive()`
 * independently, so the `getBoundingClientRect()` read over every section
 * happened twice per tick from two uncoordinated loops. Neither loop was
 * synced with Framer Motion's own frame scheduler (the one Lenis and every
 * `useScroll` in the app now run through), so its read could land between
 * another component's write and force a synchronous layout — the "Forced
 * reflow" / long 'message' handler violations during scroll. One interval,
 * one read (routed through `frame.read` so it's batched with everything
 * else), fanned out to every listener.
 */
type ActiveListener = (active: { id: string | null; local: number }) => void;
const activeListeners = new Set<ActiveListener>();
let activeTimer: ReturnType<typeof setInterval> | null = null;

function tickActive() {
  frame.read(() => {
    const result = resolveActive();
    activeListeners.forEach((listen) => listen(result));
  });
}

export function subscribeActive(listener: ActiveListener): () => void {
  activeListeners.add(listener);
  if (!activeTimer) {
    tickActive();
    activeTimer = setInterval(tickActive, 250);
  }
  return () => {
    activeListeners.delete(listener);
    if (activeListeners.size === 0 && activeTimer) {
      clearInterval(activeTimer);
      activeTimer = null;
    }
  };
}
