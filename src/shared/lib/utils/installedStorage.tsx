import { OSKey } from '@shared/api/wasabi.api';

export type InstalledEntry = {
  version: string;
  os: OSKey;
  filePath?: string; // path file installer/hasil unduh (non-zip)
  installDir?: string; // folder hasil extract (zip)
  launchPath?: string; // path executable yg siap diluncurkan
  fileUrl?: string; // kalau web-fallback
  fileName: string;
  sizeBytes?: number;
  checksum?: string;
  checksumVerified?: boolean;
  installedAt: number; // Date.now()
};

export type InstalledRecord = {
  appId: string;
  title?: string;
  cover?: string;
  entries: InstalledEntry[];
};

function keyFor(appId: string | number | bigint) {
  return `pv.installed.${String(appId)}`;
}

export function getInstalledRecord(appId: string | number | bigint): InstalledRecord | null {
  try {
    const raw = localStorage.getItem(keyFor(appId));
    return raw ? (JSON.parse(raw) as InstalledRecord) : null;
  } catch {
    return null;
  }
}

export function isInstalled(appId: string | number | bigint, os?: OSKey): boolean {
  const rec = getInstalledRecord(appId);
  if (!rec) return false;
  if (!os) return rec.entries.length > 0;
  return rec.entries.some((e) => e.os === os);
}

export function getLatestInstalled(
  appId: string | number | bigint,
  os?: OSKey,
): InstalledEntry | undefined {
  const rec = getInstalledRecord(appId);
  if (!rec) return undefined;
  const list = os ? rec.entries.filter((e) => e.os === os) : rec.entries.slice();
  return list.sort((a, b) => b.installedAt - a.installedAt)[0];
}

export function upsertInstalledEntry(
  appId: string | number | bigint,
  entry: InstalledEntry,
  meta?: { title?: string; cover?: string },
) {
  const key = keyFor(appId);
  const prev =
    getInstalledRecord(appId) ?? ({ appId: String(appId), entries: [] } as InstalledRecord);

  if (meta?.title) prev.title = meta.title;
  if (meta?.cover) prev.cover = meta.cover;

  const idx = prev.entries.findIndex((e) => e.os === entry.os && e.version === entry.version);
  if (idx >= 0) prev.entries[idx] = entry;
  else prev.entries.push(entry);

  localStorage.setItem(key, JSON.stringify(prev));
}

export function removeInstalled(appId: string | number | bigint, os?: OSKey) {
  if (!os) {
    localStorage.removeItem(keyFor(appId));
    return;
  }
  const rec = getInstalledRecord(appId);
  if (!rec) return;
  rec.entries = rec.entries.filter((e) => e.os !== os);
  localStorage.setItem(keyFor(appId), JSON.stringify(rec));
}
