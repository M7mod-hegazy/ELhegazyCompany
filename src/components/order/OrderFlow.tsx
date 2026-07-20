"use client";

import { useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { brand } from "@/lib/brand";
import { cn } from "@/lib/cn";
import { siteConfig } from "@/config/site";
import { catalog, type ProductKey } from "@/config/catalog";
import { createOrder } from "@/app/actions/order";

/**
 * The single-page checkout: pick a plan, leave your details, get an order
 * reference + a prefilled WhatsApp hand-off. Payment stays human (Instapay /
 * Vodafone Cash / bank transfer over WhatsApp) — the order record in MongoDB
 * is what the admin dashboard works from.
 */
export function OrderFlow({
  product,
  initialPlan,
}: {
  product: ProductKey;
  initialPlan: string;
}) {
  const t = useTranslations("Order");
  const tc = useTranslations("Catalog");
  const locale = useLocale();

  const [plan, setPlan] = useState(initialPlan);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [business, setBusiness] = useState("");
  const [city, setCity] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const [ref, setRef] = useState<string | null>(null);

  const plans = catalog[product].plans;
  const planDef = plans.find((p) => p.id === plan) ?? plans[0];
  const productName = tc(`${product}.name`);
  const planName = tc(`${product}.plans.${planDef.id}.name`);
  const planPrice = tc(`${product}.plans.${planDef.id}.price`);

  const waText = encodeURIComponent(
    [
      locale === "ar" ? "السلام عليكم، أكّدت طلبي من الموقع:" : "Hello, I placed an order on the website:",
      `${t("refLabel")}: ${ref ?? ""}`,
      `${productName} — ${planName} (${planPrice})`,
      name && `${t("name")}: ${name}`,
      business && `${t("business")}: ${business}`,
      city && `${t("city")}: ${city}`,
    ]
      .filter(Boolean)
      .join("\n"),
  );
  const waHref = `https://wa.me/${siteConfig.contact.whatsapp}?text=${waText}`;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setError(true);
      return;
    }
    setError(false);
    setBusy(true);
    const res = await createOrder({
      product,
      plan: planDef.id,
      name,
      phone,
      business,
      city,
      notes,
      locale,
    });
    setBusy(false);
    setRef(res.ref);
  }

  return (
    <AnimatePresence mode="wait">
      {ref === null ? (
        <m.div
          key="form"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.6, ease: brand.ease.cinematic }}
        >
          <p className="text-xs uppercase tracking-[0.35em] text-brass">{productName}</p>
          <h1 className="font-display mt-3 text-4xl font-semibold text-bone sm:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-4 max-w-xl text-bone-muted">{t("subtitle")}</p>

          <form onSubmit={submit} className="mt-12 grid gap-10 lg:grid-cols-[1.1fr_1fr]">
            {/* plan picker */}
            <fieldset>
              <legend className="mb-4 text-sm font-semibold text-bone">{t("plan")}</legend>
              <div className="grid gap-4">
                {plans.map((p) => {
                  const selected = p.id === planDef.id;
                  return (
                    <label
                      key={p.id}
                      className={cn(
                        "flex cursor-pointer items-start justify-between gap-4 rounded-2xl border p-5 transition-all duration-300",
                        selected
                          ? "border-brass bg-ink-800/80 shadow-[0_20px_60px_-30px_rgba(201,168,106,0.35)]"
                          : "border-brass/15 bg-ink-800/40 hover:border-brass/40",
                      )}
                    >
                      <input
                        type="radio"
                        name="plan"
                        value={p.id}
                        checked={selected}
                        onChange={() => setPlan(p.id)}
                        className="sr-only"
                      />
                      <span>
                        <span className="flex items-center gap-2">
                          <span className="font-semibold text-bone">
                            {tc(`${product}.plans.${p.id}.name`)}
                          </span>
                          {p.featured && (
                            <span className="rounded-full bg-brass px-2.5 py-0.5 text-[0.6rem] font-bold text-ink-900">
                              {t("recommended")}
                            </span>
                          )}
                        </span>
                        <span className="mt-1 block text-sm text-bone-muted">
                          {tc(`${product}.plans.${p.id}.note`)}
                        </span>
                      </span>
                      <span className="shrink-0 font-display text-xl font-bold text-brass">
                        {tc(`${product}.plans.${p.id}.price`)}
                      </span>
                    </label>
                  );
                })}
              </div>

              <div className="mt-8 rounded-2xl border border-brass/10 bg-ink-800/30 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-bone-muted">{t("payTitle")}</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {(t.raw("payMethods") as string[]).map((m) => (
                    <li
                      key={m}
                      className="rounded-full border border-brass/20 px-3.5 py-1.5 text-xs text-bone"
                    >
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
            </fieldset>

            {/* details */}
            <div className="flex flex-col gap-4">
              <Field label={t("name")} required>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputCls}
                  autoComplete="name"
                />
              </Field>
              <Field label={t("phone")} required>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={inputCls}
                  inputMode="tel"
                  dir="ltr"
                  autoComplete="tel"
                />
              </Field>
              <Field label={t("business")}>
                <input
                  value={business}
                  onChange={(e) => setBusiness(e.target.value)}
                  className={inputCls}
                  placeholder={t("businessPh")}
                />
              </Field>
              <Field label={t("city")}>
                <input value={city} onChange={(e) => setCity(e.target.value)} className={inputCls} />
              </Field>
              <Field label={t("notes")}>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className={cn(inputCls, "resize-none")}
                  placeholder={t("notesPh")}
                />
              </Field>

              {error && <p className="text-sm text-oxblood-tint">{t("required")}</p>}

              <button
                type="submit"
                disabled={busy}
                data-cursor
                className="mt-2 rounded-full bg-brass px-8 py-4 text-sm font-semibold text-ink-900 transition-all duration-300 hover:-translate-y-0.5 hover:bg-brass-hi disabled:opacity-60"
              >
                {busy ? t("submitting") : t("submit")}
              </button>
              <p className="text-center text-xs text-bone-muted">{t("afterNote")}</p>
            </div>
          </form>
        </m.div>
      ) : (
        <m.div
          key="done"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: brand.ease.cinematic }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-xs uppercase tracking-[0.35em] text-brass">{t("confirmedKicker")}</p>
          <h1 className="font-display mt-4 text-4xl font-semibold text-bone sm:text-5xl">
            {t("confirmedTitle")}
          </h1>

          <div className="mx-auto mt-8 inline-flex items-baseline gap-3 rounded-2xl border border-brass/30 bg-ink-800/60 px-8 py-5">
            <span className="text-sm text-bone-muted">{t("refLabel")}</span>
            <span className="font-display text-3xl font-bold tracking-wider text-brass" dir="ltr">
              {ref}
            </span>
          </div>

          <div className="mt-10 text-start">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-bone-muted">
              {t("nextTitle")}
            </p>
            <ol className="mt-4 space-y-4">
              {(t.raw("steps") as string[]).map((s, i) => (
                <li key={s} className="flex items-start gap-4">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-brass/40 font-display text-sm font-bold text-brass">
                    {i + 1}
                  </span>
                  <span className="pt-1 text-bone">{s}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor
              className="rounded-full bg-brass px-8 py-4 text-sm font-semibold text-ink-900 transition-all duration-300 hover:-translate-y-0.5 hover:bg-brass-hi"
            >
              {t("waCta")}
            </a>
            {planDef.download && (
              <Link
                href={`/products/${product}/download`}
                className="rounded-full border border-brass/40 px-8 py-4 text-sm font-semibold text-bone transition-colors hover:border-brass hover:text-brass"
              >
                {t("dlCta")}
              </Link>
            )}
            <Link href="/" className="text-sm text-bone-muted transition-colors hover:text-brass">
              {t("backHome")}
            </Link>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}

const inputCls =
  "w-full rounded-xl border border-brass/15 bg-ink-800/60 px-4 py-3 text-bone placeholder:text-bone-muted/50 outline-none transition-colors focus:border-brass";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-bone">
        {label}
        {required && <span className="text-brass"> *</span>}
      </span>
      {children}
    </label>
  );
}
