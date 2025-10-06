import { Principal } from '@dfinity/principal';

export type Timestamp = bigint;
export type AppId = bigint;
export type AnnouncementId = bigint;
export type UserId = Principal;
export type DeveloperId = Principal;
export type TokenLedgerId = Principal;
export type Version = string;
export type Country = string;
export type Language = string;
export type Category = string;
export type TagGroup = string;
export type Tag = string;

export type ApiError =
  | { NotFound: string }
  | { AlreadyExists: string }
  | { InvalidInput: string }
  | { StorageError: string }
  | { Unauthorized: string }
  | { InternalError: string }
  | { ValidationError: string }
  | { NotAuthorized: string };

export type ApiResponse<T> = { ok: T } | { err: ApiError };
type Opt<T> = [] | [T];
export function GetOpt<T>(o: Opt<T> | undefined | null): T | undefined {
  if (!o) return undefined;
  if (Array.isArray(o) && o.length > 0) return o[0];
  return undefined;
}

// bonus: buat util kebalikannya saat kirim ke canister

export const toOptVec = <T,>(arr?: T[] | null): Opt<T[]> => (arr && arr.length ? [arr] : []);

export type DistKey = 'web' | 'windows' | 'macos' | 'linux';
export type OSKey = Extract<DistKey, 'windows' | 'macos' | 'linux'>;
