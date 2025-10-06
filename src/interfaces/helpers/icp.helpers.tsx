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
export const asArray = (v?: Value): Value[] | undefined => (v && (v as any).array) as any;
export const asMap = (v?: Value): Array<[string, Value]> | undefined =>
  (v && (v as any).map) as any;
