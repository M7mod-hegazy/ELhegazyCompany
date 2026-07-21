/**
 * Scroll controller that maps scroll progress (0-1) to frame indices.
 *
 * Key performance features:
 * - RAF loop stops when scroll settles (3 consecutive identical frames)
 * - RAF loop restarts instantly on next scroll event
 * - Debounces seeking: only processes latest frame index
 * - Reports settled state for chapter overlay animations
 */

export type ScrollState = {
  frameIndex: number;
  progress: number;
  isSettled: boolean;
};

export class ScrollController {
  private _totalFrames: number;
  private _progress = 0;
  private _frameIndex = 0;
  private _settled = true;
  private _settledCount = 0;
  private _lastFrameIndex = -1;
  private _rafId = 0;
  private _onUpdate: ((state: ScrollState) => void) | null = null;
  private _onFrame: ((frameIndex: number) => void) | null = null;
  private _idleTimeout: ReturnType<typeof setTimeout> | null = null;
  private _rafRunning = false;

  constructor(totalFrames: number) {
    this._totalFrames = totalFrames;
  }

  /** Called by scroll listener (Lenis or native). */
  updateFromScroll(progress: number): void {
    this._progress = Math.max(0, Math.min(1, progress));
    const newFrame = Math.round(this._progress * (this._totalFrames - 1));

    if (newFrame !== this._frameIndex) {
      this._settled = false;
      this._settledCount = 0;
      this._frameIndex = newFrame;

      if (!this._rafRunning) {
        this.startLoop();
      }
    }
  }

  onUpdate(cb: (state: ScrollState) => void): void {
    this._onUpdate = cb;
  }

  onFrame(cb: (frameIndex: number) => void): void {
    this._onFrame = cb;
  }

  private startLoop(): void {
    if (this._rafRunning) return;
    this._rafRunning = true;
    this._tick();
  }

  private _tick = (): void => {
    if (!this._rafRunning) return;

    // Check if we've settled (3 consecutive identical frames)
    if (this._frameIndex === this._lastFrameIndex) {
      this._settledCount++;
    } else {
      this._settledCount = 0;
    }

    if (this._settledCount >= 3) {
      this._settled = true;
      this.stopLoop();
      // Emit final settled state
      this._notify();
      return;
    }

    this._lastFrameIndex = this._frameIndex;
    this._notify();
    this._rafId = requestAnimationFrame(this._tick);
  };

  private _notify(): void {
    const state: ScrollState = {
      frameIndex: this._frameIndex,
      progress: this._progress,
      isSettled: this._settled,
    };
    this._onUpdate?.(state);
    this._onFrame?.(this._frameIndex);
  }

  private stopLoop(): void {
    this._rafRunning = false;
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = 0;
    }
  }

  destroy(): void {
    this.stopLoop();
    if (this._idleTimeout) {
      clearTimeout(this._idleTimeout);
      this._idleTimeout = null;
    }
  }

  get totalFrames() {
    return this._totalFrames;
  }
  get progress() {
    return this._progress;
  }
  get frameIndex() {
    return this._frameIndex;
  }
  get isSettled() {
    return this._settled;
  }
}
