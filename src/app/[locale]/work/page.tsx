import { use } from "react";
import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { siteConfig } from "@/config/site";
import { CtaBand } from "@/components/site/CtaBand";
import { ProjectsGallery } from "@/components/work/ProjectsGallery";
import { listProjects, type ProjectView } from "@/app/actions/projects";

export const revalidate = 300; // gallery updates appear within minutes (or instantly via revalidatePath)

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Work" });
  return { title: t("title"), description: t("subtitle") };
}

const CASES = [
  { id: "store", num: "01", accent: "#5A1F1B", external: true },
  { id: "pos", num: "02", accent: "#3A4A5A", href: "/products/pos" },
  { id: "campaigns", num: "03", accent: "#7A2C26", href: "/services/marketing" },
] as const;

export default function WorkPage({ params }: Props) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const projects = use(listProjects());
  return <WorkContent projects={projects} />;
}

function WorkContent({ projects }: { projects: ProjectView[] }) {
  const t = useTranslations("Work");

  return (
    <main className="relative z-10">
      <section className="mx-auto max-w-6xl px-6 pb-10 pt-40 text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-brass">{t("kicker")}</p>
        <h1 className="font-display-ar mx-auto mt-4 max-w-3xl text-4xl font-semibold leading-tight text-bone sm:text-6xl">
          {t("title")}
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-bone-muted">{t("subtitle")}</p>
      </section>

      <section className="mx-auto max-w-6xl space-y-8 px-6 py-16">
        {CASES.map((c) => {
          const stats = t.raw(`cases.${c.id}.stats`) as { v: string; l: string }[];
          const href = c.id === "store" ? siteConfig.store.url : c.href!;
          return (
            <article
              key={c.id}
              className="group relative overflow-hidden rounded-3xl border border-brass/15 bg-ink-800/40 p-8 transition-colors hover:border-brass/40 sm:p-12"
              style={{ ["--case-accent" as string]: c.accent }}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-40"
                style={{
                  background: `radial-gradient(60% 80% at 85% 0%, ${c.accent}33, transparent 60%)`,
                }}
              />
              <div className="relative grid gap-8 lg:grid-cols-[1fr_auto]">
                <div>
                  <p className="flex items-baseline gap-3">
                    <span className="font-display-en text-2xl font-semibold" style={{ color: c.accent }}>
                      {c.num}
                    </span>
                    <span className="text-xs uppercase tracking-[0.3em] text-bone-muted">
                      {t(`cases.${c.id}.tag`)}
                    </span>
                  </p>
                  <h2 className="font-display-ar mt-3 text-2xl font-semibold text-bone sm:text-4xl">
                    {t(`cases.${c.id}.title`)}
                  </h2>
                  <p className="mt-4 max-w-2xl leading-relaxed text-bone-muted">
                    {t(`cases.${c.id}.body`)}
                  </p>
                  <div className="mt-6 flex flex-wrap gap-8">
                    {stats.map((s) => (
                      <div key={s.l}>
                        <div className="font-display-ar text-3xl font-bold text-brass">{s.v}</div>
                        <div className="mt-1 text-xs text-bone-muted">{s.l}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-end">
                  {c.id === "store" ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full bg-brass px-7 py-3 text-sm font-semibold text-ink-900 transition-all duration-300 hover:-translate-y-0.5 hover:bg-brass-hi"
                    >
                      {t(`cases.${c.id}.cta`)}
                    </a>
                  ) : (
                    <Link
                      href={href}
                      className="rounded-full bg-brass px-7 py-3 text-sm font-semibold text-ink-900 transition-all duration-300 hover:-translate-y-0.5 hover:bg-brass-hi"
                    >
                      {t(`cases.${c.id}.cta`)}
                    </Link>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </section>

      <ProjectsGallery projects={projects} />

      <section className="mx-auto max-w-3xl px-6 py-10 text-center">
        <p className="font-display-ar text-2xl leading-relaxed text-bone sm:text-3xl">
          {t("statement")}
        </p>
      </section>

      <CtaBand />
    </main>
  );
}
