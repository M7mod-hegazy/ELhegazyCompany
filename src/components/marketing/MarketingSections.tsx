"use client";

import { m } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { brand } from "@/lib/brand";
import { cn } from "@/lib/cn";
import { siteConfig } from "@/config/site";
import { catalog } from "@/config/catalog";

const ACCENT = brand.worlds.marketing.accent;
const PILLARS = ["ads", "creative", "video", "brand"] as const;

const rise = {
  hidden: { opacity: 0, y: 28 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay: i * 0.1, ease: brand.ease.cinematic },
  }),
};

/* --------------------------------- hero --------------------------------- */

export function MarketingHero() {
  const t = useTranslations("Marketing");
  const tOff = useTranslations("Offerings.marketing");
  const locale = useLocale();
  const display = locale === "ar" ? "font-display-ar" : "font-display-en";
  const waHref = `https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(
    locale === "ar" ? "عايز أعرف تفاصيل باقات التسويق" : "I want details about the marketing packages",
  )}`;

  return (
    <section className="relative flex min-h-[92vh] flex-col items-center justify-center px-6 pb-16 pt-36 text-center">
      <m.p
        variants={rise}
        initial="hidden"
        animate="show"
        className="text-xs uppercase tracking-[0.35em] text-brass"
      >
        {t("kicker")}
      </m.p>
      <m.h1
        variants={rise}
        custom={1}
        initial="hidden"
        animate="show"
        className={`${display} mt-5 max-w-4xl text-4xl font-medium leading-[1.08] text-bone sm:text-6xl lg:text-7xl`}
      >
        {t("hero")}
      </m.h1>
      <m.p
        variants={rise}
        custom={2}
        initial="hidden"
        animate="show"
        className="mt-6 max-w-2xl text-base leading-relaxed text-bone-muted sm:text-lg"
      >
        {t("promise")}
      </m.p>

      <m.div
        variants={rise}
        custom={3}
        initial="hidden"
        animate="show"
        className="mt-8 flex flex-wrap justify-center gap-2"
      >
        {PILLARS.map((p) => (
          <span key={p} className="rounded-full border border-brass/25 px-4 py-1.5 text-xs text-bone">
            {tOff(`pillars.${p}`)}
          </span>
        ))}
      </m.div>

      <m.div
        variants={rise}
        custom={4}
        initial="hidden"
        animate="show"
        className="mt-10 flex flex-wrap items-center justify-center gap-4"
      >
        <a
          href="#packages"
          data-cursor
          className="rounded-full bg-brass px-8 py-3.5 text-sm font-semibold text-ink-900 transition-all duration-300 hover:-translate-y-0.5 hover:bg-brass-hi"
        >
          {t("ctaPackages")}
        </a>
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-brass/40 px-8 py-3.5 text-sm font-semibold text-bone transition-colors hover:border-brass hover:text-brass"
        >
          {t("ctaWhatsapp")}
        </a>
      </m.div>
    </section>
  );
}

/* -------------------------------- pillars -------------------------------- */

export function PillarSections() {
  const tOff = useTranslations("Offerings.marketing");
  const t = useTranslations("Marketing");

  return (
    <div>
      {PILLARS.map((p, i) => (
        <section key={p} className="relative mx-auto max-w-6xl px-6 py-20">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <m.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8, ease: brand.ease.cinematic }}
              className={cn(i % 2 === 1 && "lg:order-2")}
            >
              <p className="flex items-baseline gap-3">
                <span className="font-display-en text-3xl font-semibold" style={{ color: ACCENT }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-xs uppercase tracking-[0.3em] text-bone-muted">
                  {t("pillarKicker")}
                </span>
              </p>
              <h2 className="font-display-ar mt-4 text-3xl font-semibold leading-tight text-bone sm:text-4xl">
                {tOff(`pillars.${p}`)}
              </h2>
              <p className="mt-4 max-w-lg leading-relaxed text-bone-muted">
                {tOff(`pillarsDesc.${p}`)}
              </p>
              <ul className="mt-6 space-y-2.5">
                {(t.raw(`pillarBullets.${p}`) as string[]).map((b) => (
                  <li key={b} className="flex items-center gap-3 text-sm text-bone">
                    <span
                      className="block h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ background: ACCENT }}
                    />
                    {b}
                  </li>
                ))}
              </ul>
            </m.div>

            <m.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.9, ease: brand.ease.cinematic }}
              className={cn(i % 2 === 1 && "lg:order-1")}
            >
              <PillarVisual pillar={p} />
            </m.div>
          </div>
        </section>
      ))}
    </div>
  );
}

/** Abstract, art-directed visual per pillar — no screenshots needed. */
function PillarVisual({ pillar }: { pillar: (typeof PILLARS)[number] }) {
  const frame =
    "relative h-72 overflow-hidden rounded-3xl border border-brass/15 bg-ink-800/50 sm:h-80";

  if (pillar === "ads") {
    // rising campaign bars
    const bars = [34, 52, 44, 68, 60, 84, 78, 96];
    return (
      <div className={`${frame} flex items-end justify-center gap-3 p-10`}>
        {bars.map((h, i) => (
          <m.div
            key={i}
            initial={{ height: 0 }}
            whileInView={{ height: `${h}%` }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: i * 0.08, ease: brand.ease.cinematic }}
            className="w-6 rounded-t-md sm:w-8"
            style={{
              background: `linear-gradient(to top, ${ACCENT}, #C9A86A)`,
              opacity: 0.55 + (i / bars.length) * 0.45,
            }}
          />
        ))}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-ink-900/70 to-transparent" />
      </div>
    );
  }

  if (pillar === "creative") {
    // hover-depth creative grid
    return (
      <div className={`${frame} grid grid-cols-3 gap-2 p-6`}>
        {Array.from({ length: 9 }).map((_, i) => (
          <m.div
            key={i}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.06, ease: brand.ease.cinematic }}
            className="rounded-xl"
            style={{
              background: `linear-gradient(135deg, ${
                i % 3 === 0 ? ACCENT : i % 3 === 1 ? "#C9A86A" : "#1E1E22"
              } 0%, #141416 100%)`,
              opacity: 0.85,
            }}
          />
        ))}
      </div>
    );
  }

  if (pillar === "video") {
    // 9:16 reels wall
    return (
      <div className={`${frame} flex items-center justify-center gap-4 p-8`}>
        {[0, 1, 2].map((i) => (
          <m.div
            key={i}
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: i * 0.12, ease: brand.ease.cinematic }}
            className="relative h-full w-24 overflow-hidden rounded-2xl border border-brass/20 sm:w-28"
            style={{
              background: `linear-gradient(${160 + i * 30}deg, ${ACCENT} 0%, #0A0A0B 65%)`,
              transform: `translateY(${(i - 1) * 10}px)`,
            }}
          >
            <span className="absolute inset-0 grid place-items-center">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-ink-900/70 text-xs text-brass">
                ▶
              </span>
            </span>
          </m.div>
        ))}
      </div>
    );
  }

  // brand: the wordmark as the artifact
  return (
    <div className={`${frame} grid place-items-center`}>
      <m.span
        initial={{ opacity: 0, letterSpacing: "0.2em" }}
        whileInView={{ opacity: 1, letterSpacing: "0em" }}
        viewport={{ once: true }}
        transition={{ duration: 1.1, ease: brand.ease.cinematic }}
        className="font-display-ar text-6xl font-semibold text-brass sm:text-7xl"
        dir="rtl"
      >
        الحجازي
      </m.span>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at center, transparent 40%, #0A0A0B 100%), radial-gradient(ellipse at 30% 20%, ${ACCENT}22, transparent 50%)`,
        }}
      />
    </div>
  );
}

/* -------------------------------- process -------------------------------- */

export function ProcessStrip() {
  const t = useTranslations("Marketing");
  const steps = t.raw("process") as { t: string; d: string }[];

  return (
    <section className="relative mx-auto max-w-6xl px-6 py-24">
      <p className="text-center text-xs uppercase tracking-[0.35em] text-brass">
        {t("processKicker")}
      </p>
      <h2 className="font-display-ar mt-4 text-center text-3xl font-semibold text-bone sm:text-4xl">
        {t("processTitle")}
      </h2>
      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s, i) => (
          <m.div
            key={s.t}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: i * 0.1, ease: brand.ease.cinematic }}
            className="rounded-3xl border border-brass/15 bg-ink-800/40 p-7"
          >
            <span className="font-display-en text-3xl font-semibold" style={{ color: ACCENT }}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-3 text-lg font-semibold text-bone">{s.t}</h3>
            <p className="mt-2 text-sm leading-relaxed text-bone-muted">{s.d}</p>
          </m.div>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------- packages ------------------------------- */

export function MarketingPackages() {
  const t = useTranslations("Marketing");
  const tc = useTranslations("Catalog.marketing");

  return (
    <section id="packages" className="relative mx-auto max-w-6xl scroll-mt-24 px-6 py-24">
      <p className="text-center text-xs uppercase tracking-[0.35em] text-brass">
        {t("packagesKicker")}
      </p>
      <h2 className="font-display-ar mx-auto mt-4 max-w-2xl text-center text-3xl font-semibold text-bone sm:text-5xl">
        {t("packagesTitle")}
      </h2>
      <p className="mx-auto mt-4 max-w-xl text-center text-bone-muted">{t("packagesSub")}</p>

      <div className="mt-14 grid items-stretch gap-6 lg:grid-cols-3">
        {catalog.marketing.plans.map((p, i) => {
          const features = t.raw(`packageFeatures.${p.id}`) as string[];
          return (
            <m.div
              key={p.id}
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: brand.ease.cinematic }}
              className={cn(
                "relative flex flex-col overflow-hidden rounded-3xl border p-8",
                p.featured
                  ? "border-brass/60 bg-gradient-to-b from-ink-700 to-ink-900 lg:scale-[1.04]"
                  : "border-brass/15 bg-ink-800/50",
              )}
            >
              {p.featured && (
                <span className="absolute end-6 top-6 rounded-full bg-brass px-3 py-1 text-[0.62rem] font-bold text-ink-900">
                  {t("popular")}
                </span>
              )}
              <h3 className="font-display-ar text-2xl font-semibold text-bone">
                {tc(`plans.${p.id}.name`)}
              </h3>
              <div
                className="font-display mt-4 text-4xl font-bold"
                style={{ color: p.featured ? "#C9A86A" : "#EDE7DA" }}
              >
                {tc(`plans.${p.id}.price`)}
              </div>
              <p className="mt-2 text-sm text-bone-muted">{tc(`plans.${p.id}.note`)}</p>
              <ul className="mt-7 flex-1 space-y-3">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-bone">
                    <span
                      className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ background: p.featured ? "#C9A86A" : ACCENT }}
                    />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={`/order?product=marketing&plan=${p.id}`}
                className={cn(
                  "mt-8 rounded-full px-6 py-3.5 text-center text-sm font-semibold transition-all duration-300",
                  p.featured
                    ? "bg-brass text-ink-900 hover:-translate-y-0.5 hover:bg-brass-hi"
                    : "border border-brass/40 text-bone hover:border-brass hover:text-brass",
                )}
              >
                {t("order")}
              </Link>
            </m.div>
          );
        })}
      </div>
    </section>
  );
}

/* --------------------------------- proof --------------------------------- */

export function MarketingProof() {
  const t = useTranslations("Marketing");
  const items = t.raw("proof") as { v: string; l: string }[];

  return (
    <section className="relative border-y border-brass/10 bg-ink-800/30 px-6 py-16">
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 text-center lg:grid-cols-4">
        {items.map((s, i) => (
          <m.div
            key={s.l}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.08, ease: brand.ease.cinematic }}
          >
            <div className="font-display-ar text-4xl font-bold text-brass sm:text-5xl">{s.v}</div>
            <div className="mt-2 text-sm text-bone-muted">{s.l}</div>
          </m.div>
        ))}
      </div>
      <p className="mx-auto mt-10 max-w-2xl text-center font-display-ar text-xl leading-relaxed text-bone sm:text-2xl">
        {t("statement")}
      </p>
    </section>
  );
}
