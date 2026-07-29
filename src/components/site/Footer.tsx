"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { siteConfig } from "@/config/site";

export function Footer() {
  const t = useTranslations("Nav");
  const tf = useTranslations("Footer");
  const locale = useLocale() as "ar" | "en";
  const whatsappHref = `https://wa.me/${siteConfig.contact.whatsapp}`;

  return (
    <footer className="border-t border-brass/10 bg-ink-900">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <BrandLogo className="text-xl" />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-bone-muted">
            {tf("blurb")}
          </p>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-[0.25em] text-bone-muted/70">
            {tf("explore")}
          </h4>
          <ul className="mt-4 space-y-2 text-sm">
            {[
              { href: "/services/marketing", label: t("marketing") },
              { href: "/products/pos", label: t("pos") },
              { href: "/products/ecommerce", label: t("ecommerce") },
              { href: "/projects", label: t("projects") },
              { href: "/faq", label: t("faq") },
              { href: "/contact", label: t("contact") },
            ].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-bone transition-colors hover:text-brass">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-[0.25em] text-bone-muted/70">
            {tf("contact")}
          </h4>
          <ul className="mt-4 space-y-2 text-sm text-bone">
            <li>
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-brass">
                WhatsApp
              </a>
            </li>
            <li>
              <a href={`mailto:${siteConfig.contact.email}`} className="transition-colors hover:text-brass">
                {siteConfig.contact.email}
              </a>
            </li>
            <li>
              <a href={siteConfig.social.instagram} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-brass">
                Instagram
              </a>
            </li>
            <li>
              <a href={siteConfig.social.facebook} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-brass">
                Facebook
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* pb clears the mobile action bar, which is fixed to the bottom edge. */}
      <div className="border-t border-brass/10 pb-14 sm:pb-0">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-6 text-xs text-bone-muted/70">
          <span>
            © {new Date().getFullYear()} {siteConfig.shortName[locale]}
          </span>
          <span className="flex items-center gap-4">
            <Link href="/privacy" className="transition-colors hover:text-brass">
              {t("privacy")}
            </Link>
            <Link href="/terms" className="transition-colors hover:text-brass">
              {t("terms")}
            </Link>
            <span>{tf("madeBy")}</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
