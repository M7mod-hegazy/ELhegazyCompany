"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { m } from "framer-motion";
import { submitLead } from "@/app/actions/lead";
import { siteConfig } from "@/config/site";
import { Magnetic } from "@/components/fx/Magnetic";
import { cn } from "@/lib/cn";

const SERVICES = ["ads", "creative", "video", "brand", "web", "pos"];
const BUDGETS = ["s", "m", "l", "xl"];
const TIMELINES = ["asap", "m1", "m3", "flex"];

export function ProjectBrief() {
  const t = useTranslations("Start");
  const locale = useLocale() as "ar" | "en";
  const [services, setServices] = useState<string[]>([]);
  const [budget, setBudget] = useState("");
  const [timeline, setTimeline] = useState("");
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [sending, setSending] = useState(false);

  const toggle = (s: string) =>
    setServices((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    await submitLead({ name, contact, services, budget, timeline, message, locale });
    const lines = [
      `${siteConfig.shortName[locale]} — ${t("title")}`,
      `${t("name")}: ${name}`,
      `${t("contact")}: ${contact}`,
      `${t("services")} ${services.map((s) => t(`serviceOptions.${s}`)).join("، ")}`,
      `${t("budget")}: ${budget ? t(`budgetOptions.${budget}`) : "-"}`,
      `${t("timeline")}: ${timeline ? t(`timelineOptions.${timeline}`) : "-"}`,
      `${t("about")}: ${message}`,
    ];
    const url = `https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(lines.join("\n"))}`;
    window.open(url, "_blank");
    setSending(false);
  };

  const chip = (active: boolean) =>
    cn(
      "rounded-full border px-5 py-2.5 text-sm transition-colors",
      active
        ? "border-brass bg-brass text-ink-900"
        : "border-brass/30 text-bone hover:border-brass/70",
    );
  const field =
    "w-full rounded-xl border border-brass/20 bg-ink-800/60 px-4 py-3 text-bone placeholder:text-bone-muted/60 focus:border-brass focus:outline-none";

  return (
    <m.form
      onSubmit={onSubmit}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-10"
    >
      <header>
        <h1 className="font-display text-4xl font-semibold text-bone sm:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-3 text-bone-muted">{t("subtitle")}</p>
      </header>

      <fieldset>
        <legend className="mb-4 text-sm font-semibold text-brass">{t("services")}</legend>
        <div className="flex flex-wrap gap-3">
          {SERVICES.map((s) => (
            <button key={s} type="button" onClick={() => toggle(s)} className={chip(services.includes(s))}>
              {t(`serviceOptions.${s}`)}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-4 text-sm font-semibold text-brass">{t("budget")}</legend>
        <div className="flex flex-wrap gap-3">
          {BUDGETS.map((b) => (
            <button key={b} type="button" onClick={() => setBudget(b)} className={chip(budget === b)}>
              {t(`budgetOptions.${b}`)}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-4 text-sm font-semibold text-brass">{t("timeline")}</legend>
        <div className="flex flex-wrap gap-3">
          {TIMELINES.map((tl) => (
            <button key={tl} type="button" onClick={() => setTimeline(tl)} className={chip(timeline === tl)}>
              {t(`timelineOptions.${tl}`)}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="space-y-4">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t("aboutPlaceholder")}
          rows={4}
          className={field}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("name")}
            required
            className={field}
          />
          <input
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder={t("contact")}
            required
            className={field}
          />
        </div>
      </div>

      <div className="flex flex-col items-start gap-3">
        <Magnetic className="inline-block">
          <button
            type="submit"
            disabled={sending}
            className="inline-block rounded-full bg-brass px-9 py-4 text-sm font-semibold text-ink-900 transition-colors hover:bg-brass-hi disabled:opacity-60"
          >
            {t("submit")}
          </button>
        </Magnetic>
        <p className="text-xs text-bone-muted/70">{t("note")}</p>
      </div>
    </m.form>
  );
}
