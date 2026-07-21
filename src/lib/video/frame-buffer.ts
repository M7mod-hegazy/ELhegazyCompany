/**
 * LRU frame buffer for decoded video frames.
 * Stores VideoFrame objects indexed by frame number with automatic eviction.
 * CRITICAL: VideoFrame objects hold GPU memory — must be .close()'d when evicted.
 */

export class FrameBuffer {
  private frames = new Map<number, VideoFrame>();
  private order: number[] = [];
  private _capacity: number;

  constructor(capacity = 60) {
    this._capacity = capacity;
  }

  get capacity() {
    return this._capacity;
  }

  get size() {
    return this.frames.size;
  }

  has(index: number): boolean {
    return this.frames.has(index);
  }

  get(index: number): VideoFrame | undefined {
    return this.frames.get(index);
  }

  set(index: number, frame: VideoFrame): void {
    if (this.frames.has(index)) {
      this.closeFrame(index);
    }
    this.frames.set(index, frame);
    this.order.push(index);
    this.evictOldest();
  }

  /** Remove frames beyond `radius` of `center`. */
  evictBeyond(center: number, radius: number): void {
    const toRemove: number[] = [];
    for (const idx of this.frames.keys()) {
      if (Math.abs(idx - center) > radius) {
        toRemove.push(idx);
      }
    }
    for (const idx of toRemove) {
      this.closeFrame(idx);
      this.frames.delete(idx);
      const pos = this.order.indexOf(idx);
      if (pos !== -1) this.order.splice(pos, 1);
    }
  }

  /** Close all frames and clear buffer. */
  clear(): void {
    for (const [idx] of this.frames) {
      this.closeFrame(idx);
    }
    this.frames.clear();
    this.order = [];
  }

  resize(newCapacity: number): void {
    this._capacity = newCapacity;
    this.evictOldest();
  }

  private closeFrame(index: number): void {
    const frame = this.frames.get(index);
    if (frame) {
      try {
        frame.close();
      } catch {
        // frame may already be closed
      }
    }
  }

  private evictOldest(): void {
    while (this.order.length > this._capacity) {
      const oldest = this.order.shift()!;
      this.closeFrame(oldest);
      this.frames.delete(oldest);
    }
  }
}
