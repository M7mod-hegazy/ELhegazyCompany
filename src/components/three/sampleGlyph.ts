/** Render a glyph or word to an offscreen canvas and sample `count` filled
 *  pixels as 3D target points (centered, world-space) — used as the particle
 *  "home". Handles wide wordmarks (e.g. "الحجازي") by fitting the text to a
 *  wide canvas before sampling. */
export function sampleGlyphPoints(
  glyph: string,
  count: number,
  worldWidth = 4.6,
): Float32Array {
  const h = 256;
  const w = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#fff";

  // Fit the text: start large, shrink until it fits 92% of the canvas width.
  let fontSize = h * 0.72;
  const family = "'Reem Kufi', 'Segoe UI', sans-serif";
  ctx.font = `700 ${fontSize}px ${family}`;
  const measured = ctx.measureText(glyph).width;
  if (measured > w * 0.92) {
    fontSize *= (w * 0.92) / measured;
    ctx.font = `700 ${fontSize}px ${family}`;
  }
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(glyph, w / 2, h / 2 + h * 0.02);

  const data = ctx.getImageData(0, 0, w, h).data;
  const filled: number[] = [];
  for (let y = 0; y < h; y += 2) {
    for (let x = 0; x < w; x += 2) {
      if (data[(y * w + x) * 4] > 128) filled.push(x, y);
    }
  }

  // Scale so the INKED extent (not the whole canvas) spans worldWidth.
  let minX = w;
  let maxX = 0;
  for (let i = 0; i < filled.length; i += 2) {
    if (filled[i] < minX) minX = filled[i];
    if (filled[i] > maxX) maxX = filled[i];
  }
  const inkW = Math.max(1, maxX - minX);
  const scale = worldWidth / inkW;
  const cx = (minX + maxX) / 2;

  const out = new Float32Array(count * 3);
  const n = filled.length / 2;
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(Math.random() * n) * 2;
    const px = filled[idx] ?? cx;
    const py = filled[idx + 1] ?? h / 2;
    out[i * 3] = (px - cx) * scale + (Math.random() - 0.5) * 0.02;
    out[i * 3 + 1] = -(py - h / 2) * scale + (Math.random() - 0.5) * 0.02;
    out[i * 3 + 2] = (Math.random() - 0.5) * 0.25;
  }
  return out;
}
