import { Fragment } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { PageHero } from "@/components/site/PageHero";
import { getWorld } from "@/config/worlds";
import { WorldShell } from "@/components/world/WorldShell";
import { PlanButtons } from "@/components/world/PlanButtons";
import { KineticStatement } from "@/components/world/KineticStatement";
import { ProofBand } from "@/components/world/ProofBand";
import { AbilitiesBento } from "@/components/world/AbilitiesBento";
import { StoryChapter } from "@/components/world/StoryChapter";
import { ModuleGallery } from "@/components/world/ModuleGallery";
import { HorizontalFeatures } from "@/components/world/HorizontalFeatures";
import { FeatureIndex } from "@/components/world/FeatureIndex";
import { WorldProof } from "@/components/world/WorldProof";
import {
  TrustStrip,
  BigNumbers,
  CompareTable,
  PullQuote,
  SparkDivider,
  CapabilityWheel,
} from "@/components/world/sections";
import { Pricing } from "@/components/world/Pricing";
import { ThemesShowcase } from "@/components/world/ThemesShowcase";
import { PlanBand } from "@/components/world/PlanButtons";
import { CtaBand } from "@/components/site/CtaBand";

const KEY = "pos" as const;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: `Worlds.${KEY}` });
  return { title: t("hero"), description: t("promise") };
}

export default async function PosWorldPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const world = getWorld(KEY);
  if (!world) notFound();
  const t = await getTranslations({ locale, namespace: `Worlds.${KEY}` });

  return (
    <WorldShell accent={world.accent} worldKey={world.key}>
      <PageHero
        videoKey="pos"
        numberTag={world.num}
        kicker={t("kicker")}
        title={t("hero")}
        subtitle={t("promise")}
        chips={t.raw("heroChips")}
        zone="bottom-left"
        accent={world.accent}
        actions={<PlanButtons worldKey={world.key} />}
      />
      <KineticStatement worldKey={world.key} />

      <ProofBand world={world} plate="page-pos" />
      <TrustStrip worldKey={world.key} />
      <AbilitiesBento worldKey={world.key} />
      <BigNumbers worldKey={world.key} />
      <ThemesShowcase worldKey={world.key} />

      {world.chapters.map((c, idx) => (
        <Fragment key={c.id}>
          <StoryChapter worldKey={world.key} chapter={c} index={idx} />
          {world.modulesAfter === c.id && world.modules && (
            <ModuleGallery worldKey={world.key} modules={world.modules} />
          )}
        </Fragment>
      ))}

      <PullQuote worldKey={world.key} id="quote1" />
      <PlanBand worldKey={world.key} />
      <HorizontalFeatures worldKey={world.key} />
      <SparkDivider />
      <CompareTable worldKey={world.key} />
      <CapabilityWheel worldKey={world.key} />
      <FeatureIndex worldKey={world.key} />
      <PullQuote worldKey={world.key} id="quote2" />
      <WorldProof worldKey={world.key} items={world.proof} />
      <Pricing worldKey={world.key} />
      <CtaBand />
    </WorldShell>
  );
}
