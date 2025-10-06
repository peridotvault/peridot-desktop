import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type AnnouncementId = bigint;
export type ApiError =
  | { InvalidInput: string }
  | { NotFound: string }
  | { ValidationError: string }
  | { NotAuthorized: string }
  | { Unauthorized: string }
  | { AlreadyExists: string }
  | { StorageError: string }
  | { InternalError: string };
export type ApiResponse = { ok: PGLMeta } | { err: ApiError };
export type ApiResponse_1 = { ok: GameAnnouncementType } | { err: ApiError };
export type ApiResponse_2 = { ok: GameAnnouncementInteractionType } | { err: ApiError };
export type ApiResponse_3 = { ok: Array<GameAnnouncementType> } | { err: ApiError };
export type ApiResponse_4 = { ok: string } | { err: ApiError };
export type ApiResponse_5 = { ok: PurchaseType } | { err: ApiError };
export interface DTOGameAnnouncement {
  status: Status;
  content: string;
  headline: string;
  coverImage: string;
  pinned: boolean;
}
export type DeveloperId = Principal;
export type Distribution = { web: WebBuild } | { native: NativeBuild };
export interface GameAnnouncementInteractionType {
  interactionType: [] | [InteractionType];
  userId: UserId;
  createdAt: Timestamp;
  comment: [] | [string];
  announcementId: AnnouncementId;
}
export interface GameAnnouncementType {
  status: Status;
  content: string;
  headline: string;
  createdAt: Timestamp;
  gameId: GameId;
  coverImage: string;
  updatedAt: [] | [Timestamp];
  pinned: boolean;
  developerId: DeveloperId;
  announcementId: AnnouncementId;
}
export type GameId = string;
export type InteractionType = { like: null } | { dislike: null };
export interface Manifest {
  listing: string;
  createdAt: Timestamp;
  size_bytes: bigint;
  version: string;
  storageRef: StorageRef;
  checksum: string;
}
export type Metadata = Array<[string, Value]>;
export interface NativeBuild {
  os: string;
  memory: bigint;
  graphics: string;
  additionalNotes: [] | [string];
  storage: bigint;
  manifests: Array<Manifest>;
  processor: string;
}
export interface PGLMeta {
  pgl1_required_age: [] | [bigint];
  pgl1_cover_image: [] | [string];
  pgl1_distribution: [] | [Array<Distribution>];
  pgl1_description: string;
  pgl1_name: string;
  pgl1_banner_image: [] | [string];
  pgl1_metadata: [] | [Metadata];
  pgl1_website: [] | [string];
  pgl1_price: [] | [bigint];
  pgl1_game_id: GameId;
}
export interface PurchaseType {
  txIndex: [] | [bigint];
  userId: UserId;
  memo: [] | [Uint8Array | number[]];
  gameId: GameId;
  purchasedAt: Timestamp;
  amount: bigint;
}
export type Status = { published: null } | { draft: null } | { archived: null };
export type StorageRef =
  | { s3: { bucket: string; basePath: string } }
  | { url: { url: string } }
  | { ipfs: { cid: string; path: [] | [string] } };
export type Timestamp = bigint;
export type UserId = Principal;
export type Value =
  | { int: bigint }
  | { map: Array<[string, Value]> }
  | { nat: bigint }
  | { array: Array<Value> }
  | { blob: Uint8Array | number[] }
  | { text: string };
export interface WebBuild {
  url: string;
  memory: bigint;
  graphics: string;
  additionalNotes: [] | [string];
  storage: bigint;
  processor: string;
}
export interface _SERVICE {
  buyGame: ActorMethod<[GameId], ApiResponse_5>;
  commentByAnnouncementId: ActorMethod<[AnnouncementId, string], ApiResponse_2>;
  createAnnouncement: ActorMethod<[GameId, DTOGameAnnouncement], ApiResponse_1>;
  deleteAnnouncement: ActorMethod<[AnnouncementId], ApiResponse_4>;
  dislikeByAnnouncementId: ActorMethod<[AnnouncementId], ApiResponse_2>;
  getAllAnnouncementsByGameId: ActorMethod<[GameId], ApiResponse_3>;
  getAllGames: ActorMethod<[bigint, bigint], Array<PGLMeta>>;
  getAnnouncementsByAnnouncementId: ActorMethod<[AnnouncementId], ApiResponse_1>;
  getGameByDeveloperId: ActorMethod<[Principal, bigint, bigint], Array<PGLMeta>>;
  getGameMetadata: ActorMethod<[string], PGLMeta>;
  getGamesByGameId: ActorMethod<[string], [] | [PGLMeta]>;
  getMyGames: ActorMethod<[], Array<PGLMeta>>;
  likeByAnnouncementId: ActorMethod<[AnnouncementId], ApiResponse_2>;
  unLikeDislikeByAnnouncementId: ActorMethod<[AnnouncementId], ApiResponse_2>;
  updateAnnouncement: ActorMethod<[AnnouncementId, DTOGameAnnouncement], ApiResponse_1>;
  updateGame: ActorMethod<[string, PGLMeta], ApiResponse>;
  verify_license: ActorMethod<[string], boolean>;
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
