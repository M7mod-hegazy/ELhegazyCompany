/** Static, GPU-free brass hero fallback (reduced-motion / no-WebGL).
 *  Concentric brass rings on ink — a quiet echo of the atelier seal. */
export default function HeroPoster() {
  return (
    <div className="absolute inset-0 bg-ink-900">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(46% 42% at 50% 44%, rgba(201,168,106,0.16), transparent 66%)",
        }}
      />
      <div
        className="absolute left-1/2 top-[44%] h-[38vmin] w-[38vmin] -translate-x-1/2 -translate-y-1/2 rounded-full border border-brass/50"
        style={{
          boxShadow:
            "0 0 70px -14px rgba(201,168,106,0.45), inset 0 0 50px -16px rgba(201,168,106,0.4)",
        }}
      />
      <div className="absolute left-1/2 top-[44%] h-[26vmin] w-[26vmin] -translate-x-1/2 -translate-y-1/2 rounded-full border border-brass/25" />
      <div className="absolute left-1/2 top-[44%] h-[2.5vmin] w-[2.5vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brass/70 blur-[2px]" />
    </div>
  );
}
