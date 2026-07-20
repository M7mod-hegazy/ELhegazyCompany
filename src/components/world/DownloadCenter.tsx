"use client";

import { m } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { brand } from "@/lib/brand";
import { cn } from "@/lib/cn";
import { siteConfig } from "@/config/site";
import { getWorld } from "@/config/worlds";

/**
 * Clear download page: Trial (free) vs Full version. Each download button uses
 * the installer URL from siteConfig.downloads.<key>; if it's empty, the button
 * becomes a specific WhatsApp request so there are never dead links. The full
 * version also always offers a "request your license" WhatsApp with a prefilled,
 * specific message.
 */
export function DownloadCenter({ worldKey }: { worldKey: string }) {
  const t = useTranslations(`Worlds.${worldKey}.dl`);
  const locale = useLocale();
  const ar = locale === "ar";
  const urls = siteConfig.downloads[worldKey] ?? { preview: "", full: "" };
  const backHref = getWorld(worldKey)?.href ?? "/";

  const wa = (msg: string) => `https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(msg)}`;
  const waPreview = wa(ar ? "السلام عليكم، ممكن رابط تحميل النسخة التجريبية من نظام نقاط البيع (الحجازي)؟" : "Hello, can I get the trial download link for the ElHegazi POS system?");
  const orderHref = `/${locale}/order?product=${worldKey}&plan=full`;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="text-center">
        <h1 className="font-display text-4xl font-semibold text-bone sm:text-6xl">{t("title")}</h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-bone-muted">{t("subtitle")}</p>
        <p className="mt-4 text-sm text-brass">{t("requirements")}</p>
      </div>

      <div className="mt-14 grid items-stretch gap-6 md:grid-cols-2">
        {/* Trial */}
        <m.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: brand.ease.cinematic }}
          className="flex flex-col rounded-3xl border border-brass/15 bg-ink-800/50 p-8"
        >
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-bone-muted">{t("preview.name")}</span>
          <div className="mt-3 font-display text-5xl font-bold text-bone">{t("preview.price")}</div>
          <p className="mt-3 text-sm text-bone-muted">{t("preview.desc")}</p>
          <ul className="mt-6 flex-1 space-y-3">
            {(t.raw("preview.features") as string[]).map((f) => (
              <li key={f} className="flex items-center gap-3 text-sm text-bone">
                <Dot muted /> {f}
              </li>
            ))}
          </ul>
          <a
            href={urls.preview || waPreview}
            {...(urls.preview ? { download: true } : { target: "_blank", rel: "noopener noreferrer" })}
            data-cursor
            className="mt-8 rounded-full border border-brass/40 px-6 py-3.5 text-center text-sm font-semibold text-bone transition-colors hover:border-brass hover:text-brass"
          >
            {urls.preview ? t("preview.cta") : t("preview.waCta")}
          </a>
        </m.div>

        {/* Full */}
        <m.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: brand.ease.cinematic }}
          className="relative flex flex-col overflow-hidden rounded-3xl border p-8 md:scale-[1.03]"
          style={{
            borderColor: "color-mix(in oklab, var(--world-accent,#C9A86A) 55%, transparent)",
            background: "linear-gradient(180deg, color-mix(in oklab, var(--world-accent,#C9A86A) 10%, #141416), #0A0A0B)",
            boxShadow: "0 40px 100px -50px rgba(0,0,0,0.95)",
          }}
        >
          <span className="absolute end-6 top-6 rounded-full px-3 py-1 text-[0.62rem] font-bold text-ink-900" style={{ background: "var(--world-accent)" }}>
            {t("full.badge")}
          </span>
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-brass">{t("full.name")}</span>
          <div className="mt-3 font-display text-5xl font-bold" style={{ color: "var(--world-accent)" }}>{t("full.price")}</div>
          <p className="mt-2 text-sm text-bone-muted">{t("full.priceNote")}</p>
          <p className="mt-3 text-sm text-bone-muted">{t("full.desc")}</p>
          <ul className="mt-6 flex-1 space-y-3">
            {(t.raw("full.features") as string[]).map((f) => (
              <li key={f} className="flex items-center gap-3 text-sm text-bone">
                <Dot /> {f}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-col gap-3">
            {urls.full && (
              <a href={urls.full} download data-cursor className="rounded-full bg-brass px-6 py-3.5 text-center text-sm font-semibold text-ink-900 transition-all duration-300 hover:-translate-y-0.5 hover:bg-brass-hi">
                {t("full.cta")}
              </a>
            )}
            <a
              href={orderHref}
              data-cursor
              className={cn(
                "rounded-full px-6 py-3.5 text-center text-sm font-semibold transition-all duration-300",
                urls.full
                  ? "border border-brass/40 text-bone hover:border-brass hover:text-brass"
                  : "bg-brass text-ink-900 hover:-translate-y-0.5 hover:bg-brass-hi",
              )}
            >
              {t("full.waCta")}
            </a>
          </div>
        </m.div>
      </div>

      <div className="mt-10 text-center">
        <Link href={backHref} className="text-sm text-bone-muted transition-colors hover:text-brass">
          ← {t("back")}
        </Link>
      </div>
    </div>
  );
}

function Dot({ muted }: { muted?: boolean }) {
  return (
    <span
      className={cn("grid h-5 w-5 shrink-0 place-items-center rounded-full text-[0.7rem]", muted ? "bg-brass/15 text-brass" : "text-ink-900")}
      style={muted ? undefined : { background: "var(--world-accent)" }}
    >
      ✓
    </span>
  );
}
