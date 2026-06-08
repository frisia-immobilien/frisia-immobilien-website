import "server-only";

import fs from "node:fs";
import path from "node:path";

export type ActiveWebsiteSnapshot = {
  activeSnapshotId: string;
  fallbackSnapshotId?: string | null;
  publishedAt?: string | null;
  checksum?: string | null;
};

export type WebsiteSnapshotManifest = {
  id?: string;
  version?: string;
  createdAt?: string;
  publishedAt?: string | null;
  checksum?: string;
  checksum_sha256?: string;
  validationStatus?: "valid" | "invalid";
  validation?: {
    ok?: boolean;
    errors?: string[];
    warnings?: string[];
  };
  counts?: Record<string, number>;
  files?: Record<string, string>;
  published?: boolean;
};

let activeSnapshotCache: ActiveWebsiteSnapshot | null | undefined;
let manifestCache: WebsiteSnapshotManifest | null | undefined;
const jsonCache = new Map<string, unknown>();

function snapshotRootCandidates() {
  return [
    path.join(process.cwd(), "data", "website-snapshots"),
    path.join(process.cwd(), "..", "data", "website-snapshots"),
  ];
}

function readJsonFile<T>(filePath: string): T | null {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
  } catch {
    return null;
  }
}

function findSnapshotRoot() {
  return snapshotRootCandidates().find((candidate) => fs.existsSync(path.join(candidate, "active-snapshot.json"))) ?? null;
}

export function getActiveWebsiteSnapshot(): ActiveWebsiteSnapshot | null {
  if (activeSnapshotCache !== undefined) return activeSnapshotCache;

  const root = findSnapshotRoot();
  if (!root) {
    activeSnapshotCache = null;
    return activeSnapshotCache;
  }

  const active = readJsonFile<ActiveWebsiteSnapshot>(path.join(root, "active-snapshot.json"));
  activeSnapshotCache = active?.activeSnapshotId ? active : null;
  return activeSnapshotCache;
}

export function hasActiveWebsiteSnapshot() {
  return getActiveWebsiteSnapshot() !== null;
}

function activeSnapshotRoot() {
  const root = findSnapshotRoot();
  const active = getActiveWebsiteSnapshot();
  if (!root || !active) return null;
  return path.join(root, "snapshots", active.activeSnapshotId);
}

function getActiveManifest() {
  if (manifestCache !== undefined) return manifestCache;

  const root = activeSnapshotRoot();
  if (!root) {
    manifestCache = null;
    return manifestCache;
  }

  const manifest = readJsonFile<WebsiteSnapshotManifest>(path.join(root, "manifest.json"));
  const isValid =
    manifest?.validationStatus === "valid" ||
    manifest?.validation?.ok === true ||
    (manifest?.published === true && !manifest?.validation?.errors?.length);

  manifestCache = isValid ? manifest : null;
  return manifestCache;
}

export function getActiveWebsiteSnapshotManifest() {
  return getActiveManifest();
}

export function readActiveSnapshotJson<T>(fileKey: string): T | null {
  const root = activeSnapshotRoot();
  const manifest = getActiveManifest();
  if (!root || !manifest) return null;

  const fileName = manifest.files?.[fileKey] || fileKey;
  const cacheKey = `${root}:${fileName}`;
  if (jsonCache.has(cacheKey)) return jsonCache.get(cacheKey) as T;

  const payload = readJsonFile<T>(path.join(root, fileName));
  if (payload !== null) jsonCache.set(cacheKey, payload);
  return payload;
}
