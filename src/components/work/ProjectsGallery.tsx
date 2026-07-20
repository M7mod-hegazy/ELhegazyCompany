"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { brand } from "@/lib/brand";
import { cn } from "@/lib/cn";
import type { ProjectView } from "@/app/actions/projects";

/**
 * The owner's living portfolio: category-filterable grid of admin-uploaded
 * projects, each opening into a full lightbox with keyboard/swipe navigation.
 */
export function ProjectsGallery({ projects }: { projects: ProjectView[] }) {
  const t = useTranslations("Work.gallery");
  const locale = useLocale() as "ar" | "en";
  const [filter, setFilter] = useState<string>("all");
  const [open, setOpen] = useState<ProjectView | null>(null);

  const categories = useMemo(() => {
    const present = [...new Set(projects.map((p) => p.category))];
    return ["all", ...present];
  }, [projects]);

  const visible = filter === "all" ? projects : projects.filter((p) => p.category === filter);

  if (projects.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <p className="text-center text-xs uppercase tracking-[0.35em] text-brass">{t("kicker")}</p>
      <h2 className="font-display-ar mt-4 text-center text-3xl font-semibold text-bone sm:text-5xl">
        {t("title")}
      </h2>

      {/* filters */}
      {categories.length > 2 && (
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setFilter(c)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-xs transition-all duration-300",
                filter === c
                  ? "border-brass bg-brass text-ink-900"
                  : "border-brass/25 text-bone hover:border-brass/60",
              )}
            >
              {c === "all" ? t("all") : t(`categories.${c}`)}
            </button>
          ))}
        </div>
      )}

      {/* grid */}
      <m.div layout className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {visible.map((p) => (
            <m.button
              key={p.id}
              layout
              type="button"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.5, ease: brand.ease.cinematic }}
              onClick={() => setOpen(p)}
              className="group relative block overflow-hidden rounded-2xl border border-brass/15 text-start"
            >
              <div className="aspect-[4/3] overflow-hidden bg-ink-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.images[0]}
                  alt={p.title[locale] || p.title.ar}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                />
              </div>
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-900/95 via-ink-900/25 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-100"
              />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <p className="text-[0.6rem] uppercase tracking-[0.3em] text-brass">
                  {t(`categories.${p.category}`)}
                </p>
                <h3 className="mt-1.5 font-display-ar text-lg font-semibold text-bone">
                  {p.title[locale] || p.title.ar}
                </h3>
                <p className="mt-1 max-h-0 overflow-hidden text-xs leading-relaxed text-bone-muted opacity-0 transition-all duration-500 group-hover:max-h-16 group-hover:opacity-100">
                  {(p.desc[locale] || p.desc.ar).slice(0, 110)}
                </p>
              </div>
              {p.images.length > 1 && (
                <span className="absolute end-3 top-3 rounded-full bg-ink-900/80 px-2.5 py-1 text-[0.6rem] text-bone">
                  {p.images.length} ◫
                </span>
              )}
            </m.button>
          ))}
        </AnimatePresence>
      </m.div>

      <AnimatePresence>
        {open && <Lightbox project={open} onClose={() => setOpen(null)} />}
      </AnimatePresence>
    </section>
  );
}

/* ------------------------------- lightbox -------------------------------- */

function Lightbox({ project, onClose }: { project: ProjectView; onClose: () => void }) {
  const t = useTranslations("Work.gallery");
  const locale = useLocale() as "ar" | "en";
  const [idx, setIdx] = useState(0);
  const count = project.images.length;

  const next = useCallback(() => setIdx((i) => (i + 1) % count), [count]);
  const prev = useCallback(() => setIdx((i) => (i - 1 + count) % count), [count]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [next, prev, onClose]);

  return (
    <m.div
      role="dialog"
      aria-modal="true"
      aria-label={project.title[locale] || project.title.ar}
      className="fixed inset-0 z-[120] flex flex-col bg-ink-900/97 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClose}
    >
      {/* top bar */}
      <div
        className="flex items-center justify-between px-5 py-4 sm:px-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <p className="text-[0.6rem] uppercase tracking-[0.3em] text-brass">
            {t(`categories.${project.category}`)}
          </p>
          <h3 className="font-display-ar text-xl font-semibold text-bone">
            {project.title[locale] || project.title.ar}
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={t("close")}
          className="grid h-10 w-10 place-items-center rounded-full border border-brass/30 text-bone transition-colors hover:border-brass hover:text-brass"
        >
          ✕
        </button>
      </div>

      {/* image stage */}
      <div
        className="relative flex flex-1 items-center justify-center overflow-hidden px-4"
        onClick={(e) => e.stopPropagation()}
      >
        <AnimatePresence mode="wait">
          <m.img
            key={idx}
            src={project.images[idx]}
            alt={`${project.title[locale] || project.title.ar} — ${idx + 1}`}
            className="max-h-full max-w-full rounded-xl object-contain shadow-[0_40px_120px_-40px_rgba(0,0,0,1)]"
            initial={{ opacity: 0, scale: 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.985 }}
            transition={{ duration: 0.35, ease: brand.ease.cinematic }}
            drag={count > 1 ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.6}
            onDragEnd={(_e, info) => {
              if (info.offset.x < -60) next();
              else if (info.offset.x > 60) prev();
            }}
          />
        </AnimatePresence>

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="prev"
              className="absolute left-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-ink-800/80 text-bone transition-colors hover:text-brass"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="next"
              className="absolute right-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-ink-800/80 text-bone transition-colors hover:text-brass"
            >
              ›
            </button>
          </>
        )}
      </div>

      {/* footer: description + thumbs + link */}
      <div className="px-5 pb-6 pt-4 sm:px-8" onClick={(e) => e.stopPropagation()}>
        {(project.desc[locale] || project.desc.ar) && (
          <p className="mx-auto max-w-2xl text-center text-sm leading-relaxed text-bone-muted">
            {project.desc[locale] || project.desc.ar}
          </p>
        )}
        <div className="mt-4 flex items-center justify-center gap-4">
          {count > 1 && (
            <div className="flex max-w-full gap-2 overflow-x-auto py-1">
              {project.images.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setIdx(i)}
                  className={cn(
                    "h-12 w-16 shrink-0 overflow-hidden rounded-lg border transition-all duration-300",
                    i === idx ? "border-brass" : "border-transparent opacity-50 hover:opacity-90",
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
          {project.link && (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 rounded-full bg-brass px-5 py-2 text-xs font-semibold text-ink-900 transition-colors hover:bg-brass-hi"
            >
              {t("visit")}
            </a>
          )}
        </div>
      </div>
    </m.div>
  );
}
