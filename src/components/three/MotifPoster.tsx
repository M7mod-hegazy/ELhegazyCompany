/** Lightweight static fallback for a section's 3D motif. */
export function MotifPoster({ accent = "#C9A86A" }: { accent?: string }) {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <div
        className="h-44 w-44 rounded-full border border-brass/40"
        style={{ boxShadow: `0 0 70px -14px ${accent}66, inset 0 0 50px -18px ${accent}55` }}
      />
      <div className="absolute h-28 w-28 rounded-full border border-brass/20" />
    </div>
  );
}
