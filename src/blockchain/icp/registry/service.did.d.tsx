import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type ApiError =
  | { InvalidInput: string }
  | { NotFound: string }
  | { ValidationError: string }
  | { NotAuthorized: string }
  | { Unauthorized: string }
  | { AlreadyExists: string }
  | { StorageError: string }
  | { InternalError: string };
export type ApiResponse = { ok: GameRecordType } | { err: ApiError };
export type ApiResponse_1 = { ok: Array<GameRecordType> } | { err: ApiError };
export interface CreateGameRecord {
  canister_id: Principal;
  developer: Developer;
}
export type Developer = Principal;
export type GameId = string;
export interface GameRecordType {
  status: [] | [string];
  register_at: Timestamp;
  canister_id: Principal;
  game_id: GameId;
  developer: Developer;
}
export type Timestamp = bigint;
export interface _SERVICE {
  getAllGameRecord: ActorMethod<[], ApiResponse_1>;
  getAllGameRecordLimit: ActorMethod<[bigint, bigint], ApiResponse_1>;
  getGameByDeveloperId: ActorMethod<[Principal, GameId], ApiResponse>;
  getGameRecordById: ActorMethod<[GameId], ApiResponse>;
  isGameRegistered: ActorMethod<[Principal], boolean>;
  register_game: ActorMethod<[CreateGameRecord], ApiResponse>;
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
