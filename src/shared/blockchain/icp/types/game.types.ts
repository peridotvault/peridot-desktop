// Core game-related types shared across features and services.
import type { MediaItem as LegacyMediaItem } from './legacy.types';

export type GameId = string;
export type Timestamp = number;
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
    sizeBytes: number;
    checksum: string;
    storageRef: StorageRef;
    createdAt: Timestamp;
}

export interface Hardware {
    processor: string;
    graphics: string;
    memoryMB: number;
    storageMB: number;
    additionalNotes: string;
}

export interface WebDistribution {
    url: string;
    processor: string;
    graphics: string;
    memoryMB: number;
    storageMB: number;
    additionalNotes?: string;
}

export interface NativeDistribution {
    os: Platform;
    processor: string;
    graphics: string;
    memoryMB: number;
    storageMB: number;
    additionalNotes?: string;
    manifests: Manifest[];
    liveVersion?: string;
}

export type Distribution = { web: WebDistribution } | { native: NativeDistribution };

export type MediaItem = LegacyMediaItem & {
    url: string;
    src?: string;
    primary?: boolean;
};

export interface Metadata {
    categories: string[];
    tags: string[];
    previews: MediaItem[];
    required_age: number;
    cover_vertical_image: string;
    cover_horizontal_image: string;
    banner_image: string;
    social_media: {
        website?: string;
    };
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
