import { Fragment } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { PageHero } from "@/components/site/PageHero";
import { getWorld } from "@/config/worlds";
import { WorldShell } from "@/components/world/WorldShell";
import { PlanButtons } from "@/components/world/PlanButtons";
import { KineticStatement } from "@/components/world/KineticStatement";
import { VideoWalkthrough } from "@/components/world/VideoWalkthrough";
import { AbilitiesBento } from "@/components/world/AbilitiesBento";
import { StoryChapter } from "@/components/world/StoryChapter";

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

      <VideoWalkthrough
        title={t("videoTitle")}
        subtitle={t("videoSub")}
        chapterHeading={t("chapterHeading")}
        playlistId="PLPw2WmqwSe_s"
        videos={[
          {
            youtubeId: "05DinTxsKA0",
            labelAr: "البداية الصح لمشروعك",
            labelEn: "Getting started",
          },
          // Add more videos here as they appear in the playlist:
          // {
          //   youtubeId: "VIDEO_ID",
          //   labelAr: "العنوان بالعربي",
          //   labelEn: "English title",
          // },
        ]}
        chapters={[
          { time: "0:00", seconds: 0, labelAr: "المقدمة", labelEn: "Introduction" },
          { time: "1:30", seconds: 90, labelAr: "تسجيل الدخول", labelEn: "Logging in" },
          { time: "3:15", seconds: 195, labelAr: "لوحة التحكم", labelEn: "Dashboard overview" },
          { time: "5:00", seconds: 300, labelAr: "إعداد المنتجات", labelEn: "Setting up products" },
          { time: "6:45", seconds: 405, labelAr: "إنشاء أول فاتورة", labelEn: "Creating first invoice" },
        ]}
      />
      <TrustStrip worldKey={world.key} />
      <AbilitiesBento worldKey={world.key} />
      <BigNumbers worldKey={world.key} />
      <ThemesShowcase worldKey={world.key} />

      {world.chapters.map((c, idx) => (
        <Fragment key={c.id}>
          <StoryChapter worldKey={world.key} chapter={c} index={idx} />

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
      {world.proof && <WorldProof worldKey={world.key} items={world.proof} />}
      <Pricing worldKey={world.key} />
      <CtaBand />
    </WorldShell>
  );
}
