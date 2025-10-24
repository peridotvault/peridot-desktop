import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Hardware {
  graphics: string;
  additionalNotes: string;
  storageMB: number;
  memoryMB: number;
  processor: string;
}
export interface Manifest {
  createdAt: Timestamp;
  version: string;
  checksum: Uint8Array | number[];
  sizeBytes: bigint;
}
export interface PGC1 {
  appendBuild: ActorMethod<[Platform, string, bigint, Uint8Array | number[], Timestamp], undefined>;
  getAllManifests: ActorMethod<[Platform], Array<Manifest>>;
  getAvailableSupply: ActorMethod<[], { isUnlimited: boolean; available: bigint }>;
  getDescription: ActorMethod<[], string>;
  getGameId: ActorMethod<[], string>;
  getHardware: ActorMethod<[Platform], [] | [Hardware]>;
  getLifetimeRevenue: ActorMethod<[], bigint>;
  getLiveManifest: ActorMethod<[Platform], [] | [Manifest]>;
  getMaxSupply: ActorMethod<[], bigint>;
  getMetadataURI: ActorMethod<[], string>;
  getName: ActorMethod<[], string>;
  getOwner: ActorMethod<[], Principal>;
  getPrice: ActorMethod<[], bigint>;
  getPurchaseInfo: ActorMethod<[Principal], [] | [Purchase]>;
  getRefundableBalance: ActorMethod<[], bigint>;
  getTokenCanister: ActorMethod<[], Principal>;
  getTotalPurchased: ActorMethod<[], bigint>;
  hasAccess: ActorMethod<[Principal], boolean>;
  isPublished: ActorMethod<[], boolean>;
  isUnlimited: ActorMethod<[], boolean>;
  purchase: ActorMethod<[], undefined>;
  refund: ActorMethod<[], undefined>;
  setDescription: ActorMethod<[string], undefined>;
  setHardware: ActorMethod<[Platform, string, string, number, number, string], undefined>;
  setLiveVersion: ActorMethod<[Platform, bigint], undefined>;
  setMetadataURI: ActorMethod<[string], undefined>;
  setName: ActorMethod<[string], undefined>;
  setPrice: ActorMethod<[bigint], undefined>;
  setPublished: ActorMethod<[boolean], undefined>;
  withdrawAll: ActorMethod<[], undefined>;
}
export type Platform =
  | { ios: null }
  | { web: null }
  | { macos: null }
  | { other: null }
  | { linux: null }
  | { android: null }
  | { windows: null };
export interface Purchase {
  time: Timestamp;
  tokenUsed: Principal;
  amount: bigint;
}
export type Timestamp = bigint;
export interface _SERVICE extends PGC1 {}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
