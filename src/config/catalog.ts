/**
 * Product/plan catalog for the on-site order flow. Plan display copy (names,
 * prices, notes, features) lives in messages under `Catalog.<product>.plans.<plan>`
 * so the owner edits real prices without a rebuild — this file only fixes the
 * ids, the order of plans, and journey behavior per plan.
 */

export type ProductKey = "pos" | "ecommerce" | "marketing";

export type PlanDef = {
  id: string;
  /** highlighted card in pickers */
  featured?: boolean;
  /** after ordering, offer the trial download immediately */
  download?: boolean;
};

export const catalog: Record<ProductKey, { plans: PlanDef[]; defaultPlan: string }> = {
  pos: {
    defaultPlan: "full",
    plans: [
      { id: "free", download: true },
      { id: "full", featured: true },
    ],
  },
  ecommerce: {
    defaultPlan: "full",
    plans: [{ id: "preview" }, { id: "full", featured: true }],
  },
  marketing: {
    defaultPlan: "growth",
    plans: [{ id: "starter" }, { id: "growth", featured: true }, { id: "pro" }],
  },
};

export function isProductKey(v: string | undefined | null): v is ProductKey {
  return v === "pos" || v === "ecommerce" || v === "marketing";
}
