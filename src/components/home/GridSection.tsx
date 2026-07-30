"use client";

import type { CSSProperties } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ParallaxImage } from "@/components/fx/ParallaxImage";

/**
 * GridSection — "كل حاجة متوصلة".
 *
 * Was a photograph of a specimen tray where every object's name was hidden
 * behind a hover/tap — nothing on the section was readable at a glance. Now a
 * plain three-column breakdown: one column per world, its own items listed in
 * the open, no interaction required to understand any of it. Each card carries
 * its own icon, an accent glow, and a real button — not a text link — so the
 * one action on the card (go see that product) is as easy to spot as the card
 * itself.
 */

type World = "pos" | "ecommerce" | "marketing";

const WORLD_ACCENT: Record<World, string> = {
  pos: "var(--color-slate)",
  ecommerce: "var(--color-oxblood-tint)",
  marketing: "var(--color-brass)",
};

const WORLD_HREF: Record<World, string> = {
  pos: "/products/pos",
  ecommerce: "/products/ecommerce",
  marketing: "/services/marketing",
};

/** Each world's items, grouped for a plain list — no coordinates needed. */
const WORLD_ITEMS: Record<World, string[]> = {
  pos: ["receipt", "barcode", "tape"],
  marketing: ["phone", "adCard"],
  ecommerce: ["chairLeg", "swatch"],
};

const WORLDS: World[] = ["pos", "ecommerce", "marketing"];

export function GridSection() {
  const t = useTranslations("Grid");

  return (
    <section className="relative overflow-hidden bg-ink-900 py-20 sm:py-28" aria-labelledby="grid-heading">
      {/* Atmosphere only — the photograph no longer carries the content, but it
          still drifts on scroll like every other plate on the page. */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <ParallaxImage
          src="/bg/grid.jpg"
          travel={24}
          scale={1.08}
          quality={60}
          className="absolute inset-0 overflow-hidden"
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, rgba(10,10,11,0.94) 0%, rgba(10,10,11,0.9) 100%)" }}
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="mb-10 max-w-[38ch]">
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.28em] text-brass/80">
            {t("kicker")}
          </p>
          <h2
            id="grid-heading"
            className="text-3xl font-semibold leading-[1.15] text-bone sm:text-4xl md:text-5xl"
          >
            {t("title")}
          </h2>
          <p className="mt-4 leading-relaxed text-bone-muted">{t("body")}</p>
        </div>

        {/* ── One card per world — icon, items, and a real button. ── */}
        <div className="grid gap-5 sm:grid-cols-3">
          {WORLDS.map((w) => {
            const accent = WORLD_ACCENT[w];
            return (
              <div
                key={w}
                className="group relative flex flex-col overflow-hidden border border-brass/15 bg-ink-800/60 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[color:var(--card-accent)]"
                style={{ "--card-accent": accent } as CSSProperties}
              >
                {/* Corner glow — the card's own accent, not just a hairline. */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute -end-10 -top-10 h-32 w-32 rounded-full opacity-25 blur-2xl transition-opacity duration-300 group-hover:opacity-45"
                  style={{ background: accent }}
                />

                <div
                  className="relative mb-5 grid h-11 w-11 place-items-center border"
                  style={{ borderColor: accent, color: accent }}
                >
                  <WorldIcon world={w} />
                </div>

                <p
                  className="relative mb-4 font-mono text-xs font-semibold uppercase tracking-[0.22em]"
                  style={{ color: accent }}
                >
                  {t(`legend.${w}`)}
                </p>

                <ul className="relative mb-6 space-y-2.5">
                  {WORLD_ITEMS[w].map((id) => (
                    <li key={id} className="flex items-center gap-3">
                      <span aria-hidden className="h-px w-4 shrink-0" style={{ background: accent }} />
                      <span className="text-sm text-bone-muted">{t(`objects.${id}`)}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={WORLD_HREF[w]}
                  className="relative mt-auto inline-flex w-fit items-center gap-2 border px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider transition-colors"
                  style={{ borderColor: accent, color: accent }}
                >
                  {t("details")}
                  <span aria-hidden>↗</span>
                </Link>
              </div>
            );
          })}
        </div>

        {/* ── The seal — the one thing shared by all three. ── */}
        <div className="mt-8 flex items-center justify-center gap-3 border-t border-brass/10 pt-8">
          <span className="seal-round h-2.5 w-2.5 border border-brass bg-ink-900" />
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-brass/80">
            {t("objects.seal")}
          </p>
        </div>
      </div>
    </section>
  );
}

/* ── Simple mono-line icons — no icon library, on-brand stroke weight. ── */
function WorldIcon({ world }: { world: World }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "h-5 w-5",
  };
  if (world === "pos") {
    return (
      <svg {...common} aria-hidden>
        <rect x="3" y="4" width="18" height="12" rx="1" />
        <path d="M8 20h8M9 16v4M15 16v4M7 8h4M7 11h6" />
      </svg>
    );
  }
  if (world === "ecommerce") {
    return (
      <svg {...common} aria-hidden>
        <path d="M6 8h12l-1 12H7L6 8Z" />
        <path d="M9 8V6a3 3 0 0 1 6 0v2" />
      </svg>
    );
  }
  return (
    <svg {...common} aria-hidden>
      <path d="M3 11v2a2 2 0 0 0 2 2h1l2 5h2l-1.5-5H10l9-4V7l-9 4H6a2 2 0 0 0-2 2Z" />
      <path d="M19 8v8" />
    </svg>
  );
}
