"use server";

import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { getMongo } from "@/lib/mongodb";
import {
  isAdmin,
  checkPassword,
  startSession,
  endSession,
} from "@/lib/adminAuth";
import {
  signLicense,
  formatActivationCode,
  formatLicenseId,
  normalizeFingerprint,
  isLicensingConfigured,
} from "@/lib/licensing";
import { ORDER_STATUSES, type OrderStatus } from "@/config/workflow";

/* ---------------------------------- auth --------------------------------- */

export async function adminLogin(password: string): Promise<{ ok: boolean }> {
  if (!checkPassword(password)) return { ok: false };
  await startSession();
  return { ok: true };
}

export async function adminLogout(): Promise<void> {
  await endSession();
}

/* --------------------------------- orders -------------------------------- */

export async function setOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<{ ok: boolean }> {
  if (!(await isAdmin())) return { ok: false };
  if (!ORDER_STATUSES.includes(status)) return { ok: false };
  const mongo = getMongo();
  if (!mongo) return { ok: false };
  const client = await mongo;
  await client
    .db("elhegazi")
    .collection("orders")
    .updateOne({ _id: new ObjectId(id) }, { $set: { status, updatedAt: new Date() } });
  revalidatePath("/admin/orders");
  return { ok: true };
}

/* -------------------------------- licenses ------------------------------- */

export type CreateLicenseInput = {
  customer: string;
  phone: string;
  machineCode: string;
  features: "full" | "trial";
  /** YYYY-MM-DD or empty = perpetual */
  expiresAt: string;
  orderRef: string;
};

export type CreateLicenseResult = {
  ok: boolean;
  error?: string;
  licenseId?: string;
  blob?: string;
  formatted?: string;
};

export async function createLicense(
  input: CreateLicenseInput,
): Promise<CreateLicenseResult> {
  if (!(await isAdmin())) return { ok: false, error: "unauthorized" };
  if (!isLicensingConfigured()) return { ok: false, error: "not_configured" };

  const fingerprint = normalizeFingerprint(input.machineCode);
  if (fingerprint.length !== 32) return { ok: false, error: "invalid_machine_code" };
  if (!input.customer.trim()) return { ok: false, error: "missing_customer" };

  const mongo = getMongo();
  if (!mongo) return { ok: false, error: "no_database" };
  const client = await mongo;
  const db = client.db("elhegazi");

  // license serial via an atomic counter (L-000001, L-000002, …)
  const counter = await db
    .collection("counters")
    .findOneAndUpdate(
      { _id: "licenseId" as unknown as ObjectId },
      { $inc: { seq: 1 } },
      { upsert: true, returnDocument: "after" },
    );
  const num = (counter?.seq as number) ?? 1;
  const licenseId = formatLicenseId(num);

  try {
    const { blob, payload } = signLicense({
      fingerprint,
      issuedTo: input.customer.trim(),
      licenseId,
      features: input.features,
      expiresAt: input.expiresAt.trim() || null,
    });

    await db.collection("licenses").insertOne({
      licenseId,
      num,
      customer: input.customer.trim(),
      phone: input.phone.trim(),
      orderRef: input.orderRef.trim(),
      hardwareId: payload.hardwareId,
      features: input.features,
      expiresAt: payload.expiresAt,
      blob,
      status: "active",
      createdAt: new Date(),
    });

    revalidatePath("/admin/licenses");
    return { ok: true, licenseId, blob, formatted: formatActivationCode(blob) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "sign_failed" };
  }
}

export async function setLicenseStatus(
  id: string,
  status: "active" | "revoked",
): Promise<{ ok: boolean }> {
  if (!(await isAdmin())) return { ok: false };
  const mongo = getMongo();
  if (!mongo) return { ok: false };
  const client = await mongo;
  await client
    .db("elhegazi")
    .collection("licenses")
    .updateOne({ _id: new ObjectId(id) }, { $set: { status, updatedAt: new Date() } });
  revalidatePath("/admin/licenses");
  return { ok: true };
}
