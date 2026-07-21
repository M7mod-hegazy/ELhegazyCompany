/**
 * Runtime detection of video scrubbing capabilities.
 * Determines which backend to use for scroll-scrubbed video:
 *   1. WebCodecs + Canvas (best — hardware-accelerated decode)
 *   2. requestVideoFrameCallback + Canvas (good — per-frame draw)
 *   3. <video> currentTime seeking (fallback — original approach)
 *   4. none (reduced-motion or total failure)
 */

export type VideoBackend =
  | "webcodecs"
  | "video-callback"
  | "video-seeking"
  | "none";

/** Check if WebCodecs VideoDecoder is available and supports H.264. */
async function supportsWebCodecs(): Promise<boolean> {
  if (typeof VideoDecoder === "undefined") return false;
  try {
    const result = await VideoDecoder.isConfigSupported({
      codec: "avc1.640034", // H.264 High Profile Level 5.2
      codedWidth: 1920,
      codedHeight: 1080,
    });
    return result.supported ?? false;
  } catch {
    return false;
  }
}

/** Check if requestVideoFrameCallback is supported on a video element. */
function supportsVideoFrameCallback(): boolean {
  if (typeof document === "undefined") return false;
  const test = document.createElement("video");
  return "requestVideoFrameCallback" in test;
}

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

  if (await supportsWebCodecs()) return "webcodecs";
  if (supportsVideoFrameCallback()) return "video-callback";
  return "video-seeking";
}

/** Should we load video at all (connection + motion check)? */
export function shouldLoadVideo(): boolean {
  if (prefersReducedMotion()) return false;
  if (!hasGoodConnection()) return false;
  return true;
}

/** Detect if device is mobile (width < 640px). Done once at init. */
export function isMobileDevice(): boolean {
  if (typeof window === "undefined") return false;
  return window.innerWidth < 640;
}
