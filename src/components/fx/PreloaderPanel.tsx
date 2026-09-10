/**
 * The brand fill — the wordmark that pours brass from bottom to top as `pct`
 * climbs, with a hairline progress bar and the ELHEGAZI lockup underneath.
 *
 * Shared by the first-visit intro (Preloader) and every client-side route
 * change (RoutePreloader) so both feel like the same, single loading moment.
 */
export function PreloaderPanel({ pct }: { pct: number }) {
  const fill = Math.min(100, Math.max(0, pct));

  return (
    <>
      <div className="relative leading-none" dir="rtl">
        <span className="font-display-ar text-[14vw] font-semibold text-bone-muted/12 sm:text-[8vw]">
          الحجازي
        </span>

        {/*
         * Reem Kufi paints above and below its 1em line box (the final yaa
         * dots sit in that lower overflow). An absolutely positioned text
         * layer with `inset-0` only gets a 1em background box, so a clipped
         * background can never reach those dots. This 1.5em reveal window
         * matches the font's painted bounds and uncovers a solid copy from
         * the true bottom of the word instead.
         */}
        <span
          aria-hidden
          className="absolute inset-x-0 -top-[0.25em] -bottom-[0.25em] overflow-hidden text-[14vw] sm:text-[8vw]"
          style={{
            clipPath: `inset(${100 - fill}% 0 0 0)`,
            willChange: "clip-path",
          }}
        >
          <span className="font-display-ar absolute inset-x-0 top-[0.25em] block h-[1em] text-[14vw] font-semibold text-brass sm:text-[8vw]">
            الحجازي
          </span>
        </span>
      </div>

      <div className="mt-7 h-px w-40 bg-bone/10">
        <div
          className="h-px bg-brass"
          style={{ width: `${fill}%`, transition: "width 120ms linear" }}
        />
      </div>
      <div className="mt-3 font-mono text-[0.6rem] uppercase tracking-[0.42em] text-bone-muted/60">
        ELHEGAZI
      </div>
    </>
  );
}
