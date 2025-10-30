export * from '@shared/blockchain/icp/types/legacy.types';

import type {
  Category,
  Distribution,
  GameId,
  Manifest,
  MediaItem,
  Platform,
  Tag,
} from '@shared/blockchain/icp/types/legacy.types';

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
  created_at?: number;
  updated_at?: number;
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

export interface CategoryDraft {
  category_id: string;
  name: string;
}

export interface TagDraft {
  tag_id: string;
  name: string;
}

export interface CategoriesResponse {
  categories: CategoryDraft[];
}

export interface TagsResponse {
  tags: TagDraft[];
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
