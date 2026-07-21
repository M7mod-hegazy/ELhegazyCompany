import { use } from "react";
import { setRequestLocale } from "next-intl/server";
import dynamic from "next/dynamic";
import { HomeFilm } from "@/components/film/HomeFilm";

const Stats = dynamic(
  () => import("@/components/site/Stats").then((m) => ({ default: m.Stats })),
  { ssr: false },
);
const SocialAdsBand = dynamic(
  () =>
    import("@/components/site/SocialAdsBand").then((m) => ({
      default: m.SocialAdsBand,
    })),
  { ssr: false },
);
const LogoMarquee = dynamic(
  () =>
    import("@/components/site/LogoMarquee").then((m) => ({
      default: m.LogoMarquee,
    })),
  { ssr: false },
);
const CtaBand = dynamic(
  () =>
    import("@/components/site/CtaBand").then((m) => ({ default: m.CtaBand })),
  { ssr: false },
);

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
