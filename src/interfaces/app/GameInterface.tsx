import type {
  Distribution,
  Manifest,
  MediaItem,
  NativeBuild,
  WebBuild,
} from '@shared/blockchain/icp/types/legacy.types';
export type { MediaItem };
import { OSKey, Timestamp, UserId } from '../CoreInterface';

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
 *  App Rating
 *  ========================= */
export interface GameRating {
  userPrincipalId: UserId;
  rating: bigint; // Nat
  comment: string;
  createdAt: Timestamp;
}

/** =========================
 *  App
 *  ========================= */

export type GameStatusCode = 'publish' | 'notPublish';
export type ManifestsByOS = Record<OSKey, Manifest[]>;

export type HardwareFields = {
  processor: string;
  memory: string; // as string, nanti di-convert ke BigInt
  storage: string; // as string
  graphics: string;
  notes: string;
};

export type WebHardwareFields = {
  processor: string;
  memory: string;
  storage: string;
  graphics: string;
  notes?: string;
};

export type Option = {
  value: string;
  label: string;
};

export type PublishInfo = { status: GameStatusCode; releasedAt?: Timestamp };

export interface HydratedGameInterface {
  // ===== general
  pgl1_game_id: string;
  pgl1_name: string;
  pgl1_description: string;
  pgl1_cover_image?: string;
  pgl1_banner_image?: string;
  pgl1_price?: string;
  pgl1_required_age?: string;
  pgl1_website?: string;
  pgl1_distribution?: Option[]; // { value: 'web'|'windows'|'macos'|'linux', label: string }[]

  // inside pgl1_metadata
  pgl1_tags?: Tag[];
  pgl1_categories?: Category[];
  pgl1_previews?: MediaItem[];
  pgl1_published?: PublishInfo; //{isPublished : true , releaseDate : Timestamp}

  manifestsByOS?: Record<OSKey, Manifest[]>;
  webHardware?: WebHardwareFields | null;
  hardwareByOS?: Record<OSKey, HardwareFields>;
}

/** =========================
 *  Type Guards
 *  ========================= */
export const isWeb = (d: Distribution): d is { web: WebBuild } => 'web' in d;
export const isNative = (d: Distribution): d is { native: NativeBuild } => 'native' in d;
