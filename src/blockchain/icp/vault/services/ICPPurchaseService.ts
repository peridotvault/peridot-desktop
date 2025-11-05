import { Principal } from '@dfinity/principal';
import { ICPPrivateAgent, ICPPublicAgent } from '@shared/blockchain/icp/sdk/actors';
import { createActorPGC1, createActorRegistry } from '@shared/blockchain/icp/sdk/agents';
import type { PurchaseResult } from '@shared/blockchain/icp/sdk/canisters/pgc1.did.d';
import type { ApiResponse_1 } from '@shared/blockchain/icp/sdk/canisters/registry.did.d';
import { ICP_REGISTRY_CANISTER } from '@shared/constants/url.const';
import { walletService } from '@shared/services/wallet.service';

export async function buyGame({
    gameId,
    wallet,
    canisterId,
}: {
    gameId: string;
    wallet: any;
    canisterId?: string;
}): Promise<PurchaseResult> {
    if (!wallet?.encryptedPrivateKey) {
        throw new Error('Active wallet is required to purchase the game.');
    }

    const normalizedGameId = gameId.trim();
    if (!normalizedGameId) {
        throw new Error('Invalid game identifier.');
    }

    const resolveCanister = async (): Promise<Principal> => {
        if (canisterId?.trim()) {
            return Principal.fromText(canisterId.trim());
        }

        const registry = createActorRegistry(ICP_REGISTRY_CANISTER, { agent: ICPPublicAgent });
        const record = (await registry.getGameRecordById(normalizedGameId)) as ApiResponse_1;

        if ('err' in record) {
            const [code, message] = Object.entries(record.err)[0] as [string, unknown];
            throw new Error(
                `Unable to resolve game canister: ${code}${message ? ` - ${String(message)}` : ''}`,
            );
        }

        return record.ok.canister_id;
    };

    const targetCanister = await resolveCanister();
    const privateKey = await walletService.decryptWalletData(wallet.encryptedPrivateKey);
    const agent = ICPPrivateAgent({ privateKey });
    const pgcActor = createActorPGC1(targetCanister, { agent });

    return pgcActor.purchase();
}
