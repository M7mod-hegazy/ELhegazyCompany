import { getMongo } from "@/lib/mongodb";
import { LicenseConsole } from "@/components/admin/LicenseConsole";
import { formatMachineCode } from "@/lib/licensing";

export const dynamic = "force-dynamic";

type License = {
  _id: unknown;
  licenseId: string;
  customer: string;
  phone: string;
  orderRef: string;
  hardwareId: string;
  features: string;
  expiresAt: string | null;
  status: string;
  createdAt?: Date;
};

export default async function LicensesPage() {
  const mongo = getMongo();
  let licenses: License[] = [];
  if (mongo) {
    try {
      licenses = (await (await mongo)
        .db("elhegazi")
        .collection("licenses")
        .find()
        .sort({ createdAt: -1 })
        .limit(300)
        .toArray()) as unknown as License[];
    } catch {
      licenses = [];
    }
  }

  return (
    <div>
      <h1 className="font-display-ar text-3xl font-semibold text-bone">التراخيص</h1>
      <p className="mt-2 text-sm text-bone-muted">
        الصق كود جهاز العميل، أصدر كود التفعيل، وابعته على واتساب. الكود مربوط بجهاز العميل ولا يعمل على غيره.
      </p>

      <div className="mt-8">
        <LicenseConsole />
      </div>

      {licenses.length > 0 && (
        <div className="mt-10">
          <h2 className="font-display-ar text-xl font-semibold text-bone">التراخيص الصادرة</h2>
          <div className="mt-4 space-y-3">
            {licenses.map((l) => (
              <article
                key={String(l._id)}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brass/15 bg-ink-800/40 p-4"
              >
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className="font-bold text-brass" dir="ltr">{l.licenseId}</span>
                  <span className="text-bone">{l.customer}</span>
                  {l.phone && (
                    <a
                      href={`https://wa.me/${l.phone.replace(/[^\d]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brass underline"
                      dir="ltr"
                    >
                      {l.phone}
                    </a>
                  )}
                  {l.orderRef && (
                    <span className="text-xs text-bone-muted" dir="ltr">{l.orderRef}</span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-bone-muted">
                  <span dir="ltr" className="font-mono">{formatMachineCode(l.hardwareId).slice(0, 14)}…</span>
                  <span className={l.features === "full" ? "text-brass" : ""}>{l.features}</span>
                  <span>{l.expiresAt ? new Date(l.expiresAt).toLocaleDateString("ar-EG") : "دائم"}</span>
                  <time>{l.createdAt ? new Date(l.createdAt).toLocaleDateString("ar-EG") : ""}</time>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
