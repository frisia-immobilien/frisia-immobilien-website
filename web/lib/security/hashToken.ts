import "server-only";

import crypto from "node:crypto";
import { env } from "@/lib/env";

export function createRandomToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function hashToken(token: string) {
  return crypto.createHash("sha256").update(`${token}.${env.TOKEN_SECRET}`).digest("hex");
}

export function hashPrivacyValue(value: string | null | undefined) {
  const normalized = String(value ?? "").trim();
  if (!normalized) return null;
  return crypto.createHash("sha256").update(`${normalized}.${env.TOKEN_SECRET}`).digest("hex");
}

export function getReportExpiryDate(days = env.TOKEN_TTL_DAYS) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + days);
  return expiresAt;
}
