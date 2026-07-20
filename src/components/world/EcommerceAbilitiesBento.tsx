"use client";

import { m } from "framer-motion";
import { useTranslations } from "next-intl";
import { brand } from "@/lib/brand";
import { cn } from "@/lib/cn";

function Icon({ id }: { id: string }) {
  const p: Record<string, React.ReactNode> = {
    storefront: <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 22V12h6v10" />,
    builder3d: <path d="M12 2L2 7l10 5 10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />,
    payments: <path d="M3 6h18v12H3zM3 10h18M7 15h4" />,
    analytics: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
    seo: <><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></>,
    mobile: <><rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></>,
    multilang: <path d="M2 12h20M12 2v20M8 3a15 15 0 0 0 0 18M16 3a15 15 0 0 1 0 18" />,
  };
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      {p[id] ?? p.storefront}
    </svg>
  );
}

const CARDS: { id: string; span?: string; feature?: boolean }[] = [
  { id: "storefront", span: "lg:col-span-2", feature: true },
  { id: "builder3d" },
  { id: "payments" },
  { id: "analytics" },
  { id: "seo" },
  { id: "mobile", span: "lg:col-span-2", feature: true },
  { id: "multilang" },
];

export function EcommerceAbilitiesBento({ worldKey }: { worldKey: string }) {
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

              {c.feature && (
                <div className="mt-auto flex items-end gap-1.5 pt-6">
                  {[55, 72, 88, 65, 92, 78].map((h, k) => (
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
