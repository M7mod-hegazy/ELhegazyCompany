"use client";

import { useTranslations } from "next-intl";
import { getFeaturedProjects } from "@/config/projects";
import { ExpandingPanels } from "@/components/projects/ExpandingPanels";
import { Link } from "@/i18n/navigation";

/**
 * SelectedWork — the featured strip on the home page.
 *
 * The link out to /projects used to be plain muted body text with no
 * affordance, which made the only route to the portfolio invisible. It is a
 * full-width hairline row now: the whole row is the target, and the brass rule
 * under it draws in on hover.
 */
export function SelectedWork() {
  const t = useTranslations("Projects");
  const featured = getFeaturedProjects(3);

  if (featured.length === 0) return null;

  return (
    <section aria-labelledby="selected-heading" className="relative border-t border-brass/10">
      <div className="mx-auto max-w-7xl px-6 pb-10 pt-16">
        <p className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-brass">
          {t("selectedTitle")}
        </p>
        <h2 id="selected-heading" className="text-3xl font-semibold text-bone sm:text-4xl">
          {t("title")}
        </h2>
      </div>

      {/* Full-bleed on desktop; the mobile card list carries its own padding. */}
      <ExpandingPanels projects={featured} />

      <div className="mx-auto max-w-7xl px-6 pb-16 pt-12">
        <Link href="/projects" className="group block border-t border-brass/20 pt-5">
          <span className="flex items-baseline justify-between gap-4">
            <span className="text-lg font-semibold text-bone transition-colors group-hover:text-brass">
              {t("seeAll")}
            </span>
            <span aria-hidden className="seal-round h-2 w-2 shrink-0 bg-brass" />
          </span>
          <span aria-hidden className="rail-underline mt-5 block h-px w-full bg-brass" />
        </Link>
      </div>
    </section>
  );
}
