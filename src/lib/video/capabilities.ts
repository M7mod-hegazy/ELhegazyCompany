/**
 * Runtime detection of video scrubbing capabilities.
 * Determines which backend to use for scroll-scrubbed video:
 *   1. <video> currentTime seeking (reliable, works everywhere)
 *   2. none (reduced-motion or total failure)
 */

export type VideoBackend = "video-seeking" | "none";

/** Check network quality — should we skip heavy video loading? */
export function hasGoodConnection(): boolean {
  if (typeof navigator === "undefined") return true;
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string; downlink?: number } }).connection;
  if (!conn) return true;
  if (conn.saveData) return false;
  if (conn.effectiveType === "2g" || conn.effectiveType === "slow-2g")
    return false;
  if (conn.downlink !== undefined && conn.downlink < 1.0) return false;
  return true;
}

/** Check if reduced motion is preferred. */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Detect the best available video backend. */
export async function detectBackend(): Promise<VideoBackend> {
  if (prefersReducedMotion()) return "none";
  return "video-seeking";
}

/** Should we load video at all (connection + motion check)? */
export function shouldLoadVideo(): boolean {
  const reduced = prefersReducedMotion();
  const goodConn = hasGoodConnection();
  console.log("[cap] reduced:", reduced, "goodConn:", goodConn);
  if (reduced) return false;
  if (!goodConn) return false;
  return true;
}

/** Detect if device is mobile (width < 640px). Done once at init. */
export function isMobileDevice(): boolean {
  if (typeof window === "undefined") return false;
  return window.innerWidth < 640;
}
