"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { siteConfig } from "@/config/site";
import { getWorld } from "@/config/worlds";

/* ── back-to-top brass orb with a scroll-progress ring (#9) ── */
export function BackToTop() {
  const [p, setP] = useState(0);
  const [show, setShow] = useState(false);
  useEffect(() => {
    const on = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const y = window.scrollY;
      setP(h > 0 ? y / h : 0);
      setShow(y > window.innerHeight * 0.8);
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  const R = 20;
  const C = 2 * Math.PI * R;
  return (
    <button
      type="button"
      aria-label="Top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      data-cursor
      className={`fixed bottom-24 z-40 grid h-12 w-12 place-items-center rounded-full border border-brass/30 bg-ink-900/70 backdrop-blur-sm transition-all duration-500 ltr:right-6 rtl:left-6 ${show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"}`}
    >
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r={R} fill="none" stroke="var(--world-accent,#C9A86A)" strokeOpacity="0.9" strokeWidth="2" strokeDasharray={C} strokeDashoffset={C * (1 - p)} strokeLinecap="round" />
      </svg>
      <span className="text-brass">↑</span>
    </button>
  );
}

/* ── floating WhatsApp orb with a pulse (#48) ── */
export function WhatsAppOrb({ worldKey }: { worldKey: string }) {
  const locale = useLocale();
  void worldKey;
  const msg = encodeURIComponent(
    locale === "ar"
      ? "مرحبًا، مهتم بنظام نقاط البيع من الحجازي — ممكن تفاصيل؟"
      : "Hi, I'm interested in the ElHegazi POS system — can I get details?",
  );
  return (
    <a
      href={`https://wa.me/${siteConfig.contact.whatsapp}?text=${msg}`}
      target="_blank"
      rel="noopener noreferrer"
      data-cursor
      aria-label="WhatsApp"
      className="group fixed bottom-6 z-40 grid h-14 w-14 place-items-center rounded-full border border-brass/40 bg-ink-900/80 backdrop-blur-sm ltr:right-6 rtl:left-6"
    >
      <span aria-hidden className="absolute inset-0 rounded-full border border-brass/40" style={{ animation: "pulseRing 2.4s ease-out infinite" }} />
      <svg viewBox="0 0 24 24" className="h-6 w-6 fill-brass transition-transform duration-300 group-hover:scale-110">
        <path d="M17.5 14.4c-.3-.2-1.7-.9-2-1-.3-.1-.5-.2-.7.1-.2.3-.7 1-.9 1.2-.2.2-.3.2-.6.1-1.6-.8-2.7-1.5-3.7-3.3-.3-.5.3-.5.8-1.5.1-.2 0-.4 0-.5s-.7-1.6-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.2 5.1 4.5 1.9.8 2.6.9 3.5.8.6-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3zM12 2a10 10 0 0 0-8.6 15l-1.3 4.8 4.9-1.3A10 10 0 1 0 12 2z" />
      </svg>
    </a>
  );
}

/* ── sticky mini-CTA bar after ~40% scroll (#47) ── */
export function StickyCTA({ worldKey }: { worldKey: string }) {
  const t = useTranslations("CTA");
  const tc = useTranslations("Common");
  const locale = useLocale();
  const dlPage = `/${locale}${getWorld(worldKey)?.href ?? ""}/download`;
  const [show, setShow] = useState(false);
  useEffect(() => {
    const on = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const p = h > 0 ? window.scrollY / h : 0;
      setShow(p > 0.4 && p < 0.94);
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <div
      className={`fixed bottom-6 left-1/2 z-40 -translate-x-1/2 transition-all duration-500 ${show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"}`}
    >
      <div className="flex items-center gap-3 rounded-full border border-brass/25 bg-ink-900/85 px-3 py-2 backdrop-blur-md">
        <span className="ps-3 text-sm text-bone-muted max-sm:hidden">{t("subtitle")}</span>
        <a href="#pricing" data-cursor className="rounded-full border border-brass/30 px-4 py-2 text-sm font-semibold text-bone transition-colors hover:border-brass hover:text-brass max-sm:hidden">
          {tc("pricing")}
        </a>
        <a href={dlPage} data-cursor className="rounded-full bg-brass px-5 py-2 text-sm font-semibold text-ink-900 transition-colors hover:bg-brass-hi">
          {tc("download")}
        </a>
      </div>
    </div>
  );
}

/* ── right-side scroll dots that track the page's sections (#6) ── */
export function WorldRail() {
  const [items, setItems] = useState<{ top: number }[]>([]);
  const [active, setActive] = useState(0);
  useEffect(() => {
    const main = document.querySelector("main");
    if (!main) return;
    const secs = Array.from(main.querySelectorAll(":scope > section, :scope > *[data-worldsection]"));
    const recalc = () => setItems(secs.map((s) => ({ top: (s as HTMLElement).offsetTop })));
    recalc();
    const on = () => {
      const mid = window.scrollY + window.innerHeight / 2;
      let idx = 0;
      secs.forEach((s, i) => {
        if ((s as HTMLElement).offsetTop <= mid) idx = i;
      });
      setActive(idx);
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", recalc);
    return () => {
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", recalc);
    };
  }, []);
  if (items.length < 3) return null;
  return (
    <div className="fixed top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-2.5 ltr:right-5 rtl:left-5 lg:flex">
      {items.map((it, i) => (
        <button
          key={i}
          type="button"
          aria-label={`Section ${i + 1}`}
          onClick={() => window.scrollTo({ top: it.top, behavior: "smooth" })}
          className="grid place-items-center"
          data-cursor
        >
          <span
            className="block rounded-full transition-all duration-300"
            style={{
              width: active === i ? 10 : 6,
              height: active === i ? 10 : 6,
              background: active === i ? "var(--world-accent,#C9A86A)" : "rgba(163,156,142,0.4)",
            }}
          />
        </button>
      ))}
    </div>
  );
}
