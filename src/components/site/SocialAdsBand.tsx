"use client";

import { m } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { brand } from "@/lib/brand";

const ACCENT = brand.worlds.marketing.accent;

/**
 * Home band for the social-advertising offer: a reels-style strip of tilted
 * 9:16 frames + the packages CTA into /services/marketing#packages.
 */
export function SocialAdsBand() {
  const t = useTranslations("Social");

  return (
    <section className="relative mx-auto max-w-6xl overflow-hidden px-6 py-24">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <m.div
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: brand.ease.cinematic }}
        >
          <p className="text-xs uppercase tracking-[0.35em] text-brass">{t("kicker")}</p>
          <h2 className="font-display-ar mt-4 text-3xl font-semibold leading-tight text-bone sm:text-5xl">
            {t("title")}
          </h2>
          <p className="mt-5 max-w-lg leading-relaxed text-bone-muted">{t("body")}</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/services/marketing#packages"
              className="rounded-full bg-brass px-7 py-3.5 text-sm font-semibold text-ink-900 transition-all duration-300 hover:-translate-y-0.5 hover:bg-brass-hi"
            >
              {t("cta")}
            </Link>
            <Link
              href="/services/marketing"
              className="rounded-full border border-brass/40 px-7 py-3.5 text-sm font-semibold text-bone transition-colors hover:border-brass hover:text-brass"
            >
              {t("ctaDetails")}
            </Link>
          </div>
        </m.div>

        <div className="relative flex h-80 items-center justify-center">
          {[-1, 0, 1].map((i) => (
            <m.div
              key={i}
              initial={{ opacity: 0, y: 30, rotate: 0 }}
              whileInView={{ opacity: 1, y: i === 0 ? -10 : 10, rotate: i * 7 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.9, delay: (i + 1) * 0.12, ease: brand.ease.cinematic }}
              className="relative -mx-3 h-64 w-36 overflow-hidden rounded-2xl border border-brass/25 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)]"
              style={{
                background: `linear-gradient(${150 + i * 40}deg, ${i === 0 ? "#C9A86A" : ACCENT} 0%, #0A0A0B 70%)`,
                zIndex: i === 0 ? 2 : 1,
              }}
            >
              <span className="absolute inset-x-0 bottom-3 mx-auto h-1 w-16 rounded-full bg-bone/30" />
              <span className="absolute inset-0 grid place-items-center">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-ink-900/70 text-sm text-brass">
                  ▶
                </span>
              </span>
            </m.div>
          ))}
        </div>
      </div>
    </section>
  );
}
