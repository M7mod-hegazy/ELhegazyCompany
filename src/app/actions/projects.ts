"use server";

import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { getMongo } from "@/lib/mongodb";
import { isAdmin } from "@/lib/adminAuth";
import { PROJECT_CATEGORIES, type ProjectCategory } from "@/config/workflow";

/**
 * Owner-managed portfolio projects. Images are uploaded from the admin as
 * compressed JPEG data-URLs (client-side canvas ≤1600px) and stored in the
 * `media` collection, served back through /api/media/[id] with long caching —
 * zero external storage dependencies.
 */

export type ProjectInput = {
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  category: string;
  link: string;
  featured: boolean;
  /** compressed JPEG/WebP data URLs */
  images: string[];
};

const MAX_IMAGES = 12;
const MAX_DATAURL_CHARS = 2_000_000; // ≈1.4 MB binary per image

export async function createProject(
  input: ProjectInput,
): Promise<{ ok: boolean; error?: string }> {
  if (!(await isAdmin())) return { ok: false, error: "unauthorized" };
  const mongo = getMongo();
  if (!mongo) return { ok: false, error: "no_database" };

  if (!input.titleAr.trim()) return { ok: false, error: "missing_title" };
  if (!PROJECT_CATEGORIES.includes(input.category as ProjectCategory)) {
    return { ok: false, error: "bad_category" };
  }
  const images = (input.images || []).slice(0, MAX_IMAGES);
  if (images.length === 0) return { ok: false, error: "missing_images" };
  for (const img of images) {
    if (!img.startsWith("data:image/") || img.length > MAX_DATAURL_CHARS) {
      return { ok: false, error: "bad_image" };
    }
  }

  const db = (await mongo).db("elhegazi");
  const mediaIds: ObjectId[] = [];
  for (const dataUrl of images) {
    const res = await db.collection("media").insertOne({ dataUrl, createdAt: new Date() });
    mediaIds.push(res.insertedId);
  }

  await db.collection("projects").insertOne({
    title: { ar: input.titleAr.trim().slice(0, 160), en: input.titleEn.trim().slice(0, 160) },
    desc: { ar: input.descAr.trim().slice(0, 1200), en: input.descEn.trim().slice(0, 1200) },
    category: input.category,
    link: input.link.trim().slice(0, 500),
    featured: Boolean(input.featured),
    images: mediaIds,
    createdAt: new Date(),
  });

  revalidatePath("/admin/projects");
  revalidatePath("/[locale]/work", "page");
  return { ok: true };
}

export async function deleteProject(id: string): Promise<{ ok: boolean }> {
  if (!(await isAdmin())) return { ok: false };
  const mongo = getMongo();
  if (!mongo) return { ok: false };
  const db = (await mongo).db("elhegazi");

  const project = await db
    .collection("projects")
    .findOne({ _id: new ObjectId(id) });
  if (project?.images?.length) {
    await db
      .collection("media")
      .deleteMany({ _id: { $in: project.images as ObjectId[] } });
  }
  await db.collection("projects").deleteOne({ _id: new ObjectId(id) });

  revalidatePath("/admin/projects");
  revalidatePath("/[locale]/work", "page");
  return { ok: true };
}

export async function toggleFeatured(id: string, featured: boolean): Promise<{ ok: boolean }> {
  if (!(await isAdmin())) return { ok: false };
  const mongo = getMongo();
  if (!mongo) return { ok: false };
  await (await mongo)
    .db("elhegazi")
    .collection("projects")
    .updateOne({ _id: new ObjectId(id) }, { $set: { featured } });
  revalidatePath("/admin/projects");
  revalidatePath("/[locale]/work", "page");
  return { ok: true };
}

/** Serializable shape for the public gallery + admin list. */
export type ProjectView = {
  id: string;
  title: { ar: string; en: string };
  desc: { ar: string; en: string };
  category: string;
  link: string;
  featured: boolean;
  images: string[]; // /api/media/<id> urls
  createdAt: string;
};

export async function listProjects(): Promise<ProjectView[]> {
  const mongo = getMongo();
  if (!mongo) return [];
  try {
    const docs = await (await mongo)
      .db("elhegazi")
      .collection("projects")
      .find()
      .sort({ featured: -1, createdAt: -1 })
      .limit(120)
      .toArray();
    return docs.map((d) => ({
      id: String(d._id),
      title: d.title ?? { ar: "", en: "" },
      desc: d.desc ?? { ar: "", en: "" },
      category: d.category ?? "other",
      link: d.link ?? "",
      featured: Boolean(d.featured),
      images: (d.images ?? []).map((m: ObjectId) => `/api/media/${String(m)}`),
      createdAt: d.createdAt ? new Date(d.createdAt).toISOString() : "",
    }));
  } catch {
    return [];
  }
}
