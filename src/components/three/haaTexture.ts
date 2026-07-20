import * as THREE from "three";

/** Brass face texture with the الحجازي wordmark carved in — embosses the hero seal. */
export function makeHaaTexture(size = 512): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  // Brass base + soft sheen
  ctx.fillStyle = "#c9a86a";
  ctx.fillRect(0, 0, size, size);
  const sheen = ctx.createRadialGradient(
    size * 0.4,
    size * 0.34,
    size * 0.05,
    size * 0.5,
    size * 0.5,
    size * 0.72,
  );
  sheen.addColorStop(0, "#e8d6a8");
  sheen.addColorStop(1, "#9a7c45");
  ctx.globalAlpha = 0.6;
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, size, size);
  ctx.globalAlpha = 1;

  // Carved الحجازي wordmark (darker = recessed), fitted to the seal face
  ctx.fillStyle = "#6e5a32";
  const family = "'Reem Kufi', 'Segoe UI', sans-serif";
  let fontSize = size * 0.3;
  ctx.font = `700 ${fontSize}px ${family}`;
  const measured = ctx.measureText("الحجازي").width;
  if (measured > size * 0.82) {
    fontSize *= (size * 0.82) / measured;
    ctx.font = `700 ${fontSize}px ${family}`;
  }
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("الحجازي", size / 2, size / 2 + size * 0.02);

  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 8;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
