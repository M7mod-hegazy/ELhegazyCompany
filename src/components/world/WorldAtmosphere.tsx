"use client";

/**
 * The world's "living" background — a fixed, always-moving environment behind
 * the page: an architectural blueprint grid that pans, drifting accent auroras,
 * a slow light sweep, and floating brass dust. Tinted by `--world-accent`.
 * Purely CSS-animated (killed automatically under prefers-reduced-motion).
 */
export function WorldAtmosphere() {
  const dust = Array.from({ length: 18 });
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-ink-900">
      {/* deep base glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 50% -10%, color-mix(in oklab, var(--world-accent,#C9A86A) 10%, transparent), transparent 55%), radial-gradient(100% 60% at 50% 120%, rgba(154,124,69,0.10), transparent 60%)",
        }}
      />

      {/* panning blueprint grid, faded at the edges */}
      <div
        className="absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            "linear-gradient(color-mix(in oklab, var(--world-accent,#C9A86A) 26%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in oklab, var(--world-accent,#C9A86A) 26%, transparent) 1px, transparent 1px)",
          backgroundSize: "56px 56px, 56px 56px",
          animation: "worldGridPan 14s linear infinite",
          maskImage:
            "radial-gradient(120% 90% at 50% 30%, black 20%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(120% 90% at 50% 30%, black 20%, transparent 75%)",
        }}
      />
      {/* fine grid */}
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(237,231,218,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(237,231,218,0.18) 1px, transparent 1px)",
          backgroundSize: "14px 14px, 14px 14px",
          maskImage: "radial-gradient(90% 70% at 50% 40%, black 10%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(90% 70% at 50% 40%, black 10%, transparent 70%)",
        }}
      />

      {/* drifting auroras */}
      <div
        className="absolute -left-40 top-[-10%] h-[55vh] w-[55vh] rounded-full blur-[90px]"
        style={{
          background:
            "radial-gradient(closest-side, color-mix(in oklab, var(--world-accent,#C9A86A) 55%, transparent), transparent)",
          animation: "drift1 18s ease-in-out infinite",
        }}
      />
      <div
        className="absolute -right-40 top-[30%] h-[60vh] w-[60vh] rounded-full blur-[100px]"
        style={{
          background:
            "radial-gradient(closest-side, rgba(201,168,106,0.30), transparent)",
          animation: "drift2 22s ease-in-out infinite",
        }}
      />
      <div
        className="absolute bottom-[-15%] left-1/3 h-[50vh] w-[50vh] rounded-full blur-[90px]"
        style={{
          background:
            "radial-gradient(closest-side, color-mix(in oklab, var(--world-accent,#C9A86A) 40%, transparent), transparent)",
          animation: "drift3 26s ease-in-out infinite",
        }}
      />

      {/* slow diagonal light sweep */}
      <div
        className="absolute inset-y-0 -left-1/2 w-1/3"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(232,214,168,0.06), transparent)",
          animation: "worldSweep 9s ease-in-out infinite",
        }}
      />

      {/* floating brass dust */}
      {dust.map((_, i) => {
        const left = (i * 53) % 100;
        const delay = (i % 9) * 0.9;
        const dur = 9 + (i % 6) * 2;
        const size = 1 + (i % 3);
        return (
          <span
            key={i}
            className="absolute rounded-full bg-brass/50"
            style={{
              left: `${left}%`,
              bottom: `-10px`,
              width: size,
              height: size,
              animation: `worldDust ${dur}s linear ${delay}s infinite`,
            }}
          />
        );
      })}

      {/* vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 100% at 50% 40%, transparent 55%, rgba(10,10,11,0.85))",
        }}
      />
    </div>
  );
}
