import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { brand } from "@/lib/brand";
import { WorldAtmosphere } from "@/components/world/WorldAtmosphere";
import { PageHero } from "@/components/site/PageHero";
import {
  MarketingHero,
  PillarSections,
  ProcessStrip,
  MarketingPackages,
  MarketingProof,
} from "@/components/marketing/MarketingSections";
import { CtaBand } from "@/components/site/CtaBand";

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

  return (
    <main
      className="relative z-10 overflow-x-clip"
      style={{ "--world-accent": brand.worlds.marketing.accent } as CSSProperties}
    >
      <PageHero
        videoKey="marketing"
        kicker={t("hero")}
        title={t("promise")}
        zone="bottom-left"
      />
      <WorldAtmosphere />
      <MarketingHero />
      <MarketingProof />
      <PillarSections />
      <ProcessStrip />
      <MarketingPackages />
      <CtaBand />
    </main>
  );
}
