"use client";

import { useLocale, useTranslations } from "next-intl";
import { siteConfig } from "@/config/site";

export function CtaBand() {
  const t = useTranslations("CTA");
  const locale = useLocale();
  const whatsappHref = `https://wa.me/${siteConfig.contact.whatsapp}`;

  return (
    <section className="relative mx-auto max-w-7xl px-6 py-28">
      <div className="relative overflow-hidden rounded-3xl border border-brass/15 bg-gradient-to-br from-ink-800 to-ink-900 px-8 py-20 text-center">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(50% 70% at 50% 0%, rgba(201,168,106,0.12), transparent 70%)",
          }}
        />
        <h2 className="font-display text-mask relative text-4xl font-semibold sm:text-6xl">
          {t("title")}
        </h2>
        <p className="relative mx-auto mt-5 max-w-xl text-bone-muted">{t("subtitle")}</p>
        <div className="relative mt-10 flex flex-wrap justify-center gap-4">
          <a
            href={`/${locale}/start`}
            className="rounded-full bg-brass px-8 py-3.5 text-sm font-semibold text-ink-900 transition-all duration-300 hover:-translate-y-0.5 hover:bg-brass-hi"
          >
            {t("primary")}
          </a>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-brass/40 px-8 py-3.5 text-sm font-semibold text-bone transition-colors duration-300 hover:border-brass hover:text-brass"
          >
            {t("whatsapp")}
          </a>
        </div>
      </div>
    </section>
  );
}
