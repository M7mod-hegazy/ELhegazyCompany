"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { m, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { Link, usePathname } from "@/i18n/navigation";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { LocaleToggle } from "./LocaleToggle";
import { siteConfig } from "@/config/site";

const LINKS = [
  { href: "/services/marketing", key: "marketing" },
  { href: "/products/pos", key: "pos" },
  { href: "/products/ecommerce", key: "ecommerce" },
  { href: "/projects", key: "projects" },
  { href: "/contact", key: "contact" },
] as const;

/**
 * Navbar.
 *
 * Rebuilt for three reasons the old bar felt unsteady:
 *
 *  - It animated `py` on scroll, so the whole bar changed height and every link
 *    inside it shifted vertically as you scrolled. Now the bar height is fixed
 *    and only the surface behind it changes.
 *  - `backdrop-blur-lg` on the mobile sheet and `rounded-full` on the CTA both
 *    break the locked design rules (no glass, no radius except the seal).
 *  - There was no active-route indication anywhere, so the nav never told you
 *    where you were.
 *
 * The scroll-progress hairline is part of the bar rather than a separate fixed
 * element, so there is one line at the top of the page instead of two.
 */
export function Navbar() {
  const t = useTranslations("Nav");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll();

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (progressRef.current) progressRef.current.style.transform = `scaleX(${p})`;
  });

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const onScroll = () => el.classList.toggle("scrolled", window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const waHref = `https://wa.me/${siteConfig.contact.whatsapp}`;

  return (
    <>
      <header
        ref={headerRef}
        className="fixed inset-x-0 top-0 z-50 h-[72px] border-b border-transparent transition-colors duration-300 [&.scrolled]:border-brass/12 [&.scrolled]:bg-ink-900/95"
      >
        {/* Scroll progress — the bar's own bottom hairline, filling left to right. */}
        <div
          ref={progressRef}
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-px origin-[left] bg-brass"
          style={{ transform: "scaleX(0)" }}
        />

        <nav className="mx-auto flex h-full max-w-7xl items-center justify-between px-5 sm:px-6">
          <Link href="/" aria-label={siteConfig.shortName.ar} className="shrink-0">
            <BrandLogo className="text-base sm:text-lg" />
          </Link>

          <div className="hidden items-center gap-7 lg:flex">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                data-active={isActive(l.href)}
                aria-current={isActive(l.href) ? "page" : undefined}
                className="nav-link text-sm text-bone-muted transition-colors duration-300 hover:text-bone data-[active=true]:text-bone"
              >
                {t(l.key)}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <LocaleToggle />
            <Link
              href="/contact"
              className="hidden bg-brass px-5 py-2.5 font-mono text-xs font-semibold text-ink-900 transition-colors duration-300 hover:bg-brass-hi sm:inline-block"
            >
              {t("start")}
            </Link>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="flex flex-col items-end gap-[5px] p-1 lg:hidden"
              aria-label={t("contact")}
              aria-expanded={open}
            >
              <span className="h-[2px] w-6 bg-brass" />
              <span className="h-[2px] w-6 bg-brass" />
              <span className="h-[2px] w-4 bg-brass" />
            </button>
          </div>
        </nav>
      </header>

      {/* ── Mobile sheet — solid ink, no glass, hairline-ruled rows. ── */}
      <AnimatePresence>
        {open && (
          <m.div
            className="fixed inset-0 z-[90] flex flex-col bg-ink-900 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-brass/12 px-5">
              <BrandLogo className="text-base" />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="close"
                className="relative h-9 w-9"
              >
                <span className="absolute left-1/2 top-1/2 h-[2px] w-6 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-brass" />
                <span className="absolute left-1/2 top-1/2 h-[2px] w-6 -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-brass" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto">
              {LINKS.map((l, i) => (
                <m.div
                  key={l.href}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.06 + i * 0.045, duration: 0.35 }}
                >
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="flex items-baseline justify-between border-b border-brass/10 px-6 py-5 text-2xl font-semibold text-bone transition-colors hover:text-brass"
                  >
                    {t(l.key)}
                    {isActive(l.href) && (
                      <span aria-hidden className="seal-round h-1.5 w-1.5 bg-brass" />
                    )}
                  </Link>
                </m.div>
              ))}
            </nav>

            <div className="shrink-0 border-t border-brass/12 p-5">
              <Link
                href="/contact"
                onClick={() => setOpen(false)}
                className="block bg-brass py-4 text-center font-mono text-sm font-semibold text-ink-900"
              >
                {t("start")}
              </Link>
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 block border border-bone/25 py-4 text-center font-mono text-sm text-bone"
              >
                WhatsApp
              </a>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
}
