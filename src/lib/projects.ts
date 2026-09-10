import "server-only";
import { promises as fs, type Dirent } from "fs";
import path from "path";
import {
  PROJECT_CATEGORIES,
  type Project,
  type ProjectInfo,
  type ProjectMetric,
  type LocalizedText,
} from "@/config/projects";

/**
 * Folder-driven project loader.
 *
 * Protocol (the shared language between you and the AI):
 *
 *   public/projects/<id>/
 *     01.jpg        ← images; sorted alphabetically, first = cover
 *     02.jpg
 *     info.json     ← text + metadata; schema = ProjectInfo (all optional)
 *
 *   - A folder is a project. `id` IS the folder name.
 *   - Images are discovered — never write paths by hand.
 *   - Folders starting with "." or "_" are ignored (scratch/templates).
 *   - info.json is optional, and every field in it is optional. Anything
 *     missing (or the whole file) is improvised from the folder name and
 *     what IS present — the site never breaks because one project is
 *     half-finished. A folder is only skipped if it has no images at all
 *     (there'd be nothing to show).
 *   - Small hand-typed mistakes (a trailing comma, a plain string instead
 *     of `{ "ar", "en" }`) are tolerated rather than failing the file.
 *   - Order: rename the folder with a numeric prefix — "1.PhysioAI" sorts
 *     first, "2.Solo" second, and so on. Folders without a prefix fall back
 *     to the info.json "num" field, then sort alphabetically.
 *   - Home preview: append "(view)" to the folder name — "1.PhysioAI (view)"
 *     also appears in the homepage "Selected Work" strip. `featured: true`
 *     in info.json does the same without touching the name.
 */

const ROOT = path.join(process.cwd(), "public", "projects");
const IMAGE_EXTS = [".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif"];
const CURRENT_YEAR = new Date().getFullYear();

const isImage = (file: string) =>
  IMAGE_EXTS.includes(path.extname(file).toLowerCase());

const isLocalized = (value: unknown): value is LocalizedText =>
  typeof value === "object" &&
  value !== null &&
  typeof (value as LocalizedText).ar === "string" &&
  typeof (value as LocalizedText).en === "string";

const isMetric = (value: unknown): value is ProjectMetric =>
  typeof value === "object" &&
  value !== null &&
  typeof (value as ProjectMetric).value === "string" &&
  isLocalized((value as ProjectMetric).label);

/** Matches a leading numeric order prefix, e.g. "1.PhysioAI" → order 1. */
const ORDER_PREFIX = /^(\d+)[.\-_ ]+/;

/** Matches the home-preview marker, e.g. "1.PhysioAI (view)". */
const VIEW_MARKER = /\(view\)/i;

/** "1.PhysioAI" → 1 — the owner controls order by renaming the folder. */
function getFolderOrder(id: string): number | undefined {
  const m = id.match(ORDER_PREFIX);
  if (!m) return undefined;
  const n = parseFloat(m[1]);
  return Number.isFinite(n) ? n : undefined;
}

/** "1.PhysioAI (view)" → true — the folder name controls the home preview. */
function isFolderFeatured(id: string): boolean {
  return VIEW_MARKER.test(id);
}

/** "sign-language_app" → "Sign Language App" — used when info.json omits a name. */
function prettifyId(id: string): string {
  const clean = id.replace(ORDER_PREFIX, "").replace(VIEW_MARKER, "").trim();
  const words = clean.replace(/[-_]+/g, " ").trim().split(/\s+/).filter(Boolean);
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") || id;
}

/**
 * Accepts a proper `{ ar, en }` pair, or a single plain string (used for
 * both languages — better than dropping a value someone typed by hand),
 * falling back to `fallback` if neither is present.
 */
function toLocalized(value: unknown, fallback: LocalizedText): LocalizedText {
  if (isLocalized(value)) return value;
  if (typeof value === "string" && value.trim()) return { ar: value, en: value };
  return fallback;
}

function toLocalizedList(value: unknown): LocalizedText[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((v) => (isLocalized(v) ? v : typeof v === "string" && v.trim() ? { ar: v, en: v } : null))
    .filter((v): v is LocalizedText => v !== null);
}

/** Removes trailing commas — the most common hand-written JSON slip. */
function parseLenientJson(text: string): unknown {
  return JSON.parse(text.replace(/,(\s*[}\]])/g, "$1"));
}

async function readRawInfo(id: string): Promise<Record<string, unknown>> {
  let text: string;
  try {
    text = await fs.readFile(path.join(ROOT, id, "info.json"), "utf8");
  } catch {
    return {}; // no info.json at all — fine, everything gets improvised
  }
  try {
    const parsed = parseLenientJson(text);
    return typeof parsed === "object" && parsed !== null ? (parsed as Record<string, unknown>) : {};
  } catch (err) {
    console.warn(
      `[projects] ${id}: info.json isn't valid JSON (${(err as Error).message}) — using auto-generated details instead.`
    );
    return {};
  }
}

/** Builds a full ProjectInfo from whatever info.json provided, improvising the rest. */
function parseInfo(r: Record<string, unknown>, id: string): ProjectInfo {
  const fallbackName: LocalizedText = { ar: prettifyId(id), en: prettifyId(id) };
  const title = toLocalized(r.title, fallbackName);
  const client = toLocalized(r.client, title);

  let category = r.category as Project["category"];
  if (!PROJECT_CATEGORIES.includes(category)) {
    if (r.category !== undefined) {
      console.warn(
        `[projects] ${id}: unknown "category" ${JSON.stringify(r.category)} — allowed: ${PROJECT_CATEGORIES.join(", ")}. Defaulting to "apps".`
      );
    }
    category = "apps";
  }

  const year = typeof r.year === "number" && Number.isFinite(r.year) ? r.year : CURRENT_YEAR;

  const summary = toLocalized(r.summary, {
    ar: `مشروع ${client.ar} — من تصميمنا وتطويرنا بالكامل.`,
    en: `${client.en} — designed and built entirely in-house.`,
  });
  const body = toLocalized(r.body, {
    ar: `تولينا تنفيذ ${client.ar} من الفكرة الأولى وحتى الإطلاق، بدون أي طرف خارجي.`,
    en: `We handled ${client.en} from the first idea through launch, entirely in-house.`,
  });

  return {
    num: typeof r.num === "string" ? r.num : undefined,
    featured: r.featured === true,
    title,
    client,
    year,
    category,
    services: toLocalizedList(r.services),
    summary,
    body,
    metrics: Array.isArray(r.metrics) ? r.metrics.filter(isMetric) : [],
    link: typeof r.link === "string" ? r.link : undefined,
  };
}

async function readImages(id: string): Promise<string[]> {
  let files: string[];
  try {
    files = await fs.readdir(path.join(ROOT, id));
  } catch {
    return [];
  }
  return files
    .filter(isImage)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((f) => `/projects/${id}/${f}`);
}

/** All projects, ordered by folder-name prefix → info.json "num" → alphabetically. */
export async function getProjects(): Promise<Project[]> {
  let entries: Dirent<string>[];
  try {
    entries = await fs.readdir(ROOT, { withFileTypes: true });
  } catch {
    console.warn("[projects] public/projects is missing or unreadable — returning no projects.");
    return [];
  }

  const loaded: { project: Project; sortNum: number; folderOrder?: number }[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith(".") || entry.name.startsWith("_")) continue;
    const id = entry.name;

    const images = await readImages(id);
    if (images.length === 0) {
      console.warn(`[projects] ${id}: no images found — skipped.`);
      continue;
    }

    const info = parseInfo(await readRawInfo(id), id);
    const folderOrder = getFolderOrder(id);
    const infoNum = info.num !== undefined && Number.isFinite(parseFloat(info.num))
      ? parseFloat(info.num)
      : undefined;
    // The folder name is the source of truth for order ("1.PhysioAI"); the
    // info.json "num" field is a fallback for folders without a prefix.
    const sortNum = folderOrder ?? infoNum ?? Number.POSITIVE_INFINITY;

    loaded.push({
      project: {
        ...info,
        id,
        num: info.num ?? "",
        // "(view)" in the folder name OR "featured": true in info.json
        // decides whether the project previews on the home strip.
        featured: info.featured === true || isFolderFeatured(id),
        services: info.services ?? [],
        metrics: info.metrics ?? [],
        images,
      },
      sortNum,
      folderOrder,
    });
  }

  loaded.sort((a, b) => a.sortNum - b.sortNum || a.project.id.localeCompare(b.project.id));

  const highest = loaded.reduce((max, { project, folderOrder }) => {
    const a = Number.isFinite(parseFloat(project.num)) ? parseFloat(project.num) : 0;
    const b = folderOrder ?? 0;
    return Math.max(max, a, b);
  }, 0);
  let auto = highest + 1;

  return loaded.map(({ project, folderOrder }) => {
    const num = folderOrder !== undefined
      ? String(folderOrder).padStart(2, "0")
      : project.num !== ""
        ? project.num
        : String(auto++).padStart(2, "0");
    return { ...project, num };
  });
}

/** Projects marked featured; pass `count` to cap the list. */
export async function getFeaturedProjects(count?: number): Promise<Project[]> {
  const all = await getProjects();
  const featured = all.filter((p) => p.featured);
  return count !== undefined ? featured.slice(0, count) : featured;
}
