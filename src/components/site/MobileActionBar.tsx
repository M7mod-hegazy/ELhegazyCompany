"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { m, AnimatePresence } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { siteConfig } from "@/config/site";

/**
 * MobileActionBar — a persistent way to act, on phones.
 *
 * Below 640px the header CTA is hidden and the next call to action is at the
 * very bottom of the page. On the home page that is roughly 7,000px of scrolling
 * with no way to contact anyone. This bar appears once the hero has left, so it
 * never covers the hero's own buttons.
 *
 * Two cells, hairline-divided, solid ink — same rules as everything else: no
 * radius, no blur.
 */
export function MobileActionBar() {
  const t = useTranslations("Home");
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 0.9);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const waHref = `https://wa.me/${siteConfig.contact.whatsapp}`;

  return (
    <AnimatePresence>
      {show && (
        <m.div
          key="action-bar"
          className="fixed inset-x-0 bottom-0 z-[60] grid grid-cols-2 border-t border-brass/20 bg-ink-900 sm:hidden"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        >
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="border-e border-brass/20 py-4 text-center font-mono text-xs text-bone"
          >
            {t("ctaWhatsapp")}
          </a>
          <Link
            href="/contact"
            className="bg-brass py-4 text-center font-mono text-xs font-semibold text-ink-900"
          >
            {t("cta")}
          </Link>
        </m.div>
      )}
    </AnimatePresence>
  );
}
