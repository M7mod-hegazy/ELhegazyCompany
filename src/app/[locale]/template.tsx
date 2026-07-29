"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { m, useReducedMotion } from "framer-motion";

/**
 * Fast, direct page transitions.
 *
 * Overlay is a swift 250ms decorative wipe that never blocks page interaction
 * or stalls route loading.
 */

const ease = [0.16, 1, 0.3, 1] as const;

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

  if (reduced) return <>{children}</>;

  return (
    <>
      {children}
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

function Mark({ text }: { text: string }) {
  if (!text) return null;
  return (
    <m.div
      className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{
        opacity: [0, 1, 0],
        scale: [0.98, 1, 1.01],
        transition: { duration: 0.28, times: [0, 0.4, 1], ease },
      }}
    >
      <span className="font-display text-2xl font-semibold text-brass sm:text-3xl">
        {text}
      </span>
      <span className="block h-px w-12 bg-brass/50" />
    </m.div>
  );
}

/* ── Curtain (Home) ── */
function Curtain() {
  return (
    <>
      <m.div
        className="absolute inset-y-0 left-0 w-1/2 bg-ink-900"
        initial={{ x: 0 }}
        animate={{ x: "-100%" }}
        transition={{ duration: 0.28, ease }}
      />
      <m.div
        className="absolute inset-y-0 right-0 w-1/2 bg-ink-900"
        initial={{ x: 0 }}
        animate={{ x: "100%" }}
        transition={{ duration: 0.28, ease }}
      />
    </>
  );
}

/* ── Scan (POS) ── */
function Scan({ label }: { label: string }) {
  return (
    <>
      <m.div
        className="absolute inset-0 bg-ink-900"
        initial={{ clipPath: "inset(0 0 0 0)" }}
        animate={{ clipPath: "inset(0 0 0 100%)" }}
        transition={{ duration: 0.28, ease }}
      />
      <Mark text={label} />
    </>
  );
}

/* ── Blinds (E-commerce) ── */
const BLIND_COUNT = 4;

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
          transition={{ duration: 0.26, delay: i * 0.015, ease }}
        />
      ))}
      <Mark text={label} />
    </>
  );
}

/* ── InkDrop (Marketing) ── */
function InkDrop({ label }: { label: string }) {
  return (
    <>
      <m.div
        className="absolute inset-0 bg-ink-900"
        initial={{ clipPath: "circle(140% at 50% 50%)" }}
        animate={{ clipPath: "circle(0% at 50% 50%)" }}
        transition={{ duration: 0.28, ease }}
      />
      <Mark text={label} />
    </>
  );
}

/* ── FilmStrip (Projects) ── */
function FilmStrip({ label }: { label: string }) {
  return (
    <>
      <m.div
        className="absolute inset-0 bg-ink-900"
        initial={{ y: 0 }}
        animate={{ y: "-100%" }}
        transition={{ duration: 0.28, ease }}
      />
      <Mark text={label} />
    </>
  );
}

/* ── Titlecard (default) ── */
function Titlecard() {
  return (
    <m.div
      className="absolute inset-0 bg-ink-900"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.25, ease }}
    />
  );
}

