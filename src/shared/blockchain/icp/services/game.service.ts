import { Principal } from '@dfinity/principal';
import { ICPPrivateAgent, ICPPublicAgent } from '../sdk/actors';
import { createActorFactory, createActorPGC1, createActorRegistry } from '../sdk/agents';
import type { ApiResponse_4, GameRecordType } from '../sdk/canisters/registry.did.d';
import { ICP_FACTORY_CANISTER, ICP_REGISTRY_CANISTER } from '../../../constants/url.const';
import { walletService } from '@shared/services/wallet.service';
import { arrayStringToPrincipal } from '@shared/utils/icp.helper';
import { fetchMetadata } from '@shared/api/metadata.api';
import { runPool } from '@shared/utils/run-pool';
import type {
    Distribution,
    OffChainGameMetadata,
    OnChainGameMetadata,
} from '../types/game.types';
import type { InitCreateGame } from '../types/factory.types';

type PrincipalListOpt = [] | [Principal[]];

const toPrincipalOpt = (controllers: string[] | null | undefined): PrincipalListOpt => {
    if (!controllers || controllers.length === 0) {
        return [];
    }
    return [arrayStringToPrincipal({ arr: controllers })];
};

const toDistribution = (): Distribution[] => {
    // TODO: Map manifests/hardware into Distribution when backend schema is finalised.
    return [];
};

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
        const agent = ICPPrivateAgent({ privateKey });
        const actor = createActorFactory(ICP_FACTORY_CANISTER, { agent });
        const controllersOpt = toPrincipalOpt(controllers_extra);

        const pgc1Created = await actor.createAndRegisterPGC1Paid({
            controllers_extra: controllersOpt,
            meta,
        });

        return pgc1Created.toString();
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
        const controllersOpt = toPrincipalOpt(controllers_extra);

        const pgc1Created = await actor.createAndRegisterPGC1WithVoucher({
            controllers_extra: controllersOpt,
            meta,
            voucher_code,
        });

        return pgc1Created.toString();
    } catch (error) {
        throw new Error('Error Service Create Game : ' + error);
    }
}

export async function getGamesByDeveloper({ dev }: { dev: string }): Promise<GameRecordType[]> {
    try {
        const agent = ICPPublicAgent;
        const actor = createActorRegistry(ICP_REGISTRY_CANISTER, { agent });

        const result = (await actor.getGamesByDeveloper(Principal.fromText(dev))) as ApiResponse_4;

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
    const agent = ICPPublicAgent;
    const registry = createActorRegistry(ICP_REGISTRY_CANISTER, { agent });

    const resp = await registry.getAllGameRecordLimit(BigInt(start), BigInt(limit));
    if ('err' in resp) return [];

    const records = resp.ok as GameRecordType[];

    const meta = await runPool(
        records,
        8,
        async (rec): Promise<OffChainGameMetadata | null> => {
            try {
                const pgl = createActorPGC1(rec.canister_id, { agent });
                const metadataURI = await pgl.getMetadataURI();
                const metadata = await fetchMetadata(metadataURI).catch(() => null);

                const gameId = await pgl.getGameId();
                const maxSupply = await pgl.getMaxSupply();
                const name = await pgl.getName();
                const description = await pgl.getDescription();
                const published = await pgl.isPublished();
                const price = await pgl.getPrice();
                const tokenPayment = await pgl.getTokenCanister();
                const totalPurchased = await pgl.getTotalPurchased();

                return {
                    game_id: gameId,
                    max_supply: Number(maxSupply),
                    name,
                    description,
                    published,
                    price: Number(price),
                    token_payment: tokenPayment.toString(),
                    total_purchased: Number(totalPurchased),
                    metadata,
                    distribution: toDistribution(),
                };
            } catch (e) {
                console.warn('PGL read failed', rec.canister_id.toText(), e);
                return null;
            }
        },
    );

    return meta.filter(Boolean) as OffChainGameMetadata[];
}

export async function getGameByCanister({
    canister_id,
}: {
    canister_id: string;
}): Promise<OnChainGameMetadata> {
    try {
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

        return {
            gameId,
            maxSupply: Number(maxSupply),
            name,
            description,
            published,
            price: Number(price),
            tokenPayment: tokenPayment.toString(),
            totalPurchased: Number(totalPurchased),
            metadataURI,
        };
    } catch (error) {
        throw new Error('Error Service Get Game By Canister : ' + error);
    }
}
