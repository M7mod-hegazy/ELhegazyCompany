/**
 * Frame decoder manager — communicates with the Web Worker that does the
 * heavy lifting (MP4Box demux + WebCodecs decode).
 *
 * Architecture:
 *   Main thread ←postMessage→ Worker (frame-decoder.worker.ts)
 *     Worker uses MP4Box to demux MP4 → EncodedVideoChunk
 *     Worker feeds chunks to WebCodecs VideoDecoder → VideoFrame
 *     Worker sends VideoFrame back to main thread (transferable)
 *     Main thread holds frames in FrameBuffer and draws via CanvasRenderer
 */

export type DecoderMessage =
  | { type: "init"; url: string; trackId?: number }
  | { type: "seek"; frameIndex: number }
  | { type: "preload"; frameIndex: number; direction: "forward" | "backward" }
  | { type: "configure"; codec: string; codedWidth: number; codedHeight: number }
  | { type: "destroy" };

export type DecoderResponse =
  | { type: "ready"; duration: number; frameCount: number; fps: number }
  | { type: "frame"; frameIndex: number; frame: VideoFrame }
  | { type: "error"; message: string }
  | { type: "configuring" }
  | { type: "configured" };

export interface DecoderCallbacks {
  onReady?: (info: {
    duration: number;
    frameCount: number;
    fps: number;
  }) => void;
  onFrame?: (frameIndex: number, frame: VideoFrame) => void;
  onError?: (message: string) => void;
}

export class FrameDecoderManager {
  private worker: Worker | null = null;
  private callbacks: DecoderCallbacks = {};
  private _ready = false;
  private _url = "";

  async init(
    url: string,
    callbacks: DecoderCallbacks,
  ): Promise<void> {
    this._url = url;
    this.callbacks = callbacks;

    // Create worker from inline script (no separate file needed)
    const workerCode = getWorkerCode();
    const blob = new Blob([workerCode], { type: "application/javascript" });
    this.worker = new Worker(URL.createObjectURL(blob), {
      name: "frame-decoder",
    });

    this.worker.onmessage = (e: MessageEvent<DecoderResponse>) => {
      this.handleMessage(e.data);
    };

    this.worker.onerror = (e) => {
      this.callbacks.onError?.(`Worker error: ${e.message}`);
    };

    // Resolve relative URL to absolute — Blob workers have no base
    const absUrl = new URL(url, window.location.origin).href;
    this.worker.postMessage({ type: "init", url: absUrl } satisfies DecoderMessage);
  }

  private handleMessage(msg: DecoderResponse): void {
    switch (msg.type) {
      case "ready":
        this._ready = true;
        this.callbacks.onReady?.({
          duration: msg.duration,
          frameCount: msg.frameCount,
          fps: msg.fps,
        });
        break;
      case "frame":
        this.callbacks.onFrame?.(msg.frameIndex, msg.frame);
        break;
      case "error":
        this.callbacks.onError?.(msg.message);
        break;
    }
  }

  seek(frameIndex: number): void {
    this.worker?.postMessage({ type: "seek", frameIndex } satisfies DecoderMessage);
  }

  preload(frameIndex: number, direction: "forward" | "backward"): void {
    this.worker?.postMessage({
      type: "preload",
      frameIndex,
      direction,
    } satisfies DecoderMessage);
  }

  destroy(): void {
    this.worker?.postMessage({ type: "destroy" } satisfies DecoderMessage);
    this.worker?.terminate();
    this.worker = null;
    this._ready = false;
  }

  get ready() {
    return this._ready;
  }
}

/**
 * Inline worker code. Bundled as a string to avoid separate file hassle.
 * Uses MP4Box.js for demuxing and WebCodecs VideoDecoder for frame extraction.
 */
function getWorkerCode(): string {
  return `
    /* ── Frame Decoder Worker ── */
    let decoder = null;
    let file = null;
    let trackInfo = null;
    let frameMap = new Map(); // frameIndex → { data, duration, timestamp }
    let keyframes = [];       // sorted array of keyframe indices
    let totalFrames = 0;
    let fps = 24;
    let timeScale = 1;
    let pendingSeeks = [];
    let processing = false;

    self.onmessage = async function(e) {
      const msg = e.data;
      switch (msg.type) {
        case 'init': await initDecoder(msg.url); break;
        case 'seek': await seekToFrame(msg.frameIndex); break;
        case 'preload': await preloadFrames(msg.frameIndex, msg.direction); break;
        case 'destroy': destroyDecoder(); break;
      }
    };

    async function initDecoder(url) {
      try {
        // Dynamically import mp4box
        const MP4Box = await import('https://cdn.jsdelivr.net/npm/mp4box@0.5.2/dist/mp4box.all.js' + '');
        // Note: in production, mp4box is bundled. This import path is resolved
        // by the bundler when the worker code is inlined.

        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch video: ' + response.status);

        const arrayBuffer = await response.arrayBuffer();
        arrayBuffer.fileStart = 0;

        file = MP4Box.createFile();

        file.onReady = (info) => {
          trackInfo = info.videoTracks[0];
          if (!trackInfo) {
            self.postMessage({ type: 'error', message: 'No video track found' });
            return;
          }

          fps = trackInfo.fps || 24;
          timeScale = trackInfo.timescale || 1;
          totalFrames = Math.ceil(trackInfo.duration / timeScale * fps);

          // Start demuxing samples
          file.setExtractionOptions(trackInfo.id, null, { nbSamples: Infinity });

          self.postMessage({
            type: 'ready',
            duration: trackInfo.duration / timeScale,
            frameCount: totalFrames,
            fps: fps
          });
        };

        let sampleIndex = 0;
        file.onSamples = (track_id, user, samples) => {
          for (const sample of samples) {
            const frameIndex = sampleIndex;
            const isKeyframe = sample.is_sync;

            frameMap.set(frameIndex, {
              data: sample.data,
              timestamp: sample.cts / timeScale,
              duration: sample.duration / timeScale,
              isKeyframe: isKeyframe,
            });

            if (isKeyframe) {
              keyframes.push(frameIndex);
            }
            sampleIndex++;
          }
        };

        file.appendBuffer(arrayBuffer);
        file.flush();

        // Now set up WebCodecs decoder
        const codec = trackInfo.codec || 'avc1.640034';
        const codedWidth = trackInfo.track_width || 1920;
        const codedHeight = trackInfo.track_height || 1080;

        if (typeof VideoDecoder !== 'undefined') {
          decoder = new VideoDecoder({
            output: (frame) => {
              // Frame decoded — find which index it's for
              handleDecodedFrame(frame);
            },
            error: (err) => {
              console.error('VideoDecoder error:', err);
              // Recreate decoder on error
              decoder = null;
            }
          });

          decoder.configure({
            codec: codec,
            codedWidth: codedWidth,
            codedHeight: codedHeight,
          });
        }
      } catch (err) {
        self.postMessage({ type: 'error', message: String(err) });
      }
    }

    let currentDecodeIndex = -1;
    let decodedCallback = null;

    function handleDecodedFrame(frame) {
      if (currentDecodeIndex >= 0 && decodedCallback) {
        self.postMessage({ type: 'frame', frameIndex: currentDecodeIndex, frame }, [frame]);
        decodedCallback();
        decodedCallback = null;
        currentDecodeIndex = -1;
      } else {
        frame.close();
      }
    }

    async function seekToFrame(targetIndex) {
      if (!decoder || !frameMap.has(targetIndex)) {
        // Try to find nearest keyframe
        const nearestKf = findNearestKeyframe(targetIndex);
        if (nearestKf >= 0 && frameMap.has(nearestKf)) {
          await decodeFromKeyframe(nearestKf, targetIndex);
        }
        return;
      }

      const entry = frameMap.get(targetIndex);
      if (entry.isKeyframe) {
        await decodeSingleFrame(targetIndex, entry);
      } else {
        // Need to decode from nearest keyframe
        const kf = findPreviousKeyframe(targetIndex);
        if (kf >= 0) {
          await decodeFromKeyframe(kf, targetIndex);
        }
      }
    }

    async function decodeSingleFrame(index, entry) {
      return new Promise((resolve) => {
        currentDecodeIndex = index;
        decodedCallback = resolve;

        const chunk = new EncodedVideoChunk({
          type: entry.isKeyframe ? 'key' : 'delta',
          timestamp: entry.timestamp * 1000000, // seconds to microseconds
          data: entry.data,
        });

        decoder.decode(chunk);
      });
    }

    async function decodeFromKeyframe(startIndex, endIndex) {
      for (let i = startIndex; i <= endIndex && i < totalFrames; i++) {
        const entry = frameMap.get(i);
        if (!entry) continue;
        await decodeSingleFrame(i, entry);
      }
    }

    function findNearestKeyframe(index) {
      let best = -1;
      for (const kf of keyframes) {
        if (kf <= index) best = kf;
        else break;
      }
      return best;
    }

    function findPreviousKeyframe(index) {
      return findNearestKeyframe(index);
    }

    async function preloadFrames(center, direction) {
      // Pre-decode frames around the center for smooth scrubbing
      const range = 10;
      const start = direction === 'forward' ? center + 1 : center - range;
      const end = direction === 'forward' ? center + range : center - 1;

      for (let i = Math.max(0, start); i <= Math.min(totalFrames - 1, end); i++) {
        if (!frameMap.has(i)) continue;
        const entry = frameMap.get(i);
        if (entry.isKeyframe) {
          await decodeSingleFrame(i, entry);
        }
      }
    }

    function destroyDecoder() {
      if (decoder) {
        try { decoder.close(); } catch {}
        decoder = null;
      }
      frameMap.clear();
      keyframes = [];
      totalFrames = 0;
    }
  `;
}
