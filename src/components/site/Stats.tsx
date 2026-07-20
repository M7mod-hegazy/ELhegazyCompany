"use client";

import { useEffect, useRef, useState } from "react";
import { m, useInView } from "framer-motion";
import { useTranslations } from "next-intl";
import { brand } from "@/lib/brand";

function Counter({ to, suffix }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    let start = 0;
    const dur = 1500;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min(1, (ts - start) / dur);
      setVal(Math.floor((1 - Math.pow(1 - p, 3)) * to));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, to]);
  return (
    <span ref={ref}>
      {val}
      {suffix}
    </span>
  );
}

export function Stats() {
  const t = useTranslations("Stats");
  const items = [
    { to: 300, suffix: "%+", key: "roas" },
    { to: 12, suffix: "M+", key: "reach" },
    { to: 40, suffix: "+", key: "brands" },
    { to: 7, suffix: "+", key: "years" },
  ] as const;
  return (
    <section className="relative mx-auto max-w-7xl px-6 py-28">
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((it, i) => (
          <m.div
            key={it.key}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: i * 0.08, ease: brand.ease.cinematic }}
            className="text-center"
          >
            <div className="font-display text-5xl font-semibold text-brass sm:text-6xl">
              <Counter to={it.to} suffix={it.suffix} />
            </div>
            <div className="mt-3 text-sm text-bone-muted">{t(it.key)}</div>
          </m.div>
        ))}
      </div>
    </section>
  );
}
