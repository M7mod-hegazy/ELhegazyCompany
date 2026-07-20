"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminLogin } from "@/app/actions/admin";

export function AdminLogin({ configured }: { configured: boolean }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await adminLogin(password);
    setBusy(false);
    if (res.ok) {
      router.refresh();
    } else {
      setError(true);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center px-6">
      <div className="w-full max-w-sm">
        <p className="text-center font-display-ar text-3xl font-semibold text-brass">الحجازي</p>
        <p className="mt-2 text-center text-sm text-bone-muted">لوحة تحكم المالك</p>

        {!configured ? (
          <p className="mt-8 rounded-2xl border border-oxblood-tint/50 bg-ink-800 p-5 text-sm leading-relaxed text-bone">
            متغير البيئة <code dir="ltr">ADMIN_PASSWORD</code> غير مضبوط. أضِفه في
            <code dir="ltr"> .env.local</code> أو في إعدادات Vercel ثم أعد التحميل.
          </p>
        ) : (
          <form onSubmit={submit} className="mt-8 flex flex-col gap-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="كلمة المرور"
              autoFocus
              className="w-full rounded-xl border border-brass/20 bg-ink-800 px-4 py-3 text-bone outline-none transition-colors focus:border-brass"
            />
            {error && <p className="text-sm text-oxblood-tint">كلمة المرور غير صحيحة</p>}
            <button
              type="submit"
              disabled={busy || !password}
              className="rounded-xl bg-brass px-4 py-3 text-sm font-semibold text-ink-900 transition-colors hover:bg-brass-hi disabled:opacity-50"
            >
              {busy ? "ثواني..." : "دخول"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
