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
import { getMessages, setRequestLocale } from "next-intl/server";
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
import { RoutePreloader } from "@/components/fx/RoutePreloader";

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
  const url = `${siteConfig.url}/${l}`;
  const keywords =
    l === "ar"
      ? [
          "شركة الحجازي",
          "الحجازي تيك",
          "نظام كاشير",
          "برنامج كاشير نقاط بيع",
          "نظام نقاط البيع POS",
          "برنامج كاشير بدون نت",
          "إدارة المحلات والمخازن",
          "تصميم متجر إلكتروني",
          "تسويق رقمي وحملات إعلانية",
          "طابعات فواتير وباركود",
          "نظام مبيعات مصر",
        ]
      : [
          "ElHegazi Tech",
          "POS System Egypt",
          "Offline Retail POS",
          "Cashier Software",
          "Inventory Management",
          "Ecommerce Development",
          "Digital Marketing Agency",
        ];

  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: `${siteConfig.name[l]} — ${siteConfig.tagline[l]}`,
      template: `%s — ${siteConfig.shortName[l]}`,
    },
    description: siteConfig.description[l],
    keywords,
    authors: [{ name: "ElHegazi Tech", url: siteConfig.url }],
    creator: "ElHegazi Tech",
    publisher: "ElHegazi Tech",
    alternates: {
      canonical: url,
      languages: {
        ar: `${siteConfig.url}/ar`,
        en: `${siteConfig.url}/en`,
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      title: `${siteConfig.name[l]} — ${siteConfig.tagline[l]}`,
      description: siteConfig.description[l],
      url,
      siteName: siteConfig.name[l],
      locale: l === "ar" ? "ar_EG" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${siteConfig.name[l]} — ${siteConfig.tagline[l]}`,
      description: siteConfig.description[l],
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const messages = await getMessages();
  const dir = locale === "ar" ? "rtl" : "ltr";
  const l = locale as "ar" | "en";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteConfig.url}/#organization`,
        name: siteConfig.name[l],
        alternateName: siteConfig.shortName[l],
        url: siteConfig.url,
        logo: `${siteConfig.url}/icon.svg`,
        sameAs: [
          siteConfig.social.youtube,
          siteConfig.social.facebook,
          siteConfig.social.instagram,
        ].filter(Boolean),
        contactPoint: {
          "@type": "ContactPoint",
          telephone: `+${siteConfig.contact.whatsapp}`,
          contactType: "customer service",
          areaServed: ["EG", "SA", "AE", "KW"],
          availableLanguage: ["Arabic", "English"],
        },
      },
      {
        "@type": "LocalBusiness",
        "@id": `${siteConfig.url}/#localbusiness`,
        name: siteConfig.name[l],
        url: siteConfig.url,
        telephone: `+${siteConfig.contact.whatsapp}`,
        email: siteConfig.contact.email,
        address: {
          "@type": "PostalAddress",
          streetAddress: siteConfig.contact.location[l],
          addressCountry: "EG",
        },
        priceRange: "$$",
      },
      {
        "@type": "SoftwareApplication",
        name: "نظام الحجازي لنقاط البيع POS",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Windows",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "EGP",
        },
      },
    ],
  };

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${reemKufi.variable} ${fraunces.variable} ${plexArabic.variable} ${inter.variable} ${plexMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      {/* NOTE: body is intentionally transparent (ink lives on <html>) so the
          fixed -z-10 3D stage isn't hidden behind the body background. */}
      <body suppressHydrationWarning className="min-h-full flex flex-col text-bone">
        <NextIntlClientProvider messages={messages}>
          <MotionProvider>
            <RoutePreloader />
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
