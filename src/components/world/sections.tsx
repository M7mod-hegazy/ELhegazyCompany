"use client";

import { m } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { brand } from "@/lib/brand";

/* ── #50 "ليه الحجازي" trust strip ── */
export function TrustStrip({ worldKey }: { worldKey: string }) {
  const t = useTranslations(`Worlds.${worldKey}`);
  const items = t.raw("trust") as { t: string; d: string }[];
  const glyph = ["ع", "⚡", "★", "◇"];
  return (
    <section className="relative mx-auto max-w-6xl px-6 py-20">
      <p className="text-center text-xs uppercase tracking-[0.35em] text-brass">{t("trustKicker")}</p>
      <h2 className="font-display mx-auto mt-4 max-w-2xl text-center text-3xl font-semibold text-bone sm:text-4xl">{t("trustTitle")}</h2>
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((it, i) => (
          <m.div
            key={it.t}
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: i * 0.08, ease: brand.ease.cinematic }}
            className="rounded-2xl border border-brass/12 bg-ink-800/50 p-6"
          >
            <span className="grid h-11 w-11 place-items-center rounded-xl border border-brass/25 bg-ink-900/60 font-display text-lg text-brass" style={{ boxShadow: "inset 0 0 20px -10px var(--world-accent)" }}>{glyph[i % 4]}</span>
            <h3 className="font-display mt-4 text-lg font-semibold text-bone">{it.t}</h3>
            <p className="mt-2 text-sm leading-relaxed text-bone-muted">{it.d}</p>
          </m.div>
        ))}
      </div>
    </section>
  );
}

/* ── #14 big-numbers reveal ── */
export function BigNumbers({ worldKey }: { worldKey: string }) {
  const t = useTranslations(`Worlds.${worldKey}`);
  const nums = t.raw("bigNums") as { v: string; l: string }[];
  return (
    <section className="relative overflow-hidden py-24">
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ background: "radial-gradient(60% 60% at 50% 50%, color-mix(in oklab, var(--world-accent,#C9A86A) 10%, transparent), transparent 70%)" }}
      />
      <div className="relative mx-auto grid max-w-6xl gap-10 px-6 sm:grid-cols-2 lg:grid-cols-4">
        {nums.map((n, i) => (
          <m.div
            key={n.l}
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: i * 0.1, ease: brand.ease.cinematic }}
            className="text-center"
          >
            <div className="font-display text-6xl font-bold sm:text-7xl" style={{ color: "var(--world-accent)" }}>{n.v}</div>
            <div className="mt-3 text-sm text-bone-muted">{n.l}</div>
          </m.div>
        ))}
      </div>
    </section>
  );
}

/* ── #25 comparison table ── */
export function CompareTable({ worldKey }: { worldKey: string }) {
  const t = useTranslations(`Worlds.${worldKey}`);
  const rows = t.raw("compareRows") as string[];
  return (
    <section className="relative mx-auto max-w-4xl px-6 py-24">
      <p className="text-center text-xs uppercase tracking-[0.35em] text-brass">{t("compareKicker")}</p>
      <h2 className="font-display mx-auto mt-4 max-w-2xl text-center text-3xl font-semibold text-bone sm:text-4xl">{t("compareTitle")}</h2>
      <div className="mt-12 overflow-hidden rounded-2xl border border-brass/15">
        <div className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b border-brass/15 bg-ink-800/60 px-5 py-4 text-sm">
          <span className="text-bone-muted">{t("compareFeature")}</span>
          <span className="w-24 text-center font-display font-semibold text-brass">{t("compareUs")}</span>
          <span className="w-24 text-center text-bone-muted">{t("compareThem")}</span>
        </div>
        {rows.map((r, i) => (
          <m.div
            key={r}
            initial={{ opacity: 0, x: -14 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.45, delay: i * 0.05, ease: brand.ease.cinematic }}
            className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b border-brass/8 px-5 py-4 text-sm last:border-0 odd:bg-ink-900/30"
          >
            <span className="text-bone">{r}</span>
            <span className="grid w-24 place-items-center">
              <span className="grid h-6 w-6 place-items-center rounded-full text-ink-900" style={{ background: "var(--world-accent)" }}>✓</span>
            </span>
            <span className="grid w-24 place-items-center text-bone-muted/50">✕</span>
          </m.div>
        ))}
      </div>
    </section>
  );
}

/* ── #39 editorial pull-quote ── */
export function PullQuote({ worldKey, id }: { worldKey: string; id: string }) {
  const t = useTranslations(`Worlds.${worldKey}`);
  return (
    <section className="relative mx-auto max-w-4xl px-6 py-24 text-center">
      <span className="font-display block text-7xl leading-none text-brass/30">”</span>
      <m.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, ease: brand.ease.cinematic }}
        className="font-display -mt-6 text-3xl font-semibold leading-snug text-bone sm:text-4xl lg:text-5xl"
      >
        {t(id)}
      </m.p>
    </section>
  );
}

/* ── #31 EKG spark divider ── */
export function SparkDivider() {
  return (
    <div className="relative mx-auto my-4 h-8 w-full max-w-3xl px-6 opacity-70">
      <svg viewBox="0 0 600 24" className="h-full w-full" preserveAspectRatio="none" fill="none">
        <path d="M0 12 H240 l12 -9 12 18 12 -14 10 5 H600" stroke="var(--world-accent,#C9A86A)" strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

/* ── #30 capability wheel ── */
const WHEEL_AR = ["نقطة بيع", "خزينة", "مخزون", "تقارير", "واتساب", "أقساط", "موردين", "فروع", "ضريبة", "رواتب", "شيكات", "ولاء", "باركود", "أوفلاين"];
const WHEEL_EN = ["POS", "Treasury", "Stock", "Reports", "WhatsApp", "Installments", "Suppliers", "Branches", "VAT", "Payroll", "Cheques", "Loyalty", "Barcode", "Offline"];

const WHEEL_POSITIONS = WHEEL_AR.map((_, i) => {
  const a = (i / WHEEL_AR.length) * Math.PI * 2 - Math.PI / 2;
  const R = 46;
  return { left: Math.round((50 + Math.cos(a) * R) * 100) / 100, top: Math.round((50 + Math.sin(a) * R) * 100) / 100 };
});

export function CapabilityWheel({ worldKey }: { worldKey: string }) {
  const t = useTranslations(`Worlds.${worldKey}`);
  const locale = useLocale();
  const chips = locale === "ar" ? WHEEL_AR : WHEEL_EN;
  return (
    <section className="relative overflow-hidden py-24">
      <div className="mx-auto mb-4 max-w-3xl px-6 text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-brass">{t("wheelKicker")}</p>
        <h2 className="font-display mt-3 text-3xl font-semibold text-bone sm:text-5xl">{t("wheelTitle")}</h2>
      </div>
      <div className="relative mx-auto mt-10 aspect-square w-full max-w-[560px]">
        {/* rotating highlight */}
        <m.div
          aria-hidden
          className="absolute inset-8 rounded-full"
          style={{ background: "conic-gradient(from 0deg, transparent, color-mix(in oklab, var(--world-accent,#C9A86A) 30%, transparent), transparent 40%)" }}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 22, ease: "linear" }}
        />
        <div className="absolute inset-16 rounded-full border border-brass/15" />
        <div className="absolute inset-8 rounded-full border border-brass/10" />
        {/* center */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
          <div className="font-display text-4xl font-bold text-brass">١</div>
          <div className="text-xs text-bone-muted">{t("wheelCenter")}</div>
        </div>
        {/* chips */}
        {chips.map((c, i) => {
          const pos = WHEEL_POSITIONS[i];
          return (
            <span
              key={c}
              className="wheel-chip absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-brass/20 bg-ink-900/70 px-3 py-1.5 text-xs text-bone opacity-0 scale-[0.6] backdrop-blur-sm animate-wheel-chip-in"
              style={{ left: `${pos.left}%`, top: `${pos.top}%`, animationDelay: `${i * 40}ms` }}
            >
              {c}
            </span>
          );
        })}
      </div>
    </section>
  );
}
