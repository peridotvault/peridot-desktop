// Main
export type GameId = string;
export type Timestamp = number;
export type Tag = string;
export type Category = string;
export type Platform = 'windows' | 'macos' | 'linux' | 'web' | 'android' | 'ios' | 'other';
export type ViewMode = 'live' | Platform;

// export interface PGLContractMeta {
export interface OffChainGameMetadata {
  game_id: GameId;
  max_supply: number;
  name: string;
  description: string;
  published: boolean;
  price: number;
  token_payment: string;
  total_purchased: number;
  metadata: Metadata;
  distribution: Array<Distribution>;
}

export type OnChainGameMetadata = {
  gameId: string;
  maxSupply: number;
  name: string;
  description: string;
  published: boolean;
  price: number;
  tokenPayment: string;
  totalPurchased: number;
  metadataURI: string;
};

// export type Metadata = Array<[string, Value]>;
export type Metadata = {
  categories: string[];
  tags: string[];
  previews: PreviewItem[];
  required_age: number;
  cover_vertical_image: string;
  cover_horizontal_image: string;
  banner_image: string;
  social_media: SocialMedia;
};

export type SocialMedia = {
  website: string;
};

// export type Distribution = { web: WebBuild } | { native: NativeBuild };
export type Build = {
  platform: Platform;
  manifest: Manifest[];
  liveManifest: Manifest;
  hardware: Hardware;
};

export type Hardware = {
  processor: string;
  graphics: string;
  memoryMB: number;
  storageMB: number;
  additionalNotes: string;
};

export interface Manifest {
  version: string;
  size_bytes: number;
  checksum: string;
  storageRef: StorageRef;
  createdAt: Timestamp;
}

export type StorageRef =
  | { s3: { bucket: string; basePath: string } }
  | { url: { url: string } }
  | { ipfs: { cid: string; path: string } };

// export interface WebBuild {
//   url: string;
//   memory: number;
//   graphics: string;
//   additionalNotes: string;
//   storage: number;
//   processor: string;
// }

// export interface NativeBuild {
//   os: string;
//   memory: number;
//   graphics: string;
//   additionalNotes: string;
//   storage: number;
//   manifests: Array<Manifest>;
//   processor: string;
//   liveVersion?: string;
// }




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
  game_id?: GameId;
  required_age?: number;
  cover_vertical_image?: string;
  cover_horizontal_image?: string;
  banner_image?: string;
  distribution?: Array<Distribution>;
  description?: string;
  name?: string;
  metadata?: Metadata;
  website?: string;
  price?: number;
}

export type DraftMetadata = {
  status?: PublishInfo; //{isPublished : true , releaseDate : Timestamp}
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



// for UI
export type PreviewItem = {
  id: string; // diperlukan untuk dnd-kit
  file: File;
  url: string;
  kind: 'image' | 'video';
  primary?: boolean;
};
