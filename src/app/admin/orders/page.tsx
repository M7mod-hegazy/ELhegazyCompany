import { getMongo } from "@/lib/mongodb";
import { OrderStatusSelect } from "@/components/admin/OrderStatusSelect";
import type { OrderStatus } from "@/config/workflow";

export const dynamic = "force-dynamic";

type Order = {
  _id: unknown;
  ref: string;
  product: string;
  plan: string;
  name: string;
  phone: string;
  business: string;
  city: string;
  notes: string;
  status: OrderStatus;
  createdAt?: Date;
};

const PRODUCT_LABELS: Record<string, string> = {
  pos: "نقاط البيع",
  ecommerce: "متجر إلكتروني",
  marketing: "تسويق",
};

export default async function OrdersPage() {
  const mongo = getMongo();
  let orders: Order[] = [];
  if (mongo) {
    try {
      orders = (await (await mongo)
        .db("elhegazi")
        .collection("orders")
        .find()
        .sort({ createdAt: -1 })
        .limit(300)
        .toArray()) as unknown as Order[];
    } catch {
      orders = [];
    }
  }

  return (
    <div>
      <h1 className="font-display-ar text-3xl font-semibold text-bone">الطلبات</h1>
      <p className="mt-2 text-sm text-bone-muted">
        جديد ← تم التواصل ← مدفوع ← تم التسليم. لطلبات POS المدفوعة، أصدر الترخيص من صفحة التراخيص.
      </p>

      {orders.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-brass/15 bg-ink-800/40 p-8 text-center text-bone-muted">
          لا توجد طلبات بعد.
        </p>
      ) : (
        <div className="mt-8 space-y-4">
          {orders.map((o) => (
            <article
              key={String(o._id)}
              className="rounded-2xl border border-brass/15 bg-ink-800/40 p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-display-ar text-lg font-bold tracking-wider text-brass" dir="ltr">
                    {o.ref}
                  </span>
                  <span className="rounded-full border border-brass/25 px-3 py-1 text-xs text-bone">
                    {PRODUCT_LABELS[o.product] ?? o.product} · {o.plan}
                  </span>
                </div>
                <OrderStatusSelect id={String(o._id)} status={o.status ?? "new"} />
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
                <span className="text-bone">{o.name}</span>
                {o.business && <span className="text-bone-muted">{o.business}</span>}
                {o.city && <span className="text-bone-muted">{o.city}</span>}
                <a
                  href={`https://wa.me/${o.phone.replace(/[^\d]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brass underline"
                  dir="ltr"
                >
                  {o.phone}
                </a>
                <time className="text-xs text-bone-muted">
                  {o.createdAt ? new Date(o.createdAt).toLocaleString("ar-EG") : ""}
                </time>
              </div>
              {o.notes && <p className="mt-2 text-sm text-bone-muted">{o.notes}</p>}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
