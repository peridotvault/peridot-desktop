import { Principal } from "@dfinity/principal";

export interface InitCreateGame {
    'initMetadataURI': string,
    'initName': string,
    'initMaxSupply': bigint,
    'initGameId': string,
    'initDescription': string,
    'initTokenCanister': Principal,
    'initPrice': bigint,
}