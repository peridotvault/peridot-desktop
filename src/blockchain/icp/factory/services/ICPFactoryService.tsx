import { HttpAgent } from '@dfinity/agent';
import { walletService } from '../../../../features/wallet/services/WalletService';
import { hexToArrayBuffer } from '../../../../lib/utils/crypto';
import { hostICP } from '../../../../constants/lib.const';
import { Secp256k1KeyIdentity } from '@dfinity/identity-secp256k1';
import { createActorFactory } from '../../idlFactories';
import { Principal } from '@dfinity/principal';

const factoryCanister = import.meta.env.VITE_PERIDOT_CANISTER_FACTORY_BACKEND;

export async function getGameUnRegistered({ wallet }: { wallet: any }): Promise<
  {
    name: string;
    canister_id: Principal;
    game_id: string;
    registered: boolean;
  }[]
> {
  const privateKey = await walletService.decryptWalletData(wallet.encryptedPrivateKey);
  const secretKey = hexToArrayBuffer(privateKey);
  try {
    // Initialize agent with identity
    const agent = new HttpAgent({
      host: hostICP,
      identity: Secp256k1KeyIdentity.fromSecretKey(secretKey),
    });

    const actor = createActorFactory(factoryCanister, { agent });
    const result = await actor.list_my_pgl1_min([true]);

    return result;
  } catch (error) {
    throw new Error('Error Service Create Game : ' + error);
  }
}
