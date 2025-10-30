import { ICPPublicAgent } from "../../../shared/blockchain/icp/sdk/actors";
import { createActorRegistry } from "../../../shared/blockchain/icp/sdk/agents";
import type { GameRecordType } from "../../../shared/blockchain/icp/sdk/canisters/registry.did.d";
import { ICP_REGISTRY_CANISTER } from "../../../shared/constants/url.const";
import { OnChainGameMetadata } from "../types/game.type";
import { getGameByCanister } from "./dto.service";

export async function getGameRecordById({ gameId }: { gameId: string }): Promise<GameRecordType> {
    try {
        const agent = ICPPublicAgent;

        const actor = createActorRegistry(ICP_REGISTRY_CANISTER, { agent });

        const result = (await actor.getGameRecordById(gameId));
        if ('err' in result) {
            const [k, v] = Object.entries(result.err)[0] as [string, string];
            throw new Error(`get game by game id failed: ${k} - ${v}`);
        }
        return result.ok;
    } catch (error) {
        throw new Error('Error Service Get Game By Id : ' + error);
    }
}

export async function getGameByGameId({ gameId }: { gameId: string }): Promise<OnChainGameMetadata> {
    try {
        const gameRecord: GameRecordType = await getGameRecordById({ gameId });
        const res = getGameByCanister({ canister_id: gameRecord.canister_id.toString() });

        return res;
    } catch (error) {
        throw new Error('Error Service Get Game By Id : ' + error);
    }
}