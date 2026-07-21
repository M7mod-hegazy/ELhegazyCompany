"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { m, AnimatePresence } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { LocaleToggle } from "./LocaleToggle";


export function Navbar() {
  const t = useTranslations("Nav");
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const onScroll = () => {
      el.classList.toggle("scrolled", window.scrollY > 24);
    };
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

  const links = [
    { href: "/services/marketing", label: t("marketing") },
    { href: "/products/pos", label: t("pos") },
    { href: "/products/ecommerce", label: t("ecommerce") },
    { href: "/work", label: t("work") },
  ];

  return (
    <>
      <header
        ref={headerRef}
        className="fixed inset-x-0 top-0 z-50 py-5 transition-all duration-500 [&.scrolled]:border-b [&.scrolled]:border-brass/10 [&.scrolled]:bg-ink-900/80 [&.scrolled]:py-3 [&.scrolled]:backdrop-blur-md"
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 sm:px-6">
          <Link href="/" aria-label="الحجازي">
            <BrandLogo className="text-base sm:text-lg" />
          </Link>

          <div className="hidden items-center gap-8 lg:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm text-bone-muted transition-colors duration-300 hover:text-brass"
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <LocaleToggle />
            <Link
              href="/start"
              className="hidden rounded-full bg-brass px-5 py-2 text-sm font-semibold text-ink-900 transition-colors duration-300 hover:bg-brass-hi sm:inline-block"
            >
              {t("start")}
            </Link>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="flex flex-col gap-[5px] p-1 lg:hidden"
              aria-label="menu"
            >
              <span className="h-[2px] w-6 bg-brass" />
              <span className="h-[2px] w-6 bg-brass" />
              <span className="h-[2px] w-4 bg-brass" />
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {open && (
          <m.div
            className="fixed inset-0 z-[90] flex flex-col bg-ink-900/97 backdrop-blur-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <div className="flex items-center justify-between px-5 py-5">
              <BrandLogo className="text-base" />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="close"
                className="relative h-8 w-8"
              >
                <span className="absolute left-1/2 top-1/2 h-[2px] w-6 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-brass" />
                <span className="absolute left-1/2 top-1/2 h-[2px] w-6 -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-brass" />
              </button>
            </div>
            <nav className="flex flex-1 flex-col items-start justify-center gap-6 px-8">
              {links.map((l, i) => (
                <m.div
                  key={l.href}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.06 }}
                >
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="font-display text-3xl font-semibold text-bone transition-colors hover:text-brass"
                  >
                    {l.label}
                  </Link>
                </m.div>
              ))}
              <Link
                href="/start"
                onClick={() => setOpen(false)}
                className="mt-6 rounded-full bg-brass px-8 py-3.5 text-sm font-semibold text-ink-900"
              >
                {t("start")}
              </Link>
            </nav>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
}
