import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface ContractMeta {
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
export interface Controllers {
  hub: [] | [Principal];
  registry: [] | [Principal];
  developer: [] | [Principal];
}
export type Distribution = { web: WebBuild } | { native: NativeBuild };
export interface Event {
  idx: bigint;
  lic: [] | [LicenseId];
  owner: [] | [Owner];
  kind: EventKind;
  note: [] | [string];
  time: Timestamp;
  the_actor: Principal;
}
export type EventKind =
  | { Burn: null }
  | { Mint: null }
  | { Revoke: null }
  | { SetControllers: null }
  | { SetGovernance: null }
  | { SetRegistry: null }
  | { UpdateMeta: null };
export type GameId = string;
export interface License {
  id: LicenseId;
  revoked: boolean;
  owner: Owner;
  created_at: Timestamp;
  expires_at: [] | [Timestamp];
  revoke_reason: [] | [string];
}
export type LicenseId = bigint;
export type MD = Array<[string, Value]>;
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
export type Owner = Principal;
export interface PGL1Ledger {
  events_len: ActorMethod<[], bigint>;
  get_controllers: ActorMethod<[], Controllers>;
  get_events: ActorMethod<[bigint, bigint], Array<Event>>;
  licenses_of_owner: ActorMethod<[Owner], Array<License>>;
  list_owners: ActorMethod<[bigint, bigint], Array<Owner>>;
  pgl1_add_distribution: ActorMethod<[Distribution], boolean>;
  pgl1_banner_image: ActorMethod<[], [] | [string]>;
  pgl1_cover_image: ActorMethod<[], [] | [string]>;
  pgl1_description: ActorMethod<[], string>;
  pgl1_distribution: ActorMethod<[], [] | [Array<Distribution>]>;
  pgl1_game_id: ActorMethod<[], string>;
  pgl1_game_metadata: ActorMethod<[], ContractMeta>;
  pgl1_metadata: ActorMethod<[], [] | [MD]>;
  pgl1_metadata_remove: ActorMethod<[Array<string>], boolean>;
  pgl1_metadata_update: ActorMethod<[{ set: Array<[string, V]>; remove: Array<string> }], boolean>;
  pgl1_metadata_upsert: ActorMethod<[Array<[string, V]>], boolean>;
  pgl1_name: ActorMethod<[], string>;
  pgl1_price: ActorMethod<[], [] | [bigint]>;
  pgl1_required_age: ActorMethod<[], [] | [bigint]>;
  pgl1_safeBurn: ActorMethod<[Owner, [] | [string]], Result_1>;
  pgl1_safeMint: ActorMethod<[Owner, [] | [Timestamp]], Result>;
  pgl1_set_distribution: ActorMethod<[Array<Distribution>], boolean>;
  pgl1_set_item_collections: ActorMethod<[Array<V>], boolean>;
  pgl1_total_supply: ActorMethod<[], bigint>;
  pgl1_update_meta: ActorMethod<[PGLUpdateMeta], boolean>;
  pgl1_website: ActorMethod<[], [] | [string]>;
  set_controllers: ActorMethod<[Controllers], boolean>;
  verify_license: ActorMethod<[Owner], boolean>;
}
export interface PGLContractMeta {
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
export interface PGLUpdateMeta {
  banner_image: [] | [[] | [string]];
  metadata: [] | [[] | [Metadata]];
  cover_image: [] | [[] | [string]];
  name: [] | [string];
  description: [] | [string];
  website: [] | [[] | [string]];
  game_id: [] | [GameId];
  required_age: [] | [[] | [bigint]];
  price: [] | [[] | [bigint]];
  distribution: [] | [[] | [Array<Distribution>]];
}
export type Result = { ok: LicenseId } | { err: string };
export type Result_1 = { ok: null } | { err: string };
export type StorageRef =
  | { s3: { bucket: string; basePath: string } }
  | { url: { url: string } }
  | { ipfs: { cid: string; path: [] | [string] } };
export type Timestamp = bigint;
export type V =
  | { int: bigint }
  | { map: Array<[string, Value]> }
  | { nat: bigint }
  | { array: Array<Value> }
  | { blob: Uint8Array | number[] }
  | { text: string };
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
export interface _SERVICE extends PGL1Ledger {}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
