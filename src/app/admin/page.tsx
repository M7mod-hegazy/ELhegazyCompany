import Link from "next/link";
import { getMongo } from "@/lib/mongodb";
import { isLicensingConfigured } from "@/lib/licensing";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const mongo = getMongo();
  let counts = { leads: 0, ordersNew: 0, ordersAll: 0, licenses: 0 };
  let dbOk = false;

  if (mongo) {
    try {
      const db = (await mongo).db("elhegazi");
      const [leads, ordersNew, ordersAll, licenses] = await Promise.all([
        db.collection("leads").countDocuments(),
        db.collection("orders").countDocuments({ status: "new" }),
        db.collection("orders").countDocuments(),
        db.collection("licenses").countDocuments(),
      ]);
      counts = { leads, ordersNew, ordersAll, licenses };
      dbOk = true;
    } catch {
      dbOk = false;
    }
  }

  const cards = [
    { label: "طلبات جديدة", value: counts.ordersNew, href: "/admin/orders", hot: counts.ordersNew > 0 },
    { label: "كل الطلبات", value: counts.ordersAll, href: "/admin/orders" },
    { label: "عملاء محتملون", value: counts.leads, href: "/admin/leads" },
    { label: "تراخيص صادرة", value: counts.licenses, href: "/admin/licenses" },
  ];

  return (
    <div>
      <h1 className="font-display-ar text-3xl font-semibold text-bone">نظرة عامة</h1>

      {!dbOk && (
        <p className="mt-6 rounded-2xl border border-oxblood-tint/50 bg-ink-800 p-5 text-sm leading-relaxed">
          قاعدة البيانات غير متصلة — اضبط <code dir="ltr">MONGODB_URI</code> في البيئة.
          الطلبات والعملاء بيكملوا عبر واتساب في كل الأحوال، لكن مش هيتسجلوا هنا.
        </p>
      )}

      {!isLicensingConfigured() && (
        <p className="mt-4 rounded-2xl border border-brass/25 bg-ink-800 p-5 text-sm leading-relaxed">
          توقيع التراخيص غير مفعّل — اضبط <code dir="ltr">LICENSE_PRIVATE_KEY_PEM</code>.
          راجع <code dir="ltr">docs/LICENSING.md</code> لخطوات الإعداد.
        </p>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className={`rounded-2xl border p-6 transition-colors hover:border-brass/60 ${
              c.hot ? "border-brass/60 bg-ink-800" : "border-brass/15 bg-ink-800/50"
            }`}
          >
            <div className="font-display-ar text-4xl font-bold text-brass">{c.value}</div>
            <div className="mt-2 text-sm text-bone-muted">{c.label}</div>
          </Link>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-brass/15 bg-ink-800/40 p-6 text-sm leading-relaxed text-bone-muted">
        <p className="font-semibold text-bone">تدفق البيع السريع:</p>
        <ol className="mt-3 list-inside list-decimal space-y-1.5">
          <li>الطلب يوصل هنا (وواتساب) برقم مرجعي HGZ-…</li>
          <li>أكّد الدفع مع العميل، وابعت له المثبّت الكامل.</li>
          <li>خد منه كود الجهاز من شاشة التفعيل.</li>
          <li>
            افتح <Link href="/admin/licenses" className="text-brass underline">التراخيص</Link> →
            ترخيص جديد → الصق الكود → ابعت له كود التفعيل.
          </li>
        </ol>
      </div>
    </div>
  );
}
