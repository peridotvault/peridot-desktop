// src/api/storage.api.ts

export type OSKey = 'windows' | 'macos' | 'linux';

export interface InitResp {
  bucket: string;
  base: string; // ex: "games/GAME123/"
  prefixes: {
    assets: string; // "games/GAME123/assets/"
    announcements: string; // "games/GAME123/announcements/"
    previews: string; // "games/GAME123/previews/"
    metadata: string; // "games/GAME123/metadata/"
    'builds/web': string;
    'builds/windows': string;
    'builds/macos': string;
    'builds/linux': string;
  };
}

export const API_BASE_STORAGE = import.meta.env.VITE_API_BASE + '/storage';

function ensureTrailingSlash(x: string): string {
  return x.endsWith('/') ? x : x + '/';
}

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json();
}

export function safeFileName(name: string): string {
  const [base, ext = ''] = name.split(/\.(?=[^.]+$)/);
  const cleanBase = base.replace(/[^a-zA-Z0-9._-]+/g, '_').slice(0, 80);
  const cleanExt = ext.replace(/[^a-zA-Z0-9]+/g, '').slice(0, 16);
  return cleanExt ? `${cleanBase}.${cleanExt}` : cleanBase;
}

/**
 * Inisialisasi struktur folder game di storage
 * Menghasilkan prefix: games/<gameId>/...
 */
export async function initAppStorage(gameId: string): Promise<InitResp> {
  return json<InitResp>(
    await fetch(`${API_BASE_STORAGE}/init`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appId: gameId }), // NestJS tetap pakai `appId` di DTO
    }),
  );
}

/**
 * Dapatkan presigned URL untuk upload
 */
export async function presignUpload(args: {
  key: string; // full key, ex: "games/GAME123/assets/logo.png"
  contentType: string;
  public?: boolean;
}) {
  return json<{ url: string; key: string; publicUrl?: string }>(
    await fetch(`${API_BASE_STORAGE}/sign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(args),
    }),
  );
}

/**
 * Dapatkan presigned URL untuk baca file private
 */
export async function presignRead(key: string) {
  return json<{ url: string }>(
    await fetch(`${API_BASE_STORAGE}/sign-get`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key }),
    }),
  );
}

/**
 * Upload ke presigned URL
 */
export async function uploadWithPresignedURL(
  url: string,
  fileOrBlob: Blob,
  contentType: string,
): Promise<void> {
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    body: fileOrBlob,
  });
  if (!res.ok) {
    throw new Error(`Upload failed: ${res.status} ${await res.text()}`);
  }
}

/**
 * Helper: upload ke prefix tertentu
 */
export async function uploadToPrefix(args: {
  file: Blob;
  prefix: string; // ex: "games/GAME123/assets/"
  fileName: string;
  contentType: string;
  public?: boolean;
}) {
  const prefix = ensureTrailingSlash(args.prefix);
  const key = `${prefix}${args.fileName}`;

  const { url: putUrl, publicUrl } = await presignUpload({
    key,
    contentType: args.contentType,
    public: !!args.public,
  });

  await uploadWithPresignedURL(putUrl, args.file, args.contentType);
  return { key, publicUrl };
}
