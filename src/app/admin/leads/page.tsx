import { getMongo } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

type Lead = {
  _id: unknown;
  name: string;
  contact: string;
  services: string[];
  budget: string;
  timeline: string;
  message: string;
  createdAt?: Date;
};

export default async function LeadsPage() {
  const mongo = getMongo();
  let leads: Lead[] = [];
  if (mongo) {
    try {
      leads = (await (await mongo)
        .db("elhegazi")
        .collection("leads")
        .find()
        .sort({ createdAt: -1 })
        .limit(200)
        .toArray()) as unknown as Lead[];
    } catch {
      leads = [];
    }
  }

  return (
    <div>
      <h1 className="font-display-ar text-3xl font-semibold text-bone">العملاء المحتملون</h1>
      <p className="mt-2 text-sm text-bone-muted">طلبات «ابدأ مشروعك» — الأحدث أولًا.</p>

      {leads.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-brass/15 bg-ink-800/40 p-8 text-center text-bone-muted">
          لا يوجد عملاء محتملون بعد.
        </p>
      ) : (
        <div className="mt-8 space-y-4">
          {leads.map((l) => (
            <article
              key={String(l._id)}
              className="rounded-2xl border border-brass/15 bg-ink-800/40 p-5"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="font-semibold text-bone">{l.name || "بدون اسم"}</h2>
                <time className="text-xs text-bone-muted">
                  {l.createdAt ? new Date(l.createdAt).toLocaleString("ar-EG") : ""}
                </time>
              </div>
              <p className="mt-1 text-sm text-brass" dir="ltr">
                {l.contact}
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                {(l.services || []).map((s) => (
                  <span key={s} className="rounded-full border border-brass/25 px-3 py-1 text-bone">
                    {s}
                  </span>
                ))}
                {l.budget && (
                  <span className="rounded-full border border-brass/25 px-3 py-1 text-bone-muted">
                    ميزانية: {l.budget}
                  </span>
                )}
                {l.timeline && (
                  <span className="rounded-full border border-brass/25 px-3 py-1 text-bone-muted">
                    توقيت: {l.timeline}
                  </span>
                )}
              </div>
              {l.message && <p className="mt-3 text-sm leading-relaxed text-bone-muted">{l.message}</p>}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
