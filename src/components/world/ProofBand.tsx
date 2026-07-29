"use client";

import { useTranslations, useLocale } from "next-intl";
import { ParallaxImage } from "@/components/fx/ParallaxImage";
import { formatNum } from "@/lib/num";
import type { WorldConfig } from "@/config/worlds";

/**
 * ProofBand — a full-bleed parallax plate carrying a world's hard numbers.
 *
 * This replaced `VideoTheater`, which rendered a dashed "video coming soon" box
 * with a glass blur on it, on both product pages. A placeholder for a video that
 * does not exist is worse than no section: it advertises the gap. The numbers
 * were already in `worlds.<key>.proof` and were only shown in a small grid
 * elsewhere; here they get the scale they deserve, over the world's own plate.
 */
export function ProofBand({
  world,
  plate,
}: {
  world: WorldConfig;
  /** Plate basename in /films, e.g. "page-pos". */
  plate: string;
}) {
  const t = useTranslations(`Worlds.${world.key}`);
  const locale = useLocale();

  return (
    <section
      className="relative overflow-hidden bg-ink-900"
      aria-label={t("proofTitle")}
    >
      <div className="relative min-h-[62svh] overflow-hidden">
        <ParallaxImage
          src={`/films/${plate}.jpg`}
          srcPortrait={`/films/${plate}-portrait.jpg`}
          travel={18}
          scale={1.06}
          quality={82}
          className="absolute inset-0 overflow-hidden"
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(10,10,11,0.95) 0%, rgba(10,10,11,0.6) 45%, rgba(10,10,11,0.35) 100%)",
          }}
        />

        <div className="relative mx-auto flex min-h-[62svh] max-w-7xl flex-col justify-end px-6 py-16">
          <h2 className="max-w-[20ch] text-3xl font-semibold leading-[1.15] text-bone sm:text-4xl">
            {t("proofTitle")}
          </h2>

          <dl className="mt-10 grid grid-cols-2 gap-px border border-brass/15 bg-brass/15 sm:grid-cols-4">
            {world.proof.map((p) => (
              <div key={p.id} className="bg-ink-900/90 px-5 py-6">
                <dt className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-bone-muted">
                  {t(`proof.${p.id}`)}
                </dt>
                <dd
                  className="mt-2 font-mono text-3xl font-semibold leading-none"
                  style={{ color: world.accent }}
                >
                  {formatNum(p.value, locale)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
