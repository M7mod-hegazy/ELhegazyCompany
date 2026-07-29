import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { locales } from "@/config/site";

// NOTE: this list is hand-maintained — update it whenever a new page is added.
const paths = [
  "",
  "/services/marketing",
  "/products/pos",
  "/products/ecommerce",
  "/projects",
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
