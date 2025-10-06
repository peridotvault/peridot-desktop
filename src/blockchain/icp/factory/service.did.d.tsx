import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Controllers {
  hub: [] | [Principal];
  registry: [] | [Principal];
}
export interface Controllers__1 {
  hub: [] | [Principal];
  registry: [] | [Principal];
  developer: [] | [Principal];
}
export type Distribution = { web: WebBuild } | { native: NativeBuild };
export type GameId = string;
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
export interface PeridotFactory {
  createPGL1: ActorMethod<
    [
      {
        controllers_extra: [] | [Array<Principal>];
        meta: PGLContractMeta;
      },
    ],
    Principal
  >;
  get_controllers: ActorMethod<[], Controllers>;
  get_created_pgl1s: ActorMethod<[], Array<[Principal, PGLContractMeta]>>;
  get_default_cycles: ActorMethod<[], bigint>;
  get_pgl1_count: ActorMethod<[], bigint>;
  get_pgl1_info: ActorMethod<
    [Principal],
    { controllers: Controllers__1; name: string; game_id: string }
  >;
  list_my_pgl1_min: ActorMethod<
    [[] | [boolean]],
    Array<{
      name: string;
      canister_id: Principal;
      game_id: string;
      registered: boolean;
    }>
  >;
  set_controllers: ActorMethod<[Controllers], boolean>;
  set_default_cycles: ActorMethod<[bigint], boolean>;
}
export type StorageRef =
  | { s3: { bucket: string; basePath: string } }
  | { url: { url: string } }
  | { ipfs: { cid: string; path: [] | [string] } };
export type Timestamp = bigint;
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
export interface _SERVICE extends PeridotFactory {}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
