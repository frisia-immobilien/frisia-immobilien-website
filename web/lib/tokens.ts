import crypto from "crypto";

export function makeToken(): string {
  return crypto.randomBytes(32).toString("hex"); // 64 chars
}

export function hashToken(token: string, secret: string): string {
  return crypto.createHash("sha256").update(`${token}.${secret}`).digest("hex");
}

export function expiresAtDays(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}