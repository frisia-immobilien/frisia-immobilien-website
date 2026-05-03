import "server-only";

const ENV_NAME_PATTERN = /\b[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+\b/;

export function getPublicApiErrorMessage(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : "";
  if (!message) return fallback;

  if (process.env.NODE_ENV === "production" && ENV_NAME_PATTERN.test(message)) {
    return fallback;
  }

  return message;
}
