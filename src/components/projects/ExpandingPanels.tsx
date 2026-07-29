"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { m, AnimatePresence, useReducedMotion } from "framer-motion";
import type { Project } from "@/config/projects";
import { useLocale, useTranslations } from "next-intl";
import { formatNum } from "@/lib/num";

type ExpandingPanelsProps = { projects: Project[] };

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * ExpandingPanels — the project strip.
 *
 * Desktop (≥1024px): a horizontal row filling the viewport; the active panel
 * takes six times the width of a collapsed one.
 * Mobile (<1024px): stacked cards.
 *
 * The collapsed state was throwing away every piece of information it had. It
 * set the cover to 30% opacity *and* laid a flat 50% ink scrim over it, so the
 * photograph was ~15% visible; the only label was Arabic set with
 * `writing-mode: vertical-rl` and rotated 180°, which Latin survives and Arabic
 * script does not. There was no year, no category and no metric until you
 * hovered — so the one number that would make someone open the panel was the one
 * thing hidden behind opening it.
 *
 * Collapsed panels now read horizontally and carry the headline metric.
 */
export function ExpandingPanels({ projects }: ExpandingPanelsProps) {
  const locale = useLocale() as "ar" | "en";
  const t = useTranslations("Projects");
  const reduced = useReducedMotion();
  const isRtl = locale === "ar";

  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [expandedDetails, setExpandedDetails] = useState<Set<number>>(new Set());

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, idx: number) => {
      const total = projects.length;
      const forward = isRtl ? "ArrowLeft" : "ArrowRight";
      const backward = isRtl ? "ArrowRight" : "ArrowLeft";

      if (e.key === forward) {
        e.preventDefault();
        setOpenIndex(Math.min(idx + 1, total - 1));
      } else if (e.key === backward) {
        e.preventDefault();
        setOpenIndex(Math.max(idx - 1, 0));
      } else if (e.key === "Home") {
        e.preventDefault();
        setOpenIndex(0);
      } else if (e.key === "End") {
        e.preventDefault();
        setOpenIndex(total - 1);
      } else if (e.key === "Escape") {
        setOpenIndex(null);
      }
    },
    [projects.length, isRtl]
  );

  const handleMouseEnter = (idx: number) => {
    hoverTimer.current = setTimeout(() => setHoveredIndex(idx), 90);
  };
  const handleMouseLeave = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setHoveredIndex(null);
  };
  useEffect(() => () => { if (hoverTimer.current) clearTimeout(hoverTimer.current); }, []);

  const activeIndex = hoveredIndex ?? openIndex;

  if (projects.length === 0) {
    return (
      <p className="mx-auto max-w-7xl px-6 py-20 text-center leading-relaxed text-bone-muted">
        {t("empty")}
      </p>
    );
  }

  return (
    <>
      {/* ── DESKTOP ── */}
      <ul className="hidden h-[100svh] w-full lg:flex" role="list" aria-label={t("title")}>
        {projects.map((project, idx) => {
          const isOpen = activeIndex === idx;
          const cover = project.images[0];
          const title = project.title[locale];
          const client = project.client[locale];
          const lead = project.metrics[0];
          const isDetail = expandedDetails.has(idx);

          return (
            <li
              key={project.id}
              style={{
                flex: isOpen ? 6 : 1,
                transition: reduced ? "none" : "flex 0.48s cubic-bezier(0.22,1,0.36,1)",
              }}
              className="group relative overflow-hidden border-s border-brass/10 first:border-s-0"
            >
              <button
                className="absolute inset-0 h-full w-full text-start"
                aria-expanded={isOpen}
                aria-label={title}
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                onMouseEnter={() => handleMouseEnter(idx)}
                onMouseLeave={handleMouseLeave}
                onKeyDown={(e) => handleKeyDown(e, idx)}
              >
                {cover ? (
                  <Image
                    src={cover}
                    alt={title}
                    fill
                    sizes={isOpen ? "60vw" : "18vw"}
                    quality={isOpen ? 85 : 60}
                    style={{
                      objectFit: "cover",
                      opacity: isOpen ? 1 : 0.55,
                      transition: reduced ? "none" : "opacity 0.48s ease",
                    }}
                  />
                ) : (
                  <div className="absolute inset-0 grid place-items-center bg-ink-800">
                    <span aria-hidden className="font-display-ar text-8xl text-brass opacity-[0.07]">
                      الحجازي
                    </span>
                  </div>
                )}

                {/* Gradient, not a flat wash — the photo stays legible. */}
                <div
                  aria-hidden
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(10,10,11,0.95) 0%, rgba(10,10,11,0.45) 46%, rgba(10,10,11,0.12) 100%)",
                  }}
                />

                {/* Hover affordance — brass hairline grows up the leading edge. */}
                <span
                  aria-hidden
                  className="absolute inset-y-0 start-0 w-px origin-bottom scale-y-0 bg-brass transition-transform duration-300 group-hover:scale-y-100"
                />

                {/* Collapsed: horizontal, and it carries the headline number. */}
                {!isOpen && (
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <div className="rule-seal mb-4 w-full" />
                    <p className="font-mono text-xs text-bone-muted">
                      {formatNum(project.num, locale)}
                    </p>
                    <p className="mt-1 truncate text-[0.95rem] font-semibold text-bone">
                      {client}
                    </p>
                    <p className="mt-0.5 truncate font-mono text-[0.68rem] text-bone-muted">
                      {t(`categories.${project.category}`)} · {formatNum(project.year, locale)}
                    </p>
                    {lead && (
                      <p className="mt-3 font-mono text-lg font-semibold text-brass">
                        {formatNum(lead.value, locale)}
                      </p>
                    )}
                  </div>
                )}
              </button>

              {/* Open panel */}
              {isOpen && (
                <div className="absolute inset-x-0 bottom-0 z-10 p-8">
                  <p className="mb-2 font-mono text-xs uppercase tracking-widest text-bone-muted">
                    {formatNum(project.num, locale)} · {t(`categories.${project.category}`)} ·{" "}
                    {formatNum(project.year, locale)}
                  </p>
                  <h3 className="mb-2 font-display text-2xl font-semibold text-bone">{title}</h3>
                  <p className="mb-5 max-w-[60ch] text-sm text-bone-muted">
                    {project.summary[locale]}
                  </p>

                  <div className="mb-5 flex flex-wrap gap-2">
                    {project.services.map((svc) => (
                      <span
                        key={svc[locale]}
                        className="border border-brass/20 px-3 py-1 font-mono text-xs text-bone-muted"
                      >
                        {svc[locale]}
                      </span>
                    ))}
                  </div>

                  <div className="mb-6 flex gap-8">
                    {project.metrics.map((metric) => (
                      <div key={metric.label[locale]}>
                        <span className="font-mono text-xl font-semibold text-brass">
                          {formatNum(metric.value, locale)}
                        </span>
                        <p className="font-mono text-xs text-bone-muted">{metric.label[locale]}</p>
                      </div>
                    ))}
                  </div>

                  <AnimatePresence>
                    {isDetail && (
                      <m.p
                        key="body"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease }}
                        className="mb-5 max-w-[70ch] overflow-hidden text-sm leading-relaxed text-bone-muted"
                      >
                        {project.body[locale]}
                      </m.p>
                    )}
                  </AnimatePresence>

                  <div className="flex items-center gap-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedDetails((prev) => {
                          const next = new Set(prev);
                          if (next.has(idx)) next.delete(idx);
                          else next.add(idx);
                          return next;
                        });
                      }}
                      className="border border-brass/30 px-4 py-2 font-mono text-xs text-bone transition-colors hover:border-brass/60"
                    >
                      {t("actionDetails")}
                    </button>
                    {project.link && (
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="font-mono text-xs text-brass transition-colors hover:text-brass-hi"
                      >
                        {t("actionVisit")}
                      </a>
                    )}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {/* ── MOBILE — cards, not a file list. ── */}
      <ul className="flex flex-col gap-4 px-6 lg:hidden" role="list" aria-label={t("title")}>
        {projects.map((project, idx) => {
          const isOpen = openIndex === idx;
          const cover = project.images[0];
          const title = project.title[locale];
          const client = project.client[locale];

          return (
            <li key={project.id} className="border border-brass/15 bg-ink-800">
              {cover && (
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <Image
                    src={cover}
                    alt={title}
                    fill
                    sizes="100vw"
                    quality={72}
                    style={{ objectFit: "cover", opacity: 0.8 }}
                  />
                  <div
                    aria-hidden
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(10,10,11,0.92) 0%, transparent 60%)",
                    }}
                  />
                  <p className="absolute inset-x-0 bottom-0 p-4 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-bone-muted">
                    {formatNum(project.num, locale)} · {t(`categories.${project.category}`)} ·{" "}
                    {formatNum(project.year, locale)}
                  </p>
                </div>
              )}

              <div className="p-5">
                <h3 className="text-xl font-semibold text-bone">{client}</h3>
                <p className="mt-1 text-sm text-bone-muted">{project.summary[locale]}</p>

                <div className="mt-5 grid grid-cols-3 gap-3 border-y border-brass/10 py-4">
                  {project.metrics.slice(0, 3).map((metric) => (
                    <div key={metric.label[locale]}>
                      <p className="font-mono text-base font-semibold text-brass">
                        {formatNum(metric.value, locale)}
                      </p>
                      <p className="mt-0.5 font-mono text-[0.65rem] leading-tight text-bone-muted">
                        {metric.label[locale]}
                      </p>
                    </div>
                  ))}
                </div>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <m.div
                      key="body"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.32, ease }}
                      className="overflow-hidden"
                    >
                      <p className="pt-4 text-sm leading-relaxed text-bone-muted">
                        {project.body[locale]}
                      </p>
                      {project.link && (
                        <a
                          href={project.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-4 inline-block font-mono text-xs text-brass"
                        >
                          {t("actionVisit")}
                        </a>
                      )}
                    </m.div>
                  )}
                </AnimatePresence>

                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  aria-expanded={isOpen}
                  className="mt-4 w-full border border-brass/25 py-3 font-mono text-xs text-bone transition-colors hover:border-brass/60"
                >
                  {t("actionDetails")}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
