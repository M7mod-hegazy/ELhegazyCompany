"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

type Row = { problem: string; fix: string };

/**
 * ProblemFixSection — direct pain-point → feature mapping.
 *
 * No metaphor, no interaction: the problem and its fix sit side by side on
 * the same row. Reads in a single pass, top to bottom.
 */
export function ProblemFixSection() {
  const t = useTranslations("ProblemFix");
  const rows = t.raw("rows") as Row[];

  return (
    <section className="relative overflow-hidden py-20 sm:py-28" aria-labelledby="problemfix-heading">
      {/* No local backdrop — this sits on the shared page-wide atmosphere
          (WorldAtmosphere, mounted once in page.tsx) rather than layering a
          second, slightly-different texture on top of it. */}
      <div className="relative mx-auto max-w-5xl px-6">
        <div className="mb-10 max-w-[46ch]">
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.28em] text-brass/80">
            {t("kicker")}
          </p>
          <h2
            id="problemfix-heading"
            className="text-3xl font-semibold leading-[1.15] text-bone sm:text-4xl md:text-5xl"
          >
            {t("title")}
          </h2>
          <p className="mt-4 leading-relaxed text-bone-muted">{t("body")}</p>
        </div>

        {/* Column headers — desktop only, mobile cards repeat the icon per row. */}
        <div className="mb-2 hidden grid-cols-2 px-5 sm:grid">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-bone-muted">
            {t("problemLabel")}
          </p>
          <p className="ps-5 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-brass/80">
            {t("fixLabel")}
          </p>
        </div>

        <div className="divide-y divide-brass/10 border border-brass/15">
          {rows.map((r, i) => (
            <div key={i} className="grid sm:grid-cols-2">
              <div className="flex items-start gap-3 p-5 sm:border-e sm:border-brass/10">
                <span
                  aria-hidden
                  className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center border border-oxblood-tint/50 text-xs text-oxblood-tint"
                >
                  ✕
                </span>
                <p className="text-sm leading-snug text-bone-muted">{r.problem}</p>
              </div>
              <div className="flex items-start gap-3 bg-brass/[0.04] p-5">
                <span
                  aria-hidden
                  className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center border border-brass text-xs text-brass"
                >
                  ✓
                </span>
                <p className="text-sm font-medium leading-snug text-bone">{r.fix}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/contact"
            className="inline-block bg-brass px-7 py-3.5 font-mono text-sm font-semibold text-ink-900 transition-colors hover:bg-brass-hi"
          >
            {t("cta")}
          </Link>
        </div>
      </div>
    </section>
  );
}
