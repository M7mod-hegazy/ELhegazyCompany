"use client";

import { m, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { siteConfig } from "@/config/site";
import { ParallaxImage } from "@/components/fx/ParallaxImage";

/**
 * CompareSection — before / after.
 *
 * Replaces the old "day in your shop" hourly walkthrough. Same counter, split
 * in two: the paper-and-memory way on the left (the same photograph used in
 * CounterSection, desaturated — literally the same place, before), the system
 * running it on the right (an illustrated till panel, since no real product
 * screenshot exists yet). No hover, no scroll-scrubbing — the whole point
 * reads in one glance.
 */
const ease = [0.22, 1, 0.36, 1] as const;

export function CompareSection() {
  const t = useTranslations("Compare");
  const reduced = useReducedMotion();
  const beforePoints = t.raw("beforePoints") as string[];
  const afterPoints = t.raw("afterPoints") as string[];
  const waHref = `https://wa.me/${siteConfig.contact.whatsapp}`;

  return (
    <section className="relative overflow-hidden py-20 sm:py-28" aria-labelledby="compare-heading">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto mb-12 max-w-[42ch] text-center">
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.28em] text-brass/80">
            {t("kicker")}
          </p>
          <h2 id="compare-heading" className="text-3xl font-semibold leading-[1.15] text-bone sm:text-4xl md:text-5xl">
            {t("title")}
          </h2>
          <p className="mt-4 leading-relaxed text-bone-muted">{t("body")}</p>
        </div>

        <div className="relative grid overflow-hidden border border-brass/15 sm:grid-cols-2">
          {/* Center seal — sits on the dividing line, desktop only. */}
          <div
            aria-hidden
            className="absolute inset-y-0 start-1/2 z-20 hidden w-px -translate-x-1/2 bg-brass/25 sm:block"
          />
          <span
            aria-hidden
            className="seal-round absolute start-1/2 top-1/2 z-20 hidden h-9 w-9 -translate-x-1/2 -translate-y-1/2 place-items-center border border-brass bg-ink-900 font-mono text-[0.6rem] text-brass sm:grid"
          >
            VS
          </span>

          {/* ── Before ── */}
          <m.div
            initial={reduced ? false : { opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease }}
            className="relative flex min-h-[420px] flex-col justify-end overflow-hidden p-8"
          >
            <div aria-hidden className="absolute inset-0 -z-10">
              <ParallaxImage
                src="/bg/counter.jpg"
                travel={22}
                scale={1.08}
                quality={72}
                objectPosition="center 60%"
                filter="grayscale(0.75) sepia(0.1) brightness(0.68) contrast(0.95)"
                className="absolute inset-0 overflow-hidden"
              />
              {/* Darker, closer to the rest of the page's photo treatment — the
                  lighter first pass made this patch of warm wood tones stand
                  out against how dark everything around it is. */}
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(to top, rgba(10,10,11,0.92) 0%, rgba(10,10,11,0.6) 55%, rgba(10,10,11,0.32) 100%)" }}
              />
            </div>

            <p className="mb-4 font-mono text-xs font-semibold uppercase tracking-[0.25em] text-bone-muted">
              {t("beforeLabel")}
            </p>
            <ul className="space-y-2.5">
              {beforePoints.map((p) => (
                <li key={p} className="flex items-start gap-3">
                  <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-bone-muted/60" />
                  <span className="text-sm leading-snug text-bone-muted">{p}</span>
                </li>
              ))}
            </ul>
          </m.div>

          {/* ── After ── */}
          <m.div
            initial={reduced ? false : { opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.1, ease }}
            className="relative flex min-h-[420px] flex-col justify-between overflow-hidden bg-ink-900 p-8"
          >
            <div
              aria-hidden
              className="absolute inset-0 -z-10"
              style={{
                backgroundImage: "url(/bg/backdrop.jpg)",
                backgroundSize: "cover",
                backgroundPosition: "center",
                opacity: 0.14,
              }}
            />
            <div
              aria-hidden
              className="absolute inset-0 -z-10"
              style={{
                background:
                  "radial-gradient(90% 70% at 50% 0%, rgba(201,168,106,0.16) 0%, transparent 65%), radial-gradient(70% 50% at 100% 100%, rgba(201,168,106,0.1) 0%, transparent 60%)",
              }}
            />

            <div>
              <p className="mb-4 font-mono text-xs font-semibold uppercase tracking-[0.25em] text-brass">
                {t("afterLabel")}
              </p>
              <ul className="space-y-2.5">
                {afterPoints.map((p) => (
                  <li key={p} className="flex items-start gap-3">
                    <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brass" />
                    <span className="text-sm leading-snug text-bone">{p}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Illustrated till panel — not a screenshot, a small built UI. */}
            <div className="relative mt-8">
              <div className="border border-brass/25 bg-ink-900 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)]">
                <div className="flex items-center gap-1.5 border-b border-brass/15 px-4 py-2.5">
                  <span className="h-2 w-2 rounded-full bg-brass/50" />
                  <span className="h-2 w-2 rounded-full bg-brass/30" />
                  <span className="h-2 w-2 rounded-full bg-brass/20" />
                  <span className="ms-2 font-mono text-[0.62rem] uppercase tracking-widest text-bone-muted">
                    {t("mockHeader")}
                  </span>
                </div>
                <div className="space-y-2 p-4 font-mono text-sm">
                  <div className="flex justify-between text-bone-muted">
                    <span>{t("mockItem1")}</span>
                    <span className="text-bone">٤٠</span>
                  </div>
                  <div className="flex justify-between text-bone-muted">
                    <span>{t("mockItem2")}</span>
                    <span className="text-bone">٨٥</span>
                  </div>
                  <div className="flex justify-between border-t border-brass/15 pt-2 font-semibold text-brass">
                    <span>{t("mockTotal")}</span>
                    <span>١٢٥</span>
                  </div>
                </div>
              </div>
              {/* Toast sits in normal flow below the card — no overlap, no clipping. */}
              <div className="relative z-10 mx-4 -mt-3 flex w-fit items-center gap-2 border border-brass/30 bg-ink-800 px-3 py-2 font-mono text-[0.65rem] text-bone shadow-lg">
                <span aria-hidden className="text-brass">✓</span>
                {t("mockToast")}
              </div>
            </div>
          </m.div>
        </div>

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
