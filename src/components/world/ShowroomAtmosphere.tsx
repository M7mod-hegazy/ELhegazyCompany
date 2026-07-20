"use client";

export function ShowroomAtmosphere() {
  const orbs = Array.from({ length: 8 });
  const sparkles = Array.from({ length: 24 });
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-ink-900">
      {/* warm base glow — softer falloff than POS grid */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(100% 70% at 50% 0%, color-mix(in oklab, var(--world-accent,#5A1F1B) 14%, transparent), transparent 60%), radial-gradient(80% 50% at 50% 100%, rgba(90,31,27,0.08), transparent 60%)",
        }}
      />

      {/* floating warm orbs — organic, no grid */}
      <div
        className="absolute -left-32 top-[5%] h-[50vh] w-[50vh] rounded-full blur-[100px]"
        style={{
          background:
            "radial-gradient(closest-side, color-mix(in oklab, var(--world-accent,#5A1F1B) 50%, transparent), transparent)",
          animation: "drift1 20s ease-in-out infinite",
        }}
      />
      <div
        className="absolute -right-32 top-[25%] h-[55vh] w-[55vh] rounded-full blur-[110px]"
        style={{
          background:
            "radial-gradient(closest-side, rgba(201,168,106,0.22), transparent)",
          animation: "drift2 24s ease-in-out infinite",
        }}
      />
      <div
        className="absolute -bottom-20 left-1/4 h-[45vh] w-[45vh] rounded-full blur-[90px]"
        style={{
          background:
            "radial-gradient(closest-side, color-mix(in oklab, var(--world-accent,#5A1F1B) 35%, transparent), transparent)",
          animation: "drift3 28s ease-in-out infinite",
        }}
      />

      {/* slow warm light sweep from top-left */}
      <div
        className="absolute inset-y-0 -left-1/3 w-1/2"
        style={{
          background:
            "linear-gradient(120deg, transparent, rgba(232,214,168,0.05), transparent)",
          animation: "worldSweep 12s ease-in-out infinite",
        }}
      />

      {/* floating ring particles — showroom spotlights feel */}
      {orbs.map((_, i) => {
        const left = (i * 37 + 11) % 100;
        const top = (i * 23 + 7) % 100;
        const delay = (i % 5) * 1.4;
        const dur = 14 + (i % 4) * 3;
        const size = 20 + (i % 5) * 15;
        return (
          <span
            key={i}
            className="absolute rounded-full border opacity-20"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: size,
              height: size,
              borderColor: "color-mix(in oklab, var(--world-accent,#5A1F1B) 40%, transparent)",
              animation: `drift1 ${dur}s ease-in-out ${delay}s infinite`,
            }}
          />
        );
      })}

      {/* fine sparkle dust — smaller, warmer than POS */}
      {sparkles.map((_, i) => {
        const left = (i * 41 + 13) % 100;
        const delay = (i % 8) * 0.7;
        const dur = 4 + (i % 5) * 1.5;
        const size = 1 + (i % 2);
        return (
          <span
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${left}%`,
              bottom: `${(i * 17) % 100}%`,
              width: size,
              height: size,
              background: i % 3 === 0
                ? "rgba(201,168,106,0.6)"
                : "color-mix(in oklab, var(--world-accent,#5A1F1B) 50%, transparent)",
              animation: `worldDust ${dur}s ease-in-out ${delay}s infinite alternate`,
            }}
          />
        );
      })}

      {/* vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(130% 100% at 50% 40%, transparent 50%, rgba(10,10,11,0.88))",
        }}
      />
    </div>
  );
}
