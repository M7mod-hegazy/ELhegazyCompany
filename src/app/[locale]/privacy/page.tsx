import { use } from "react";
import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { LegalContent } from "@/components/site/LegalContent";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Legal.privacy" });
  return { title: t("title") };
}

export default function PrivacyPage({ params }: Props) {
  const { locale } = use(params);
  setRequestLocale(locale);
  return <LegalContent ns="privacy" />;
}
