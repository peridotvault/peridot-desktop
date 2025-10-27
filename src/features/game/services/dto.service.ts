import { Principal } from "@dfinity/principal";
import { ICPPrivateAgent, ICPPublicAgent } from "../../../shared/blockchain/icp/sdk/actors";
import { createActorFactory, createActorPGC1, createActorRegistry } from "../../../shared/blockchain/icp/sdk/agents";
import { InitCreateGame } from "../types/factory.type";
import { arrayStringToPrincipal } from "../../../shared/utils/icp.helper";
import type { ApiResponse_4, GameRecordType } from "../../../shared/blockchain/icp/sdk/canisters/registry.did.d";
import { runPool } from "../utils/runpool.helper";
import { OffChainGameMetadata, OnChainGameMetadata } from "../types/game.type";
import { ICP_FACTORY_CANISTER, ICP_REGISTRY_CANISTER } from "../../../shared/config/url.const";
import { walletService } from "../../../shared/services/wallet.service";
import { fetchMetadata } from "../api/game.api";

export async function createGamePaid({
    controllers_extra,
    meta,
    wallet,
}: {
    controllers_extra: null | string[];
    meta: InitCreateGame;
    wallet: any;
}): Promise<string> {
    const privateKey = await walletService.decryptWalletData(wallet.encryptedPrivateKey);
    try {
        // Initialize agent with identity
        const agent = ICPPrivateAgent({ privateKey });
        const actor = createActorFactory(ICP_FACTORY_CANISTER, { agent });
        const ce: [] | [Principal[]] = controllers_extra == null ? [] : [arrayStringToPrincipal({ arr: controllers_extra! })];
        const pgc1_created = (await actor.createAndRegisterPGC1Paid({
            controllers_extra: ce,
            meta,
        }));
        return pgc1_created.toString();
    } catch (error) {
        throw new Error('Error Service Create Game : ' + error);
    }
}

export async function createGameVoucher({
    voucher_code,
    controllers_extra,
    meta,
    wallet,
}: {
    voucher_code: string;
    controllers_extra: null | string[];
    meta: InitCreateGame;
    wallet: any;
}): Promise<string> {
    const privateKey = await walletService.decryptWalletData(wallet.encryptedPrivateKey);
    try {
        const agent = ICPPrivateAgent({ privateKey });
        const actor = createActorFactory(ICP_FACTORY_CANISTER, { agent });
        const ce: [] | [Principal[]] = controllers_extra == null ? [] : [arrayStringToPrincipal({ arr: controllers_extra! })];
        const pgc1_created = (await actor.createAndRegisterPGC1WithVoucher({
            controllers_extra: ce,
            meta,
            voucher_code
        }));
        return pgc1_created.toString();
    } catch (error) {
        throw new Error('Error Service Create Game : ' + error);
    }
}

// export async function setLiveVersion({})
// export async function setLiveVersion({})

export async function getGamesByDeveloper({
    dev,
}: {
    dev: string;
}): Promise<GameRecordType[]> {
    try {
        // Initialize agent with identity
        const agent = ICPPublicAgent;
        const actor = createActorRegistry(ICP_REGISTRY_CANISTER, { agent });

        const result = (await actor.getGamesByDeveloper(
            Principal.fromText(dev)
        )) as ApiResponse_4;

        if ('err' in result) {
            const [k, v] = Object.entries(result.err)[0] as [string, string];
            throw new Error(`get game by Developer failed: ${k} - ${v}`);
        }
        return result.ok;
    } catch (error) {
        throw new Error('Error Service Get All Games by Developer : ' + error);
    }
}

export async function getPublishedGames({
    start,
    limit,
}: {
    start: number;
    limit: number;
}): Promise<OffChainGameMetadata[]> {
    // 1) agent anonim
    const agent = ICPPublicAgent;
    const registry = createActorRegistry(ICP_REGISTRY_CANISTER, {
        agent,
    });

    // Asumsikan kamu sudah punya method paginated di Registry:
    //    getAllGameRecordLimit(start: Nat, limit: Nat) -> ApiResponse<[GameRecord]>
    const resp = await registry.getAllGameRecordLimit(BigInt(start), BigInt(limit));
    if ('err' in resp) return [];

    const records = resp.ok as GameRecordType[];

    // 3) Ambil metadata tiap PGL1 secara paralel (dibatasi)
    const meta = await runPool(
        records,
        8, // concurrency; bisa 4–16 tergantung selera
        async (rec) => {
            try {
                const pgl = createActorPGC1(rec.canister_id, { agent });
                const metadataURI = await pgl.getMetadataURI();
                const metadata = await fetchMetadata(metadataURI);

                const gameId = await pgl.getGameId();
                const maxSupply = await pgl.getMaxSupply();
                const name = await pgl.getName();
                const description = await pgl.getDescription();
                const published = await pgl.isPublished();
                const price = await pgl.getPrice();
                const tokenPayment = await pgl.getTokenCanister();
                const totalPurchased = await pgl.getTotalPurchased();

                // 4) Bentuk PGLMeta untuk UI (mapping 1:1)
                const meta: OffChainGameMetadata = {
                    game_id: gameId,
                    max_supply: Number(maxSupply),
                    name: name,
                    description: description,
                    published: published,
                    price: Number(price),
                    token_payment: tokenPayment.toString(),
                    total_purchased: Number(totalPurchased),
                    metadata: metadata,
                    distribution: Array<Distribution>,
                };
                return meta;
            } catch (e) {
                console.warn('PGL read failed', rec.canister_id.toText(), e);
                return null;
            }
        },
    );

    // 5) Filter null & kembalikan
    return meta.filter(Boolean) as OffChainGameMetadata[];
}

export async function getGameByCanister({
    canister_id,
}: {
    canister_id: string;
}): Promise<OnChainGameMetadata> {
    try {
        // Initialize agent with identity
        const agent = ICPPublicAgent;
        const actor = createActorPGC1(canister_id, { agent });

        const gameId = await actor.getGameId();
        const maxSupply = await actor.getMaxSupply();
        const name = await actor.getName();
        const description = await actor.getDescription();
        const published = await actor.isPublished();
        const price = await actor.getPrice();
        const tokenPayment = await actor.getTokenCanister();
        const totalPurchased = await actor.getTotalPurchased();
        const metadataURI = await actor.getMetadataURI();

        // 4) Bentuk PGLMeta untuk UI (mapping 1:1)
        const meta: OnChainGameMetadata = {
            gameId: gameId,
            maxSupply: Number(maxSupply),
            name: name,
            description: description,
            published: published,
            price: Number(price),
            tokenPayment: tokenPayment.toString(),
            totalPurchased: Number(totalPurchased),
            metadataURI: metadataURI,
        };
        return meta;
    } catch (error) {
        throw new Error('Error Service Get All Games by Developer : ' + error);
    }
}