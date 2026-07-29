"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useScroll, useMotionValueEvent, useReducedMotion } from "framer-motion";
import Image from "next/image";

/**
 * GridSection — parallax #2, "كل حاجة متوصلة".
 *
 * The specimen tray photograph is the section. Tapping any object names it and
 * draws a hairline to the world that makes it, in that world's accent colour.
 * The brass seal in the centre belongs to all three, so it draws three lines at
 * once — that is the payoff of the section.
 *
 * Hotspot and legend coordinates are percentages of the photograph's own 16:9
 * box, so the container keeps that aspect ratio at every width and the numbers
 * stay accurate without measurement.
 */

type World = "pos" | "ecommerce" | "marketing";

const WORLD_ACCENT: Record<World, string> = {
  pos: "var(--color-slate)",
  ecommerce: "var(--color-oxblood-tint)",
  marketing: "var(--color-brass)",
};

/** x/y measured against the real photograph. */
const OBJECTS: { id: string; x: number; y: number; worlds: World[] }[] = [
  { id: "receipt", x: 22, y: 23, worlds: ["pos"] },
  { id: "barcode", x: 41, y: 22, worlds: ["pos"] },
  { id: "tape", x: 66, y: 25, worlds: ["pos"] },
  { id: "phone", x: 82, y: 27, worlds: ["marketing"] },
  { id: "adCard", x: 25, y: 64, worlds: ["marketing"] },
  { id: "seal", x: 50, y: 49, worlds: ["pos", "ecommerce", "marketing"] },
  { id: "chairLeg", x: 48, y: 76, worlds: ["ecommerce"] },
  { id: "swatch", x: 76, y: 70, worlds: ["ecommerce"] },
];

const LEGEND: Record<World, { x: number; y: number }> = {
  pos: { x: 22, y: 95 },
  ecommerce: { x: 50, y: 95 },
  marketing: { x: 78, y: 95 },
};

export function GridSection() {
  const t = useTranslations("Grid");
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<string | null>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const layer = layerRef.current;
    if (!layer || reduced) return;
    layer.style.transform = `translate3d(0, ${(p - 0.5) * -14}%, 0) scale(1.06)`;
  });

  const activeObj = OBJECTS.find((o) => o.id === active) ?? null;
  const litWorlds = new Set<World>(activeObj?.worlds ?? []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-ink-900 py-20 sm:py-28"
      aria-labelledby="grid-heading"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-10 max-w-[38ch]">
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.28em] text-brass/80">
            {t("kicker")}
          </p>
          <h2
            id="grid-heading"
            className="text-3xl font-semibold leading-[1.15] text-bone sm:text-4xl md:text-5xl"
          >
            {t("title")}
          </h2>
          <p className="mt-4 leading-relaxed text-bone-muted">{t("body")}</p>
          <p className="mt-5 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-brass/70">
            {t("hint")}
          </p>
        </div>

        {/* ── The tray ── */}
        <div className="relative isolate aspect-video w-full overflow-hidden border border-brass/15">
          <div ref={layerRef} className="parallax-layer absolute inset-0">
            <Image
              src="/bg/grid.jpg"
              alt={t("title")}
              fill
              sizes="(max-width: 1152px) 100vw, 1152px"
              quality={84}
              style={{ objectFit: "cover" }}
            />
          </div>

          {/* Connector lines. viewBox is 0–100 in both axes so the object and
              legend percentages above can be used directly as coordinates. */}
          <svg
            aria-hidden
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-0 h-full w-full"
          >
            {activeObj?.worlds.map((w) => (
              <line
                key={w}
                x1={activeObj.x}
                y1={activeObj.y}
                x2={LEGEND[w].x}
                y2={LEGEND[w].y}
                stroke={WORLD_ACCENT[w]}
                strokeWidth={0.22}
                vectorEffect="non-scaling-stroke"
                strokeDasharray="120"
                strokeDashoffset="120"
                style={{
                  animation: reduced
                    ? undefined
                    : "gridConnector 420ms var(--ease-out-soft) forwards",
                  strokeDashoffset: reduced ? 0 : undefined,
                }}
              />
            ))}
          </svg>

          {/* Hotspots */}
          {OBJECTS.map((o) => {
            const isOn = active === o.id;
            return (
              <button
                key={o.id}
                type="button"
                aria-pressed={isOn}
                onClick={() => setActive(isOn ? null : o.id)}
                onMouseEnter={() => setActive(o.id)}
                onFocus={() => setActive(o.id)}
                className="absolute z-10 grid h-10 w-10 place-items-center"
                style={{
                  left: `${o.x}%`,
                  top: `${o.y}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <span
                  className="seal-round h-3 w-3 border transition-all duration-300"
                  style={{
                    borderColor: isOn
                      ? WORLD_ACCENT[o.worlds[0]]
                      : "color-mix(in srgb, var(--color-brass) 55%, transparent)",
                    background: isOn ? WORLD_ACCENT[o.worlds[0]] : "transparent",
                    transform: isOn ? "scale(1.5)" : "scale(1)",
                  }}
                />
                <span className="sr-only">{t(`objects.${o.id}`)}</span>
              </button>
            );
          })}

          {/* Floating label for the active object */}
          {activeObj && (
            <span
              className="pointer-events-none absolute z-20 whitespace-nowrap border border-brass/25 bg-ink-900/95 px-2.5 py-1 font-mono text-[0.65rem] uppercase tracking-[0.15em] text-bone"
              style={{
                left: `${activeObj.x}%`,
                top: `${activeObj.y}%`,
                transform: "translate(-50%, -220%)",
              }}
            >
              {t(`objects.${activeObj.id}`)}
            </span>
          )}

          {/* Legend */}
          {(Object.keys(LEGEND) as World[]).map((w) => (
            <span
              key={w}
              className="pointer-events-none absolute z-20 flex items-center gap-2 whitespace-nowrap border px-2.5 py-1 font-mono text-[0.65rem] uppercase tracking-[0.15em] transition-all duration-300"
              style={{
                left: `${LEGEND[w].x}%`,
                top: `${LEGEND[w].y}%`,
                transform: "translate(-50%, -50%)",
                borderColor: litWorlds.has(w)
                  ? WORLD_ACCENT[w]
                  : "color-mix(in srgb, var(--color-bone) 18%, transparent)",
                background: "rgba(10,10,11,0.9)",
                color: litWorlds.has(w) ? "var(--color-bone)" : "var(--color-bone-muted)",
              }}
            >
              <span
                aria-hidden
                className="seal-round h-1.5 w-1.5"
                style={{
                  background: litWorlds.has(w)
                    ? WORLD_ACCENT[w]
                    : "var(--color-bone-muted)",
                }}
              />
              {t(`legend.${w}`)}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
