import { use } from "react";
import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { CtaBand } from "@/components/site/CtaBand";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Faq" });
  return { title: t("title") };
}

export default function FaqPage({ params }: Props) {
  const { locale } = use(params);
  setRequestLocale(locale);
  return <FaqContent />;
}

function FaqContent() {
  const t = useTranslations("Faq");
  const items = t.raw("items") as { q: string; a: string }[];

  return (
    <main className="relative z-10">
      <div className="mx-auto w-full max-w-3xl px-6 pb-24 pt-40">
        <p className="text-center text-xs uppercase tracking-[0.35em] text-brass">{t("kicker")}</p>
        <h1 className="font-display-ar mt-4 text-center text-4xl font-semibold text-bone sm:text-5xl">
          {t("title")}
        </h1>

        <div className="mt-14 space-y-3">
          {items.map((item) => (
            <details
              key={item.q}
              className="group rounded-2xl border border-brass/15 bg-ink-800/40 transition-colors open:border-brass/40"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 text-bone [&::-webkit-details-marker]:hidden">
                <span className="font-semibold">{item.q}</span>
                <span
                  aria-hidden
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-brass/30 text-brass transition-transform duration-300 group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="px-5 pb-5 leading-relaxed text-bone-muted">{item.a}</p>
            </details>
          ))}
        </div>

        <p className="mt-12 text-center text-sm text-bone-muted">
          {t("more")}{" "}
          <Link href="/contact" className="text-brass underline">
            {t("moreCta")}
          </Link>
        </p>
      </div>
      <CtaBand />
    </main>
  );
}
