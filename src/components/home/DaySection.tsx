"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { ParallaxImage } from "@/components/fx/ParallaxImage";
import { formatNum } from "@/lib/num";

/**
 * DaySection — "يوم في محلك".
 *
 * Replaces the old Tracker, which was a bare hairline with four dots floating in
 * a black void. It told you the agency's internal phases ("discovery, creative,
 * launch, growth") — the shop owner's own process, not theirs, and nothing you
 * could picture.
 *
 * This inverts it. The rail is now **the shop's own working day**, laid across a
 * real photograph of a counter. Each marker is an hour a shop owner already
 * recognises; opening one shows what the system is doing for them at that hour.
 * Same read-by-touching grammar as the specimen tray, applied to the question
 * that actually decides a sale: "what does this thing do for me all day?"
 *
 * The plate drifts on scroll — this is the home page's parallax image section.
 */

const HOURS = ["open", "rush", "delivery", "shift", "close"] as const;
type Hour = (typeof HOURS)[number];

/** x position along the rail, as a percentage of the plate width. */
const MARK_X: Record<Hour, number> = {
  open: 8,
  rush: 30,
  delivery: 50,
  shift: 71,
  close: 92,
};

export function DaySection() {
  const t = useTranslations("Day");
  const locale = useLocale();
  const [active, setActive] = useState<Hour>("rush");

  return (
    <section
      className="relative overflow-hidden bg-ink-900 py-20 sm:py-28"
      aria-labelledby="day-heading"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-10 max-w-[42ch]">
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.28em] text-brass">
            {t("kicker")}
          </p>
          <h2
            id="day-heading"
            className="text-3xl font-semibold leading-[1.15] text-bone sm:text-4xl"
          >
            {t("title")}
          </h2>
          <p className="mt-4 leading-relaxed text-bone-muted">{t("body")}</p>
          <p className="mt-5 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-brass/80">
            {t("hint")}
          </p>
        </div>
      </div>

      {/* ── The plate ── */}
      <div className="relative mx-auto max-w-[1400px] px-0 sm:px-6">
        <div className="relative isolate aspect-[16/10] w-full overflow-hidden border-y border-brass/15 sm:aspect-[21/9] sm:border">
          <ParallaxImage
            src="/bg/counter.jpg"
            travel={14}
            scale={1.06}
            quality={82}
            sizes="(max-width: 1400px) 100vw, 1400px"
            objectPosition="center 55%"
            className="absolute inset-0 overflow-hidden"
          />

          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(10,10,11,0.94) 0%, rgba(10,10,11,0.45) 42%, rgba(10,10,11,0.55) 100%)",
            }}
          />

          {/* Rail + markers — desktop only; mobile gets the list below. */}
          <div className="absolute inset-x-0 bottom-0 hidden sm:block">
            <div className="relative mx-8 mb-28">
              <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-bone/20" />
              {HOURS.map((h) => {
                const on = active === h;
                return (
                  <button
                    key={h}
                    type="button"
                    aria-pressed={on}
                    onMouseEnter={() => setActive(h)}
                    onFocus={() => setActive(h)}
                    onClick={() => setActive(h)}
                    className="absolute -top-3 grid h-11 w-11 -translate-x-1/2 place-items-center"
                    style={{ left: `${MARK_X[h]}%` }}
                  >
                    <span
                      className="seal-round grid place-items-center border transition-all duration-300"
                      style={{
                        height: on ? 18 : 12,
                        width: on ? 18 : 12,
                        borderColor: "var(--color-brass)",
                        background: on ? "var(--color-brass)" : "var(--color-ink-900)",
                      }}
                    />
                    <span
                      className="absolute top-8 whitespace-nowrap font-mono text-[0.7rem] tracking-wider transition-colors"
                      style={{ color: on ? "var(--color-brass)" : "var(--color-bone-muted)" }}
                    >
                      {formatNum(t(`hours.${h}.time`), locale)}
                    </span>
                    <span className="sr-only">{t(`hours.${h}.label`)}</span>
                  </button>
                );
              })}
            </div>

            {/* Readout for the active hour. */}
            <div className="mx-8 mb-8 border border-brass/25 bg-ink-900/90 px-6 py-5">
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-brass">
                {t(`hours.${active}.label`)}
              </p>
              <p className="mt-2 max-w-[62ch] text-lg leading-snug text-bone">
                {t(`hours.${active}.does`)}
              </p>
              <p className="mt-2 font-mono text-xs text-bone-muted">
                {t(`hours.${active}.tool`)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile: the same day as a hairline list. No hover on a phone. ── */}
      <ol className="mx-auto mt-8 max-w-7xl px-6 sm:hidden">
        {HOURS.map((h) => (
          <li key={h} className="border-b border-brass/10 py-5 last:border-b-0">
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-xs text-brass">
                {formatNum(t(`hours.${h}.time`), locale)}
              </span>
              <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-bone-muted">
                {t(`hours.${h}.label`)}
              </span>
            </div>
            <p className="mt-2 leading-snug text-bone">{t(`hours.${h}.does`)}</p>
            <p className="mt-1.5 font-mono text-xs text-bone-muted">{t(`hours.${h}.tool`)}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
