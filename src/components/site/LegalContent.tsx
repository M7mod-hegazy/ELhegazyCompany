"use client";

import { useTranslations } from "next-intl";

/** Shared renderer for the privacy/terms prose pages. */
export function LegalContent({ ns }: { ns: "privacy" | "terms" }) {
  const t = useTranslations(`Legal.${ns}`);
  const sections = t.raw("sections") as { h: string; p: string }[];

  return (
    <main className="relative z-10 mx-auto w-full max-w-3xl px-6 pb-28 pt-40">
      <h1 className="font-display-ar text-4xl font-semibold text-bone sm:text-5xl">{t("title")}</h1>
      <p className="mt-4 text-sm text-bone-muted">{t("updated")}</p>
      <div className="mt-12 space-y-10">
        {sections.map((s) => (
          <section key={s.h}>
            <h2 className="font-display-ar text-xl font-semibold text-brass">{s.h}</h2>
            <p className="mt-3 leading-relaxed text-bone-muted">{s.p}</p>
          </section>
        ))}
      </div>
    </main>
  );
}
