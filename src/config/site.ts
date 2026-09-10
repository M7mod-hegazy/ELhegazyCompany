/**
 * Single source of truth for brand-level, owner-editable values.
 * PLACEHOLDERS below are marked — the owner swaps these for real values later.
 */

export const locales = ["ar", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "ar";

export const siteConfig = {
  name: { ar: "شركة الحجازي", en: "ElHegazi Company" },
  shortName: { ar: "الحجازي", en: "ElHegazi" },
  tagline: {
    ar: "نصنع العلامات التي تُرى",
    en: "We build brands people see",
  },
  description: {
    ar: "وكالة إبداعية ورقمية: حملات إعلانية مدفوعة، إنتاج صور وفيديو، هوية بصرية، ومتاجر إلكترونية.",
    en: "A creative & digital agency: paid ad campaigns, image & video production, brand identity, and e-commerce.",
  },
  url: "https://elhegazi-agency.vercel.app",

  contact: {
    /** International format, digits only, used in wa.me deep links. */
    whatsapp: "201032440775",
    email: "medo.hagaze33@gmail.com",
    phoneDisplay: "+20 103 244 0775",
    location: { ar: "القاهرة، مصر", en: "Cairo, Egypt" },
  },
  social: {
    instagram: "https://instagram.com/elhegazi",
    facebook: "https://facebook.com/elhegazi",
    tiktok: "",
    youtube: "",
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
