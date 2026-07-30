import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import dynamic from "next/dynamic";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { siteConfig } from "@/config/site";

// Above-fold: imported normally
import { HomeHero } from "@/components/home/HomeHero";
import { DiagnosticSection } from "@/components/home/DiagnosticSection";
import { WorldAtmosphere } from "@/components/world/WorldAtmosphere";

// Below-fold: SSR: true so search engines can index copy; lazy JS hydration
const CounterSection = dynamic(
  () => import("@/components/home/CounterSection").then((m) => m.CounterSection),
  { ssr: true }
);
const InstrumentsSection = dynamic(
  () => import("@/components/home/InstrumentsSection").then((m) => m.InstrumentsSection),
  { ssr: true }
);
const GridSection = dynamic(
  () => import("@/components/home/GridSection").then((m) => m.GridSection),
  { ssr: true }
);
const CompareSection = dynamic(
  () => import("@/components/home/CompareSection").then((m) => m.CompareSection),
  { ssr: true }
);
const ProblemFixSection = dynamic(
  () => import("@/components/home/ProblemFixSection").then((m) => m.ProblemFixSection),
  { ssr: true }
);
const SelectedWork = dynamic(
  () => import("@/components/home/SelectedWork").then((m) => m.SelectedWork),
  { ssr: true }
);
const LogoMarquee = dynamic(
  () => import("@/components/site/LogoMarquee").then((m) => m.LogoMarquee),
  { ssr: true }
);
const HomeCta = dynamic(
  () => import("@/components/home/HomeCta").then((m) => m.HomeCta),
  { ssr: true }
);
const CtaBand = dynamic(
  () => import("@/components/site/CtaBand").then((m) => m.CtaBand),
  { ssr: true }
);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Home" });
  const url = `${siteConfig.url}/${locale}`;
  return {
    title: siteConfig.name[locale as "ar" | "en"],
    description: t("lead"),
    alternates: {
      canonical: url,
      languages: { ar: `${siteConfig.url}/ar`, en: `${siteConfig.url}/en` },
    },
    openGraph: {
      type: "website",
      url,
      title: siteConfig.name[locale as "ar" | "en"],
      description: t("lead"),
      siteName: siteConfig.name[locale as "ar" | "en"],
    },
  };
}

export default function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);

  return (
    <main>
      {/* Ambient animated backdrop — drifting brass glows, panning grid,
          floating dust. Every product page already has this; the home page
          didn't, which is a big part of why so many sections read as flat,
          static black. Fixed + -z-10, so it sits behind every section below
          that doesn't cover it with its own photo. */}
      <WorldAtmosphere />

      {/* 1. Hero — full-bleed clip 1 */}
      <HomeHero />

      {/* 2. Diagnostic — 3-question flow */}
      <DiagnosticSection />

      {/* 3. Counter — parallax photo + hotspots */}
      <CounterSection />

      {/* 4. Instruments — 3 stacking product panels */}
      <InstrumentsSection />

      {/* 5. Grid — overhead specimen tray with parallax */}
      <GridSection />

      {/* 6. Before / after — same counter, two different ways to run it */}
      <CompareSection />

      {/* 6.5. Problem → fix — direct pain points mapped to features */}
      <ProblemFixSection />

      {/* 6.7. Brands strip — logos we've worked with (placeholders until real logos land) */}
      <LogoMarquee />

      {/* 7. Selected work — expanding panels (featured projects). Its header
          carries the "we build more than the 3 core products" message and
          category tags now, directly beside the headline. */}
      <SelectedWork />

      {/* 8. CTA — clip 5 with letterbox close */}
      <HomeCta />
    </main>
  );
}
