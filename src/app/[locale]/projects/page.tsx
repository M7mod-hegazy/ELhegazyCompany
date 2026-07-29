import { use } from "react";
import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { useTranslations, useLocale } from "next-intl";
import { projects, getProjectCategories } from "@/config/projects";
import { PageHero } from "@/components/site/PageHero";
import { ProjectsClient } from "@/components/projects/ProjectsClient";
import { CtaBand } from "@/components/site/CtaBand";
import { siteConfig } from "@/config/site";
import { formatNum, formatCount } from "@/lib/num";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Projects" });
  return {
    title: t("title"),
    description: t("subtitle"),
    alternates: {
      canonical: `${siteConfig.url}/${locale}/projects`,
      languages: {
        ar: `${siteConfig.url}/ar/projects`,
        en: `${siteConfig.url}/en/projects`,
      },
    },
  };
}

export default function ProjectsPage({ params }: Props) {
  const { locale } = use(params);
  setRequestLocale(locale);

  return (
    <main>
      <ProjectsHero />
      <ProjectsClient projects={projects} />
      <CtaBand />
    </main>
  );
}

/**
 * The projects page opens on an index, not a poster — it leads into a list, so
 * the hero uses the `index` variant and hands off through a stats bridge that
 * overlaps the panels below. That bridge is what welds the opening to the work
 * instead of stacking two unrelated blocks.
 */
function ProjectsHero() {
  const t = useTranslations("Projects");
  const locale = useLocale();

  const years = projects.map((p) => p.year);
  const span = years.length ? new Date().getFullYear() - Math.min(...years) + 1 : 1;

  const stats = [
    { value: formatNum(projects.length, locale), label: t("statProjects") },
    { value: formatNum(getProjectCategories().length, locale), label: t("statFields") },
    { value: formatNum(span, locale), label: t("statYears") },
    { value: locale === "ar" ? "١٠٠٪" : "100%", label: t("statInHouse") },
  ];

  return (
    <PageHero
      videoKey="projects"
      kicker={t("kicker")}
      title={t("title")}
      subtitle={t("subtitle")}
      zone="bottom-left"
      bridge={
        <div className="mx-auto mt-6 max-w-7xl px-6">
          <dl className="grid grid-cols-2 gap-px border border-brass/15 bg-brass/15 sm:grid-cols-4 rounded-xl overflow-hidden backdrop-blur-md">
            {stats.map((s) => (
              <div key={s.label} className="bg-ink-900/80 px-5 py-4">
                <dt className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-bone-muted">
                  {s.label}
                </dt>
                <dd className="mt-1.5 font-mono text-xl sm:text-2xl font-semibold leading-none text-brass">
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 font-mono text-xs text-bone-muted">
            {formatCount(projects.length, locale, {
              one: t("countOne"),
              two: t("countTwo"),
              few: t("countFew"),
              many: t("countMany"),
            })}
          </p>
        </div>
      }
    />
  );
}
