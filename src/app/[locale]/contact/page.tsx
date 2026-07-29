import { use } from "react";
import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { useTranslations, useLocale } from "next-intl";
import { PageHero } from "@/components/site/PageHero";
import { ContactForm } from "@/components/site/ContactForm";
import { siteConfig } from "@/config/site";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Contact" });
  return {
    title: t("title"),
    description: t("subtitle"),
    alternates: {
      canonical: `${siteConfig.url}/${locale}/contact`,
      languages: {
        ar: `${siteConfig.url}/ar/contact`,
        en: `${siteConfig.url}/en/contact`,
      },
    },
  };
}

export default function ContactPage({ params }: Props) {
  const { locale } = use(params);
  setRequestLocale(locale);

  return (
    <main>
      <ContactHero />
      {/* The form — client component */}
      <ContactForm />
      {/* Direct channels below the form */}
      <ContactChannels />
    </main>
  );
}

/* ── Hero ─────────────────────────────────────────────────────────── */
function ContactHero() {
  const t = useTranslations("Contact");
  return (
    <PageHero
      videoKey="contact"
      kicker={t("kicker")}
      title={t("title")}
      subtitle={t("subtitle")}
      zone="center"
    />
  );
}

/* ── Direct channels strip ─────────────────────────────────────────── */
function ContactChannels() {
  const t = useTranslations("Contact");
  const locale = useLocale() as "ar" | "en";
  const whatsappHref = `https://wa.me/${siteConfig.contact.whatsapp}`;

  return (
    <div className="mx-auto max-w-2xl px-6 pb-24">
      <div className="rule-seal mb-8 w-full" />
      <p className="mb-6 font-mono text-xs uppercase tracking-[0.2em] text-bone-muted">
        {t("channelsTitle")}
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {/* WhatsApp */}
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="border border-brass/30 px-6 py-5 transition-colors hover:border-brass/60 group"
        >
          <span className="font-mono text-xs uppercase tracking-widest text-bone-muted group-hover:text-brass">
            WhatsApp
          </span>
          <p className="mt-2 text-bone" dir="ltr">
            {siteConfig.contact.phoneDisplay}
          </p>
        </a>

        {/* Email */}
        <a
          href={`mailto:${siteConfig.contact.email}`}
          className="border border-brass/20 px-6 py-5 transition-colors hover:border-brass/40 group"
        >
          <span className="font-mono text-xs uppercase tracking-widest text-bone-muted group-hover:text-brass">
            Email
          </span>
          <p className="mt-2 text-bone" dir="ltr">
            {siteConfig.contact.email}
          </p>
        </a>
      </div>

      {/* Hours */}
      <p className="mt-6 font-mono text-xs text-bone-muted">{t("hours")}</p>
    </div>
  );
}
