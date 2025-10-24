// Main
export type GameId = string;
export type Timestamp = number;
export type Tag = string;
export type Category = string;
export type Platform = 'windows' | 'macos' | 'linux' | 'web';
export type ViewMode = 'live' | Platform;

export interface PGLContractMeta {
  pgl1_required_age: number;
  pgl1_cover_vertical_image: string;
  pgl1_cover_horizontal_image: string;
  pgl1_distribution: Array<Distribution>;
  pgl1_description: string;
  pgl1_name: string;
  pgl1_banner_image: string;
  pgl1_metadata: Metadata;
  pgl1_website: string;
  pgl1_price: number;
  pgl1_game_id: GameId;
}

export type Metadata = Array<[string, Value]>;

export type Distribution = { web: WebBuild } | { native: NativeBuild };

export interface WebBuild {
  url: string;
  memory: number;
  graphics: string;
  additionalNotes: string;
  storage: number;
  processor: string;
}

export interface NativeBuild {
  os: string;
  memory: number;
  graphics: string;
  additionalNotes: string;
  storage: number;
  manifests: Array<Manifest>;
  processor: string;
  liveVersion?: string;
}

export interface Manifest {
  listing: string;
  createdAt: Timestamp;
  size_bytes: number;
  version: string;
  storageRef: StorageRef;
  checksum: string;
}

export type StorageRef =
  | { s3: { bucket: string; basePath: string } }
  | { url: { url: string } }
  | { ipfs: { cid: string; path: string } };

export type Value =
  | { int: number }
  | { map: Array<[string, Value]> }
  | { nat: number }
  | { array: Array<Value> }
  | { blob: Uint8Array | number[] }
  | { text: string };

export type MediaItem =
  | { kind: 'image'; src: string; alt?: string; storageKey?: string }
  | {
      kind: 'video';
      src: string;
      poster?: string;
      alt?: string;
      storageKey?: string;
    };

export type PublishInfo = { isPublished: boolean; releaseDate?: Timestamp };

// Draft
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
  pgl1_status?: PublishInfo; //{isPublished : true , releaseDate : Timestamp}
  pgl1_previews?: MediaItem[];
  pgl1_categories?: Category[];
  pgl1_tags?: Tag[];
};

export type DraftStatus = 'draft' | 'ready' | 'published';

export type DraftCompositeKey = [string, number];

export type GamePublish = {
  game_id: string;
  chain_id: number;
  is_published: boolean;
  release_date?: number;
};

export type Hardware = {
  processor: string;
  graphics: string;
  memory: string;
  storage: string;
  additionalNotes: string;
};

// for UI
export type PreviewItem = {
  id: string; // diperlukan untuk dnd-kit
  file: File;
  url: string;
  kind: 'image' | 'video';
  primary?: boolean;
};
