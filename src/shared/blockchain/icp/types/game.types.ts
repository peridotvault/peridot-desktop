export type GameId = string;
export type Timestamp = number | bigint;
export type Tag = string;
export type Category = string;

export type Platform =
    | 'web'
    | 'windows'
    | 'macos'
    | 'linux'
    | 'android'
    | 'ios'
    | 'other';

export type ViewMode = 'live' | 'web' | Platform;

export type Opt<T> = [] | [T];

export type StorageRef =
    | { s3: { bucket: string; basePath: string; objectKey?: string } }
    | { url: { url: string } }
    | { ipfs: { cid: string; path?: string } };

export interface Manifest {
    listing: string;
    createdAt: Timestamp;
    sizeBytes: number | bigint;
    version: string;
    storageRef: StorageRef;
    checksum: string | number[] | Uint8Array;

    /**
     * Optional aliases for legacy consumers while migration is underway.
     */
    size_bytes?: number | bigint;
    storage?: StorageRef;
}

type AdditionalNotes = string | string[] | null | undefined;

export interface WebDistribution {
    url: string;
    processor?: string;
    graphics?: string;
    memory?: number | bigint;
    storage?: number | bigint;
    additionalNotes?: AdditionalNotes;
}

export interface NativeDistribution {
    os: Platform;
    processor?: string;
    graphics?: string;
    memory?: number | bigint;
    storage?: number | bigint;
    manifests: Manifest[];
    liveVersion?: string;
    additionalNotes?: AdditionalNotes;
}

export type Distribution = { web: WebDistribution } | { native: NativeDistribution };

export interface MediaItemBase {
    id?: string;
    src?: string;
    url?: string;
    alt?: string;
    poster?: string;
    storageKey?: string;
    primary?: boolean;
    file?: File;
}

export type MediaItem =
    | (MediaItemBase & { kind: 'image' })
    | (MediaItemBase & { kind: 'video'; poster?: string });

export interface PublishInfo {
    isPublished: boolean;
    releaseDate?: Timestamp;
}

export interface Metadata {
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
    coverImage?: string;
    cover_image?: string;
    previews?: MediaItem[];
    distribution?: Distribution[];
    distributions?: Distribution[];
    categories?: Category[];
    tags?: Tag[];
    publishInfo?: PublishInfo;
    is_published?: boolean;
    status?: string;
    releaseDate?: Timestamp;
    release_date?: Timestamp;
    release_date_ns?: number | bigint;
    draftStatus?: string;
    draft_status?: string;
    createdAt?: string;
    created_at?: string;
    updatedAt?: string;
    updated_at?: string;
    tokenPayment?: string;
    token_payment?: string;
    totalPurchased?: number;
    total_purchased?: number;
    [key: string]: unknown;
}

export interface PGCMeta {
    gameId: string;
    name: string;
    description: string;
    requiredAge?: Opt<number | bigint>;
    price?: Opt<number | bigint>;
    coverImage?: Opt<string>;
    coverVerticalImage?: string;
    coverHorizontalImage?: string;
    bannerImage?: Opt<string>;
    metadata?: Opt<Metadata>;
    distribution?: Opt<Distribution[]>;
    website?: Opt<string>;
    previews?: MediaItem[];
    tokenPayment?: Opt<string>;
    totalPurchased?: number;
    published?: boolean;
    [key: string]: unknown;
}

export interface GameAnnouncementType {
    announcementId: string | number;
    headline: string;
    content: string;
    coverImage?: string;
    pinned?: boolean;
    createdAt?: bigint | number;
    status?: Record<string, unknown>;
}

export type PurchaseType = Record<string, unknown>;

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
    metadata?: Metadata | null;
    distribution?: Distribution[];
}

export interface OffChainGameMetadata {
    game_id: string;
    name: string;
    description: string;
    published: boolean;
    price: number;
    token_payment: string;
    total_purchased: number;
    max_supply: number;
    metadata: Metadata | null;
    distribution: Distribution[] | null;
    metadata_uri?: string;
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

export interface PGCGame {
    gameId: GameId;
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
