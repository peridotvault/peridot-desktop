export type OSKey = 'windows' | 'macos' | 'linux';

export interface InitResp {
  bucket: string;
  region: string;
  base: string; // ex: "icp/apps/<appId>/"
  prefixes: {
    assets: string; // "icp/apps/<appId>/assets/"
    announcements: string; // "icp/apps/<appId>/announcements/"
    previews: string; // "icp/apps/<appId>/previews/"
    metadata: string; // "icp/apps/<appId>/metadata/"
    'builds/web': string; // "icp/apps/<appId>/builds/web/"
    'builds/windows': string;
    'builds/macos': string;
    'builds/linux': string;
  };
}

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

function ensureTrailingSlash(x: string) {
  return x.endsWith('/') ? x : x + '/';
}

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  return res.json();
}

export function safeFileName(name: string) {
  const [base, ext = ''] = name.split(/\.(?=[^.]+$)/);
  const cleanBase = base.replace(/[^a-zA-Z0-9._-]+/g, '_').slice(0, 80);
  const cleanExt = ext.replace(/[^a-zA-Z0-9]+/g, '').slice(0, 16);
  return cleanExt ? `${cleanBase}.${cleanExt}` : cleanBase;
}

/** Inisialisasi struktur folder app di Wasabi */
export async function initAppStorage(appId: string) {
  return json<InitResp>(
    await fetch(`${API_BASE}/apps/${encodeURIComponent(appId)}/init`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appId }),
    }),
  );
}

/** Minta presigned PUT (server route: POST /wasabi/sign) */
export async function presignUpload(args: {
  key: string; // full key di bucket, ex: "icp/apps/<appId>/cover/file.png"
  contentType: string;
  public?: boolean; // opsional, tergantung server
}) {
  return json<{ url: string; key: string; publicUrl?: string }>(
    await fetch(`${API_BASE}/wasabi/sign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(args),
    }),
  );
}

/** Minta presigned GET untuk baca objek private (POST /wasabi/sign) */
export async function presignRead(key: string) {
  return json<{ url: string }>(
    await fetch(`${API_BASE}/wasabi/sign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key }),
    }),
  );
}

/** PUT ke presigned URL (fungsi internal, dipanggil oleh uploadToPrefix) */
export async function uploadWithPresignedURL(url: string, fileOrBlob: Blob, contentType: string) {
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    body: fileOrBlob,
  });
  if (!res.ok) {
    throw new Error(`Upload failed: ${res.status} ${await res.text()}`);
  }
}

/** Helper: hitung key dari prefix + fileName, sign PUT, lalu upload */
export async function uploadToPrefix(args: {
  file: Blob;
  prefix: string; // ex: "icp/apps/<appId>/cover/"
  fileName: string; // ex: "cover.png"
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
