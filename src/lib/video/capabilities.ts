"use client";
import { useEffect, useState } from "react";

/**
 * True when the device/user/network says: do not autoplay heavy video.
 * Returns a stable `false` on the server and the first client render so
 * server and client HTML match, then updates asynchronously.
 *
 * Autoplay is blocked when any of these is true:
 *  - prefers-reduced-motion: reduce
 *  - navigator.connection.saveData
 *  - effectiveType is "2g" or "slow-2g"
 *  - downlink < 1.0 Mbps
 */
type Conn = {
  saveData?: boolean;
  effectiveType?: string;
  downlink?: number;
  addEventListener?: (t: string, fn: () => void) => void;
  removeEventListener?: (t: string, fn: () => void) => void;
};

export function useVideoAllowed(): boolean {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const conn = (navigator as Navigator & { connection?: Conn }).connection;

    const evaluate = () => {
      if (motionMq.matches) return setAllowed(false);
      if (!conn) return setAllowed(true);
      if (conn.saveData) return setAllowed(false);
      if (conn.effectiveType === "slow-2g" || conn.effectiveType === "2g") {
        return setAllowed(false);
      }
      // `downlink` is a rolling estimate. It reads low during the initial page
      // load and on ordinary Egyptian mobile networks, so a 1.0 Mbps floor
      // permanently demoted real users to a still frame. Only refuse when the
      // link is genuinely unusable for a ~3 MB clip.
      if (typeof conn.downlink === "number" && conn.downlink > 0 && conn.downlink < 0.35) {
        return setAllowed(false);
      }
      setAllowed(true);
    };

    evaluate();

    // Re-evaluate when conditions change. Without this a visitor whose
    // connection recovers stays on the poster for the whole session.
    motionMq.addEventListener("change", evaluate);
    conn?.addEventListener?.("change", evaluate);
    return () => {
      motionMq.removeEventListener("change", evaluate);
      conn?.removeEventListener?.("change", evaluate);
    };
  }, []);

  return allowed;
}

/**
 * True when the viewport is portrait-ish (aspect ratio ≤ 4/5).
 * SSR-safe: returns `false` on the server and on the first client render,
 * then updates in an effect. Listens for orientation changes.
 */
export function useIsPortrait(): boolean {
  const [portrait, setPortrait] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-aspect-ratio: 4/5)");
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      setPortrait(e.matches);
    };
    // Fire immediately with current state
    handler(mq);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return portrait;
}
