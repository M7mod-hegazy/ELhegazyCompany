"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createProject,
  deleteProject,
  toggleFeatured,
  type ProjectView,
} from "@/app/actions/projects";
import { PROJECT_CATEGORIES } from "@/config/workflow";

const CAT_LABELS: Record<string, string> = {
  marketing: "حملات وتسويق",
  brand: "هوية بصرية",
  video: "فيديو وريلز",
  web: "مواقع",
  pos: "نقاط بيع",
  ecommerce: "متاجر إلكترونية",
};

const ERRORS: Record<string, string> = {
  unauthorized: "انتهت الجلسة — سجّل الدخول من جديد.",
  no_database: "قاعدة البيانات غير متصلة (MONGODB_URI).",
  missing_title: "اكتب اسم المشروع بالعربي.",
  bad_category: "اختار تصنيف صحيح.",
  missing_images: "ارفع صورة واحدة على الأقل.",
  bad_image: "صورة غير صالحة أو أكبر من الحد المسموح.",
};

/** Compress an image file client-side (canvas, max 1600px, JPEG 0.82). */
async function compressImage(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = url;
    });
    const max = 1600;
    const scale = Math.min(1, max / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.82);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function ProjectsManager({ projects }: { projects: ProjectView[] }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [titleAr, setTitleAr] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [descAr, setDescAr] = useState("");
  const [descEn, setDescEn] = useState("");
  const [category, setCategory] = useState<string>("marketing");
  const [link, setLink] = useState("");
  const [featured, setFeatured] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onPickFiles(files: FileList | null) {
    if (!files) return;
    setBusy(true);
    const next: string[] = [];
    for (const f of Array.from(files).slice(0, 12 - images.length)) {
      if (!f.type.startsWith("image/")) continue;
      next.push(await compressImage(f));
    }
    setImages((prev) => [...prev, ...next].slice(0, 12));
    setBusy(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await createProject({
      titleAr,
      titleEn,
      descAr,
      descEn,
      category,
      link,
      featured,
      images,
    });
    setBusy(false);
    if (!res.ok) {
      setError(ERRORS[res.error ?? ""] ?? `خطأ: ${res.error}`);
      return;
    }
    setTitleAr("");
    setTitleEn("");
    setDescAr("");
    setDescEn("");
    setLink("");
    setFeatured(false);
    setImages([]);
    router.refresh();
  }

  return (
    <div className="space-y-10">
      {/* new project */}
      <form onSubmit={submit} className="rounded-2xl border border-brass/25 bg-ink-800/60 p-6">
        <h2 className="font-display-ar text-xl font-semibold text-bone">مشروع جديد</h2>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm text-bone">اسم المشروع (عربي) *</span>
            <input value={titleAr} onChange={(e) => setTitleAr(e.target.value)} className={inputCls} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm text-bone">Project name (English)</span>
            <input value={titleEn} onChange={(e) => setTitleEn(e.target.value)} className={inputCls} dir="ltr" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm text-bone">وصف (عربي)</span>
            <textarea value={descAr} onChange={(e) => setDescAr(e.target.value)} rows={3} className={inputCls} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm text-bone">Description (English)</span>
            <textarea value={descEn} onChange={(e) => setDescEn(e.target.value)} rows={3} className={inputCls} dir="ltr" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm text-bone">التصنيف</span>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
              {PROJECT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {CAT_LABELS[c]}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm text-bone">رابط (اختياري)</span>
            <input value={link} onChange={(e) => setLink(e.target.value)} className={inputCls} dir="ltr" placeholder="https://…" />
          </label>
        </div>

        {/* images */}
        <div className="mt-5">
          <span className="mb-2 block text-sm text-bone">الصور (أول صورة هي الغلاف) *</span>
          <div className="flex flex-wrap gap-3">
            {images.map((src, i) => (
              <div key={i} className="group relative h-24 w-32 overflow-hidden rounded-xl border border-brass/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="h-full w-full object-cover" />
                {i === 0 && (
                  <span className="absolute start-1 top-1 rounded-full bg-brass px-2 py-0.5 text-[0.55rem] font-bold text-ink-900">
                    الغلاف
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setImages(images.filter((_, j) => j !== i))}
                  className="absolute end-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-ink-900/80 text-xs text-oxblood-tint opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label="حذف الصورة"
                >
                  ✕
                </button>
              </div>
            ))}
            {images.length < 12 && (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="grid h-24 w-32 place-items-center rounded-xl border border-dashed border-brass/30 text-3xl text-brass/70 transition-colors hover:border-brass hover:text-brass"
              >
                +
              </button>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => onPickFiles(e.target.files)}
          />
          <p className="mt-2 text-xs text-bone-muted">
            بيتم ضغط الصور تلقائيًا (حد أقصى ١٢ صورة). اسحب صور بجودة عالية والباقي علينا.
          </p>
        </div>

        <label className="mt-5 flex items-center gap-2 text-sm text-bone">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
            className="h-4 w-4 accent-[#C9A86A]"
          />
          مشروع مميز (يظهر أولًا)
        </label>

        {error && <p className="mt-4 rounded-xl border border-oxblood-tint/50 bg-ink-900 p-4 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="mt-6 rounded-full bg-brass px-8 py-3 text-sm font-semibold text-ink-900 transition-colors hover:bg-brass-hi disabled:opacity-50"
        >
          {busy ? "ثواني..." : "أضف المشروع"}
        </button>
      </form>

      {/* existing */}
      {projects.length > 0 && (
        <div>
          <h2 className="font-display-ar text-xl font-semibold text-bone">
            المشاريع المنشورة ({projects.length})
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <article key={p.id} className="overflow-hidden rounded-2xl border border-brass/15 bg-ink-800/40">
                {p.images[0] && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={p.images[0]} alt={p.title.ar} className="h-36 w-full object-cover" />
                )}
                <div className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-bone">{p.title.ar}</h3>
                    {p.featured && (
                      <span className="rounded-full bg-brass px-2 py-0.5 text-[0.55rem] font-bold text-ink-900">مميز</span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-bone-muted">
                    {CAT_LABELS[p.category] ?? p.category} · {p.images.length} صور
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        await toggleFeatured(p.id, !p.featured);
                        router.refresh();
                      }}
                      className="rounded-full border border-brass/30 px-3 py-1 text-xs text-bone transition-colors hover:border-brass hover:text-brass"
                    >
                      {p.featured ? "إلغاء التمييز" : "تمييز"}
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        if (!confirm(`حذف «${p.title.ar}» نهائيًا؟`)) return;
                        await deleteProject(p.id);
                        router.refresh();
                      }}
                      className="rounded-full border border-oxblood-tint/40 px-3 py-1 text-xs text-oxblood-tint transition-colors hover:border-oxblood-tint"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-brass/15 bg-ink-900 px-4 py-2.5 text-bone outline-none transition-colors focus:border-brass";
