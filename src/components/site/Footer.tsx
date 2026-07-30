"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { siteConfig } from "@/config/site";

export function Footer() {
  const t = useTranslations("Nav");
  const locale = useLocale() as "ar" | "en";
  const isAr = locale === "ar";
  const whatsappHref = `https://wa.me/${siteConfig.contact.whatsapp}`;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative z-20 border-t-2 border-brass/25 bg-ink-700">
      {/* ── Mini CTA ── */}
      <div className="border-b border-brass/20 bg-ink-800">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-6 py-14 sm:flex-row sm:justify-between">
          <div className="text-center sm:text-left">
            <p className="font-display text-xl font-semibold text-brass">
              {isAr ? "جاهز تبدأ مشروعك؟" : "Ready to start your project?"}
            </p>
            <p className="mt-1 text-sm text-bone-muted">
              {isAr
                ? "احكيلنا عن بيزنسك ونرجعلك بخطة واضحة وسعر واضح."
                : "Tell us about your business and we'll come back with a clear plan."}
            </p>
          </div>
          <div className="flex shrink-0 gap-3">
            <Link
              href="/contact"
              className="bg-brass px-6 py-3 font-mono text-xs font-semibold text-ink-900 transition-all hover:bg-brass-hi"
            >
              {t("contact")}
            </Link>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-brass/40 px-6 py-3 font-mono text-xs text-bone transition-colors hover:border-brass hover:text-brass"
            >
              {isAr ? "واتساب" : "WhatsApp"}
            </a>
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        {/* Brand column */}
        <div>
          <BrandLogo className="text-xl" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-bone-muted">
            {isAr
              ? "وكالة إبداعية ورقمية من قلب التجارة الحقيقية — نصنع العلامات، ونطلق الحملات، ونبني المتاجر."
              : "A creative & digital agency born from real commerce — we craft brands, launch campaigns, and build stores."}
          </p>
          <div className="mt-6 flex items-center gap-3">
            <span className="text-xs uppercase tracking-[0.2em] text-bone-muted/60">
              {isAr ? "تابعنا" : "Follow us"}
            </span>
            <span className="h-px flex-1 bg-brass/15" />
          </div>
          <div className="mt-4 flex gap-2">
            <SocialIcon href={siteConfig.social.instagram} label="Instagram">
              <InstagramIcon />
            </SocialIcon>
            <SocialIcon href={siteConfig.social.facebook} label="Facebook">
              <FacebookIcon />
            </SocialIcon>
            <SocialIcon href={whatsappHref} label="WhatsApp">
              <WhatsAppIcon />
            </SocialIcon>
          </div>
        </div>

        {/* Services & Products */}
        <div>
          <SectionLabel>{isAr ? "الخدمات" : "Services"}</SectionLabel>
          <ul className="mt-5 space-y-2.5 text-sm">
            {[{ href: "/services/marketing", label: t("marketing") }].map((l) => (
              <li key={l.href}>
                <FooterLink href={l.href}>{l.label}</FooterLink>
              </li>
            ))}
          </ul>
          <h4 className="mt-8 flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-bone-muted/70">
            <span className="h-px w-4 bg-brass/30" />
            {isAr ? "المنتجات" : "Products"}
          </h4>
          <ul className="mt-5 space-y-2.5 text-sm">
            {[
              { href: "/products/pos", label: t("pos") },
              { href: "/products/ecommerce", label: t("ecommerce") },
            ].map((l) => (
              <li key={l.href}>
                <FooterLink href={l.href}>{l.label}</FooterLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Company */}
        <div>
          <SectionLabel>{isAr ? "الشركة" : "Company"}</SectionLabel>
          <ul className="mt-5 space-y-2.5 text-sm">
            {[
              { href: "/projects", label: t("projects") },
              { href: "/faq", label: t("faq") },
              { href: "/contact", label: t("contact") },
            ].map((l) => (
              <li key={l.href}>
                <FooterLink href={l.href}>{l.label}</FooterLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <SectionLabel>{isAr ? "تواصل" : "Contact"}</SectionLabel>
          <ul className="mt-5 space-y-3 text-sm text-bone">
            <li className="flex items-start gap-2.5">
              <PinIcon />
              <span>{siteConfig.contact.location[locale]}</span>
            </li>
            <li>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 transition-colors hover:text-brass"
              >
                <PhoneIcon />
                {siteConfig.contact.phoneDisplay}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${siteConfig.contact.email}`}
                className="inline-flex items-center gap-2.5 transition-colors hover:text-brass"
              >
                <MailIcon />
                {siteConfig.contact.email}
              </a>
            </li>
          </ul>
          <p className="mt-4 font-mono text-xs text-bone-muted/60">
            {isAr ? "كل يوم، ٩ صباحاً – ١٠ مساءً" : "Every day, 9am – 10pm"}
          </p>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-brass/15 bg-ink-900 pb-14 sm:pb-0">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-5 text-xs text-bone-muted/70">
          <span>
            &copy; {new Date().getFullYear()} {siteConfig.shortName[locale]}
          </span>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="transition-colors hover:text-brass">
              {t("privacy")}
            </Link>
            <Link href="/terms" className="transition-colors hover:text-brass">
              {t("terms")}
            </Link>
            <span className="text-bone-muted/40">|</span>
            <span>{isAr ? "صُنع بعناية في مصر" : "Crafted with care in Egypt"}</span>
            <button
              type="button"
              onClick={scrollToTop}
              aria-label={isAr ? "العودة للأعلى" : "Back to top"}
              className="ml-2 flex h-7 w-7 items-center justify-center border border-brass/20 text-brass transition-colors hover:border-brass hover:bg-brass/10"
            >
              <ArrowUpIcon />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ── Sub-components ──────────────────────────────────────────── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-bone-muted/70">
      <span className="h-px w-4 bg-brass/30" />
      {children}
    </h4>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-1.5 text-bone transition-colors hover:text-brass"
    >
      <span className="h-px w-0 bg-brass transition-all duration-300 group-hover:w-3" />
      {children}
    </Link>
  );
}

function SocialIcon({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center border border-brass/15 text-bone-muted transition-all hover:border-brass hover:text-brass hover:bg-brass/10"
    >
      {children}
    </a>
  );
}

/* ── Inline SVG icons ────────────────────────────────────────── */

function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-brass/60">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-brass/60">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-brass/60">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function ArrowUpIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m18 15-6-6-6 6" />
    </svg>
  );
}
