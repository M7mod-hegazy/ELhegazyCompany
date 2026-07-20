import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("NotFound");

  return (
    <main className="relative z-10 grid min-h-screen place-items-center px-6">
      <div className="text-center">
        <p className="font-display-en text-8xl font-bold text-brass/25 sm:text-9xl">404</p>
        <h1 className="font-display-ar mt-4 text-3xl font-semibold text-bone sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mx-auto mt-4 max-w-sm text-bone-muted">{t("body")}</p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-full bg-brass px-8 py-3.5 text-sm font-semibold text-ink-900 transition-all duration-300 hover:-translate-y-0.5 hover:bg-brass-hi"
        >
          {t("cta")}
        </Link>
      </div>
    </main>
  );
}
