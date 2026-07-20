"use client";

import { m } from "framer-motion";
import { useTranslations } from "next-intl";
import { brand } from "@/lib/brand";

export function WorldProof({
  worldKey,
  items,
}: {
  worldKey: string;
  items: { id: string; value: string }[];
}) {
  const t = useTranslations(`Worlds.${worldKey}.proof`);
  return (
    <section className="relative mx-auto max-w-6xl px-6 py-24">
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((it, i) => (
          <m.div
            key={it.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: i * 0.08, ease: brand.ease.cinematic }}
            className="text-center"
          >
            <div
              className="font-display text-5xl font-semibold sm:text-6xl"
              style={{ color: "var(--world-accent)" }}
            >
              {it.value}
            </div>
            <div className="mt-3 text-sm text-bone-muted">{t(it.id)}</div>
          </m.div>
        ))}
      </div>
    </section>
  );
}
