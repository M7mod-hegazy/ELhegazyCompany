/** Shared enums for orders + projects — kept OUT of the "use server" action
 *  files, which may only export async functions. */

export const ORDER_STATUSES = ["new", "contacted", "paid", "delivered", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PROJECT_CATEGORIES = [
  "marketing",
  "brand",
  "video",
  "web",
  "pos",
  "ecommerce",
] as const;
export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];
