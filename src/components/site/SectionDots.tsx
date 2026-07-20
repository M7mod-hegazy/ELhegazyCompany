"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { getSections, resolveActive } from "@/lib/scrollSections";

const ORDER = ["hero", "marketing", "pos", "ecommerce"];

export function SectionDots() {
  const t = useTranslations("Nav");
  const labels: Record<string, string> = {
    hero: t("home"),
    marketing: t("marketing"),
    pos: t("pos"),
    ecommerce: t("ecommerce"),
  };
  const [active, setActive] = useState<string | null>("hero");
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    const id = setInterval(() => {
      const present = getSections().map((s) => s.id);
      setIds(ORDER.filter((o) => present.includes(o)));
      setActive(resolveActive().id);
    }, 180);
    return () => clearInterval(id);
  }, []);

  if (!ids.length) return null;
  const go = (sid: string) =>
    document.getElementById(sid)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="fixed inset-y-0 z-40 hidden flex-col items-center justify-center gap-4 ltr:right-6 rtl:left-6 lg:flex">
      {ids.map((sid) => (
        <button
          key={sid}
          onClick={() => go(sid)}
          className="group flex items-center gap-3"
          aria-label={labels[sid]}
        >
          <span
            className={`text-[10px] uppercase tracking-widest transition-opacity ${
              active === sid
                ? "text-brass opacity-100"
                : "text-bone-muted opacity-0 group-hover:opacity-60"
            }`}
          >
            {labels[sid]}
          </span>
          <span
            className={`h-2 w-2 rounded-full border transition-all ${
              active === sid
                ? "scale-100 border-brass bg-brass"
                : "scale-75 border-bone-muted/50 bg-transparent"
            }`}
          />
        </button>
      ))}
    </div>
  );
}
