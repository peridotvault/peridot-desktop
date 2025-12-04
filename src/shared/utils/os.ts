import { OSKey } from '@shared/interfaces/CoreInterface';

// Detects the current OS in a browser-friendly way.
// Falls back to linux when a platform cannot be inferred (e.g., SSR).
export const detectOSKey = (): OSKey => {
  if (typeof navigator === 'undefined') return 'linux';

  const platform = (navigator.platform || '').toLowerCase();
  const ua = (navigator.userAgent || '').toLowerCase();

  if (platform.includes('win') || ua.includes('windows')) return 'windows';
  if (platform.includes('mac') || ua.includes('mac') || ua.includes('darwin')) return 'macos';
  return 'linux';
};

// Normalizes arbitrary strings into a supported OSKey.
export const normalizeOSKey = (value: string): OSKey => {
  const lower = value.toLowerCase();
  if (lower.includes('win')) return 'windows';
  if (lower.includes('mac') || lower.includes('darwin')) return 'macos';
  return 'linux';
};
