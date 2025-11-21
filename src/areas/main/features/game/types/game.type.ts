export type {
  OffChainGameMetadata,
  OnChainGameMetadata,
  PGCGame,
} from '@shared/blockchain/icp/types/game.types';

import type {
  Category,
  Distribution,
  GameId,
  Metadata,
  MediaItem,
  PublishInfo,
  Tag,
} from '@shared/blockchain/icp/types/game.types';

export interface DraftPGC {
  gameId?: GameId;
  requiredAge?: number;
  coverVerticalImage?: string;
  coverHorizontalImage?: string;
  bannerImage?: string;
  distribution?: Array<Distribution>;
  description?: string;
  name?: string;
  metadata?: Metadata | null;
  website?: string;
  price?: number;
  previews?: MediaItem[];
  categories?: Category[];
  tags?: Tag[];
  publishInfo?: PublishInfo;
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
  gameId: string;
  chainId: number;
  isPublished: boolean;
  releaseDate?: number;
};

export interface PGCContractMeta {
  gameId: GameId;
  name: string;
  description?: string;
  coverVerticalImage?: string;
  coverHorizontalImage?: string;
  bannerImage?: string;
  price?: number;
  requiredAge?: number;
  website?: string;
  metadata?: Metadata;
  distribution?: Array<Distribution>;
}

export type PreviewItem = MediaItem & {
  id: string;
  url: string;
  src: string;
  file?: File;
};
