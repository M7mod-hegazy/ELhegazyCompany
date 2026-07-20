"use client";

import { useTranslations } from "next-intl";

const ITEMS = ["ATELIER", "NOVA", "ORIENT", "LUMEN", "SAHARA", "VERVE", "MAISON", "ZENITH"];

export function LogoMarquee() {
  const t = useTranslations("Marquee");
  return (
    <section className="relative overflow-hidden border-y border-brass/10 py-10">
      <p className="mb-7 text-center text-xs uppercase tracking-[0.3em] text-bone-muted/70">
        {t("title")}
      </p>
      <div className="flex w-max animate-[marquee_32s_linear_infinite] gap-16 whitespace-nowrap">
        {[...ITEMS, ...ITEMS].map((x, i) => (
          <span key={i} className="font-display text-2xl tracking-wide text-bone-muted/50">
            {x}
          </span>
        ))}
      </div>
    </section>
  );
}
