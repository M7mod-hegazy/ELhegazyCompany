"use client";

import { useState, useId } from "react";
import { useTranslations, useLocale } from "next-intl";
import { siteConfig } from "@/config/site";

const SERVICE_KEYS = ["ads", "photo", "video", "identity", "store", "pos"] as const;
const BUDGET_KEYS = ["s", "m", "l", "xl"] as const;
const TIMING_KEYS = ["thismonth", "3months", "exploring"] as const;

type FormState = {
  name: string;
  contact: string;
  services: Set<string>;
  budget: string;
  timing: string;
  message: string;
};

type Errors = Partial<Record<"name" | "contact", string>>;

/**
 * ContactForm — Phase 6.
 *
 * Styled as an order slip: hairline-ruled column, dotted leaders, mono labels.
 * Submit opens WhatsApp with a pre-built message.
 * Validation is minimal: name required, contact must be an Egyptian mobile or email.
 *
 * No rounded inputs. No glassmorphism. No shadows.
 */
export function ContactForm() {
  const t = useTranslations("Contact");
  const locale = useLocale() as "ar" | "en";
  const id = useId();

  const [form, setForm] = useState<FormState>({
    name: "",
    contact: "",
    services: new Set(),
    budget: "",
    timing: "",
    message: "",
  });
  const [errors, setErrors] = useState<Errors>({});

  /* ── Validation ──────────────────────────────────────────────── */
  const validate = (): Errors => {
    const errs: Errors = {};
    if (!form.name.trim()) errs.name = t("errorName");
    // Egyptian mobile: starts with +20 or 01, 11 digits total
    const isEgyptianMobile = /^(?:\+?20|0)(10|11|12|15)\d{8}$/.test(
      form.contact.replace(/\s/g, "")
    );
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contact);
    if (!isEgyptianMobile && !isEmail) errs.contact = t("errorContact");
    return errs;
  };

  /* ── WhatsApp message builder ────────────────────────────────── */
  const buildMessage = () => {
    const serviceList = SERVICE_KEYS
      .filter((k) => form.services.has(k))
      .map((k) => t(`serviceOptions.${k}`))
      .join("، ");
    const budgetLabel = form.budget ? t(`budgetOptions.${form.budget as typeof BUDGET_KEYS[number]}`) : "—";
    const timingLabel = form.timing ? t(`timingOptions.${form.timing as typeof TIMING_KEYS[number]}`) : "—";

    return [
      `${t("name")}: ${form.name}`,
      `${t("contactField")}: ${form.contact}`,
      `${t("services")}: ${serviceList || "—"}`,
      `${t("budget")}: ${budgetLabel}`,
      `${t("timing")}: ${timingLabel}`,
      form.message ? `${t("message")}: ${form.message}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  };

  /* ── Submit ──────────────────────────────────────────────────── */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    const text = buildMessage();
    // Must be a real <a> click, not window.open — iOS Safari blocks async popup
    const url = `https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(text)}`;
    window.location.href = url;
  };

  const toggleService = (key: string) => {
    setForm((f) => {
      const next = new Set(f.services);
      if (next.has(key)) next.delete(key); else next.add(key);
      return { ...f, services: next };
    });
  };

  /* ── Render ─────────────────────────────────────────────────── */
  return (
    <div id="contact-form" className="relative mx-auto max-w-3xl px-6 py-16 scroll-mt-24">
      {/* Decorative ambient card glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-2 rounded-3xl opacity-50 blur-2xl"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(201,168,106,0.18) 0%, transparent 70%)",
        }}
      />

      <form
        onSubmit={handleSubmit}
        noValidate
        className="relative z-10 rounded-3xl border border-brass/25 bg-ink-800/70 p-8 sm:p-12 backdrop-blur-xl shadow-2xl"
        aria-label={t("formTitle")}
      >
        <div className="flex items-center gap-3 mb-6">
          <span className="h-px w-8 bg-brass/40" />
          <h2 className="text-2xl sm:text-3xl font-semibold text-bone font-display">{t("formTitle")}</h2>
        </div>

        {/* ── Name ── */}
        <FieldRow label={t("name")} htmlFor={`${id}-name`} error={errors.name}>
          <input
            id={`${id}-name`}
            type="text"
            autoComplete="name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full border-0 border-b border-brass/25 bg-transparent py-2.5 text-bone placeholder:text-bone-muted/40 focus:border-brass focus:outline-none transition-colors"
            placeholder="—"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? `${id}-name-err` : undefined}
          />
          {errors.name && (
            <p id={`${id}-name-err`} role="alert" className="mt-1 font-mono text-xs text-oxblood-tint">
              {errors.name}
            </p>
          )}
        </FieldRow>

        {/* ── Contact ── */}
        <FieldRow label={t("contactField")} htmlFor={`${id}-contact`} error={errors.contact}>
          <input
            id={`${id}-contact`}
            type="text"
            autoComplete="tel"
            inputMode="tel"
            value={form.contact}
            onChange={(e) => setForm((f) => ({ ...f, contact: e.target.value }))}
            className="w-full border-0 border-b border-brass/25 bg-transparent py-2.5 text-bone placeholder:text-bone-muted/40 focus:border-brass focus:outline-none transition-colors"
            placeholder="01xxxxxxxxx"
            aria-invalid={!!errors.contact}
            aria-describedby={errors.contact ? `${id}-contact-err` : undefined}
          />
          {errors.contact && (
            <p id={`${id}-contact-err`} role="alert" className="mt-1 font-mono text-xs text-oxblood-tint">
              {errors.contact}
            </p>
          )}
        </FieldRow>

        {/* ── Services (multi-select chips) ── */}
        <FieldRow label={t("services")} htmlFor="">
          <div role="group" aria-label={t("services")} className="flex flex-wrap gap-2 pt-1">
            {SERVICE_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => toggleService(key)}
                aria-pressed={form.services.has(key)}
                className={`rounded-full border px-4 py-2 font-mono text-xs transition-all ${
                  form.services.has(key)
                    ? "border-brass bg-brass text-ink-900 font-semibold"
                    : "border-brass/25 bg-ink-900/50 text-bone-muted hover:border-brass/60 hover:text-bone"
                }`}
              >
                {t(`serviceOptions.${key}`)}
              </button>
            ))}
          </div>
        </FieldRow>

        {/* ── Budget (single-select) ── */}
        <FieldRow label={t("budget")} htmlFor="">
          <div role="group" aria-label={t("budget")} className="flex flex-wrap gap-2 pt-1">
            {BUDGET_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setForm((f) => ({ ...f, budget: key }))}
                aria-pressed={form.budget === key}
                className={`rounded-full border px-4 py-2 font-mono text-xs transition-all ${
                  form.budget === key
                    ? "border-brass bg-brass text-ink-900 font-semibold"
                    : "border-brass/25 bg-ink-900/50 text-bone-muted hover:border-brass/60 hover:text-bone"
                }`}
              >
                {t(`budgetOptions.${key}`)}
              </button>
            ))}
          </div>
        </FieldRow>

        {/* ── Timing (single-select) ── */}
        <FieldRow label={t("timing")} htmlFor="">
          <div role="group" aria-label={t("timing")} className="flex flex-wrap gap-2 pt-1">
            {TIMING_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setForm((f) => ({ ...f, timing: key }))}
                aria-pressed={form.timing === key}
                className={`rounded-full border px-4 py-2 font-mono text-xs transition-all ${
                  form.timing === key
                    ? "border-brass bg-brass text-ink-900 font-semibold"
                    : "border-brass/25 bg-ink-900/50 text-bone-muted hover:border-brass/60 hover:text-bone"
                }`}
              >
                {t(`timingOptions.${key}`)}
              </button>
            ))}
          </div>
        </FieldRow>

        {/* ── Message (optional) ── */}
        <FieldRow label={t("message")} htmlFor={`${id}-msg`}>
          <textarea
            id={`${id}-msg`}
            rows={4}
            value={form.message}
            onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            className="w-full resize-none border-0 border-b border-brass/25 bg-transparent py-2.5 text-bone placeholder:text-bone-muted/40 focus:border-brass focus:outline-none transition-colors"
            placeholder="—"
          />
        </FieldRow>

        {/* Submit */}
        <div className="rule-seal my-8 w-full" />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between">
          <button
            type="submit"
            className="rounded-full bg-brass px-8 py-3.5 font-mono text-sm font-semibold text-ink-900 transition-all hover:bg-brass-hi hover:-translate-y-0.5"
          >
            {t("submit")}
          </button>
          <p className="font-mono text-xs text-bone-muted">{t("submitNote")}</p>
        </div>
      </form>
    </div>
  );
}

/* ── FieldRow ─────────────────────────────────────────────────────── */
function FieldRow({
  label,
  htmlFor,
  children,
  error,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <div className="relative border-t border-brass/10 py-5">
      <label
        htmlFor={htmlFor || undefined}
        className="mb-2 block font-mono text-xs uppercase tracking-[0.2em] text-bone-muted"
      >
        {label}
        {/* Dotted leader — pure CSS, no JS */}
        <span aria-hidden className="ms-2 text-brass/20">
          {"·".repeat(6)}
        </span>
      </label>
      {children}
    </div>
  );
}
