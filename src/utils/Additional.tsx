import { EncryptedData } from '@antigane/encryption';
// import { Option } from '../interfaces/Additional';
import { DistKey, OSKey } from '../interfaces/CoreInterface';
import { Option } from '../interfaces/app/GameInterface';

export const shortenAddress = (address: string | null, firstSlice: number, secondSlice: number) => {
  if (address) return `${address.slice(0, firstSlice)}...${address.slice(-secondSlice)}`;
};

export const getProfileImage = (url: string | undefined | null) => {
  return url == '' || url == null || url == undefined ? './assets/img/profile_not_found.png' : url;
};

export const getCoverImage = (url: string | undefined | null) => {
  return url == '' || url == null || url == undefined ? './assets/img/cover_not_found.png' : url;
};

export const copyToClipboard = (data: EncryptedData | string | null) => {
  if (!data) return;
  const textToCopy = typeof data === 'string' ? data : data.data;
  navigator.clipboard.writeText(textToCopy).catch((err) => {
    console.error('Failed to copy: ', err);
  });
};

export const formatPeridotTokenPrice = (price: bigint | undefined) => {
  const convertedPrice = Number(price) / 1e8;
  return convertedPrice;
};

export const hasDist = (selected: Option[], value: DistKey) =>
  selected.some((d) => d.value === value);

export const toOSKey = (v: string): OSKey =>
  ['windows', 'macos', 'linux'].includes(v) ? (v as OSKey) : 'windows';

export const nowNs = (): bigint => BigInt(Date.now()) * 1_000_000n;

export const dateStrToNs = (yyyy_mm_dd: string): bigint => {
  if (!yyyy_mm_dd) return 0n;
  const [y, m, d] = yyyy_mm_dd.split('-').map((x) => Number(x));
  const ms = Date.UTC(y, m - 1, d, 0, 0, 0, 0);
  return BigInt(ms) * 1_000_000n;
};

export const nsToDateStr = (ns: bigint | number | string | null | undefined): string => {
  if (ns === null || ns === undefined) return '';
  // Pastikan jadi BigInt dulu (baik ns awalnya number atau string)
  const n = typeof ns === 'bigint' ? ns : BigInt(ns);
  const ms = Number(n / 1_000_000n);
  const d = new Date(ms);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
    .toISOString()
    .slice(0, 10);
};

export function formatShortEn(date: string, tz = 'Asia/Jakarta'): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: tz,
  }).formatToParts(new Date(date));

  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  return `${get('weekday')}, ${get('month')} ${get('day')} ${get('year')}`;
}
