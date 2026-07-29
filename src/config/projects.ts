/**
 * Projects data — hardcoded, no database.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * OWNER: Add your real projects below. Copy an existing block.
 * Images go in public/projects/<id>/ — the first image is the panel cover.
 * The two entries marked SAMPLE below should be deleted when you have real work.
 * ─────────────────────────────────────────────────────────────────────────
 */

export type ProjectCategory =
  | "pos"
  | "ecommerce"
  | "marketing"
  | "brand"
  | "video"
  | "furniture";

export const PROJECT_CATEGORIES: ProjectCategory[] = [
  "pos",
  "ecommerce",
  "marketing",
  "brand",
  "video",
  "furniture",
];

export type ProjectMetric = {
  /** The value string, e.g. "+180%" or "3.2×". Keep it short — one token. */
  value: string;
  label: { ar: string; en: string };
};

export type Project = {
  /** URL-safe unique ID, e.g. "maktabet-al-nour". Controls sort order via num. */
  id: string;
  /** Display number, e.g. "01". Controls order in the panels. */
  num: string;
  /** true → also shown in the home page "Selected Work" strip. */
  featured: boolean;
  title: { ar: string; en: string };
  client: { ar: string; en: string };
  year: number;
  category: ProjectCategory;
  /** 2–4 short service chips shown as hairline pills. */
  services: { ar: string; en: string }[];
  /** One line, max ~90 chars. Shown in collapsed panels. */
  summary: { ar: string; en: string };
  /** 2–4 sentences. Shown in the expanded panel body. */
  body: { ar: string; en: string };
  /** 2–4 metrics. Numbers in mono, labels in small caps. */
  metrics: ProjectMetric[];
  /** Paths in /projects/<id>/01.jpg — first image is the panel cover. */
  images: string[];
  /** Live URL. Optional — renders a "Visit site" action when set. */
  link?: string;
};

// ─────────────────────────────────────────────────────────────────────────
// SAMPLE PROJECTS — delete these when you add real work.
// ─────────────────────────────────────────────────────────────────────────

export const projects: Project[] = [
  {
    // SAMPLE
    id: "al-nour-furniture",
    num: "01",
    featured: true,
    title: { ar: "أثاث النور", en: "Al-Nour Furniture" },
    client: { ar: "محل أثاث النور", en: "Al-Nour Furniture Shop" },
    year: 2024,
    category: "marketing",
    services: [
      { ar: "إعلانات ميتا", en: "Meta Ads" },
      { ar: "تصوير منتجات", en: "Product Photography" },
      { ar: "هوية بصرية", en: "Brand Identity" },
    ],
    summary: {
      ar: "حملة إعلانية متكاملة رفعت المبيعات الشهرية بنسبة ١٨٠٪ خلال ثلاثة أشهر.",
      en: "A full ad campaign that raised monthly sales by 180% in three months.",
    },
    body: {
      ar: "بدأنا بإعادة تصميم الهوية البصرية الكاملة، ثم أنتجنا محتوى مصوّر احترافي للمنتجات. أطلقنا حملات إعلانية على فيسبوك وإنستجرام باستهداف دقيق للمنطقة الجغرافية والفئات العمرية. النتيجة: مضاعفة الوصول وزيادة المبيعات الشهرية بنسبة ١٨٠٪ في ثلاثة أشهر فقط.",
      en: "We started by redesigning the full visual identity, then produced professional product photography. We launched targeted Facebook and Instagram campaigns, precisely targeting geography and demographics. The result: doubled reach and a 180% increase in monthly sales within three months.",
    },
    metrics: [
      { value: "+180%", label: { ar: "نمو في المبيعات", en: "Sales growth" } },
      { value: "3.8×", label: { ar: "عائد الإعلان", en: "ROAS" } },
      { value: "40K+", label: { ar: "مشاهدة شهرياً", en: "Monthly reach" } },
    ],
    images: ["/projects/al-nour-furniture/01.jpg"],
  },
  {
    // SAMPLE
    id: "misr-retail",
    num: "02",
    featured: true,
    title: { ar: "مصر ريتيل", en: "Misr Retail" },
    client: { ar: "سلسلة محلات مصر ريتيل", en: "Misr Retail Chain" },
    year: 2025,
    category: "pos",
    services: [
      { ar: "نظام نقاط البيع", en: "POS System" },
      { ar: "تكامل المخازن", en: "Inventory Integration" },
    ],
    summary: {
      ar: "تركيب وتدريب على نظام نقاط البيع في ٤ فروع مع تكامل المخزون المركزي.",
      en: "POS rollout and training across 4 branches with centralised inventory integration.",
    },
    body: {
      ar: "نصّبنا نظام نقاط البيع في أربعة فروع وربطناها بمخزن مركزي واحد. درّبنا الفريق على جميع الميزات بما فيها الورديات، الخزينة، التقارير، وواتساب CRM. بدأ الفريق يعمل بكفاءة كاملة في أقل من أسبوعين.",
      en: "We installed the POS system across four branches, connecting them to a single central warehouse. Trained the full team on all features including shifts, treasury, reports and WhatsApp CRM. The team was operating at full efficiency in under two weeks.",
    },
    metrics: [
      { value: "4", label: { ar: "فروع مرتبطة", en: "Connected branches" } },
      { value: "-35%", label: { ar: "وقت إغلاق الوردية", en: "Shift-close time" } },
      { value: "100%", label: { ar: "أوفلاين", en: "Offline" } },
    ],
    images: ["/projects/misr-retail/01.jpg"],
  },
];

/** Returns projects marked as featured, up to `count` (default: all). */
export function getFeaturedProjects(count?: number): Project[] {
  const featured = projects.filter((p) => p.featured);
  return count !== undefined ? featured.slice(0, count) : featured;
}

/** Returns only the ProjectCategory values that are actually used in the current project list. */
export function getProjectCategories(): ProjectCategory[] {
  const used = new Set(projects.map((p) => p.category));
  return PROJECT_CATEGORIES.filter((c) => used.has(c));
}
