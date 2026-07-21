"use client";

import { useEffect, useState } from "react";
import { usePathname } from "@/i18n/navigation";
import { m } from "framer-motion";

/**
 * Cinematic page transitions — each key page gets its own unique entrance.
 * Dismiss is a clean opacity fade on the wrapper; internal animations play
 * once on mount. This dual-layer approach is bulletproof:
 *   - Entrance: cinematic per-page animation (plays on mount)
 *   - Exit: smooth opacity fade (plays when ready)
 *
 *   /                   → curtain    (two panels split, wordmark)
 *   /products/pos       → scan       (brass scan line wipes L→R)
 *   /products/ecommerce → blinds     (horizontal strips alternate)
 *   /services/marketing → inkdrop    (circular ink expands from center)
 *   /work               → filmstrip  (panel slides up + title)
 *   *                   → titlecard  (wordmark + hairline)
 */

const ease = [0.76, 0, 0.24, 1] as const;

const MIN_DURATIONS: Record<string, number> = {
  curtain: 1200,
  scan: 900,
  blinds: 900,
  inkdrop: 900,
  filmstrip: 900,
  titlecard: 800,
};

function getPageKind(pathname: string): string {
  const path = pathname.replace(/^\/(ar|en)/, "") || "/";
  if (path === "/") return "curtain";
  if (path === "/products/pos") return "scan";
  if (path === "/products/ecommerce") return "blinds";
  if (path === "/services/marketing") return "inkdrop";
  if (path === "/work") return "filmstrip";
  return "titlecard";
}

function usePageReady(minDuration: number) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const domReady =
      document.readyState === "complete" ||
      document.readyState === "interactive";

    let timer: ReturnType<typeof setTimeout>;

    if (domReady) {
      timer = setTimeout(() => setReady(true), minDuration);
    } else {
      const onReady = () => {
        timer = setTimeout(() => setReady(true), minDuration);
      };
      document.addEventListener("DOMContentLoaded", onReady, { once: true });
      return () => {
        document.removeEventListener("DOMContentLoaded", onReady);
        clearTimeout(timer);
      };
    }

    return () => clearTimeout(timer);
  }, [minDuration]);

  return ready;
}

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const kind = getPageKind(pathname);
  const minDur = MIN_DURATIONS[kind] ?? MIN_DURATIONS.titlecard;
  const ready = usePageReady(minDur);

  return (
    <>
      {/* Overlay: always plays entrance on mount; fades out when ready */}
      <m.div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[110]"
        initial={{ opacity: 1 }}
        animate={{
          opacity: ready ? 0 : 1,
          transition: { duration: 0.6, ease: "easeOut" },
        }}
      >
        <Overlay kind={kind} />
      </m.div>

      {/* Content: mounts immediately behind overlay (z-110), fades in when overlay clears */}
      <div className="relative z-0">
        <m.div
          initial={{ opacity: 0 }}
          animate={{
            opacity: ready ? 1 : 0,
            transition: { duration: 0.6, ease: "easeOut" },
          }}
        >
          {children}
        </m.div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */

function Overlay({ kind }: { kind: string }) {
  switch (kind) {
    case "curtain":
      return <Curtain />;
    case "scan":
      return <Scan />;
    case "blinds":
      return <Blinds />;
    case "inkdrop":
      return <InkDrop />;
    case "filmstrip":
      return <FilmStrip />;
    default:
      return <Titlecard />;
  }
}

/* ── Curtain (Home) ─────────────────────────────────────────────── */

function Curtain() {
  return (
    <>
      <m.div
        className="absolute inset-y-0 left-0 w-1/2 bg-ink-900"
        initial={{ x: 0 }}
        animate={{ x: "-100%" }}
        transition={{ duration: 0.75, delay: 0.25, ease }}
      />
      <m.div
        className="absolute inset-y-0 right-0 w-1/2 bg-ink-900"
        initial={{ x: 0 }}
        animate={{ x: "100%" }}
        transition={{ duration: 0.75, delay: 0.25, ease }}
      />
      <m.span
        dir="rtl"
        className="absolute inset-0 flex items-center justify-center font-display-ar text-4xl font-semibold text-brass sm:text-5xl"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{
          opacity: [0, 1, 1, 0],
          scale: [0.96, 1, 1, 1.02],
          transition: { duration: 0.7, times: [0, 0.25, 0.65, 1], ease },
        }}
      >
        الحجازي
      </m.span>
    </>
  );
}

/* ── Scan (POS — brass scan line wipe) ──────────────────────────── */

function Scan() {
  return (
    <>
      <m.div
        className="absolute inset-0 bg-ink-900"
        initial={{ clipPath: "inset(0 0 0 0)" }}
        animate={{ clipPath: "inset(0 0 0 100%)" }}
        transition={{ duration: 0.65, delay: 0.2, ease }}
      />
      <m.div
        className="absolute inset-y-0 w-px bg-brass/50"
        initial={{ left: "0%" }}
        animate={{ left: "100%" }}
        transition={{ duration: 0.65, delay: 0.2, ease }}
      />
      <m.div
        className="absolute inset-y-0 w-12"
        initial={{ left: "-3rem", opacity: 0 }}
        animate={{ left: "100%", opacity: [0, 0.6, 0] }}
        transition={{ duration: 0.65, delay: 0.2, ease }}
        style={{
          background:
            "linear-gradient(to right, transparent, rgba(201,168,106,0.15), transparent)",
        }}
      />
      <m.div
        className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{
          opacity: [0, 1, 1, 0],
          scale: [0.96, 1, 1, 1.02],
          transition: {
            duration: 0.85,
            times: [0, 0.2, 0.65, 1],
            ease: [0.16, 1, 0.3, 1],
          },
        }}
      >
        <span
          dir="rtl"
          className="font-display-ar text-3xl font-semibold text-brass sm:text-4xl"
        >
          نظام نقاط البيع
        </span>
        <span className="block h-px w-16 bg-brass/50" />
      </m.div>
    </>
  );
}

/* ── Blinds (E-commerce — alternating strips) ───────────────────── */

const BLIND_COUNT = 8;

function Blinds() {
  return (
    <>
      {Array.from({ length: BLIND_COUNT }).map((_, i) => {
        const fromRight = i % 2 === 1;
        return (
          <m.div
            key={i}
            className="absolute left-0 right-0 bg-ink-900"
            style={{
              top: `${(i / BLIND_COUNT) * 100}%`,
              height: `${100 / BLIND_COUNT + 0.5}%`,
            }}
            initial={{ x: "0%" }}
            animate={{ x: fromRight ? "100%" : "-100%" }}
            transition={{
              duration: 0.55,
              delay: 0.15 + i * 0.04,
              ease,
            }}
          />
        );
      })}
      <m.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{
          opacity: [0, 1, 1, 0],
          transition: { duration: 0.8, times: [0, 0.2, 0.6, 1], ease },
        }}
      >
        <span
          dir="rtl"
          className="font-display-ar text-3xl font-semibold text-brass sm:text-4xl"
        >
          المتجر الإلكتروني
        </span>
      </m.div>
    </>
  );
}

/* ── InkDrop (Marketing — circular ink expands) ─────────────────── */

function InkDrop() {
  return (
    <>
      {/* Ink circle expands from center to fill screen */}
      <m.div
        className="absolute inset-0 bg-ink-900"
        initial={{ scale: 0, borderRadius: "50%" }}
        animate={{ scale: 30, borderRadius: "0%" }}
        transition={{ duration: 0.8, delay: 0.1, ease }}
      />
      {/* Title + hairline appear then fade */}
      <m.div
        className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{
          opacity: [0, 1, 1, 0],
          scale: [0.9, 1, 1, 1.04],
          transition: {
            duration: 1.0,
            times: [0, 0.2, 0.65, 1],
            ease: [0.16, 1, 0.3, 1],
          },
        }}
      >
        <span
          dir="rtl"
          className="font-display-ar text-3xl font-semibold text-brass sm:text-4xl"
        >
          التسويق الرقمي
        </span>
        <span className="block h-px w-16 bg-brass/50" />
      </m.div>
    </>
  );
}

/* ── FilmStrip (Work — panel slides up) ─────────────────────────── */

function FilmStrip() {
  return (
    <>
      <m.div
        className="absolute inset-0 bg-ink-900"
        initial={{ y: 0 }}
        animate={{ y: "-100%" }}
        transition={{ duration: 0.7, delay: 0.15, ease }}
      />
      <m.div
        className="absolute left-1/2 top-0 -translate-x-1/2 h-px bg-brass/40"
        initial={{ width: 0 }}
        animate={{
          width: ["0%", "60%", "60%", "0%"],
          transition: { duration: 0.75, times: [0, 0.3, 0.7, 1], ease: "easeInOut" },
        }}
      />
      <m.span
        dir="rtl"
        className="absolute inset-0 flex items-center justify-center font-display-ar text-3xl font-semibold text-brass sm:text-4xl"
        initial={{ opacity: 0, y: 30 }}
        animate={{
          opacity: [0, 1, 1, 0],
          y: [30, 0, 0, -20],
          transition: { duration: 0.8, times: [0, 0.25, 0.6, 1], ease },
        }}
      >
        أعمالنا
      </m.span>
    </>
  );
}

/* ── Titlecard (default) ────────────────────────────────────────── */

function Titlecard() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-ink-900">
      <m.span
        dir="rtl"
        className="font-display-ar text-4xl font-semibold text-brass sm:text-5xl"
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{
          opacity: [0, 1, 1, 0],
          y: [18, 0, 0, -14],
          scale: [0.98, 1, 1, 1.01],
          transition: {
            duration: 0.85,
            times: [0, 0.3, 0.75, 1],
            ease: [0.16, 1, 0.3, 1],
          },
        }}
      >
        الحجازي
      </m.span>
      <m.span
        aria-hidden
        className="mt-4 block h-px bg-brass/60"
        initial={{ width: 0 }}
        animate={{
          width: ["0%", "18%", "18%", "0%"],
          transition: { duration: 0.85, times: [0, 0.35, 0.7, 1], ease: "easeInOut" },
        }}
      />
    </div>
  );
}
