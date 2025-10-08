import { HttpAgent } from '@dfinity/agent';
import { CreateGameRecord, GameRecordType } from '../service.did.d';
import { hostICP } from '../../../../constants/lib.const';
import { createActorRegistry } from '../../idlFactories';

const registryCanister = import.meta.env.VITE_PERIDOT_CANISTER_REGISTRY_BACKEND;

export async function register_game({ meta }: { meta: CreateGameRecord }): Promise<GameRecordType> {
  try {
    // Initialize agent with identity
    const agent = new HttpAgent({
      host: hostICP,
    });

    const actor = createActorRegistry(registryCanister, { agent });
    const result = await actor.register_game(meta);
    if ('err' in result) {
      const [k, v] = Object.entries(result.err)[0] as [string, string];
      throw new Error(`register game failed: ${k} - ${v}`);
    }
    return result.ok;
  } catch (error) {
    throw new Error('Error Service Registered Game : ' + error);
  }
}
