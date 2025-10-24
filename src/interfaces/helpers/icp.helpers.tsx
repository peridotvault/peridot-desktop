import { Distribution } from '../../blockchain/icp/pgc/service.did.d';
import { Metadata, Value } from '../../blockchain/icp/vault/service.did.d';

export type Opt<T> = [] | [T];
export const optGet = <T,>(o: [] | [T]) => (o.length ? o[0] : undefined);
export const optGetOr = <T,>(o: [] | [T], fallback: T) => (o.length ? o[0] : fallback);
export function ToOpt<T>(v: T | null | undefined): Opt<T> {
  return v == null ? [] : [v];
}
export const unwrapOpt = <T,>(o: [] | [T] | undefined): T | undefined =>
  Array.isArray(o) ? (o.length ? o[0] : undefined) : undefined;

export const mdGet = (metaOpt: [] | [Metadata] | undefined, key: string): Value | undefined => {
  const md = unwrapOpt(metaOpt) ?? [];
  for (const [k, v] of md) if (k === key) return v;
  return undefined;
};

export const asText = (v?: Value): string | undefined => (v && (v as any).text) as any;
export const asBigInt = (v?: Value): bigint | undefined => (v && (v as any).text) as any;
export const asArray = (v?: Value): Value[] | undefined => (v && (v as any).array) as any;
export const asMap = (v?: Value): Array<[string, Value]> | undefined =>
  (v && (v as any).map) as any;

export const fmtBytes = (n?: bigint): string | undefined => {
  if (n === undefined) return undefined;
  const num = Number(n);
  if (Number.isNaN(num)) return String(n);
  const KB = 1024;
  const MB = KB ** 2;
  const GB = KB ** 3;
  if (num >= GB) return `${(num / GB).toFixed(1)} GB`;
  if (num >= MB) return `${(num / MB).toFixed(0)} MB`;
  if (num >= KB) return `${(num / KB).toFixed(0)} KB`;
  return `${num} B`;
};

export const unopt = <T,>(v: [] | [T] | undefined | null): T | undefined =>
  Array.isArray(v) && v.length ? v[0] : undefined;

export type PlatformKey = 'Website' | 'Windows' | 'macOS' | 'Linux' | 'Other';

export const normalizeOsToPlatform = (osRaw: string | undefined): PlatformKey => {
  const os = (osRaw || '').toLowerCase();
  if (os.includes('win')) return 'Windows';
  if (os.includes('mac') || os.includes('os x') || os.includes('darwin')) return 'macOS';
  if (os.includes('linux') || os.includes('ubuntu') || os.includes('debian')) return 'Linux';
  return 'Other';
};

export type NormalizedDist = {
  Website?: WebSpec[]; // bisa lebih dari satu web build
  Windows?: NativeSpec[];
  macOS?: NativeSpec[];
  Linux?: NativeSpec[];
  Other?: NativeSpec[];
};

export type NativeSpec = {
  os: string;
  processor: string;
  graphics: string;
  memory?: string; // formatted
  storage?: string; // formatted
  notes?: string;
};

export type WebSpec = {
  processor: string;
  graphics: string;
  memory?: string; // formatted
  storage?: string; // formatted
  notes?: string;
};

export const normalizeDistribution = (
  distOpt: [] | [Array<Distribution>] | undefined,
): NormalizedDist => {
  const out: NormalizedDist = {};
  const dist = unopt(distOpt) ?? [];
  for (const d of dist) {
    if ('web' in d) {
      const w = d.web;
      const webSpec: WebSpec = {
        processor: w.processor,
        graphics: w.graphics,
        memory: fmtBytes(w.memory),
        storage: fmtBytes(w.storage),
        notes: unopt(w.additionalNotes),
      };
      (out.Website ??= []).push(webSpec);
    } else if ('native' in d) {
      const n = d.native;
      const pf: PlatformKey = normalizeOsToPlatform(n.os);
      const nat: NativeSpec = {
        os: n.os,
        processor: n.processor,
        graphics: n.graphics,
        memory: fmtBytes(n.memory),
        storage: fmtBytes(n.storage),
        notes: unopt(n.additionalNotes),
      };
      (out[pf] ??= []).push(nat);
    }
  }
  return out;
};
