import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { locales } from "@/config/site";

const paths = [
  "",
  "/services/marketing",
  "/products/pos",
  "/products/pos/download",
  "/products/ecommerce",
  "/work",
  "/start",
  "/order",
  "/contact",
  "/faq",
  "/privacy",
  "/terms",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return locales.flatMap((locale) =>
    paths.map((p) => ({
      url: `${siteConfig.url}/${locale}${p}`,
      lastModified: new Date(),
      changeFrequency: p === "" ? ("weekly" as const) : ("monthly" as const),
      priority: p === "" ? 1 : 0.7,
    })),
  );
}
