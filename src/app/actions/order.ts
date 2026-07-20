"use server";

import { getMongo } from "@/lib/mongodb";
import { catalog, isProductKey } from "@/config/catalog";

export type OrderInput = {
  product: string;
  plan: string;
  name: string;
  phone: string;
  business: string;
  city: string;
  notes: string;
  locale: string;
};

export type OrderResult = { ok: boolean; ref: string };

/** Short human-friendly order reference, e.g. HGZ-4K7TQ9. */
function makeRef(): string {
  const alphabet = "23456789ABCDEFGHJKMNPQRSTUVWXYZ"; // no 0/O/1/I/L
  let s = "";
  for (let i = 0; i < 6; i++) {
    s += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `HGZ-${s}`;
}

/**
 * Persists an order to MongoDB when configured. Like the lead flow, it always
 * resolves with a reference so the WhatsApp hand-off (which carries the full
 * order anyway) proceeds even without a database.
 */
export async function createOrder(input: OrderInput): Promise<OrderResult> {
  const ref = makeRef();

  // validate against the catalog — unknown products/plans are rejected
  if (!isProductKey(input.product)) return { ok: false, ref };
  const plan = catalog[input.product].plans.find((p) => p.id === input.plan);
  if (!plan) return { ok: false, ref };
  if (!input.name.trim() || !input.phone.trim()) return { ok: false, ref };

  try {
    const mongo = getMongo();
    if (mongo) {
      const client = await mongo;
      await client
        .db("elhegazi")
        .collection("orders")
        .insertOne({
          ref,
          product: input.product,
          plan: input.plan,
          name: input.name.trim().slice(0, 120),
          phone: input.phone.trim().slice(0, 40),
          business: input.business.trim().slice(0, 160),
          city: input.city.trim().slice(0, 80),
          notes: input.notes.trim().slice(0, 2000),
          locale: input.locale,
          status: "new", // new → contacted → paid → delivered (admin moves it)
          createdAt: new Date(),
        });
    }
    return { ok: true, ref };
  } catch {
    // DB down ≠ lost sale: the customer continues via WhatsApp with the ref.
    return { ok: true, ref };
  }
}
