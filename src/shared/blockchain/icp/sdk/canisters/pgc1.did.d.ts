import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Hardware {
  'graphics': string,
  'additionalNotes': string,
  'storageMB': number,
  'memoryMB': number,
  'processor': string,
}
export interface Manifest {
  'storage': StorageRef,
  'createdAt': Timestamp,
  'version': string,
  'checksum': Uint8Array | number[],
  'sizeBytes': bigint,
}
export interface PGC1 {
  'appendBuild': ActorMethod<
    [Platform, string, bigint, Uint8Array | number[], Timestamp, StorageRef],
    Result
  >,
  'getAllLiveManifests': ActorMethod<[], Array<[Platform, [] | [Manifest]]>>,
  'getAllManifests': ActorMethod<[Platform], Array<Manifest>>,
  'getAllManifestsAllPlatforms': ActorMethod<
    [],
    Array<[Platform, Array<Manifest>]>
  >,
  'getAvailableSupply': ActorMethod<
    [],
    { 'isUnlimited': boolean, 'available': bigint }
  >,
  'getDescription': ActorMethod<[], string>,
  'getGameId': ActorMethod<[], string>,
  'getHardware': ActorMethod<[Platform], [] | [Hardware]>,
  'getLifetimeRevenue': ActorMethod<[], bigint>,
  'getLiveManifest': ActorMethod<[Platform], [] | [Manifest]>,
  'getMaxSupply': ActorMethod<[], bigint>,
  'getMetadataURI': ActorMethod<[], string>,
  'getName': ActorMethod<[], string>,
  'getOwner': ActorMethod<[], Principal>,
  'getPrice': ActorMethod<[], bigint>,
  'getPurchaseInfo': ActorMethod<[Principal], [] | [Purchase]>,
  'getRefundableBalance': ActorMethod<[], bigint>,
  'getTokenCanister': ActorMethod<[], Principal>,
  'getTotalPurchased': ActorMethod<[], bigint>,
  'getVaultCanister': ActorMethod<[], Principal>,
  'getWithdrawnBalance': ActorMethod<[], bigint>,
  'hasAccess': ActorMethod<[Principal], boolean>,
  'isFree': ActorMethod<[], boolean>,
  'isPublished': ActorMethod<[], boolean>,
  'isUnlimited': ActorMethod<[], boolean>,
  'purchase': ActorMethod<[], PurchaseResult>,
  'refund': ActorMethod<[], RefundResult>,
  'setDescription': ActorMethod<[string], Result>,
  'setHardware': ActorMethod<
    [Platform, string, string, number, number, string],
    Result
  >,
  'setLiveVersion': ActorMethod<[Platform, bigint], Result>,
  'setMetadataURI': ActorMethod<[string], Result>,
  'setName': ActorMethod<[string], Result>,
  'setPrice': ActorMethod<[bigint], Result>,
  'setPublished': ActorMethod<[boolean], Result>,
  'withdrawAll': ActorMethod<[], WithdrawResult>,
}
export type Platform = { 'ios': null } |
{ 'web': null } |
{ 'macos': null } |
{ 'other': null } |
{ 'linux': null } |
{ 'android': null } |
{ 'windows': null };
export interface Purchase {
  'time': Timestamp,
  'tokenUsed': Principal,
  'amount': bigint,
}
export type PurchaseResult = { 'notPublished': null } |
{ 'alreadyOwned': null } |
{ 'insufficientAllowance': null } |
{ 'soldOut': null } |
{ 'success': { 'txIndex': bigint, 'timestamp': Timestamp } } |
{ 'paymentFailed': string };
export type RefundResult = { 'transferFailed': string } |
{ 'success': { 'amount': bigint } } |
{ 'notOwned': null } |
{ 'windowClosed': null };
export type Result = { 'ok': null } |
{ 'err': string };
export type StorageRef = { 's3': { 'bucket': string, 'basePath': string } } |
{ 'url': { 'url': string } } |
{ 'ipfs': { 'cid': string, 'path': string } };
export type Timestamp = bigint;
export type WithdrawResult = { 'transferFailed': string } |
{ 'noBalance': null } |
{ 'success': { 'vaultShare': bigint, 'amount': bigint } } |
{ 'unauthorized': null };
export interface _SERVICE extends PGC1 { }
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
