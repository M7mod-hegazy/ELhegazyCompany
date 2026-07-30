import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["framer-motion"],
  },
  images: {
    // Next 16 requires every quality value used by next/image to be declared
    // here — any value not listed gets silently clamped down to the nearest
    // lower one, which is why panel art was looking softer than intended.
    // 60/72 are the projects-grid thumbnails, 75 the default, 80–85 hero art.
    qualities: [60, 72, 75, 80, 82, 84, 85],
  },
  async redirects() {
    // Permanent redirects: old routes → new ones (applied for all locales via next-intl prefix)
    const locales = ["ar", "en"];
    const base = [
      { source: "/work", destination: "/projects", permanent: true },
      { source: "/start", destination: "/contact", permanent: true },
      { source: "/order", destination: "/contact", permanent: true },
      {
        source: "/products/pos/download",
        destination: "/products/pos",
        permanent: true,
      },
    ];
    // Also apply for each locale prefix
    const localised = locales.flatMap((locale) =>
      base.map((r) => ({
        source: `/${locale}${r.source}`,
        destination: `/${locale}${r.destination}`,
        permanent: r.permanent,
      }))
    );
    return [...base, ...localised];
  },
  async headers() {
    return [
      {
        // Films use human-readable filenames (no content hash), so we use a
        // short max-age instead of immutable. No stale-while-revalidate: Chrome's
        // disk cache throws ERR_CACHE_OPERATION_NOT_SUPPORTED on range-requested
        // (video seek) responses cached under SWR — a known Chromium interaction,
        // not something a header tweak on our end can work around safely.
        source: "/films/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600",
          },
        ],
      },
      {
        source: "/posters/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
