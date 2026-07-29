import type { CSSProperties } from "react";
import { use } from "react";
import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { useTranslations, useLocale } from "next-intl";
import { PageHero } from "@/components/site/PageHero";
import { ContactForm } from "@/components/site/ContactForm";
import { WorldAtmosphere } from "@/components/world/WorldAtmosphere";
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

import { AmbientFilm } from "@/components/film/AmbientFilm";

export default function ContactPage({ params }: Props) {
  const { locale } = use(params);
  setRequestLocale(locale);

  return (
    <main
      className="relative z-10 overflow-x-clip min-h-screen bg-ink-950"
      style={{ "--world-accent": "var(--color-brass)" } as CSSProperties}
    >
      {/* ── Fixed Background Video for the Entire Page ── */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <AmbientFilm
          src="/films/page-contact-v4.mp4"
          srcPortrait="/films/page-contact-v4-portrait.mp4"
          poster="/films/page-contact-v4.jpg"
          posterPortrait="/films/page-contact-v4-portrait.jpg"
          className="absolute inset-0"
        />
        {/* Dimming overlay so text remains readable without blurring the video */}
        <div className="absolute inset-0 bg-ink-900/80" />
      </div>

      <div className="relative z-10 pt-32 sm:pt-40 pb-16">
        <ContactHeader />
        <WorldAtmosphere transparent={true} />
        <ContactForm />
        <ContactChannels />
      </div>
    </main>
  );
}

/* ── Integrated Header ────────────────────────────────────────────── */
function ContactHeader() {
  const t = useTranslations("Contact");
  const whatsappHref = `https://wa.me/${siteConfig.contact.whatsapp}`;

  return (
    <div className="mx-auto max-w-3xl px-6 mb-12 text-center sm:text-start">
      <p className="mb-4 font-mono text-sm uppercase tracking-[0.2em] text-brass">
        {t("kicker")}
      </p>
      <h1 className="mb-6 font-display text-5xl font-medium tracking-tight text-bone sm:text-7xl">
        {t("title")}
      </h1>
      <p className="mb-8 max-w-xl text-lg text-bone-muted sm:text-xl">
        {t("subtitle")}
      </p>
      <div className="flex flex-wrap justify-center sm:justify-start gap-3">
        <a
          href="#contact-form"
          className="bg-brass px-7 py-3.5 font-mono text-sm font-semibold text-ink-900 transition-all hover:bg-brass-hi rounded-full hover:-translate-y-0.5"
        >
          {t("title")}
        </a>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="border border-bone/30 px-7 py-3.5 font-mono text-sm text-bone transition-colors hover:border-brass hover:text-brass rounded-full"
        >
          WhatsApp
        </a>
      </div>
    </div>
  );
}

/* ── Direct channels strip ─────────────────────────────────────────── */
function ContactChannels() {
  const t = useTranslations("Contact");
  const locale = useLocale() as "ar" | "en";
  const whatsappHref = `https://wa.me/${siteConfig.contact.whatsapp}`;

  return (
    <div className="relative z-10 mx-auto max-w-3xl px-6 pb-24">
      <div className="w-full">
        <div className="flex items-center gap-3 mb-6">
          <span className="h-px w-8 bg-brass/40" />
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-brass font-semibold">
            {t("channelsTitle")}
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {/* WhatsApp */}
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-none border-b border-brass/25 py-6 transition-all hover:border-brass group"
          >
            <span className="font-mono text-xs uppercase tracking-widest text-bone-muted group-hover:text-brass transition-colors">
              WhatsApp
            </span>
            <p className="mt-2 text-lg font-semibold text-bone" dir="ltr">
              {siteConfig.contact.phoneDisplay}
            </p>
          </a>

          {/* Email */}
          <a
            href={`mailto:${siteConfig.contact.email}`}
            className="rounded-none border-b border-brass/25 py-6 transition-all hover:border-brass group"
          >
            <span className="font-mono text-xs uppercase tracking-widest text-bone-muted group-hover:text-brass transition-colors">
              Email
            </span>
            <p className="mt-2 text-lg font-semibold text-bone" dir="ltr">
              {siteConfig.contact.email}
            </p>
          </a>
        </div>

        {/* Hours */}
        <p className="mt-6 font-mono text-xs text-bone-muted text-center sm:text-start">{t("hours")}</p>
      </div>
    </div>
  );
}

