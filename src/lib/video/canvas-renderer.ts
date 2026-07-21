/**
 * DPR-capped canvas renderer for VideoFrame objects.
 * Draws decoded frames to a <canvas> with device pixel ratio capping
 * to prevent GPU overload on high-DPR mobile screens.
 */

export class CanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private _dpr: number;
  private _width = 0;
  private _height = 0;

  constructor(canvas: HTMLCanvasElement, maxDpr = 1.5) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { willReadFrequently: false })!;
    this._dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
  }

  get dpr() {
    return this._dpr;
  }

  /** Resize canvas backing store to match CSS layout size × DPR. */
  resize(width: number, height: number): void {
    if (width === this._width && height === this._height) return;
    this._width = width;
    this._height = height;
    this.canvas.width = Math.round(width * this._dpr);
    this.canvas.height = Math.round(height * this._dpr);
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
  }

  /** Draw a VideoFrame to the canvas, scaled to fill. */
  drawFrame(frame: VideoFrame): void {
    const { ctx, canvas } = this;
    if (!canvas.width || !canvas.height) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // VideoFrame implements CanvasImageSource — drawImage accepts it directly.
    // Use cover scaling to fill the canvas without distortion.
    const fw = frame.displayWidth;
    const fh = frame.displayHeight;
    const cw = canvas.width;
    const ch = canvas.height;

    const scale = Math.max(cw / fw, ch / fh);
    const sw = fw * scale;
    const sh = fh * scale;
    const sx = (cw - sw) / 2;
    const sy = (ch - sh) / 2;

    ctx.drawImage(frame, sx, sy, sw, sh);
  }

  /** Draw an HTMLImageElement or HTMLVideoElement (poster/fallback). */
  drawImage(img: HTMLImageElement | HTMLVideoElement): void {
    const { ctx, canvas } = this;
    if (!canvas.width || !canvas.height) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const iw = "naturalWidth" in img ? img.naturalWidth : img.videoWidth;
    const ih = "naturalHeight" in img ? img.naturalHeight : img.videoHeight;
    const cw = canvas.width;
    const ch = canvas.height;

    const scale = Math.max(cw / iw, ch / ih);
    const sw = iw * scale;
    const sh = ih * scale;
    const sx = (cw - sw) / 2;
    const sy = (ch - sh) / 2;

    ctx.drawImage(img, sx, sy, sw, sh);
  }

  clear(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  destroy(): void {
    this.clear();
  }
}
