"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { m, useReducedMotion } from "framer-motion";

/**
 * Page transitions.
 *
 * Design rule: the transition NEVER gates the content. The page is fully
 * visible and interactive from the first frame; the overlay is a decorative
 * wipe that clears off the top of it. Previously this component held the
 * content at opacity 0 behind an opaque panel for a fixed 500–700ms and then
 * cross-faded for another 600ms, which read as "I clicked and nothing
 * happened" on every navigation.
 *
 *   /                   → curtain   (two panels split)
 *   /products/pos       → scan      (brass line wipes across)
 *   /products/ecommerce → blinds    (horizontal strips alternate)
 *   /services/marketing → inkdrop   (ink circle expands away)
 *   /projects           → filmstrip (panel slides up)
 *   *                   → titlecard (wordmark + hairline)
 */

const ease = [0.76, 0, 0.24, 1] as const;

type Kind = "curtain" | "scan" | "blinds" | "inkdrop" | "filmstrip" | "titlecard";

function getPageKind(pathname: string): Kind {
  const path = pathname.replace(/^\/(ar|en)/, "") || "/";
  if (path === "/") return "curtain";
  if (path === "/products/pos") return "scan";
  if (path === "/products/ecommerce") return "blinds";
  if (path === "/services/marketing") return "inkdrop";
  if (path === "/projects") return "filmstrip";
  return "titlecard";
}

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const kind = getPageKind(pathname);
  const t = useTranslations("Nav");

  const label: Record<Kind, string> = {
    curtain: "",
    scan: t("pos"),
    blinds: t("ecommerce"),
    inkdrop: t("marketing"),
    filmstrip: t("projects"),
    titlecard: "",
  };

  // Reduced motion: no overlay at all, content renders plainly.
  if (reduced) return <>{children}</>;

  return (
    <>
      {/* Content is live and interactive immediately — never gated. */}
      {children}

      {/* Decorative wipe, painted on top, self-clearing, click-through. */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-[110]">
        <Overlay kind={kind} label={label[kind]} />
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */

function Overlay({ kind, label }: { kind: Kind; label: string }) {
  switch (kind) {
    case "curtain":
      return <Curtain />;
    case "scan":
      return <Scan label={label} />;
    case "blinds":
      return <Blinds label={label} />;
    case "inkdrop":
      return <InkDrop label={label} />;
    case "filmstrip":
      return <FilmStrip label={label} />;
    default:
      return <Titlecard />;
  }
}

/** Brand mark that flashes over the wipe, then removes itself from paint. */
function Mark({ text, delay = 0 }: { text: string; delay?: number }) {
  if (!text) return null;
  return (
    <m.div
      className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{
        opacity: [0, 1, 1, 0],
        scale: [0.97, 1, 1, 1.02],
        transition: { duration: 0.62, delay, times: [0, 0.25, 0.6, 1], ease },
      }}
    >
      <span className="font-display text-3xl font-semibold text-brass sm:text-4xl">
        {text}
      </span>
      <span className="block h-px w-16 bg-brass/50" />
    </m.div>
  );
}

/* ── Curtain (Home) ─────────────────────────────────────────────── */

function Curtain() {
  return (
    <>
      <m.div
        className="absolute inset-y-0 left-0 w-1/2 bg-ink-900"
        initial={{ x: 0 }}
        animate={{ x: "-100%" }}
        transition={{ duration: 0.62, ease }}
      />
      <m.div
        className="absolute inset-y-0 right-0 w-1/2 bg-ink-900"
        initial={{ x: 0 }}
        animate={{ x: "100%" }}
        transition={{ duration: 0.62, ease }}
      />
      <m.span
        dir="rtl"
        className="absolute inset-0 flex items-center justify-center font-display-ar text-4xl font-semibold text-brass sm:text-5xl"
        initial={{ opacity: 1, scale: 1 }}
        animate={{
          opacity: [1, 1, 0],
          scale: [1, 1, 1.03],
          transition: { duration: 0.5, times: [0, 0.4, 1], ease },
        }}
      >
        الحجازي
      </m.span>
    </>
  );
}

/* ── Scan (POS) ─────────────────────────────────────────────────── */

function Scan({ label }: { label: string }) {
  return (
    <>
      <m.div
        className="absolute inset-0 bg-ink-900"
        initial={{ clipPath: "inset(0 0 0 0)" }}
        animate={{ clipPath: "inset(0 0 0 100%)" }}
        transition={{ duration: 0.58, ease }}
      />
      <m.div
        className="absolute inset-y-0 w-px bg-brass/50"
        initial={{ left: "0%" }}
        animate={{ left: "100%", opacity: [1, 1, 0] }}
        transition={{ duration: 0.58, ease }}
      />
      <Mark text={label} />
    </>
  );
}

/* ── Blinds (E-commerce) ────────────────────────────────────────── */

const BLIND_COUNT = 8;

function Blinds({ label }: { label: string }) {
  return (
    <>
      {Array.from({ length: BLIND_COUNT }).map((_, i) => (
        <m.div
          key={i}
          className="absolute left-0 right-0 bg-ink-900"
          style={{
            top: `${(i / BLIND_COUNT) * 100}%`,
            height: `${100 / BLIND_COUNT + 0.5}%`,
          }}
          initial={{ x: "0%" }}
          animate={{ x: i % 2 ? "100%" : "-100%" }}
          transition={{ duration: 0.5, delay: i * 0.03, ease }}
        />
      ))}
      <Mark text={label} />
    </>
  );
}

/* ── InkDrop (Marketing) ────────────────────────────────────────── */

function InkDrop({ label }: { label: string }) {
  return (
    <>
      <m.div
        className="absolute inset-0 bg-ink-900"
        initial={{ clipPath: "circle(150% at 50% 50%)" }}
        animate={{ clipPath: "circle(0% at 50% 50%)" }}
        transition={{ duration: 0.7, ease }}
      />
      <Mark text={label} />
    </>
  );
}

/* ── FilmStrip (Projects) ───────────────────────────────────────── */

function FilmStrip({ label }: { label: string }) {
  return (
    <>
      <m.div
        className="absolute inset-0 bg-ink-900"
        initial={{ y: 0 }}
        animate={{ y: "-100%" }}
        transition={{ duration: 0.62, ease }}
      />
      <Mark text={label} />
    </>
  );
}

/* ── Titlecard (default) ────────────────────────────────────────── */

function Titlecard() {
  return (
    <m.div
      className="absolute inset-0 flex flex-col items-center justify-center bg-ink-900"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.5, ease }}
    >
      <m.span
        dir="rtl"
        className="font-display-ar text-4xl font-semibold text-brass sm:text-5xl"
        initial={{ opacity: 1, y: 0 }}
        animate={{ opacity: [1, 1, 0], y: [0, 0, -12] }}
        transition={{ duration: 0.5, times: [0, 0.5, 1], ease }}
      >
        الحجازي
      </m.span>
    </m.div>
  );
}
