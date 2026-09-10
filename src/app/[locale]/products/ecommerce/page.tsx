import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { PageHero } from "@/components/site/PageHero";
import { getWorld } from "@/config/worlds";
import { EcommerceShell } from "@/components/world/EcommerceShell";
import { PlanButtons } from "@/components/world/PlanButtons";
import { KineticStatement } from "@/components/world/KineticStatement";
import { EcommerceAbilitiesBento } from "@/components/world/EcommerceAbilitiesBento";
import { ThemesShowcase } from "@/components/world/ThemesShowcase";
import { StoryChapter } from "@/components/world/StoryChapter";
import { HorizontalFeatures } from "@/components/world/HorizontalFeatures";
import { FeatureIndex } from "@/components/world/FeatureIndex";
import {
  CompareTable,
  PullQuote,
  SparkDivider,
  CapabilityWheel,
  EC_WHEEL_AR,
  EC_WHEEL_EN,
} from "@/components/world/sections";
import { Pricing } from "@/components/world/Pricing";
import { LiveStoreBand } from "@/components/world/LiveStoreBand";
import { CtaBand } from "@/components/site/CtaBand";

const KEY = "ecommerce" as const;

// 4 open slots, real images to come later (owner will supply better ones) —
// drop files at public/shots/ecommerce/theme-1.* … theme-4.* and they appear
// automatically; until then ShotFrame shows a clean labelled placeholder
// instead of a broken image, same as everywhere else on the site.
const ECOMMERCE_THEME_SET = [
  { id: "theme-1", sw: "#5B4FE5", device: "browser" as const },
  { id: "theme-2", sw: "#1F8A56", device: "browser" as const },
  { id: "theme-3", sw: "#D9642B", device: "browser" as const },
  { id: "theme-4", sw: "#8B6FD9", device: "browser" as const },
];

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: `Worlds.${KEY}` });
  return { title: t("hero"), description: t("promise") };
}

export default async function EcommerceWorldPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const world = getWorld(KEY);
  if (!world) notFound();
  const t = await getTranslations({ locale, namespace: `Worlds.${KEY}` });

  return (
    <EcommerceShell accent={world.accent} worldKey={world.key}>
      <PageHero
        videoKey="ecommerce"
        numberTag={world.num}
        kicker={t("kicker")}
        title={t("hero")}
        subtitle={t("promise")}
        chips={t.raw("heroChips")}
        zone="bottom-left"
        accent={world.accent}
        actions={<PlanButtons worldKey={world.key} previewHref={world.externalHref} />}
      />
      <KineticStatement worldKey={world.key} />
      <LiveStoreBand worldKey={world.key} href={world.externalHref} />
      <EcommerceAbilitiesBento worldKey={world.key} />
      <ThemesShowcase worldKey={world.key} themes={ECOMMERCE_THEME_SET} />

      {/* A real page of the live store per chapter — home, login, a product,
          the full catalog, categories, about, portfolio, branches, offers,
          best-sellers — each with that page's actual desktop and mobile
          screenshot. Replaced the old abstract-capability chapters (several
          of which pointed at shots that were never real). */}
      {world.chapters.map((c, idx) => (
        <StoryChapter key={c.id} worldKey={world.key} chapter={c} index={idx} />
      ))}

      {/* Second, shorter mention of the same offer — POS repeats its trial
          pitch at this exact position (PlanBand, after the first pull-quote).
          E-commerce only pitched it once, at the very top; this closes that
          gap with the mechanism that actually fits a hosted store. */}
      <LiveStoreBand
        worldKey={world.key}
        href={world.externalHref}
        kicker={t("midPreview.kicker")}
        title={t("midPreview.title")}
        cta={t("midPreview.cta")}
        compact
      />
      <PullQuote worldKey={world.key} id="quote1" />
      <HorizontalFeatures worldKey={world.key} ids={["catalog","families","gallery","sku","import","featured","offers","bestsellers","reviews","accounts","dashboard","sync","seo","pages"]} />
      <SparkDivider />
      <CompareTable worldKey={world.key} />
      <CapabilityWheel worldKey={world.key} chipsAr={EC_WHEEL_AR} chipsEn={EC_WHEEL_EN} />
      {/* Real store capabilities only. Earlier this list included shopping
          cart, checkout, payment gateways, cash on delivery and cart recovery
          — none of that reflects how orders actually happen here (a customer
          messages on WhatsApp and the sale closes there). WhatsApp ordering
          is its own chip below. Lists live in FeatureIndex.tsx per world. */}
      <FeatureIndex worldKey={world.key} />
      <PullQuote worldKey={world.key} id="quote2" />
      <Pricing worldKey={world.key} />
      <CtaBand />
    </EcommerceShell>
  );
}
