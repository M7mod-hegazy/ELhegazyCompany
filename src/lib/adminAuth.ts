import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";

/**
 * Minimal cookie session for the owner's admin console. One shared password
 * (env ADMIN_PASSWORD) → an HMAC-signed, expiring cookie. No user table —
 * this is a single-operator console, not a multi-tenant system.
 */

const COOKIE = "hgz_admin";
const SESSION_MS = 14 * 24 * 60 * 60 * 1000;

function secret(): string {
  return process.env.ADMIN_PASSWORD || "";
}

function sign(exp: string): string {
  return crypto.createHmac("sha256", secret()).update(exp).digest("base64url");
}

export function isAdminConfigured(): boolean {
  return secret().length > 0;
}

export async function isAdmin(): Promise<boolean> {
  if (!isAdminConfigured()) return false;
  const value = (await cookies()).get(COOKIE)?.value;
  if (!value) return false;
  const [exp, sig] = value.split(".");
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(sign(exp)));
  } catch {
    return false;
  }
}

export function checkPassword(password: string): boolean {
  const expected = secret();
  if (!expected) return false;
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export async function startSession(): Promise<void> {
  const exp = String(Date.now() + SESSION_MS);
  (await cookies()).set(COOKIE, `${exp}.${sign(exp)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MS / 1000,
  });
}

export async function endSession(): Promise<void> {
  (await cookies()).delete(COOKIE);
}
