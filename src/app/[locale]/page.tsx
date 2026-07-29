import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import dynamic from "next/dynamic";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { siteConfig } from "@/config/site";

// Above-fold: imported normally
import { HomeHero } from "@/components/home/HomeHero";
import { DiagnosticSection } from "@/components/home/DiagnosticSection";

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
const DaySection = dynamic(
  () => import("@/components/home/DaySection").then((m) => m.DaySection),
  { ssr: true }
);
const SelectedWork = dynamic(
  () => import("@/components/home/SelectedWork").then((m) => m.SelectedWork),
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

      {/* 6. A day in your shop — parallax counter plate, hour by hour */}
      <DaySection />

      {/* 7. Selected work — expanding panels (featured projects) */}
      <SelectedWork />

      {/* 8. CTA — clip 5 with letterbox close */}
      <HomeCta />
    </main>
  );
}
