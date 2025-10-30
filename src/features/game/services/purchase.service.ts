import { Principal } from "@dfinity/principal";
import { ICPPrivateAgent } from "../../../shared/blockchain/icp/sdk/actors";
import { createActorPGC1 } from "../../../shared/blockchain/icp/sdk/agents";
import { walletService } from '@shared/services/wallet.service';


export async function purchaseGame({
    canisterId,
    wallet,
}: {
    canisterId: string;
    wallet: any;
}): Promise<boolean> {
    const privateKey = await walletService.decryptWalletData(wallet.encryptedPrivateKey);
    try {
        const agent = ICPPrivateAgent({ privateKey });
        const actor = createActorPGC1(Principal.fromText(canisterId), { agent });
        await actor.purchase();
        return true;
    } catch (error) {
        throw new Error('Error Service Buy App : ' + error);
    }
}
