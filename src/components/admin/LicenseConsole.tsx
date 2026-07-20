"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createLicense, type CreateLicenseResult } from "@/app/actions/admin";

const ERRORS: Record<string, string> = {
  unauthorized: "انتهت الجلسة — سجّل الدخول من جديد.",
  not_configured: "مفتاح التوقيع غير مضبوط (LICENSE_PRIVATE_KEY_PEM). راجع docs/LICENSING.md.",
  invalid_machine_code: "كود الجهاز غير صحيح — لازم يكون ٣٢ خانة hex (بالشرط أو من غيرها).",
  missing_customer: "اكتب اسم العميل.",
  no_database: "قاعدة البيانات غير متصلة (MONGODB_URI).",
  invalid_fingerprint: "كود الجهاز غير صحيح.",
  missing_private_key: "مفتاح التوقيع غير مضبوط.",
};

/** New-license form + the resulting activation code with copy/WhatsApp actions. */
export function LicenseConsole() {
  const router = useRouter();
  const [customer, setCustomer] = useState("");
  const [phone, setPhone] = useState("");
  const [machineCode, setMachineCode] = useState("");
  const [features, setFeatures] = useState<"full" | "trial">("full");
  const [expiresAt, setExpiresAt] = useState("");
  const [orderRef, setOrderRef] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<CreateLicenseResult | null>(null);
  const [copied, setCopied] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setCopied(false);
    const res = await createLicense({
      customer,
      phone,
      machineCode,
      features,
      expiresAt,
      orderRef,
    });
    setBusy(false);
    setResult(res);
    if (res.ok) router.refresh();
  }

  async function copy() {
    if (!result?.formatted) return;
    await navigator.clipboard.writeText(result.formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const waHref =
    result?.ok && phone
      ? `https://wa.me/${phone.replace(/[^\d]/g, "")}?text=${encodeURIComponent(
          `كود تفعيل نظام الحجازي (${result.licenseId}):\n\n${result.formatted}\n\nالصقه في شاشة التفعيل بالبرنامج.`,
        )}`
      : null;

  return (
    <div className="rounded-2xl border border-brass/25 bg-ink-800/60 p-6">
      <h2 className="font-display-ar text-xl font-semibold text-bone">ترخيص جديد</h2>

      <form onSubmit={submit} className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm text-bone">اسم العميل / المحل *</span>
          <input value={customer} onChange={(e) => setCustomer(e.target.value)} className={inputCls} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm text-bone">رقم الواتساب</span>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} dir="ltr" inputMode="tel" />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-sm text-bone">كود الجهاز (من شاشة التفعيل) *</span>
          <input
            value={machineCode}
            onChange={(e) => setMachineCode(e.target.value)}
            className={`${inputCls} font-mono`}
            dir="ltr"
            placeholder="A1B2-C3D4-…"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm text-bone">النسخة</span>
          <select
            value={features}
            onChange={(e) => setFeatures(e.target.value as "full" | "trial")}
            className={inputCls}
          >
            <option value="full">كاملة (full)</option>
            <option value="trial">تجريبية (trial)</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm text-bone">تاريخ الانتهاء (فارغ = دائم)</span>
          <input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className={inputCls} dir="ltr" />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-sm text-bone">رقم الطلب (اختياري)</span>
          <input value={orderRef} onChange={(e) => setOrderRef(e.target.value)} className={inputCls} dir="ltr" placeholder="HGZ-…" />
        </label>

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={busy}
            className="rounded-full bg-brass px-8 py-3 text-sm font-semibold text-ink-900 transition-colors hover:bg-brass-hi disabled:opacity-50"
          >
            {busy ? "جاري التوقيع..." : "أصدر كود التفعيل"}
          </button>
        </div>
      </form>

      {result && !result.ok && (
        <p className="mt-4 rounded-xl border border-oxblood-tint/50 bg-ink-900 p-4 text-sm">
          {ERRORS[result.error ?? ""] ?? `خطأ: ${result.error}`}
        </p>
      )}

      {result?.ok && (
        <div className="mt-5 rounded-xl border border-brass/40 bg-ink-900 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm text-bone-muted">
              الترخيص <span className="font-bold text-brass" dir="ltr">{result.licenseId}</span> — كود التفعيل:
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={copy}
                className="rounded-full border border-brass/40 px-4 py-1.5 text-xs text-bone transition-colors hover:border-brass hover:text-brass"
              >
                {copied ? "اتنسخ ✓" : "نسخ"}
              </button>
              {waHref && (
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-brass px-4 py-1.5 text-xs font-semibold text-ink-900 transition-colors hover:bg-brass-hi"
                >
                  إرسال واتساب
                </a>
              )}
            </div>
          </div>
          <pre
            dir="ltr"
            className="mt-3 max-h-40 overflow-auto whitespace-pre-wrap break-all rounded-lg bg-ink-800 p-4 font-mono text-xs leading-relaxed text-brass-hi"
          >
            {result.formatted}
          </pre>
        </div>
      )}
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-brass/15 bg-ink-900 px-4 py-2.5 text-bone outline-none transition-colors focus:border-brass";
