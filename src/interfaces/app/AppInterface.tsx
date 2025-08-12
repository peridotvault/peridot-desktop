import { AppId, Timestamp, UserId } from "../CoreInterface";

/** Jika kamu punya enum/variant final, impor dari file lain */
export type AppStatus =
  | { draft: null }
  | { published: null }
  | { archived: null }
  | { hidden: null }; // <-- EDIT sesuai Core.AppStatus milikmu

export type Category =
  | { game: null }
  | { tool: null }
  | { demo: null }
  | { other: null }; // <-- EDIT sesuai Core.Category milikmu

export type Tag = string; // <-- EDIT jika Tag kamu adalah variant, bukan string

/** =========================
 *  Preview
 *  ========================= */
export interface Preview {
  url: string;
}

/** =========================
 *  OS (variant)
 *  ========================= */
export type OS = { windows: null } | { macos: null } | { linux: null };

/** =========================
 *  Manifest
 *  ========================= */
export interface Manifest {
  version: string; // ex: "1.0.3"
  size: number; // Motoko Float -> JS number (Float64)
  bucket: string; // storage bucket
  basePath: string; // folder/path
  checksum: string; // sha256 / dsb
  content: string; // payload/listing file
  createdAt: Timestamp;
}

/** =========================
 *  Web & Native Build
 *  ========================= */
export interface WebBuild {
  url: string; // ex: https://game.example/play
}

export interface NativeBuild {
  os: OS; // #windows | #macos | #linux
  manifests: Manifest[];
  processor: string;
  memory: bigint; // in MB/GB (Nat)
  storage: bigint; // in MB/GB (Nat)
  graphics: string;
  additionalNotes?: string | null;
}

/** =========================
 *  Distribution (variant)
 *  ========================= */
export type Distribution = { web: WebBuild } | { native: NativeBuild };

/** =========================
 *  App Rating
 *  ========================= */
export interface AppRating {
  userPrincipalId: UserId;
  rating: bigint; // Nat
  comment: string;
  createdAt: Timestamp;
}

/** =========================
 *  Create DTO
 *  ========================= */
export interface CreateApp {
  title: string;
  description: string;
  coverImage: string;
  previews: Preview[];
  price: bigint; // Nat
  requiredAge: bigint; // Nat
  releaseDate: Timestamp;
  status: AppStatus;
  createdAt: Timestamp;
  category: Category;
  appTags: Tag[];
  distributions: Distribution[];
}

/** =========================
 *  App
 *  ========================= */
export interface AppInterface {
  appId: AppId;
  developerId: UserId;
  title: string;
  description: string;
  coverImage: string;
  previews: Preview[];
  price: bigint; // Nat
  requiredAge: bigint; // Nat
  releaseDate: Timestamp;
  status: AppStatus;
  createdAt: Timestamp;
  category: Category;
  appTags: Tag[];
  distributions: Distribution[];
  appRatings?: AppRating[] | null;
}

/** =========================
 *  Type Guards
 *  ========================= */
export const isWeb = (d: Distribution): d is { web: WebBuild } => "web" in d;
export const isNative = (d: Distribution): d is { native: NativeBuild } =>
  "native" in d;

export const isWindows = (os: OS): os is { windows: null } => "windows" in os;
export const isMac = (os: OS): os is { macos: null } => "macos" in os;
export const isLinux = (os: OS): os is { linux: null } => "linux" in os;
