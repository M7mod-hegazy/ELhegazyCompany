import { use } from "react";
import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { brand } from "@/lib/brand";
import { WorldAtmosphere } from "@/components/world/WorldAtmosphere";
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

export default function MarketingWorldPage({ params }: Props) {
  const { locale } = use(params);
  setRequestLocale(locale);

  return (
    <main
      className="relative z-10 overflow-x-clip"
      style={{ "--world-accent": brand.worlds.marketing.accent } as CSSProperties}
    >
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
