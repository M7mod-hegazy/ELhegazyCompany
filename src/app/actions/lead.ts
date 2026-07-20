"use server";

import { getMongo } from "@/lib/mongodb";

export type LeadInput = {
  name: string;
  contact: string;
  services: string[];
  budget: string;
  timeline: string;
  message: string;
  locale: string;
};

/** Persists a lead to MongoDB Atlas when configured. Always resolves so the
 *  WhatsApp hand-off proceeds regardless of database availability. */
export async function submitLead(input: LeadInput): Promise<{ ok: boolean }> {
  try {
    const mongo = getMongo();
    if (mongo) {
      const client = await mongo;
      await client
        .db("elhegazi")
        .collection("leads")
        .insertOne({ ...input, createdAt: new Date() });
    }
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
