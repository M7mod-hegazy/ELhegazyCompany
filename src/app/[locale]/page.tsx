import { use } from "react";
import { setRequestLocale } from "next-intl/server";
import { HomeFilm } from "@/components/film/HomeFilm";
import { BelowFold } from "@/components/site/BelowFold";

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
      <BelowFold />
    </main>
  );
}
