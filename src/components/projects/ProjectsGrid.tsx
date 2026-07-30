"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { m, AnimatePresence, useReducedMotion } from "framer-motion";
import type { Project } from "@/config/projects";
import { useLocale, useTranslations } from "next-intl";
import { formatNum } from "@/lib/num";

type ProjectsGridProps = { projects: Project[] };

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * ProjectsGrid — the full /projects listing.
 *
 * ExpandingPanels divides the available width by the number of items, which
 * only works for a small, fixed set (it's still what the home page's 3-item
 * "Selected work" strip uses). Once this page carries dozens of projects that
 * math falls apart — collapsed strips get unreadably thin. This is a mosaic
 * grid instead: tile size comes from a repeating pattern, not from the total
 * count, so it holds up at any scale. Every tile shows its essentials in the
 * open (client, category, year, headline metric) — nothing is gated behind
 * hover. Clicking opens the full write-up in a dialog.
 */
type TileSize = "feature" | "wide" | "normal";

function tileSize(i: number): TileSize {
  if (i % 5 === 0) return "feature";
  if (i % 5 === 3) return "wide";
  return "normal";
}

const SPAN: Record<TileSize, string> = {
  feature: "col-span-2 row-span-2",
  wide: "col-span-2 row-span-1",
  normal: "col-span-1 row-span-1",
};

export function ProjectsGrid({ projects }: ProjectsGridProps) {
  const locale = useLocale() as "ar" | "en";
  const t = useTranslations("Projects");
  const [openId, setOpenId] = useState<string | null>(null);

  const openProject = projects.find((p) => p.id === openId) ?? null;

  useEffect(() => {
    if (!openId) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenId(null);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [openId]);

  if (projects.length === 0) {
    return (
      <p className="mx-auto max-w-7xl px-6 py-20 text-center leading-relaxed text-bone-muted">
        {t("empty")}
      </p>
    );
  }

  return (
    <>
      <div
        className="mx-auto grid max-w-7xl auto-rows-[190px] grid-cols-2 gap-3 px-6 sm:auto-rows-[220px] sm:grid-cols-4 sm:gap-4"
        style={{ gridAutoFlow: "dense" }}
      >
        {projects.map((project, i) => (
          <ProjectTile
            key={project.id}
            project={project}
            size={tileSize(i)}
            locale={locale}
            onOpen={() => setOpenId(project.id)}
          />
        ))}
      </div>

      <AnimatePresence>
        {openProject && (
          <ProjectDialog project={openProject} locale={locale} onClose={() => setOpenId(null)} />
        )}
      </AnimatePresence>
    </>
  );
}

/* ── Tile ───────────────────────────────────────────────────────────── */
function ProjectTile({
  project,
  size,
  locale,
  onOpen,
}: {
  project: Project;
  size: TileSize;
  locale: "ar" | "en";
  onOpen: () => void;
}) {
  const t = useTranslations("Projects");
  const cover = project.images[0];
  const title = project.title[locale];
  const client = project.client[locale];
  const lead = project.metrics[0];
  const isBig = size !== "normal";

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={title}
      className={`group relative overflow-hidden border border-brass/15 bg-ink-800 text-start transition-colors hover:border-brass/40 ${SPAN[size]}`}
    >
      {cover ? (
        <Image
          src={cover}
          alt={title}
          fill
          sizes={size === "feature" ? "50vw" : size === "wide" ? "50vw" : "25vw"}
          quality={size === "feature" ? 82 : 72}
          style={{ objectFit: "cover" }}
          className="transition-transform duration-500 group-hover:scale-[1.04]"
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center bg-ink-800">
          <span aria-hidden className="font-display-ar text-6xl text-brass opacity-[0.08]">
            الحجازي
          </span>
        </div>
      )}

      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to top, rgba(10,10,11,0.94) 0%, rgba(10,10,11,0.35) 55%, rgba(10,10,11,0.05) 100%)",
        }}
      />

      <span
        aria-hidden
        className="absolute inset-y-0 start-0 w-px origin-bottom scale-y-0 bg-brass transition-transform duration-300 group-hover:scale-y-100"
      />

      <div className={`absolute inset-x-0 bottom-0 ${isBig ? "p-5" : "p-3.5"}`}>
        <p className={`font-mono text-bone-muted ${isBig ? "text-xs" : "text-[0.65rem]"}`}>
          {formatNum(project.num, locale)} · {t(`categories.${project.category}`)} ·{" "}
          {formatNum(project.year, locale)}
        </p>
        <p className={`mt-1 truncate font-semibold text-bone ${isBig ? "text-xl" : "text-sm"}`}>
          {client}
        </p>
        {size === "feature" && (
          <p className="mt-1.5 max-w-[42ch] text-sm leading-snug text-bone-muted">
            {project.summary[locale]}
          </p>
        )}
        {lead && (
          <p className={`mt-2 font-mono font-semibold text-brass ${isBig ? "text-lg" : "text-sm"}`}>
            {formatNum(lead.value, locale)}
          </p>
        )}
      </div>
    </button>
  );
}

/* ── Dialog ─────────────────────────────────────────────────────────── */
function ProjectDialog({
  project,
  locale,
  onClose,
}: {
  project: Project;
  locale: "ar" | "en";
  onClose: () => void;
}) {
  const t = useTranslations("Projects");
  const reduced = useReducedMotion();
  const cover = project.images[0];

  return (
    <m.div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-ink-900/90 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
      role="presentation"
    >
      <m.div
        role="dialog"
        aria-modal="true"
        aria-label={project.title[locale]}
        onClick={(e) => e.stopPropagation()}
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={reduced ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.98 }}
        transition={{ duration: 0.32, ease }}
        className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto border border-brass/20 bg-ink-900"
      >
        {cover && (
          <div className="relative aspect-[16/9] w-full">
            <Image src={cover} alt={project.title[locale]} fill sizes="672px" quality={85} style={{ objectFit: "cover" }} />
            <div
              aria-hidden
              className="absolute inset-0"
              style={{ background: "linear-gradient(to top, rgba(10,10,11,0.9), transparent 60%)" }}
            />
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          aria-label={t("close")}
          className="absolute end-4 top-4 grid h-9 w-9 place-items-center border border-brass/30 bg-ink-900/80 text-bone transition-colors hover:border-brass"
        >
          ✕
        </button>

        <div className="p-6 sm:p-8">
          <p className="mb-2 font-mono text-xs uppercase tracking-widest text-bone-muted">
            {formatNum(project.num, locale)} · {t(`categories.${project.category}`)} ·{" "}
            {formatNum(project.year, locale)}
          </p>
          <h3 className="mb-1 font-display text-2xl font-semibold text-bone">{project.client[locale]}</h3>
          <p className="mb-5 text-sm text-bone-muted">{project.title[locale]}</p>

          <p className="mb-6 max-w-[65ch] leading-relaxed text-bone-muted">{project.body[locale]}</p>

          <div className="mb-6 flex flex-wrap gap-2">
            {project.services.map((svc) => (
              <span
                key={svc[locale]}
                className="border border-brass/20 px-3 py-1 font-mono text-xs text-bone-muted"
              >
                {svc[locale]}
              </span>
            ))}
          </div>

          <div className="mb-2 flex flex-wrap gap-8 border-t border-brass/10 pt-6">
            {project.metrics.map((metric) => (
              <div key={metric.label[locale]}>
                <span className="font-mono text-xl font-semibold text-brass">
                  {formatNum(metric.value, locale)}
                </span>
                <p className="font-mono text-xs text-bone-muted">{metric.label[locale]}</p>
              </div>
            ))}
          </div>

          {project.link && (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-block bg-brass px-6 py-3 font-mono text-sm font-semibold text-ink-900 transition-colors hover:bg-brass-hi"
            >
              {t("actionVisit")}
            </a>
          )}
        </div>
      </m.div>
    </m.div>
  );
}
