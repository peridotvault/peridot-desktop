export * from '@shared/blockchain/icp/types/legacy.types';
export type {
  OffChainGameMetadata,
  OnChainGameMetadata,
} from '@shared/blockchain/icp/types/game.types';

import type {
  Category,
  Distribution,
  GameId,
  Metadata,
  MediaItem,
  PublishInfo,
  Tag,
} from '@shared/blockchain/icp/types/legacy.types';

export interface DraftPGL {
  pgl1_game_id?: GameId;
  pgl1_required_age?: number;
  pgl1_cover_vertical_image?: string;
  pgl1_cover_horizontal_image?: string;
  pgl1_banner_image?: string;
  pgl1_distribution?: Array<Distribution>;
  pgl1_description?: string;
  pgl1_name?: string;
  pgl1_metadata?: Metadata;
  pgl1_website?: string;
  pgl1_price?: number;
}

export type DraftMetadata = {
  status?: PublishInfo;
  previews?: MediaItem[];
  categories?: Category[];
  tags?: Tag[];
};

export type DraftStatus = 'draft' | 'ready' | 'published';
export type DraftCompositeKey = [string, number];

export type GamePublish = {
  game_id: string;
  chain_id: number;
  is_published: boolean;
  release_date?: number;
};

export interface PGLContractMeta {
  pgl1_game_id: GameId;
  pgl1_name: string;
  pgl1_description?: string;
  pgl1_cover_vertical_image?: string;
  pgl1_cover_horizontal_image?: string;
  pgl1_banner_image?: string;
  pgl1_price?: number;
  pgl1_required_age?: number;
  pgl1_website?: string;
  pgl1_metadata?: Metadata;
  pgl1_distribution?: Array<Distribution>;
}

export type PreviewItem = MediaItem & {
  id: string;
  url: string;
  src: string;
  file?: File;
};
