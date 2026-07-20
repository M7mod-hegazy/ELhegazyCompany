import "server-only";
import crypto from "node:crypto";

/**
 * Ed25519 license signing for the POS app (seller side) — a TypeScript port of
 * `retailer/shared/licensing` (signLicense.js + tokenCodec.js), byte-compatible
 * with the RTL2 token format the installed app verifies offline.
 *
 * The private key NEVER lives in this repo: set `LICENSE_PRIVATE_KEY_PEM` in
 * the environment (Vercel → Project → Environment Variables). It must be the
 * PKCS8 PEM whose public half is embedded in the POS build
 * (`retailer/shared/licensing/publicKey.js`). Accepts either the raw PEM with
 * real newlines, a \n-escaped single-line value, or base64 of the whole PEM.
 */

const PAYLOAD_VERSION_V2 = 2;
const TOKEN_PREFIX_V2 = "RTL2";
const MAX_ISSUED_TO_BYTES = 32;

export type LicensePayload = {
  v: number;
  hardwareId: string;
  issuedTo: string | null;
  licenseId: string | null;
  issuedAt: string;
  expiresAt: string | null;
  features: string;
};

export function getLicensePrivateKeyPem(): string | null {
  const raw = process.env.LICENSE_PRIVATE_KEY_PEM;
  if (!raw || !raw.trim()) return null;
  if (raw.includes("BEGIN")) return raw.replace(/\\n/g, "\n");
  return Buffer.from(raw, "base64").toString("utf8");
}

export function isLicensingConfigured(): boolean {
  return getLicensePrivateKeyPem() !== null;
}

/** Accept machine codes with dashes/spaces/mixed case → raw lowercase hex. */
export function normalizeFingerprint(value: string): string {
  return String(value || "")
    .toLowerCase()
    .replace(/[^0-9a-f]/g, "");
}

function parseLicenseNumber(licenseId: string | null): number {
  const match = String(licenseId || "").match(/(\d+)/);
  return match ? Number(match[1]) : 0;
}

export function formatLicenseId(num: number): string {
  return `L-${String(num).padStart(6, "0")}`;
}

function parseExpiresAt(expiresAt: string | null): number {
  if (!expiresAt) return 0;
  const raw = String(expiresAt).trim();
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(raw);
  const date = new Date(dateOnly ? `${raw}T23:59:59.999Z` : raw);
  if (!Number.isFinite(date.getTime())) return 0;
  return Math.floor(date.getTime() / 1000);
}

function featuresToCode(features: string): number {
  return String(features) === "trial" ? 1 : 0;
}

/** RTL2 compact binary message — byte-identical to tokenCodec.packCompactMessage. */
function packCompactMessage(payload: LicensePayload): Buffer {
  const hw = Buffer.from(normalizeFingerprint(payload.hardwareId), "hex");
  if (hw.length !== 16) throw new Error("invalid_hardwareId");

  const nameBuf = Buffer.from(String(payload.issuedTo || ""), "utf8").subarray(
    0,
    MAX_ISSUED_TO_BYTES,
  );
  const licenseNum = parseLicenseNumber(payload.licenseId);
  const issuedAt = Math.floor(Date.parse(payload.issuedAt) / 1000);
  const expiresAt = parseExpiresAt(payload.expiresAt);
  const features = featuresToCode(payload.features);

  const message = Buffer.alloc(31 + nameBuf.length);
  message.writeUInt8(PAYLOAD_VERSION_V2, 0);
  hw.copy(message, 1);
  message.writeUInt32BE(licenseNum, 17);
  message.writeUInt32BE(issuedAt, 21);
  message.writeUInt32BE(expiresAt, 25);
  message.writeUInt8(features, 29);
  message.writeUInt8(nameBuf.length, 30);
  nameBuf.copy(message, 31);
  return message;
}

function encodeTokenV2(payload: LicensePayload, signature: Buffer): string {
  const message = packCompactMessage(payload);
  const wire = Buffer.concat([message, signature]);
  return `${TOKEN_PREFIX_V2}.${wire.toString("base64url")}`;
}

/** Group the activation code for easier reading/copying (whitespace-safe). */
export function formatActivationCode(blob: string): string {
  const raw = String(blob || "").trim();
  if (!raw) return "";
  const dot = raw.indexOf(".");
  if (dot === -1) return raw;
  const prefix = raw.slice(0, dot + 1);
  const body = raw.slice(dot + 1);
  const groups = body.match(/.{1,5}/g) || [];
  return `${prefix}${groups.join(" ")}`;
}

export function formatMachineCode(hardwareId: string): string {
  const hex = String(hardwareId || "")
    .toUpperCase()
    .replace(/[^0-9A-F]/g, "");
  return (hex.match(/.{1,4}/g) || []).join("-");
}

/**
 * Build + sign an RTL2 license token for a customer machine.
 * Throws on invalid fingerprint or missing key — callers surface the message.
 */
export function signLicense({
  fingerprint,
  issuedTo,
  licenseId,
  expiresAt = null,
  features = "full",
  issuedAt = new Date().toISOString(),
}: {
  fingerprint: string;
  issuedTo: string;
  licenseId: string;
  expiresAt?: string | null;
  features?: "full" | "trial";
  issuedAt?: string;
}): { blob: string; payload: LicensePayload } {
  const privateKeyPem = getLicensePrivateKeyPem();
  if (!privateKeyPem) throw new Error("missing_private_key");

  const hardwareId = normalizeFingerprint(fingerprint);
  if (hardwareId.length !== 32) throw new Error("invalid_fingerprint");

  const payload: LicensePayload = {
    v: PAYLOAD_VERSION_V2,
    hardwareId,
    issuedTo: String(issuedTo || "").trim() || null,
    licenseId: String(licenseId || "").trim() || null,
    issuedAt,
    expiresAt: expiresAt ? String(expiresAt) : null,
    features: String(features || "full"),
  };

  const privateKey = crypto.createPrivateKey(privateKeyPem);
  const message = packCompactMessage(payload);
  // Ed25519 requires the algorithm argument to be null.
  const signature = crypto.sign(null, message, privateKey);
  return { blob: encodeTokenV2(payload, signature), payload };
}
