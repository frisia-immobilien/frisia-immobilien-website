import "server-only";

function readEnv(name: string) {
  const value = process.env[name];
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : "";
}

export function requireEnv(name: string) {
  const value = readEnv(name);
  if (!value) {
    throw new Error(`${name} ist nicht gesetzt.`);
  }
  return value;
}

export const env = {
  DATABASE_URL: requireEnv("DATABASE_URL"),
  TOKEN_SECRET: requireEnv("TOKEN_SECRET"),
  TOKEN_TTL_DAYS: Number(readEnv("TOKEN_TTL_DAYS") || 30),
  PUBLIC_BASE_URL: readEnv("PUBLIC_BASE_URL"),
  PROPSTACK_API_KEY: readEnv("PROPSTACK_API_KEY"),
  PROPSTACK_BASE_URL: readEnv("PROPSTACK_BASE_URL") || "https://api.propstack.de/v2",
  PROPSTACK_V1_BASE_URL:
    readEnv("PROPSTACK_V1_BASE_URL") ||
    readEnv("PROPSTACK_BASE_URL").replace(/\/v2\/?$/i, "/v1") ||
    "https://api.propstack.de/v1",
  PROPSTACK_BROKER_ID: readEnv("PROPSTACK_BROKER_ID"),
  PROPSTACK_LEAD_BROKER_ID: readEnv("PROPSTACK_LEAD_BROKER_ID"),
  PROPSTACK_LEAD_BROKER_EMAIL: readEnv("PROPSTACK_LEAD_BROKER_EMAIL"),
  PROPSTACK_LEAD_BROKER_NAME: readEnv("PROPSTACK_LEAD_BROKER_NAME"),
  PROPSTACK_REPORT_SNIPPET_ID: readEnv("PROPSTACK_REPORT_SNIPPET_ID"),
  GOOGLE_MAPS_API_KEY: readEnv("GOOGLE_MAPS_API_KEY"),
  OPENCAGE_API_KEY: readEnv("OPENCAGE_API_KEY"),
  BORIS_API_URL: readEnv("BORIS_API_URL"),
};
