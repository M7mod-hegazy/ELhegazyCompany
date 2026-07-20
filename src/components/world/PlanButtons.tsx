"use client";

import { useLocale, useTranslations } from "next-intl";
import { getWorld } from "@/config/worlds";
import { cn } from "@/lib/cn";

/** Download (free) + Pricing CTA pair — reused across the page so the offer is
 *  always one click away. Download falls back to /start until a real installer
 *  URL is set in siteConfig.downloads. */
export function PlanButtons({
  worldKey,
  className,
  center,
}: {
  worldKey: string;
  className?: string;
  center?: boolean;
}) {
  const t = useTranslations("Common");
  const locale = useLocale();
  const dlPage = `/${locale}${getWorld(worldKey)?.href ?? ""}/download`;
  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:gap-4", center && "sm:justify-center", className)}>
      <a
        href={dlPage}
        data-cursor
        className="rounded-full bg-brass px-7 py-3.5 text-center text-sm font-semibold text-ink-900 transition-all duration-300 hover:-translate-y-0.5 hover:bg-brass-hi"
      >
        {t("download")}
      </a>
      <a
        href="#pricing"
        data-cursor
        className="inline-flex items-center justify-center gap-2 rounded-full border border-brass/40 px-7 py-3.5 text-sm font-semibold text-bone transition-colors hover:border-brass hover:text-brass"
      >
        {t("pricing")}
      </a>
    </div>
  );
}

/** A compact mid-page band that repeats the offer between sections. */
export function PlanBand({ worldKey }: { worldKey: string }) {
  const t = useTranslations("Common");
  return (
    <section className="relative mx-auto max-w-4xl px-6 py-16">
      <div className="rounded-3xl border border-brass/15 bg-ink-800/40 px-8 py-10 text-center">
        <p className="font-display text-2xl font-semibold text-bone sm:text-3xl">{t("tryFree")}</p>
        <PlanButtons worldKey={worldKey} center className="mt-7" />
      </div>
    </section>
  );
}
