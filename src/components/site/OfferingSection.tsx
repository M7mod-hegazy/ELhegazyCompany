"use client";

import dynamic from "next/dynamic";
import { m } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Stage } from "@/components/three/Stage";
import { MotifPoster } from "@/components/three/MotifPoster";
import { brand } from "@/lib/brand";
import { cn } from "@/lib/cn";

const scenes = {
  marketing: dynamic(() => import("@/components/three/scenes/MarketingScene"), { ssr: false }),
  pos: dynamic(() => import("@/components/three/scenes/PosScene"), { ssr: false }),
  ecommerce: dynamic(() => import("@/components/three/scenes/EcommerceScene"), { ssr: false }),
} as const;

export type SceneKey = keyof typeof scenes;

export function OfferingSection({
  id,
  num,
  tKey,
  href,
  accent,
  scene,
  pillars,
  reverse,
}: {
  id: string;
  num: string;
  tKey: string;
  href: string;
  accent: string;
  scene: SceneKey;
  pillars?: string[];
  reverse?: boolean;
}) {
  const t = useTranslations("Offerings");
  const Scene = scenes[scene];

  return (
    <section
      id={id}
      className="relative mx-auto grid max-w-7xl items-center gap-10 px-6 py-24 lg:grid-cols-2"
    >
      <div className={cn("relative h-[58vh] min-h-[400px]", reverse && "lg:order-2")}>
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: `radial-gradient(60% 60% at 50% 50%, ${accent}26, transparent 70%)`,
          }}
        />
        <Stage className="absolute inset-0" poster={<MotifPoster accent={accent} />}>
          {(progress) => <Scene progress={progress} />}
        </Stage>
      </div>

      <m.div
        className={cn(reverse && "lg:order-1")}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: brand.ease.cinematic }}
      >
        <span className="text-xs tracking-[0.3em] text-bone-muted">{num}</span>
        <h2 className="font-display mt-4 text-4xl font-semibold text-bone sm:text-5xl">
          {t(`${tKey}.title`)}
        </h2>
        <p className="mt-5 max-w-md leading-relaxed text-bone-muted">
          {t(`${tKey}.long`)}
        </p>

        {pillars && (
          <ul className="mt-7 grid grid-cols-2 gap-x-6 gap-y-3">
            {pillars.map((p) => (
              <li key={p} className="flex items-center gap-3 text-sm text-bone">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brass" />
                {t(`${tKey}.pillars.${p}`)}
              </li>
            ))}
          </ul>
        )}

        <Link
          href={href}
          className="mt-9 inline-flex items-center gap-2 rounded-full border border-brass/40 px-7 py-3 text-sm font-semibold text-bone transition-colors duration-300 hover:border-brass hover:text-brass"
        >
          {t("details")}
          <span className="rtl:rotate-180">→</span>
        </Link>
      </m.div>
    </section>
  );
}
