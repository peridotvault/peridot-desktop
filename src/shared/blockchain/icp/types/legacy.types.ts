export type GameId = string;
export type Timestamp = number | bigint;
export type Tag = string;
export type Category = string;
export type Platform = 'web' | 'windows' | 'macos' | 'linux' | 'android' | 'ios' | 'other';

export type Opt<T> = [] | [T];

export type Value =
    | { int: number | bigint }
    | { map: Array<[string, Value]> }
    | { nat: number | bigint }
    | { array: Array<Value> }
    | { blob: Uint8Array | number[] }
    | { text: string };

export type Metadata = Array<[string, Value]>;

type MediaItemBase = {
    alt?: string;
    storageKey?: string;
    src?: string;
    url?: string;
    poster?: string;
    primary?: boolean;
    id?: string;
    file?: File;
};

export type MediaItem =
    | (MediaItemBase & { kind: 'image' })
    | (MediaItemBase & { kind: 'video'; poster?: string });

export type PreviewItem = MediaItem;

export type StorageRef =
    | { s3: { bucket: string; basePath: string } }
    | { url: { url: string } }
    | { ipfs: { cid: string; path: string } };

export interface Manifest {
    listing: string;
    createdAt: Timestamp;
    size_bytes: number | bigint;
    version: string;
    storageRef: StorageRef;
    checksum: string;
}

export interface WebBuild {
    url: string;
    memory: number | bigint;
    graphics: string;
    additionalNotes: Opt<string>;
    storage: number | bigint;
    processor: string;
}

export interface NativeBuild {
    os: string;
    memory: number | bigint;
    graphics: string;
    additionalNotes: Opt<string>;
    storage: number | bigint;
    manifests: Array<Manifest>;
    processor: string;
    liveVersion?: string;
}

export type Distribution = { web: WebBuild } | { native: NativeBuild };

export interface PublishInfo {
    isPublished: boolean;
    releaseDate?: Timestamp;
}

export interface PGLMeta {
    pgl1_game_id: string;
    pgl1_name: string;
    pgl1_description: string;
    pgl1_required_age: Opt<number | bigint>;
    pgl1_price: Opt<number | bigint>;
    pgl1_cover_image: Opt<string>;
    pgl1_cover_vertical_image?: string;
    pgl1_cover_horizontal_image?: string;
    pgl1_banner_image: Opt<string>;
    pgl1_metadata: Opt<Metadata>;
    pgl1_distribution: Opt<Distribution[]>;
    pgl1_website: Opt<string>;
    pgl1_previews?: MediaItem[];
    pgl1_token_payment?: Opt<string>;
    pgl1_total_purchased?: number;
    pgl1_published?: boolean;
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
