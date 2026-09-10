"use client";

import type { CSSProperties } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ShotFrame } from "@/components/world/ShotFrame";

/**
 * GridSection — "كل حاجة بتتوصّل ببعضها".
 *
 * Previous versions of this card grid never carried a single real image —
 * first a hover-only specimen photo, then plain colored boxes with an icon
 * and a bullet list. Nothing on the section proved the company builds three
 * different, real products; it just asserted it in text. Each card now leads
 * with an actual screenshot of that product (device-framed, same ShotFrame
 * used on the product pages), so the three cards are visibly different
 * things, not the same box painted three colors.
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

/** world (shot folder) + shot id + frame chrome, one real image per card. */
const WORLD_SHOT: Record<World, { shot: string; device: "app" | "browser" }> = {
  pos: { shot: "pos-checkout", device: "app" },
  ecommerce: { shot: "storefront", device: "browser" },
  marketing: { shot: "ad-mockup", device: "browser" },
};

const WORLDS: World[] = ["pos", "ecommerce", "marketing"];

export function GridSection() {
  const t = useTranslations("Grid");

  return (
    <section className="relative overflow-hidden bg-ink-900 py-20 sm:py-28" aria-labelledby="grid-heading">
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

        {/* ── One card per world — real image first, then the one line that
            matters, then proof items and a real button. ── */}
        <div className="grid gap-5 sm:grid-cols-3">
          {WORLDS.map((w) => {
            const accent = WORLD_ACCENT[w];
            const { shot, device } = WORLD_SHOT[w];
            const items = t.raw(`cards.${w}.items`) as string[];
            return (
              <div
                key={w}
                className="group flex flex-col overflow-hidden border border-brass/15 bg-ink-800/60 transition-all duration-300 hover:-translate-y-1 hover:border-[color:var(--card-accent)]"
                style={{ "--card-accent": accent } as CSSProperties}
              >
                <div className="p-3 pb-0">
                  <ShotFrame
                    world={w}
                    shot={shot}
                    device={device}
                    label={t(`cards.${w}.shotLabel`)}
                    className="border-0"
                  />
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <p
                    className="mb-3 font-mono text-xs font-semibold uppercase tracking-[0.22em]"
                    style={{ color: accent }}
                  >
                    {t(`cards.${w}.tag`)}
                  </p>

                  <h3 className="mb-4 text-lg font-semibold leading-snug text-bone">
                    {t(`cards.${w}.headline`)}
                  </h3>

                  <ul className="mb-6 space-y-2.5">
                    {items.map((item) => (
                      <li key={item} className="flex items-center gap-3">
                        <span aria-hidden className="h-px w-4 shrink-0" style={{ background: accent }} />
                        <span className="text-sm text-bone-muted">{item}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={WORLD_HREF[w]}
                    className="mt-auto inline-flex w-fit items-center gap-2 border px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider transition-colors"
                    style={{ borderColor: accent, color: accent }}
                  >
                    {t("details")}
                    <span aria-hidden>↗</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
