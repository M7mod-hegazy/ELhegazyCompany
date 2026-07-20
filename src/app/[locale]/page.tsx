import { use } from "react";
import { setRequestLocale } from "next-intl/server";
import { HomeFilm } from "@/components/film/HomeFilm";
import { Stats } from "@/components/site/Stats";
import { SocialAdsBand } from "@/components/site/SocialAdsBand";
import { LogoMarquee } from "@/components/site/LogoMarquee";
import { CtaBand } from "@/components/site/CtaBand";

export default function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);

  return (
    <main className="relative z-10">
      {/* The brand film — hero + the three offerings + CTA, as one scrubbed take */}
      <HomeFilm />
      <Stats />
      <SocialAdsBand />
      <LogoMarquee />
      <CtaBand />
    </main>
  );
}
