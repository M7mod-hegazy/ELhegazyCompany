"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { formatNum } from "@/lib/num";

const ITEMS = ["ATELIER", "NOVA", "ORIENT", "LUMEN", "SAHARA", "VERVE", "MAISON", "ZENITH"];

/**
 * LogoMarquee — "trusted by" band.
 *
 * Was a bare line of scrolling text on flat black — no numbers, no CTA,
 * nothing to look at besides the loop itself. Same fake wordmarks (swap
 * `ITEMS` for real logos when they land), but now with real stat tiles above
 * it and a way to act below it, so the loop is decoration for a section that
 * has something to say — not the whole section.
 *
 * No local background here — an opaque fill + its own border-y read as a
 * boxed-off "island" between neighbouring sections. It sits directly on the
 * page-wide animated atmosphere (WorldAtmosphere, mounted once in page.tsx)
 * instead, the same surface every other texture-less section shares.
 */
const STATS = [
  { key: "roas", value: "3.8×" },
  { key: "reach", value: "2M+" },
  { key: "brands", value: "40+" },
  { key: "years", value: "5+" },
] as const;

export function LogoMarquee() {
  const t = useTranslations("Marquee");
  const tStats = useTranslations("Stats");
  const locale = useLocale();

  return (
    <section className="relative overflow-hidden py-20 sm:py-28">
      <div className="relative mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.28em] text-brass/80">
            {t("kicker")}
          </p>
          <h2 className="text-2xl font-semibold leading-[1.2] text-bone sm:text-3xl">
            {t("title")}
          </h2>
          <p className="mt-3 leading-relaxed text-bone-muted">{t("subtitle")}</p>
        </div>

        {/* ── Real numbers, framed like the rest of the site's stat rows. ── */}
        <dl className="mt-10 grid grid-cols-2 gap-px border border-brass/15 bg-brass/15 sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.key} className="bg-ink-900 px-5 py-6 text-center">
              <dd className="font-mono text-2xl font-semibold text-brass sm:text-3xl">
                {formatNum(s.value, locale)}
              </dd>
              <dt className="mt-1.5 font-mono text-[0.65rem] uppercase tracking-[0.15em] text-bone-muted">
                {tStats(s.key)}
              </dt>
            </div>
          ))}
        </dl>

        {/* ── The logos — each its own chip, edges fading rather than hard-cutting.
            Exactly two copies of the row + a translateX(-50%) loop: the second
            half is pixel-identical to the first, so the loop point is invisible
            and the strip never visibly "ends" or jumps. ── */}
        <div
          className="relative mt-10 overflow-hidden border-y border-brass/10 py-6"
          style={{
            maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
            WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
          }}
        >
          <div
            className="flex w-max animate-[marquee_26s_linear_infinite] gap-4 whitespace-nowrap"
            style={{ willChange: "transform" }}
          >
            {[...ITEMS, ...ITEMS].map((x, i) => (
              <span
                key={i}
                className="flex items-center border border-brass/15 bg-ink-800/40 px-6 py-3 font-display text-xl tracking-wide text-bone-muted/60"
              >
                {x}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/projects"
            className="inline-block bg-brass px-7 py-3.5 font-mono text-sm font-semibold text-ink-900 transition-colors hover:bg-brass-hi"
          >
            {t("cta")}
          </Link>
        </div>
      </div>
    </section>
  );
}
