import { ICPPrivateAgent } from "../../../shared/blockchain/icp/sdk/actors";
import { createActorRegistry } from "../../../shared/blockchain/icp/sdk/agents";
// import { walletService } from "../../wallet/services/WalletService";
import { OffChainGameMetadata } from "../types/game.type";


// export async function getMyGames({ wallet }: { wallet: any }): Promise<OffChainGameMetadata[]> {
//     const privateKey = await walletService.decryptWalletData(wallet.encryptedPrivateKey);
//     try {
//         // Initialize agent with identity
//         const agent = ICPPrivateAgent({ privateKey });
//         const actor = createActorRegistry(REGISTRY_CANISTER, { agent });

//         const result = (await actor.getMyGames());
//         return result;
//     } catch (error) {
//         throw new Error('Error Service Get My Games : ' + error);
//     }
// }
