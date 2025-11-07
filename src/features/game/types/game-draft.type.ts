import type {
  GameId,
  Platform,
  Distribution,
  Manifest,
  MediaItem,
  Tag,
  Category,
} from '@shared/blockchain/icp/types/game.types';

export type { Distribution };

export interface GameDraft {
  gameId?: GameId;
  game_id?: GameId;
  name?: string;
  description?: string;
  requiredAge?: number;
  required_age?: number;
  price?: number;
  website?: string;
  bannerImage?: string;
  banner_image?: string;
  coverVerticalImage?: string;
  cover_vertical_image?: string;
  coverHorizontalImage?: string;
  cover_horizontal_image?: string;
  isPublished?: boolean;
  is_published?: boolean;
  releaseDate?: number;
  release_date?: number;
  draftStatus?: string;
  draft_status?: string;
  previews?: MediaItem[];
  distributions?: Array<Distribution>;
  categories?: Category[];
  tags?: Tag[];
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
}

export interface GameGeneral {
  name?: string;
  description?: string;
  requiredAge?: number;
  required_age?: number;
  price?: number;
  website?: string;
  coverVerticalImage?: string;
  cover_vertical_image?: string;
  coverHorizontalImage?: string;
  cover_horizontal_image?: string;
  bannerImage?: string;
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

export type GameWhole = Omit<GameDraft, 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt?: string;
};

export interface GameMetadataResponse {
  categories: string[];
  tags: string[];
  previews: MediaItem[];
  name?: string;
  description?: string;
  price?: number;
  requiredAge?: number;
  required_age?: number;
  website?: string;
  banner_image?: string;
  bannerImage?: string;
  cover_vertical_image?: string;
  coverVerticalImage?: string;
  cover_horizontal_image?: string;
  coverHorizontalImage?: string;
  releaseDate?: number;
  release_date?: number;
  draftStatus?: string;
  draft_status?: string;
  createdAt: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
}

export type GameWholeUpsertPayload = Partial<Omit<GameWhole, 'updatedAt'>> & {
  createdAt?: string;
  updatedAt?: string;
};

export interface CategoryDb {
  categoryId: string;
  name: string;
}

export interface TagDb {
  tagId: string;
  name: string;
}

export interface CategoriesResponse {
  categories: CategoryDb[];
}

export interface TagsResponse {
  tags: TagDb[];
}

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
      platform: Exclude<Platform, 'web'>;
      os: string;
      hardware: HardwarePatch;
    };

export interface AppendManifestPayload {
  setLive?: boolean;
  os: string;
  manifest: Manifest;
}
