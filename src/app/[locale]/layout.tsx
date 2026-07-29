import "../globals.css";
import type { Metadata } from "next";
import {
  Reem_Kufi,
  Fraunces,
  IBM_Plex_Sans_Arabic,
  IBM_Plex_Mono,
  Inter,
} from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { siteConfig } from "@/config/site";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { MotionProvider } from "@/components/providers/MotionProvider";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { FilmGrain } from "@/components/fx/FilmGrain";
import { Preloader } from "@/components/fx/Preloader";
import { Overlays } from "@/components/fx/Overlays";

const reemKufi = Reem_Kufi({
  subsets: ["arabic", "latin"],
  variable: "--font-reem-kufi",
  display: "swap",
});
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});
const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-plex-ar",
  display: "swap",
});
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const l = (hasLocale(routing.locales, locale) ? locale : "ar") as "ar" | "en";
  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: `${siteConfig.name[l]} — ${siteConfig.tagline[l]}`,
      template: `%s — ${siteConfig.shortName[l]}`,
    },
    description: siteConfig.description[l],
    openGraph: {
      title: `${siteConfig.name[l]} — ${siteConfig.tagline[l]}`,
      description: siteConfig.description[l],
      url: siteConfig.url,
      siteName: siteConfig.name[l],
      locale: l === "ar" ? "ar_EG" : "en_US",
      type: "website",
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${reemKufi.variable} ${fraunces.variable} ${plexArabic.variable} ${inter.variable} ${plexMono.variable} h-full antialiased`}
    >
      {/* NOTE: body is intentionally transparent (ink lives on <html>) so the
          fixed -z-10 3D stage isn't hidden behind the body background. */}
      <body suppressHydrationWarning className="min-h-full flex flex-col text-bone">
        <NextIntlClientProvider>
          <MotionProvider>
            <SmoothScroll>
              <Navbar />
              {children}
              <Footer />
            </SmoothScroll>
            <FilmGrain />
            <Overlays />
            <Preloader />
          </MotionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
