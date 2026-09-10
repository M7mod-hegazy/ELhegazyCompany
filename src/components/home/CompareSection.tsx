"use client";

import { useState } from "react";
import { m, AnimatePresence, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { siteConfig } from "@/config/site";
import { ShotFrame } from "@/components/world/ShotFrame";

/**
 * CompareSection — before / after.
 *
 * The old version only ever compared the POS counter: a real photo on the
 * "before" side against a fabricated illustrated till on "after" — the whole
 * section read as a POS pitch. It's a tab switcher now, one tab per field
 * (POS / store / ads), and every "after" side leads with a number pulled
 * straight from a real client (misr-retail, Wesal) instead of an invented
 * mock, backed by a real screenshot instead of a drawn panel.
 */
const ease = [0.22, 1, 0.36, 1] as const;

type Field = "pos" | "ecommerce" | "marketing";
const FIELDS: Field[] = ["pos", "ecommerce", "marketing"];

const FIELD_ACCENT: Record<Field, string> = {
  pos: "var(--color-slate)",
  ecommerce: "var(--color-oxblood-tint)",
  marketing: "var(--color-brass)",
};

const FIELD_SHOT: Record<Field, { shot: string; device: "app" | "browser" }> = {
  pos: { shot: "owner-dash", device: "app" },
  ecommerce: { shot: "storefront", device: "browser" },
  marketing: { shot: "ad-mockup", device: "browser" },
};

export function CompareSection() {
  const t = useTranslations("Compare");
  const reduced = useReducedMotion();
  const [field, setField] = useState<Field>("pos");
  const waHref = `https://wa.me/${siteConfig.contact.whatsapp}`;

  const accent = FIELD_ACCENT[field];
  const { shot, device } = FIELD_SHOT[field];
  const before = t.raw(`${field}.before`) as string[];
  const after = t.raw(`${field}.after`) as string[];

  return (
    <section className="relative overflow-hidden py-20 sm:py-28" aria-labelledby="compare-heading">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto mb-10 max-w-[46ch] text-center">
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.28em] text-brass/80">
            {t("kicker")}
          </p>
          <h2 id="compare-heading" className="text-3xl font-semibold leading-[1.15] text-bone sm:text-4xl md:text-5xl">
            {t("title")}
          </h2>
          <p className="mt-4 leading-relaxed text-bone-muted">{t("body")}</p>
        </div>

        {/* ── Field tabs ── */}
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {FIELDS.map((f) => {
            const active = f === field;
            return (
              <button
                key={f}
                type="button"
                onClick={() => setField(f)}
                aria-pressed={active}
                className="border px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider transition-colors"
                style={
                  active
                    ? { borderColor: FIELD_ACCENT[f], color: FIELD_ACCENT[f], backgroundColor: "color-mix(in oklab, " + FIELD_ACCENT[f] + " 12%, transparent)" }
                    : { borderColor: "color-mix(in oklab, var(--color-brass) 20%, transparent)", color: "var(--color-bone-muted)" }
                }
              >
                {t(`tabs.${f}`)}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <m.div
            key={field}
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? {} : { opacity: 0, y: -12 }}
            transition={{ duration: 0.4, ease }}
            className="relative grid overflow-hidden border border-brass/15 sm:grid-cols-2"
          >
            {/* ── Before ── */}
            <div className="relative flex min-h-[420px] flex-col justify-center bg-ink-800/60 p-8">
              <p className="mb-4 font-mono text-xs font-semibold uppercase tracking-[0.25em] text-bone-muted">
                {t("beforeLabel")}
              </p>
              <ul className="space-y-3">
                {before.map((p) => (
                  <li key={p} className="flex items-start gap-3">
                    <span
                      aria-hidden
                      className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center border border-oxblood-tint/50 text-xs text-oxblood-tint"
                    >
                      ✕
                    </span>
                    <span className="text-sm leading-snug text-bone-muted">{p}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* ── After ── */}
            <div className="relative flex min-h-[420px] flex-col justify-between overflow-hidden bg-ink-900 p-8">
              <div
                aria-hidden
                className="absolute inset-0 -z-10"
                style={{
                  background: `radial-gradient(90% 70% at 50% 0%, color-mix(in oklab, ${accent} 16%, transparent) 0%, transparent 65%)`,
                }}
              />

              <div>
                <p className="mb-1 font-mono text-xs font-semibold uppercase tracking-[0.25em] text-brass">
                  {t("afterLabel")}
                </p>
                <p className="mt-3 font-mono text-3xl font-semibold" style={{ color: accent }}>
                  {t(`${field}.afterHeadline`)}
                </p>
                <p className="mb-4 mt-1 text-xs text-bone-muted">{t(`${field}.afterHeadlineLabel`)}</p>
                <ul className="space-y-2.5">
                  {after.map((p) => (
                    <li key={p} className="flex items-start gap-3">
                      <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brass" />
                      <span className="text-sm leading-snug text-bone">{p}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Real product screenshot — replaces the old fabricated mock. */}
              <div className="relative mt-6">
                <ShotFrame
                  world={field}
                  shot={shot}
                  device={device}
                  label={t(`${field}.shotLabel`)}
                />
              </div>
            </div>
          </m.div>
        </AnimatePresence>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link
            href="/contact"
            className="bg-brass px-7 py-3.5 font-mono text-sm font-semibold text-ink-900 transition-colors hover:bg-brass-hi"
          >
            {t("cta")}
          </Link>
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-bone/30 px-7 py-3.5 font-mono text-sm text-bone transition-colors hover:border-brass hover:text-brass"
          >
            {t("ctaWhatsapp")}
          </a>
        </div>
      </div>
    </section>
  );
}
