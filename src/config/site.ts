/**
 * Single source of truth for brand-level, owner-editable values.
 * PLACEHOLDERS below are marked — the owner swaps these for real values later.
 */

export const locales = ["ar", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "ar";

export const siteConfig = {
  name: {
    ar: "شركة الحجازي للحلول البرمجية ونقاط البيع | ElHegazi Tech",
    en: "ElHegazi Tech | POS & Business Software Solutions",
  },
  shortName: { ar: "الحجازي تيك", en: "ElHegazi Tech" },
  tagline: {
    ar: "أنظمة نقاط البيع، المتاجر الإلكترونية، والتسويق الرقمي",
    en: "POS Systems, E-Commerce & Digital Growth Solutions",
  },
  description: {
    ar: "أنظمة كاشير ونقاط بيع POS متكاملة بدون إنترنت، تصميم متاجر إلكترونية احترافية، وحملات تسويق رقمي متقدمة في مصر والعالم العربي.",
    en: "Comprehensive offline/online POS systems, tailored e-commerce platforms, and data-driven digital marketing solutions.",
  },
  url: "https://elhegazi-tech.vercel.app",

  contact: {
    /** International format, digits only, used in wa.me deep links. */
    whatsapp: "201032440775",
    email: "medo.hagaze33@gmail.com",
    phoneDisplay: "+20 103 244 0775",
    location: {
      ar: "شارع أحمد بن حنبل، أمام حي شرق الزهراء، القاهرة",
      en: "Ahmed Ibn Hanbal St, In front of East Zahraa District, Cairo",
    },
  },
  social: {
    instagram: "https://instagram.com/elhegazi",
    facebook: "https://facebook.com/elhegazi",
    tiktok: "",
    youtube: "https://www.youtube.com/@FanTasTic-m7j",
  },
  /** The owner's live e-commerce store (case-study World 3). */
  store: { url: "https://elhegazi.vercel.app" },

  // --- PLACEHOLDER: owner sets the real installer download links ---
  // Empty URL → the button becomes a WhatsApp request for the link instead of a
  // dead link. Set e.g. a Drive/GitHub release .exe URL to enable real downloads.
  downloads: {
    pos: { preview: "", full: "" },
    ecommerce: { preview: "", full: "" },
    marketing: { preview: "", full: "" },
  } as Record<string, { preview: string; full: string }>,
} as const;
