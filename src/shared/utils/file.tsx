// src/utils/file.ts
export function base64ToBlob(dataUrl: string): {
  blob: Blob;
  type: string;
  ext: string;
} {
  const [meta, b64] = dataUrl.split(',');
  const m = /data:(.*?);base64/.exec(meta || '');
  const type = m?.[1] || 'application/octet-stream';
  const bin = atob(b64 || '');
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  const blob = new Blob([buf], { type });
  const ext = mimeToExt(type);
  return { blob, type, ext };
}
function mimeToExt(type: string): string {
  if (type === 'image/jpeg') return 'jpg';
  if (type === 'image/png') return 'png';
  if (type === 'image/webp') return 'webp';
  if (type === 'video/mp4') return 'mp4';
  if (type === 'video/webm') return 'webm';
  if (type === 'application/zip') return 'zip';
  const p = type.split('/')[1];
  return p || 'bin';
}

export async function sha256Hex(blob: Blob): Promise<string> {
  const buf = await blob.arrayBuffer();
  const digest = await crypto.subtle.digest('SHA-256', buf);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
