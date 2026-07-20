"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

export function LocaleToggle() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("Common");
  const other = locale === "ar" ? "en" : "ar";

  return (
    <button
      type="button"
      onClick={() => router.replace(pathname, { locale: other })}
      className="text-xs uppercase tracking-[0.2em] text-bone-muted transition-colors hover:text-brass"
      aria-label="Switch language"
    >
      {t("language")}
    </button>
  );
}
