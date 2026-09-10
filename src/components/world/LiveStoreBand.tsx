"use client";

import { m } from "framer-motion";
import { useTranslations } from "next-intl";
import { brand } from "@/lib/brand";
import { cn } from "@/lib/cn";

export function LiveStoreBand({
  worldKey,
  href,
  kicker,
  title,
  cta,
  compact,
}: {
  worldKey: string;
  href?: string;
  /** Overrides for a second, shorter mention further down the page — without
   *  these it renders the default hero-level pitch (kicker/promise/button
   *  copy from Worlds.<worldKey>). */
  kicker?: string;
  title?: string;
  cta?: string;
  compact?: boolean;
}) {
  const t = useTranslations(`Worlds.${worldKey}`);

  if (!href) return null;

  return (
    <section className={cn("relative mx-auto px-6", compact ? "max-w-4xl py-8" : "max-w-5xl py-12")}>
      <m.a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.7, ease: brand.ease.cinematic }}
        className={cn(
          "group relative block overflow-hidden rounded-3xl border border-brass/20 bg-gradient-to-br from-ink-800/80 to-ink-900/80 text-center transition-all duration-500 hover:border-brass/50",
          compact ? "px-8 py-8" : "px-8 py-10",
        )}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(50% 60% at 50% 40%, color-mix(in oklab, var(--world-accent,#5A1F1B) 25%, transparent), transparent 70%)",
          }}
        />
        <span
          className="relative inline-block rounded-full border border-brass/25 bg-ink-900/60 px-4 py-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.25em] text-brass"
        >
          {kicker ?? t("kicker")}
        </span>
        <p className={cn("relative mt-4 font-display font-semibold text-bone", compact ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl")}>
          {title ?? t("promise")}
        </p>
        <span className="relative mt-6 inline-flex items-center gap-2 rounded-full bg-brass px-7 py-3 text-sm font-semibold text-ink-900 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:bg-brass-hi">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
          {cta ?? t("liveStoreCta")}
        </span>
      </m.a>
    </section>
  );
}
