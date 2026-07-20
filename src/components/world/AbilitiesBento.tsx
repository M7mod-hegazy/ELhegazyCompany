"use client";

import { m } from "framer-motion";
import { useTranslations } from "next-intl";
import { brand } from "@/lib/brand";
import { cn } from "@/lib/cn";

/* compact line icons (stroke = currentColor) */
function Icon({ id }: { id: string }) {
  const p: Record<string, React.ReactNode> = {
    treasury: <path d="M3 7h18v10H3zM3 7l9-4 9 4M8 12h.01M16 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0" />,
    reports: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
    crm: <path d="M21 15a2 2 0 0 1-2 2H8l-4 4V6a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2z" />,
    credit: <path d="M3 6h18v12H3zM3 10h18M7 15h4" />,
    inventory: <path d="M3 7l9-4 9 4v10l-9 4-9-4zM3 7l9 4 9-4M12 11v10" />,
    offline: <path d="M12 3l8 4v5c0 4-3 7-8 9-5-2-8-5-8-9V7zM9 12l2 2 4-4" />,
    print: <path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2M7 14h10v7H7z" />,
  };
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      {p[id] ?? p.reports}
    </svg>
  );
}

const CARDS: { id: string; span?: string; feature?: boolean }[] = [
  { id: "treasury", span: "lg:col-span-2", feature: true },
  { id: "reports" },
  { id: "crm" },
  { id: "credit" },
  { id: "inventory" },
  { id: "offline", span: "lg:col-span-2", feature: true },
  { id: "print" },
];

export function AbilitiesBento({ worldKey }: { worldKey: string }) {
  const t = useTranslations(`Worlds.${worldKey}`);
  return (
    <section className="relative mx-auto max-w-6xl px-6 py-24">
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-brass">{t("abilitiesKicker")}</p>
        <h2 className="font-display mx-auto mt-4 max-w-3xl text-3xl font-semibold text-bone sm:text-5xl">
          {t("abilitiesTitle")}
        </h2>
      </div>

      <div className="mt-12 grid auto-rows-[minmax(160px,auto)] gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CARDS.map((c, i) => (
          <m.div
            key={c.id}
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: (i % 3) * 0.08, ease: brand.ease.cinematic }}
            className={cn(
              "group relative overflow-hidden rounded-2xl border border-brass/12 bg-gradient-to-b from-ink-800/80 to-ink-900/80 p-6 transition-all duration-500 hover:-translate-y-1 hover:border-brass/40",
              c.span,
            )}
          >
            {/* hover glow */}
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              style={{ background: "radial-gradient(60% 60% at 30% 0%, color-mix(in oklab, var(--world-accent,#C9A86A) 30%, transparent), transparent 70%)" }}
            />
            <div className="relative flex h-full flex-col">
              <span
                className="grid h-11 w-11 place-items-center rounded-xl border border-brass/25 bg-ink-900/60 text-brass transition-colors duration-500 group-hover:text-brass-hi"
                style={{ boxShadow: "inset 0 0 20px -10px var(--world-accent)" }}
              >
                <Icon id={c.id} />
              </span>
              <h3 className={cn("font-display mt-5 font-semibold text-bone", c.feature ? "text-2xl sm:text-3xl" : "text-xl")}>
                {t(`abilities.${c.id}.title`)}
              </h3>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-bone-muted">
                {t(`abilities.${c.id}.desc`)}
              </p>

              {/* featured cards get a live micro-bar */}
              {c.feature && (
                <div className="mt-auto flex items-end gap-1.5 pt-6">
                  {[42, 68, 55, 88, 72, 96].map((h, k) => (
                    <span
                      key={k}
                      className="w-full origin-bottom rounded-t"
                      style={{
                        height: h * 0.5,
                        background: "linear-gradient(to top, var(--world-accent), #E8D6A8)",
                        animation: `barGrow 0.9s ${brand.ease.cinematicCss} ${k * 0.09}s both`,
                        opacity: 0.85,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </m.div>
        ))}
      </div>
    </section>
  );
}
