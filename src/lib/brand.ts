/**
 * Brand design tokens as typed values (the CSS-var counterparts live in
 * globals.css @theme). Use these where JS needs the raw values: Three.js
 * materials, canvas, framer-motion, dynamic styles.
 */

export const brand = {
  colors: {
    ink: { 900: "#0A0A0B", 800: "#141416", 700: "#1E1E22" },
    brass: { base: "#C9A86A", hi: "#E8D6A8", deep: "#9A7C45" },
    oxblood: { base: "#5A1F1B", tint: "#7A2C26" },
    bone: { base: "#EDE7DA", muted: "#A39C8E" },
  },
  /** Cinematic ease-out — shared across GSAP and framer-motion. */
  ease: {
    cinematic: [0.16, 1, 0.3, 1] as [number, number, number, number],
    cinematicCss: "cubic-bezier(0.16, 1, 0.3, 1)",
  },
  /**
   * Per-world "signature": each offering page keeps the shared DNA (ink +
   * brass + type) but gets its own secondary accent + motion character.
   */
  worlds: {
    marketing: { accent: "#7A2C26", signature: "kinetic" },
    pos: { accent: "#3A4A5A", signature: "architectural" },
    ecommerce: { accent: "#5A1F1B", signature: "showroom" },
  },
} as const;

export type WorldKey = keyof typeof brand.worlds;
