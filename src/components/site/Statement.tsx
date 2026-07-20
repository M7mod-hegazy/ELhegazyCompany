"use client";

import { m } from "framer-motion";
import { useTranslations } from "next-intl";
import { brand } from "@/lib/brand";

export function Statement() {
  const t = useTranslations("Home");
  return (
    <section className="mx-auto max-w-5xl px-6 py-32 text-center">
      <m.h2
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.9, ease: brand.ease.cinematic }}
        className="font-display text-3xl font-medium leading-tight text-bone sm:text-5xl"
      >
        {t("statement1")} <span className="text-mask">{t("statement2")}</span>
      </m.h2>
    </section>
  );
}
