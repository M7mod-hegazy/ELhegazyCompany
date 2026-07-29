"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { siteConfig } from "@/config/site";

/**
 * CtaBand — the closing call on every non-home page.
 *
 * Rebuilt in the site's own language. It was the last component still carrying
 * the old system: a `rounded-3xl` gradient card with two `rounded-full` pills,
 * landing directly under sharp hairline-ruled sections. Two visual systems on
 * one page is what made the site feel assembled rather than designed.
 *
 * The primary action also pointed at `/start`, a deleted route, so the most
 * important button on the page took a server redirect and a full page reload.
 */
export function CtaBand() {
  const t = useTranslations("CTA");
  const whatsappHref = `https://wa.me/${siteConfig.contact.whatsapp}`;

  return (
    <section className="relative border-t border-brass/12 bg-ink-900">
      <div className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-3xl font-semibold text-bone sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mx-auto mt-5 max-w-[52ch] leading-relaxed text-bone-muted">
            {t("subtitle")}
          </p>

          <div className="rule-seal mx-auto my-9 w-40" />

          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/contact"
              className="bg-brass px-8 py-3.5 font-mono text-sm font-semibold text-ink-900 transition-colors duration-300 hover:bg-brass-hi"
            >
              {t("primary")}
            </Link>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-brass/40 px-8 py-3.5 font-mono text-sm text-bone transition-colors duration-300 hover:border-brass hover:text-brass"
            >
              {t("whatsapp")}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
