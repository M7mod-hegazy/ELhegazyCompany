/**
 * Project types + pure helpers. Data does NOT live here anymore.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * HOW PROJECTS WORK (the shared protocol between you and the AI):
 *
 *   One folder per project in  public/projects/<id>/
 *
 *     public/projects/
 *       al-nour-furniture/
 *         01.jpg        ← images, any number; sorted alphabetically,
 *         02.jpg          the FIRST one is the panel cover
 *         03.jpg
 *         info.json     ← all text + metadata (bilingual)
 *
 *   - Drop images in. Nothing else — paths are discovered automatically.
 *   - info.json holds the text. Ask the AI ("add project X") and it writes
 *     the file for you; you only supply the photos.
 *   - The loader in src/lib/projects.ts reads the folders at build time.
 *   - Order: folders with a "num" come first (sorted by it); the rest follow
 *     alphabetically and get numbered automatically.
 * ─────────────────────────────────────────────────────────────────────────
 */

export type ProjectCategory =
  | "pos"
  | "ecommerce"
  | "marketing"
  | "brand"
  | "video"
  | "furniture"
  | "apps";

export const PROJECT_CATEGORIES: ProjectCategory[] = [
  "pos",
  "ecommerce",
  "marketing",
  "brand",
  "video",
  "furniture",
  "apps",
];

export type LocalizedText = { ar: string; en: string };

export type ProjectMetric = {
  /** The value string, e.g. "+180%" or "3.2×". Keep it short — one token. */
  value: string;
  label: LocalizedText;
};

/**
 * What info.json contains. `id` and `images` are NOT stored — the folder
 * name is the id, and images come from the folder contents.
 * Every optional field gets a sensible default from the loader.
 */
export type ProjectInfo = {
  /** Display number, e.g. "01". Optional — a numeric folder-name prefix
   *  ("1.PhysioAI") is the preferred way to set order; this is the fallback. */
  num?: string;
  /** true → also shown in the home page "Selected Work" strip. The "(view)"
   *  folder-name marker is the equivalent, name-based way to do this. */
  featured?: boolean;
  title: LocalizedText;
  client: LocalizedText;
  year: number;
  category: ProjectCategory;
  /** 2–4 short service chips shown as hairline pills. */
  services?: LocalizedText[];
  /** One line, max ~90 chars. Shown in collapsed panels. */
  summary: LocalizedText;
  /** 2–4 sentences. Shown in the expanded panel body. */
  body: LocalizedText;
  /** 2–4 metrics. Numbers in mono, labels in small caps. */
  metrics?: ProjectMetric[];
  /** Live URL. Optional — renders a "Visit site" action when set. */
  link?: string;
};

/** A fully-resolved project as the UI consumes it. Built by the loader. */
export type Project = {
  /** URL-safe unique ID — the folder name in public/projects/. */
  id: string;
  /** Display number, e.g. "01". Always present on a loaded project. */
  num: string;
  featured: boolean;
  title: LocalizedText;
  client: LocalizedText;
  year: number;
  category: ProjectCategory;
  services: LocalizedText[];
  summary: LocalizedText;
  body: LocalizedText;
  metrics: ProjectMetric[];
  /** Paths in /projects/<id>/01.jpg — first image is the panel cover. */
  images: string[];
  /** Live URL. Optional — renders a "Visit site" action when set. */
  link?: string;
};

/** Returns only the ProjectCategory values actually used by the given list. */
export function getProjectCategories(projects: Project[]): ProjectCategory[] {
  const used = new Set(projects.map((p) => p.category));
  return PROJECT_CATEGORIES.filter((c) => used.has(c));
}
