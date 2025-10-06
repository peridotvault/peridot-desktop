import {
  Distribution,
  Manifest,
  NativeBuild,
  WebBuild,
} from '../../blockchain/icp/vault/service.did.d';
import { MediaItem } from '../../components/organisms/CarouselPreview';
import { Option } from '../Additional';
import { AppId, OSKey, Timestamp, UserId } from '../CoreInterface';

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
 *  App Rating
 *  ========================= */
export interface AppRating {
  userPrincipalId: UserId;
  rating: bigint; // Nat
  comment: string;
  createdAt: Timestamp;
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

export type GameStatusCode = 'publish' | 'notPublish';
export type ManifestsByOS = Record<OSKey, Manifest[]>;

export interface HydratedAppInterface {
  // general
  title: string; // <= pgl1_name
  description: string; // <= pgl1_description
  coverImage: string; // <= pgl1_cover_image
  bannerImage: string; // <= metadata.pgl1_banner_image
  priceStr: string; // <= String(pgl1_price?)
  requiredAgeStr: string; // <= String(pgl1_required_age?)
  releaseDateStr: string; // (opsional: jika kamu simpan di metadata release_date_ns)
  statusCode: GameStatusCode; // <= metadata.pgl1_status -> "publish"/"notPublish"
  selectedCategories: Option[]; // <= metadata.pgl1_category
  appTags: string[]; // <= metadata.pgl1_tags
  previewItems: MediaItem[]; // <= metadata.pgl1_previews

  // distribution
  selectedDistribution: Option[]; // dari pgl1_distribution
  manifestsByOS: ManifestsByOS; // dari native.manifests
  webUrl: string; // dari web.url

  // hardware (di-share dari first native)
  processor: string;
  memory: string;
  storage: string;
  graphics: string;
  notes: string;
}

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
