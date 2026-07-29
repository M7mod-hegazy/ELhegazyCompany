import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { brand } from "@/lib/brand";
import { WorldAtmosphere } from "@/components/world/WorldAtmosphere";
import { PageHero } from "@/components/site/PageHero";
import {
  PillarSections,
  ProcessStrip,
  MarketingPackages,
  MarketingProof,
} from "@/components/marketing/MarketingSections";
import { CtaBand } from "@/components/site/CtaBand";
import { siteConfig } from "@/config/site";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Marketing" });
  return { title: t("hero"), description: t("promise") };
}

export default async function MarketingWorldPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Marketing" });
  const tOff = await getTranslations({ locale, namespace: "Offerings.marketing" });

  const PILLARS = ["ads", "creative", "video", "brand"] as const;
  const waHref = `https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(
    locale === "ar" ? "عايز أعرف تفاصيل باقات التسويق" : "I want details about the marketing packages"
  )}`;

  return (
    <main
      className="relative z-10 overflow-x-clip"
      style={{ "--world-accent": brand.worlds.marketing.accent } as CSSProperties}
    >
      <PageHero
        videoKey="marketing"
        numberTag="03"
        kicker={t("kicker")}
        title={t("hero")}
        subtitle={t("promise")}
        chips={PILLARS.map((p) => tOff(`pillars.${p}`))}
        zone="bottom-left"
        accent={brand.worlds.marketing.accent}
        actions={
          <>
            <a
              href="#packages"
              data-cursor
              className="rounded-full bg-brass px-7 py-3.5 text-sm font-semibold text-ink-900 transition-all duration-300 hover:bg-brass-hi"
            >
              {t("ctaPackages")}
            </a>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-brass/40 px-7 py-3.5 text-sm font-semibold text-bone transition-colors hover:border-brass hover:text-brass"
            >
              {t("ctaWhatsapp")}
            </a>
          </>
        }
      />
      <WorldAtmosphere />
      <MarketingProof />
      <PillarSections />
      <ProcessStrip />
      <MarketingPackages />
      <CtaBand />
    </main>
  );
}

