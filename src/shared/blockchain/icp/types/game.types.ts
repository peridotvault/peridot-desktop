// Core game-related types shared across features and services.
export type GameId = string;
export type Timestamp = string | number | bigint;
export type Tag = string;
export type Category = string;
export type Platform = 'windows' | 'macos' | 'linux' | 'web' | 'android' | 'ios' | 'other';
export type ViewMode = 'live' | Platform;

export type StorageRef =
    | { s3: { bucket: string; basePath: string } }
    | { url: { url: string } }
    | { ipfs: { cid: string; path: string } };

export interface Manifest {
    version: string;
    size_bytes: number;
    checksum: string;
    storageRef: StorageRef;
    createdAt: Timestamp;
    listing: string;
}

export interface Hardware {
    processor: string;
    graphics: string;
    memoryMB: number;
    storageMB: number;
    additionalNotes: string;
}

type LegacyOpt<T> = [] | [T];

export interface WebDistribution {
    url: string;
    processor: string;
    graphics: string;
    memory: number | bigint;
    storage: number | bigint;
    /**
     * Backward compatibility for distributions stored with *_MB suffix.
     */
    memoryMB?: number;
    storageMB?: number;
    additionalNotes?: string | LegacyOpt<string>;
}

export interface NativeDistribution {
    os: Platform;
    processor: string;
    graphics: string;
    memory: number | bigint;
    storage: number | bigint;
    /**
     * Backward compatibility for distributions stored with *_MB suffix.
     */
    memoryMB?: number;
    storageMB?: number;
    additionalNotes?: string | LegacyOpt<string>;
    manifests: Manifest[];
    liveVersion?: string;
}

export type Distribution = { web: WebDistribution } | { native: NativeDistribution };

type BaseMediaItem = {
    src?: string;
    alt?: string;
    storageKey?: string;
    primary?: boolean;
    url?: string;
};

export type MediaItem =
    | (BaseMediaItem & { kind: 'image' })
    | (BaseMediaItem & { kind: 'video'; poster?: string });

export interface Metadata {
    categories?: string[];
    tags?: string[];
    previews?: MediaItem[];
    required_age?: number;
    website?: string;
    banner_image?: string;
    cover_vertical_image?: string;
    cover_horizontal_image?: string;
    release_date?: number;
    draft_status?: string;
    created_at?: string;
    updated_at?: string;
}

export interface OffChainGameMetadata {
    game_id: GameId;
    max_supply: number;
    name: string;
    description: string;
    published: boolean;
    price: number;
    token_payment: string;
    total_purchased: number;
    metadata: Metadata | null;
    distribution: Distribution[];
}

export interface PGCGame {
    gameId: string;
    name: string;
    description: string;
    published: boolean;
    price: number;
    tokenPayment: string;
    totalPurchased: number;
    maxSupply: number;
    requiredAge?: number;
    coverVerticalImage?: string;
    coverHorizontalImage?: string;
    bannerImage?: string;
    website?: string;
    metadata: Metadata | null;
    distribution: Distribution[];
    previews: MediaItem[];
}

export interface OnChainGameMetadata {
    gameId: string;
    maxSupply: number;
    name: string;
    description: string;
    published: boolean;
    price: number;
    tokenPayment: string;
    totalPurchased: number;
    metadataURI: string;
}

export type PublishInfo = {
    isPublished: boolean;
    releaseDate?: Timestamp;
};

export interface GameAnnouncement {
    announcementId: string;
    headline: string;
    content: string;
    coverImage?: string;
    pinned?: boolean;
    createdAt?: number;
    status?: string;
}
