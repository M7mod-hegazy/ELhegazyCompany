import { use } from "react";
import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { siteConfig } from "@/config/site";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Contact" });
  return { title: t("title"), description: t("subtitle") };
}

export default function ContactPage({ params }: Props) {
  const { locale } = use(params);
  setRequestLocale(locale);
  return <ContactContent />;
}

function ContactContent() {
  const t = useTranslations("Contact");
  const locale = useLocale() as "ar" | "en";
  const whatsappHref = `https://wa.me/${siteConfig.contact.whatsapp}`;

  const channels = [
    {
      id: "whatsapp",
      label: "WhatsApp",
      value: siteConfig.contact.phoneDisplay,
      href: whatsappHref,
      external: true,
      primary: true,
    },
    {
      id: "email",
      label: t("email"),
      value: siteConfig.contact.email,
      href: `mailto:${siteConfig.contact.email}`,
      external: false,
    },
    {
      id: "instagram",
      label: "Instagram",
      value: "@elhegazi",
      href: siteConfig.social.instagram,
      external: true,
    },
    {
      id: "facebook",
      label: "Facebook",
      value: "/elhegazi",
      href: siteConfig.social.facebook,
      external: true,
    },
  ];

  return (
    <main className="relative z-10 mx-auto min-h-screen w-full max-w-5xl px-6 pb-28 pt-40">
      <p className="text-xs uppercase tracking-[0.35em] text-brass">{t("kicker")}</p>
      <h1 className="font-display-ar mt-4 max-w-2xl text-4xl font-semibold leading-tight text-bone sm:text-6xl">
        {t("title")}
      </h1>
      <p className="mt-5 max-w-xl text-bone-muted">{t("subtitle")}</p>

      <div className="mt-14 grid gap-4 sm:grid-cols-2">
        {channels.map((c) => (
          <a
            key={c.id}
            href={c.href}
            {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className={
              c.primary
                ? "group rounded-3xl border border-brass/50 bg-gradient-to-b from-ink-700 to-ink-900 p-7 transition-transform duration-300 hover:-translate-y-1"
                : "group rounded-3xl border border-brass/15 bg-ink-800/40 p-7 transition-colors hover:border-brass/40"
            }
          >
            <div className="text-xs uppercase tracking-[0.3em] text-bone-muted">{c.label}</div>
            <div
              className="mt-3 font-display text-xl font-semibold text-bone transition-colors group-hover:text-brass"
              dir="ltr"
            >
              {c.value}
            </div>
          </a>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-bone-muted">
        <span>{siteConfig.contact.location[locale]}</span>
        <span aria-hidden>·</span>
        <span>{t("hours")}</span>
      </div>

      <div className="mt-16 rounded-3xl border border-brass/15 bg-ink-800/40 p-10 text-center">
        <p className="font-display-ar text-2xl font-semibold text-bone">{t("briefTitle")}</p>
        <p className="mx-auto mt-3 max-w-md text-sm text-bone-muted">{t("briefBody")}</p>
        <Link
          href="/start"
          className="mt-7 inline-block rounded-full bg-brass px-8 py-3.5 text-sm font-semibold text-ink-900 transition-all duration-300 hover:-translate-y-0.5 hover:bg-brass-hi"
        >
          {t("briefCta")}
        </Link>
      </div>
    </main>
  );
}
