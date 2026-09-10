"use client";

import { m } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { brand } from "@/lib/brand";
import { cn } from "@/lib/cn";
import { getWorld } from "@/config/worlds";
import { siteConfig } from "@/config/site";

/**
 * Commercial pricing block: Free preview vs Full version. Prices/plan copy live
 * in messages (`Worlds.<key>.pricing`) so the owner edits the real price with no
 * rebuild.
 *
 * World-aware by `externalHref`: a hosted product (e-commerce) points the
 * preview card at the real running store and routes the "buy" card to a
 * WhatsApp inquiry (that's how the sale actually closes). Desktop software
 * (POS) keeps the on-site flow: free → download page, full → /contact order.
 */
export function Pricing({ worldKey }: { worldKey: string }) {
  const t = useTranslations(`Worlds.${worldKey}.pricing`);
  const locale = useLocale();
  const world = getWorld(worldKey);
  const external = world?.externalHref;

  const startHref = external ?? `/${locale}${world?.href ?? ""}/download`;
  const orderHref = external
    ? `https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(
        locale === "ar"
          ? "مرحبًا، عايز أطلب متجر إلكتروني من الحجازي (٥٬٠٠٠ ج.م) — ممكن التفاصيل؟"
          : "Hi, I'd like to order an ElHegazi e-commerce store (EGP 5,000) — can I get the details?",
      )}`
    : `/${locale}/contact?product=${worldKey}&plan=full`;

  const freeFeatures = t.raw("free.features") as string[];
  const fullFeatures = t.raw("full.features") as string[];

  const extAnchor = external ? { target: "_blank", rel: "noopener noreferrer" } : {};

  return (
    <section id="pricing" className="relative mx-auto max-w-5xl scroll-mt-24 px-6 py-24">
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-brass">{t("kicker")}</p>
        <h2 className="font-display mx-auto mt-4 max-w-2xl text-3xl font-semibold text-bone sm:text-5xl">
          {t("title")}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-bone-muted">{t("subtitle")}</p>
      </div>

      <div className="mt-14 grid items-stretch gap-6 md:grid-cols-2">
        {/* Free preview */}
        <m.div
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: brand.ease.cinematic }}
          className="flex flex-col rounded-3xl border border-brass/15 bg-ink-800/50 p-8"
        >
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-bone-muted">
            {t("free.tag")}
          </span>
          <h3 className="font-display mt-3 text-2xl font-semibold text-bone">{t("free.name")}</h3>
          <div className="mt-5 font-display text-5xl font-bold text-bone">{t("free.price")}</div>
          <p className="mt-2 text-sm text-bone-muted">{t("free.priceNote")}</p>
          <ul className="mt-7 flex-1 space-y-3">
            {freeFeatures.map((f) => (
              <li key={f} className="flex items-center gap-3 text-sm text-bone">
                <Check muted />
                {f}
              </li>
            ))}
          </ul>
          <a
            href={startHref}
            data-cursor
            {...extAnchor}
            className="mt-8 rounded-full border border-brass/40 px-6 py-3 text-center text-sm font-semibold text-bone transition-colors hover:border-brass hover:text-brass"
          >
            {t("free.cta")}
          </a>
        </m.div>

        {/* Full version — highlighted */}
        <m.div
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.1, ease: brand.ease.cinematic }}
          className="relative flex flex-col overflow-hidden rounded-3xl border p-8 md:scale-[1.03]"
          style={{
            borderColor: "color-mix(in oklab, var(--world-accent,#C9A86A) 55%, transparent)",
            background: "linear-gradient(180deg, color-mix(in oklab, var(--world-accent,#C9A86A) 10%, #141416), #0A0A0B)",
            boxShadow: "0 40px 100px -50px rgba(0,0,0,0.95), inset 0 0 0 1px color-mix(in oklab, var(--world-accent,#C9A86A) 30%, transparent)",
          }}
        >
          <span
            className="absolute end-6 top-6 rounded-full px-3 py-1 text-[0.62rem] font-bold text-ink-900"
            style={{ background: "var(--world-accent)" }}
          >
            {t("full.badge")}
          </span>
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-brass">
            {t("full.tag")}
          </span>
          <h3 className="font-display mt-3 text-2xl font-semibold text-bone">{t("full.name")}</h3>
          <div className="mt-5 font-display text-5xl font-bold" style={{ color: "var(--world-accent)" }}>
            {t("full.price")}
          </div>
          <p className="mt-2 text-sm text-bone-muted">{t("full.priceNote")}</p>
          <ul className="mt-7 flex-1 space-y-3">
            {fullFeatures.map((f) => (
              <li key={f} className="flex items-center gap-3 text-sm text-bone">
                <Check />
                {f}
              </li>
            ))}
          </ul>
          <a
            href={orderHref}
            data-cursor
            {...extAnchor}
            className="mt-8 rounded-full bg-brass px-6 py-3 text-center text-sm font-semibold text-ink-900 transition-all duration-300 hover:-translate-y-0.5 hover:bg-brass-hi"
          >
            {t("full.cta")}
          </a>
        </m.div>
      </div>

      <p className="mt-8 text-center text-sm text-bone-muted">{t("note")}</p>
    </section>
  );
}

function Check({ muted }: { muted?: boolean }) {
  return (
    <span
      className={cn(
        "grid h-5 w-5 shrink-0 place-items-center rounded-full text-[0.7rem]",
        muted ? "bg-brass/15 text-brass" : "text-ink-900",
      )}
      style={muted ? undefined : { background: "var(--world-accent)" }}
    >
      ✓
    </span>
  );
}
