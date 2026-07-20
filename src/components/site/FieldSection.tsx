"use client";

import { useEffect, useRef, useState } from "react";
import {
  m,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { registerSection } from "@/lib/scrollSections";
import { SplitWords } from "@/components/fx/SplitWords";

export function FieldSection({
  id,
  num,
  tKey,
  href,
  pillars,
  image,
  download,
}: {
  id: string;
  num: string;
  tKey: string;
  href: string;
  pillars: string[];
  dir?: "left" | "right" | "up" | "down";
  image?: string;
  /** show a "download free" CTA (for the product offerings) → world pricing */
  download?: boolean;
}) {
  const t = useTranslations("Offerings");
  const tNav = useTranslations("Nav");
  const tc = useTranslations("Common");
  const locale = useLocale();
  const ref = useRef<HTMLDivElement>(null);
  const [beat, setBeat] = useState(0);

  useEffect(() => {
    if (ref.current) return registerSection(id, ref.current);
  }, [id]);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const b = v < 0.25 ? 0 : v < 0.5 ? 1 : v < 0.78 ? 2 : 3;
    setBeat((prev) => (prev === b ? prev : b));
  });

  const title = (
    <>
      <div className="inline-flex w-fit items-center gap-3 rounded-full border border-brass/25 bg-ink-900/50 px-4 py-2 backdrop-blur-sm sm:gap-4 sm:px-5 sm:py-2.5">
        <span className="font-display text-base font-bold text-brass sm:text-lg">{num}</span>
        <span className="h-5 w-px bg-brass/30 sm:h-6" />
        <span className="text-start text-xs font-semibold text-bone">خدماتنا</span>
      </div>
      <SplitWords
        text={t(`${tKey}.title`)}
        className="mt-4 font-display text-3xl font-semibold text-bone sm:mt-5 sm:text-5xl lg:text-6xl"
      />
      <p className="mt-3 text-base text-brass sm:mt-4 sm:text-lg">{t(`${tKey}.goal`)}</p>
    </>
  );

  const about = (
    <>
      <p className="text-sm leading-relaxed text-bone-muted sm:text-base">{t(`${tKey}.long`)}</p>
      <div className="mt-4 aspect-video w-full overflow-hidden rounded-xl border border-brass/25 bg-ink-800/50">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={t(`${tKey}.title`)} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.25em] text-bone-muted/40">
            {t(`${tKey}.title`)}
          </div>
        )}
      </div>
    </>
  );

  const offerings = (
    <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3">
      {pillars.map((p, i) => (
        <li
          key={p}
          className="rounded-xl border border-brass/15 bg-ink-800/40 p-4 transition-colors hover:border-brass/35"
        >
          <div className="flex items-center gap-3 text-sm font-semibold text-bone">
            <span className="font-display text-brass">{String(i + 1).padStart(2, "0")}</span>
            {t(`${tKey}.pillars.${p}`)}
          </div>
          <p className="mt-2 text-xs leading-relaxed text-bone-muted">
            {t(`${tKey}.pillarsDesc.${p}`)}
          </p>
        </li>
      ))}
    </ul>
  );

  const cta = (
    <div>
      <h3 className="font-display text-4xl font-semibold leading-tight text-bone sm:text-5xl lg:text-6xl">
        {t("readyTitle")}
      </h3>
      <p className="mt-5 max-w-md text-base leading-relaxed text-bone-muted sm:text-lg">
        {t("readySub")}
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
        {download ? (
        <Link
          href={`${href}/download`}
          className="rounded-full bg-brass px-7 py-3.5 text-center text-sm font-semibold text-ink-900 transition-all duration-300 hover:-translate-y-0.5 hover:bg-brass-hi"
        >
          {tc("download")}
        </Link>
      ) : (
        <Link
          href="/start"
          className="rounded-full bg-brass px-7 py-3.5 text-center text-sm font-semibold text-ink-900 transition-all duration-300 hover:-translate-y-0.5 hover:bg-brass-hi"
        >
          {tNav("start")}
        </Link>
      )}
      <Link
        href={href}
        className="inline-flex items-center justify-center gap-2 rounded-full border border-brass/40 px-7 py-3.5 text-sm font-semibold text-bone transition-colors hover:border-brass hover:text-brass"
      >
        {t("details")} <span className="rtl:rotate-180">→</span>
      </Link>
      </div>
    </div>
  );

  // bottom content on mobile: beat 0 is the "cover" (title on top, 3D at the
  // bottom, scroll hint); beats 1-3 slide content in at the bottom as the 3D
  // has risen to the top. Desktop shows one beat centred.
  const bottom = [about, offerings, cta];
  const desktop = [title, about, offerings, cta];

  return (
    <section ref={ref} id={id} className="relative h-[400vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* ── MOBILE / TABLET: name on top · 3D glides up · content at bottom ── */}
        <div className="flex h-full flex-col px-5 pb-8 pt-24 lg:hidden">
          <AnimatePresence>
            {beat === 0 && (
              <m.div
                key="title"
                initial={{ opacity: 0, y: -14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-2xl bg-ink-900/45 p-5 backdrop-blur-md"
              >
                {title}
              </m.div>
            )}
          </AnimatePresence>
          <div className="relative mt-auto min-h-[8rem]">
            <AnimatePresence mode="wait">
              {beat === 0 ? (
                <m.div
                  key="hint"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center gap-1.5 pb-2 text-brass/70"
                >
                  <span className="text-[0.62rem] tracking-[0.35em]">
                    {locale === "ar" ? "اسحب لأسفل" : "SCROLL"}
                  </span>
                  <m.span
                    animate={{ y: [0, 7, 0] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                    className="text-xl leading-none"
                  >
                    ↓
                  </m.span>
                </m.div>
              ) : (
                <m.div
                  key={beat}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="rounded-2xl bg-ink-900/60 p-5 backdrop-blur-md"
                >
                  {bottom[beat - 1]}
                </m.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── DESKTOP: cinematic single-beat, 3D to the side ── */}
        <div className="hidden h-full items-center lg:flex">
          <div className="mx-auto w-full max-w-7xl px-6">
            <div className="w-full max-w-lg">
              <AnimatePresence mode="wait">
                <m.div
                  key={beat}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -18 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  {desktop[beat]}
                </m.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
