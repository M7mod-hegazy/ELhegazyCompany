import { use, type CSSProperties } from "react";
import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { getWorld } from "@/config/worlds";
import { DownloadCenter } from "@/components/world/DownloadCenter";

const KEY = "pos" as const;
type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: `Worlds.${KEY}.dl` });
  return { title: t("title"), description: t("subtitle") };
}

export default function PosDownloadPage({ params }: Props) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const accent = getWorld(KEY)?.accent ?? "#C9A86A";
  return (
    <main
      className="relative z-10 min-h-screen px-6 pb-28 pt-36"
      style={{ "--world-accent": accent } as CSSProperties}
    >
      <DownloadCenter worldKey={KEY} />
    </main>
  );
}
