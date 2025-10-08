import { HttpAgent } from '@dfinity/agent';
import { walletService } from '../../../../features/wallet/services/WalletService';
import { hexToArrayBuffer } from '../../../../utils/crypto';
import { Secp256k1KeyIdentity } from '@dfinity/identity-secp256k1';
import { ApiResponse_6, PurchaseType } from '../service.did.d';
import { createActorVault } from '../../idlFactories';
import { hostICP } from '../../../../constants/lib.const';

const vaultCanister = import.meta.env.VITE_PERIDOT_CANISTER_VAULT_BACKEND;

export async function buyGame({
  gameId,
  wallet,
}: {
  gameId: string;
  wallet: any;
}): Promise<PurchaseType> {
  const privateKey = await walletService.decryptWalletData(wallet.encryptedPrivateKey);
  const secretKey = hexToArrayBuffer(privateKey);
  try {
    const agent = new HttpAgent({
      host: hostICP,
      identity: Secp256k1KeyIdentity.fromSecretKey(secretKey),
    });

    const actor = createActorVault(vaultCanister, { agent });

    const result = (await actor.buyGame(gameId)) as ApiResponse_6;
    if ('err' in result) {
      const [k, v] = Object.entries(result.err)[0] as [string, string];
      throw new Error(`buyApp failed: ${k} - ${v}`);
    }
    return result.ok;
  } catch (error) {
    throw new Error('Error Service Buy App : ' + error);
  }
}
