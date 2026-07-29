"use client";

import { useState, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { m, AnimatePresence, useReducedMotion } from "framer-motion";
import { ExpandingPanels } from "./ExpandingPanels";
import { getProjectCategories, type Project, type ProjectCategory } from "@/config/projects";
import { formatOrdinal } from "@/lib/num";

const PAGE_SIZE = 8;
const ease = [0.22, 1, 0.36, 1] as const;

type Props = { projects: Project[] };

/**
 * ProjectsClient — Phase 4.3 client shell.
 *
 * Owns: category filter state, pagination state.
 * Renders: filter rail (only when >2 categories used) → ExpandingPanels → pager.
 *
 * Filter + page changes do NOT navigate — they swap the visible slice in memory.
 * After a page change, scrolls to the top of the panels.
 */
export function ProjectsClient({ projects }: Props) {
  const t = useTranslations("Projects");
  const locale = useLocale() as "ar" | "en";
  const prefersReduced = useReducedMotion();

  const usedCategories = getProjectCategories();
  const showFilterRail = usedCategories.length >= 2;

  const [activeCategory, setActiveCategory] = useState<ProjectCategory | "all">("all");
  const [page, setPage] = useState(0);
  const panelsRef = useRef<HTMLDivElement>(null);

  const filtered =
    activeCategory === "all"
      ? projects
      : projects.filter((p) => p.category === activeCategory);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const visible = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleCategoryChange = (cat: ProjectCategory | "all") => {
    setActiveCategory(cat);
    setPage(0);
  };

  const handlePageChange = (next: number) => {
    setPage(next);
    panelsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="relative" aria-label={t("title")}>
      {/* Filter rail */}
      {showFilterRail && (
        <div
          className="mx-auto flex max-w-7xl flex-wrap gap-2 px-6 py-8"
          role="group"
          aria-label={t("allFilter")}
        >
          <FilterChip
            label={t("allFilter")}
            active={activeCategory === "all"}
            onClick={() => handleCategoryChange("all")}
          />
          {usedCategories.map((cat) => (
            <FilterChip
              key={cat}
              label={t(`categories.${cat}`)}
              active={activeCategory === cat}
              onClick={() => handleCategoryChange(cat)}
            />
          ))}
        </div>
      )}

      {/* Panels */}
      <div ref={panelsRef}>
        <AnimatePresence mode="wait">
          <m.div
            key={`${activeCategory}-${page}`}
            initial={prefersReduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={prefersReduced ? {} : { opacity: 0 }}
            transition={{ duration: 0.3, ease }}
          >
            <ExpandingPanels projects={visible} />
          </m.div>
        </AnimatePresence>
      </div>

      {/* Pagination — only show when more than one page */}
      {totalPages > 1 && (
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-8">
          <button
            onClick={() => handlePageChange(Math.max(0, page - 1))}
            disabled={page === 0}
            className="border border-brass/20 px-4 py-2 font-mono text-xs text-bone-muted transition-colors hover:border-brass/50 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {t("pagerPrev")}
          </button>

          <span className="font-mono text-xs text-bone-muted">
            {formatOrdinal(page + 1, locale)} / {formatOrdinal(totalPages, locale)}
          </span>

          <button
            onClick={() => handlePageChange(Math.min(totalPages - 1, page + 1))}
            disabled={page >= totalPages - 1}
            className="border border-brass/20 px-4 py-2 font-mono text-xs text-bone-muted transition-colors hover:border-brass/50 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {t("pagerNext")}
          </button>
        </div>
      )}
    </section>
  );
}

/* ── FilterChip ─────────────────────────────────────────────────── */
function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`border px-4 py-2 font-mono text-xs transition-colors ${
        active
          ? "border-brass bg-brass/10 text-bone"
          : "border-brass/20 text-bone-muted hover:border-brass/50"
      }`}
    >
      {label}
    </button>
  );
}
