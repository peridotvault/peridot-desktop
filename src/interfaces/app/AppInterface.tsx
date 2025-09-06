import { MediaItem } from '../../components/organisms/CarouselPreview';
import { Option } from '../Additional';
import { AppId, Opt, OSKey, Timestamp, UserId } from '../CoreInterface';

/** Jika kamu punya enum/variant final, impor dari file lain */
export type AppStatus = { publish: null } | { notPublish: null };

export type Media = { image: null } | { video: null };

export type Tag = string;
export type Category = string;

/** =========================
 *  Preview
 *  ========================= */
export interface Preview {
  kind: Media;
  url: string;
}

/** =========================
 *  OS (variant)
 *  ========================= */
export type OS = { windows: null } | { macos: null } | { linux: null };

/** =========================
 *  Manifest
 *  ========================= */
export interface ManifestInterface {
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
  manifests: ManifestInterface[];
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
export interface UpdateAppInterface {
  title: string;
  description: string;
  bannerImage: Opt<string>;
  coverImage: Opt<string>;
  previews: Opt<Preview[]>;
  price: Opt<bigint>;
  requiredAge: Opt<bigint>;
  releaseDate: Opt<Timestamp>;
  status: AppStatus;
  category: Opt<Category[]>;
  appTags: Opt<Tag[]>;
  distributions: Opt<Distribution[]>;
}

export interface CreateAppInterface {
  title: string;
  description: string;
}

/** =========================
 *  App
 *  ========================= */
export interface AppInterface {
  appId: AppId;
  developerId: UserId;
  title: string;
  description: string;
  bannerImage: string;
  coverImage: string;
  previews: Preview[];
  price: bigint; // Nat
  requiredAge: bigint; // Nat
  releaseDate: Timestamp;
  status: AppStatus;
  createdAt: Timestamp;
  category: Category[];
  appTags: Tag[];
  distributions: Distribution[];
  appRatings?: AppRating[] | null;
}

export type HydratedAppInterface = {
  title: string;
  description: string;
  coverImage: string;
  bannerImage: string;
  priceStr: string;
  requiredAgeStr: string;
  releaseDateStr: string;
  statusCode: 'publish' | 'notPublish';
  selectedCategories: Option[];
  appTags: string[];
  previewItems: MediaItem[];
  selectedDistribution: Option[];
  manifestsByOS: Record<OSKey, ManifestInterface[]>;
  webUrl: string;
  processor: string;
  memory: string;
  storage: string;
  graphics: string;
  notes: string;
};

export type HardwareSpec = {
  processor: string;
  memory: string; // string angka, nanti di-convert ke BigInt
  storage: string; // string angka, nanti di-convert ke BigInt
  graphics: string;
  notes: string;
};

/** =========================
 *  Type Guards
 *  ========================= */
export const isWeb = (d: Distribution): d is { web: WebBuild } => 'web' in d;
export const isNative = (d: Distribution): d is { native: NativeBuild } => 'native' in d;

export const isWindows = (os: OS): os is { windows: null } => 'windows' in os;
export const isMac = (os: OS): os is { macos: null } => 'macos' in os;
export const isLinux = (os: OS): os is { linux: null } => 'linux' in os;
