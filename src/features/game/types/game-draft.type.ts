export * from '@shared/blockchain/icp/types/legacy.types';

import type {
  Category,
  GameId,
  Platform,
  Tag,
} from '@shared/blockchain/icp/types/legacy.types';
import type {
  Distribution,
  Manifest,
  MediaItem,
} from '@shared/blockchain/icp/types/game.types';

export interface GameDraft {
  game_id?: GameId;
  name?: string;
  description?: string;
  required_age?: number;
  price?: number;
  website?: string;
  banner_image?: string;
  cover_vertical_image?: string;
  cover_horizontal_image?: string;
  is_published?: boolean;
  release_date?: number;
  draft_status?: string;
  previews?: MediaItem[];
  distributions?: Array<Distribution>;
  categories?: Category[];
  tags?: Tag[];
  created_at?: string;
  updated_at?: string;
}

export interface GameGeneral {
  name?: string;
  description?: string;
  required_age?: number;
  price?: number;
  website?: string;
  cover_vertical_image?: string;
  cover_horizontal_image?: string;
  banner_image?: string;
  categories?: Category[];
  tags?: Tag[];
}

export interface GamePreview {
  previews?: MediaItem[];
}

export interface GameBuilds {
  distributions?: Array<Distribution>;
}

export type GameWhole = Omit<GameDraft, 'created_at' | 'updated_at'> & {
  created_at: string;
  updated_at?: string;
};

export interface GameMetadataResponse {
  categories: string[];
  tags: string[];
  previews: MediaItem[];
  required_age?: number;
  website?: string;
  banner_image?: string;
  cover_vertical_image?: string;
  cover_horizontal_image?: string;
  release_date?: number;
  draft_status?: string;
  created_at: string;
  updated_at?: string;
}

export type GameWholeUpsertPayload = Partial<Omit<GameWhole, 'updated_at'>> & {
  /**
   * Optional ISO timestamp used when creating a new row.
   * When omitted the service will reuse the current stored value or now().
   */
  created_at?: string;
  /**
   * Optional ISO timestamp representing the latest update time.
   * When omitted the service will assign the current time.
   */
  updated_at?: string;
};

export interface CategoryDb {
  category_id: string;
  name: string;
}

export interface TagDb {
  tag_id: string;
  name: string;
}

export interface CategoriesResponse {
  categories: CategoryDb[];
}

export interface TagsResponse {
  tags: TagDb[];
}

// DTO
export interface HardwarePatch {
  processor?: string;
  graphics?: string;
  memory?: number;
  storage?: number;
  additionalNotes?: string;
}

export type SetHardwarePayload =
  | {
      platform: 'web';
      hardware: HardwarePatch;
    }
  | {
      platform: Exclude<Platform, 'web'>; // windows/macos/linux/android/ios
      os: string; // wajib utk native
      hardware: HardwarePatch;
    };

export interface AppendManifestPayload {
  setLive?: boolean;
  os: string; // target OS native
  manifest: Manifest; // 1 manifest yang ingin di-append
}
