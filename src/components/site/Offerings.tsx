"use client";

import { m } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { SectionHeading } from "./SectionHeading";
import { brand } from "@/lib/brand";

const items = [
  { key: "marketing", href: "/services/marketing", accent: brand.worlds.marketing.accent, num: "01" },
  { key: "pos", href: "/products/pos", accent: brand.worlds.pos.accent, num: "02" },
  { key: "ecommerce", href: "/products/ecommerce", accent: brand.worlds.ecommerce.accent, num: "03" },
] as const;

export function Offerings() {
  const t = useTranslations("Offerings");

  return (
    <section id="offerings" className="relative mx-auto max-w-7xl px-6 py-28">
      <SectionHeading kicker={t("kicker")} title={t("title")} />

      <div className="mt-16 grid gap-6 md:grid-cols-3">
        {items.map((it, i) => (
          <m.div
            key={it.key}
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: i * 0.1, ease: brand.ease.cinematic }}
          >
            <Link
              href={it.href}
              className="group relative flex h-full min-h-[340px] flex-col justify-between overflow-hidden rounded-2xl border border-brass/12 bg-gradient-to-b from-ink-800 to-ink-900 p-8 transition-colors duration-500 hover:border-brass/40"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  background: `radial-gradient(70% 55% at 50% 0%, ${it.accent}40, transparent 70%)`,
                }}
              />
              <div className="relative">
                <span className="text-xs tracking-[0.3em] text-bone-muted">{it.num}</span>
                <h3 className="font-display mt-6 text-3xl font-semibold text-bone">
                  {t(`${it.key}.title`)}
                </h3>
                <p className="mt-4 max-w-xs text-sm leading-relaxed text-bone-muted">
                  {t(`${it.key}.desc`)}
                </p>
              </div>
              <span className="relative mt-8 inline-flex items-center gap-2 text-sm font-semibold text-brass">
                {t("details")}
                <span className="transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1">
                  →
                </span>
              </span>
            </Link>
          </m.div>
        ))}
      </div>
    </section>
  );
}
