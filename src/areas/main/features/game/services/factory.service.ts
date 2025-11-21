import type { Principal } from '@dfinity/principal';
import { ICPPrivateAgent } from '@shared/blockchain/icp/sdk/actors';
import { createActorFactory } from '@shared/blockchain/icp/sdk/agents';
import { ICP_FACTORY_CANISTER } from '@shared/config/icp';
import { walletService } from '@shared/services/wallet.service';

export async function getGameUnRegistered({ wallet }: { wallet: any }): Promise<
  {
    name: string;
    canister_id: Principal;
    game_id: string;
    registered: boolean;
  }[]
> {
  const privateKey = await walletService.decryptWalletData(wallet.encryptedPrivateKey);
  try {
    // Initialize agent with identity
    const agent = ICPPrivateAgent({ privateKey });

    const actor = createActorFactory(ICP_FACTORY_CANISTER, { agent });
    const result = await actor.list_my_pgc1_min([true]);

    return result;
  } catch (error) {
    throw new Error('Error Service Create Game : ' + error);
  }
}
