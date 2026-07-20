"use client";

import { useState, useTransition } from "react";
import { setOrderStatus } from "@/app/actions/admin";
import type { OrderStatus } from "@/config/workflow";

const LABELS: Record<OrderStatus, string> = {
  new: "جديد",
  contacted: "تم التواصل",
  paid: "مدفوع",
  delivered: "تم التسليم",
  cancelled: "ملغي",
};

export function OrderStatusSelect({
  id,
  status,
}: {
  id: string;
  status: OrderStatus;
}) {
  const [value, setValue] = useState<OrderStatus>(status);
  const [pending, startTransition] = useTransition();

  return (
    <select
      value={value}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value as OrderStatus;
        setValue(next);
        startTransition(() => {
          void setOrderStatus(id, next);
        });
      }}
      className={`rounded-full border bg-ink-800 px-3 py-1.5 text-xs outline-none transition-colors ${
        value === "new"
          ? "border-brass text-brass"
          : value === "cancelled"
            ? "border-oxblood-tint/60 text-oxblood-tint"
            : "border-brass/25 text-bone"
      }`}
    >
      {(Object.keys(LABELS) as OrderStatus[]).map((s) => (
        <option key={s} value={s}>
          {LABELS[s]}
        </option>
      ))}
    </select>
  );
}
