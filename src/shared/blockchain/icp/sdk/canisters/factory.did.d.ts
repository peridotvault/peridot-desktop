import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Controllers { 'registry': [] | [Principal] }
export interface PeridotFactory {
  'createAndRegisterPGC1Paid': ActorMethod<
    [{ 'controllers_extra': [] | [Array<Principal>], 'meta': init }],
    {
      'canister_id': Principal,
      'error': [] | [string],
      'registered': boolean,
    }
  >,
  'createAndRegisterPGC1WithVoucher': ActorMethod<
    [
      {
        'controllers_extra': [] | [Array<Principal>],
        'meta': init,
        'voucher_code': string,
      },
    ],
    {
      'canister_id': Principal,
      'error': [] | [string],
      'registered': boolean,
    }
  >,
  'get_controllers': ActorMethod<[], Controllers>,
  'get_created_pgc1s': ActorMethod<[], Array<[Principal, init]>>,
  'get_default_cycles': ActorMethod<[], bigint>,
  'get_pgc1_count': ActorMethod<[], bigint>,
  'get_pgc1_info': ActorMethod<
    [Principal],
    { 'owner': Principal, 'name': string, 'game_id': string }
  >,
  'list_my_pgc1_min': ActorMethod<
    [[] | [boolean]],
    Array<
      {
        'name': string,
        'canister_id': Principal,
        'game_id': string,
        'registered': boolean,
      }
    >
  >,
  'set_controllers': ActorMethod<[Controllers], boolean>,
  'set_default_cycles': ActorMethod<[bigint], boolean>,
}
export interface init {
  'initMetadataURI': string,
  'initName': string,
  'initMaxSupply': bigint,
  'initGameId': string,
  'initDescription': string,
  'initTokenCanister': Principal,
  'initPrice': bigint,
}
export interface _SERVICE extends PeridotFactory { }
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
