import { ICP_REGISTRY_CANISTER } from '../../../constants/url.const';
import { ICPPublicAgent } from '../sdk/actors';
import { createActorRegistry } from '../sdk/agents';
import type { CreateGameRecord, GameRecordType } from '../sdk/canisters/registry.did.d';

export async function register_game_with_fee({ meta }: { meta: CreateGameRecord }): Promise<GameRecordType> {
    try {
        // Initialize agent with identity
        const agent = ICPPublicAgent;

        const actor = createActorRegistry(ICP_REGISTRY_CANISTER, { agent });
        const result = await actor.register_game_with_fee(meta);
        if ('err' in result) {
            const [k, v] = Object.entries(result.err)[0] as [string, string];
            throw new Error(`register game failed: ${k} - ${v}`);
        }
        return result.ok;
    } catch (error) {
        throw new Error('Error Service Registered Game : ' + error);
    }
}

export const register_game = register_game_with_fee;
