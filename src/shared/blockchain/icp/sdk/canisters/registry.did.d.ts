import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type ApiError = { 'InvalidInput': string } |
{ 'NotFound': string } |
{ 'ValidationError': string } |
{ 'NotAuthorized': string } |
{ 'Unauthorized': string } |
{ 'AlreadyExists': string } |
{ 'StorageError': string } |
{ 'InternalError': string };
export type ApiResponse = { 'ok': boolean } |
{ 'err': ApiError };
export type ApiResponse_1 = { 'ok': GameRecordType } |
{ 'err': ApiError };
export type ApiResponse_2 = { 'ok': Array<string> } |
{ 'err': ApiError };
export type ApiResponse_3 = { 'ok': bigint } |
{ 'err': ApiError };
export type ApiResponse_4 = { 'ok': Array<GameRecordType> } |
{ 'err': ApiError };
export interface CreateGameRecord { 'canister_id': Principal }
export type Developer = Principal;
export type GameId = string;
export interface GameRecordType {
  'status': [] | [string],
  'register_at': Timestamp,
  'canister_id': Principal,
  'game_id': GameId,
  'developer': Developer,
}
export type Timestamp = bigint;
export interface _SERVICE {
  'add_admin': ActorMethod<[Principal], ApiResponse>,
  'create_voucher': ActorMethod<[string], ApiResponse>,
  'generate_vouchers': ActorMethod<[bigint, [] | [bigint]], ApiResponse_2>,
  'getAllGameRecord': ActorMethod<[], ApiResponse_4>,
  'getAllGameRecordLimit': ActorMethod<[bigint, bigint], ApiResponse_4>,
  'getGameRecordById': ActorMethod<[GameId], ApiResponse_1>,
  'getGamesByDeveloper': ActorMethod<[Principal], ApiResponse_4>,
  'get_admins': ActorMethod<[], Array<Principal>>,
  'get_governor': ActorMethod<[], [] | [Principal]>,
  'get_payment_config': ActorMethod<
    [],
    {
      'amount_smallest': bigint,
      'decimals': number,
      'token': [] | [Principal],
    }
  >,
  'get_voucher_count': ActorMethod<[], ApiResponse_3>,
  'isGameRegistered': ActorMethod<[Principal], boolean>,
  'is_voucher_valid': ActorMethod<[string], boolean>,
  'list_vouchers': ActorMethod<[], ApiResponse_2>,
  'redeem_voucher': ActorMethod<[string, CreateGameRecord], ApiResponse_1>,
  'register_game_with_fee': ActorMethod<[CreateGameRecord], ApiResponse_1>,
  'register_game_with_fee_for': ActorMethod<
    [CreateGameRecord, Principal],
    ApiResponse_1
  >,
  'remove_admin': ActorMethod<[Principal], ApiResponse>,
  'revoke_voucher': ActorMethod<[string], ApiResponse>,
  'set_governor': ActorMethod<[Principal], boolean>,
  'set_payment_config': ActorMethod<[Principal, bigint, Principal], boolean>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
