"use client";

import { useEffect, useRef, useState } from "react";

/** Mutable sound design: soft brass ticks on hover/click, generated with the
 *  Web Audio API (no asset files). Off by default (respects autoplay policy). */
export function SoundToggle() {
  const [on, setOn] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!on) return;
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = ctxRef.current ?? new AC();
    ctxRef.current = ctx;

    // soft ambient pad (two detuned sines, very low volume)
    const pad = ctx.createGain();
    pad.gain.value = 0;
    pad.connect(ctx.destination);
    const o1 = ctx.createOscillator();
    const o2 = ctx.createOscillator();
    o1.type = "sine";
    o2.type = "sine";
    o1.frequency.value = 90;
    o2.frequency.value = 135.5;
    o1.connect(pad);
    o2.connect(pad);
    o1.start();
    o2.start();
    pad.gain.linearRampToValueAtTime(0.014, ctx.currentTime + 1.6);

    const tick = (freq: number, dur = 0.06, vol = 0.035) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = freq;
      o.connect(g);
      g.connect(ctx.destination);
      const t = ctx.currentTime;
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.start(t);
      o.stop(t + dur);
    };

    const over = (e: Event) => {
      if ((e.target as HTMLElement)?.closest("a,button,[data-cursor]")) tick(660);
    };
    const down = (e: Event) => {
      if ((e.target as HTMLElement)?.closest("a,button")) tick(440, 0.09, 0.045);
    };
    document.addEventListener("mouseover", over);
    document.addEventListener("pointerdown", down);
    return () => {
      document.removeEventListener("mouseover", over);
      document.removeEventListener("pointerdown", down);
      pad.gain.cancelScheduledValues(ctx.currentTime);
      pad.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
      o1.stop(ctx.currentTime + 0.4);
      o2.stop(ctx.currentTime + 0.4);
    };
  }, [on]);

  return (
    <button
      type="button"
      onClick={() => setOn((v) => !v)}
      aria-label="toggle sound"
      className="fixed bottom-6 z-[70] rounded-full border border-brass/40 bg-ink-900/70 p-3 text-brass backdrop-blur transition-colors hover:border-brass ltr:right-6 rtl:left-6"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 5 6 9H2v6h4l5 4z" />
        {on ? (
          <>
            <path d="M15.5 8.5a5 5 0 0 1 0 7" />
            <path d="M19 5a9 9 0 0 1 0 14" />
          </>
        ) : (
          <path d="M22 9l-6 6M16 9l6 6" />
        )}
      </svg>
    </button>
  );
}
