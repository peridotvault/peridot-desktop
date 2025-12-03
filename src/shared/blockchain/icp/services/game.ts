import { Principal } from '@dfinity/principal';
import { ICPPrivateAgent, ICPPublicAgent } from '../sdk/actors';
import { createActorFactory, createActorPGC1, createActorRegistry } from '../sdk/agents';
import type { ApiResponse_4, GameRecordType } from '../sdk/canisters/registry.did';
import type { Manifest as PGCLiveManifest } from '../sdk/canisters/pgc1.did';
import { ICP_FACTORY_CANISTER, ICP_REGISTRY_CANISTER } from '../../../config/icp';
import { walletService } from '@shared/services/wallet';
import { arrayStringToPrincipal } from '@shared/utils/icp.helper';
import { fetchMetadata } from '@shared/api/metadata.api';
import { runPool } from '@shared/utils/run-pool';
import type {
    Distribution,
    Metadata,
    OffChainGameMetadata,
    OnChainGameMetadata,
    PGCGame,
    Platform,
} from '../types/game';
import type { InitCreateGame } from '../types/factory';

type PrincipalListOpt = [] | [Principal[]];

const storageRefToUrl = (manifest: PGCLiveManifest | null): string | undefined => {
    if (!manifest) return undefined;

    const storage = (manifest as any).storage ?? (manifest as any).storageRef;
    if (!storage) return undefined;

    if ("url" in storage) {
        const raw = storage.url?.url;
        if (typeof raw === "string" && raw.trim()) {
            return raw.trim();
        }
    }

    return undefined;
};

/**
 * Enrich PGCGame[] dengan distribution web berdasarkan live manifest.
 * Dipakai hanya di getMyGames (library), jadi nggak ganggu flow lain.
 */
async function enrichOwnedGamesWithWebDistribution(
    games: PGCGame[],
    records: GameRecordType[],
): Promise<PGCGame[]> {
    // map gameId -> record (agar tahu canister_id-nya)
    const recordByGameId = new Map<string, GameRecordType>();
    for (const rec of records) {
        recordByGameId.set(rec.game_id, rec);
    }

    return runPool(
        games,
        6, // concurrency
        async (game): Promise<PGCGame> => {
            try {
                const rec = recordByGameId.get(game.gameId);
                if (!rec) return game;

                const manifest = await getLiveManifestForPlatform({
                    canisterId: rec.canister_id,
                    platform: "web",
                });

                const url = storageRefToUrl(manifest);
                if (!url) return game;

                const webDist: Distribution = {
                    web: {
                        url,
                        processor: undefined,
                        graphics: undefined,
                        memory: undefined,
                        storage: undefined,
                        additionalNotes: undefined,
                    },
                };

                // merge dengan distribution existing (kalau nanti ada di metadata)
                const nonWebDists = Array.isArray(game.distribution)
                    ? game.distribution.filter((d) => !("web" in d))
                    : [];

                return {
                    ...game,
                    distribution: [...nonWebDists, webDist],
                };
            } catch (err) {
                console.warn("[getMyGames] enrich web distribution failed", game.gameId, err);
                return game;
            }
        },
    );
}

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

const toPlatformVariant = (platform: Platform) => {
    switch (platform) {
        case 'windows':
            return { windows: null } as const;
        case 'macos':
            return { macos: null } as const;
        case 'linux':
            return { linux: null } as const;
        case 'android':
            return { android: null } as const;
        case 'ios':
            return { ios: null } as const;
        case 'other':
            return { other: null } as const;
        case 'web':
        default:
            return { web: null } as const;
    }
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

const PUBLISHED_CACHE_TTL_MS = 60_000;
let cachedPublished: OffChainGameMetadata[] | null = null;
let cachedPublishedAt = 0;

async function fetchPublishedCatalog({
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

const loadPublishedCatalog = async (): Promise<OffChainGameMetadata[]> => {
    const now = Date.now();
    if (cachedPublished && now - cachedPublishedAt < PUBLISHED_CACHE_TTL_MS) {
        return cachedPublished;
    }
    const list = await fetchPublishedCatalog({ start: 0, limit: 200 });
    cachedPublished = list;
    cachedPublishedAt = now;
    return list;
};

const composePGCGame = ({
    gameId,
    name,
    description,
    published,
    price,
    tokenPayment,
    totalPurchased,
    maxSupply,
    metadata,
    distribution,
}: {
    gameId: string;
    name: string;
    description: string;
    published: boolean;
    price: number;
    tokenPayment: string;
    totalPurchased: number;
    maxSupply: number;
    metadata: Metadata | null;
    distribution: Distribution[];
}): PGCGame => {
    const previews = Array.isArray(metadata?.previews) ? metadata?.previews ?? [] : [];
    const metadataDistribution =
        Array.isArray(metadata?.distribution) && metadata.distribution.length
            ? (metadata.distribution as Distribution[])
            : Array.isArray((metadata as any)?.distributions) && (metadata as any).distributions.length
                ? ((metadata as any).distributions as Distribution[])
                : [];

    const mergedDistribution =
        distribution && distribution.length ? distribution : metadataDistribution;

    return {
        gameId,
        name,
        description,
        published,
        price,
        tokenPayment,
        totalPurchased,
        maxSupply,
        requiredAge: metadata?.requiredAge ?? metadata?.required_age,
        coverVerticalImage: metadata?.coverVerticalImage ?? metadata?.cover_vertical_image ?? undefined,
        coverHorizontalImage:
            metadata?.coverHorizontalImage ?? metadata?.cover_horizontal_image ?? undefined,
        bannerImage: metadata?.bannerImage ?? metadata?.banner_image ?? undefined,
        website: metadata?.website ?? undefined,
        metadata,
        distribution: mergedDistribution,
        previews,
    };
};

const mapOffChainToPGC = (game: OffChainGameMetadata): PGCGame =>
    composePGCGame({
        gameId: game.game_id,
        name: game.name,
        description: game.description,
        published: game.published,
        price: game.price,
        tokenPayment: game.token_payment,
        totalPurchased: game.total_purchased,
        maxSupply: game.max_supply,
        metadata: game.metadata ?? null,
        distribution: game.distribution ?? [],
    });

export const mapCatalogToPGCGames = (games: OffChainGameMetadata[]): PGCGame[] =>
    games.map(mapOffChainToPGC);

const readPGCGameFromCanister = async (
    canister: Principal,
    agent = ICPPublicAgent,
): Promise<PGCGame | null> => {
    try {
        const actor = createActorPGC1(canister, { agent });
        const metadataURI = await actor.getMetadataURI();
        const metadata = await fetchMetadata(metadataURI).catch(() => null);

        const gameId = await actor.getGameId();
        const maxSupply = await actor.getMaxSupply();
        const name = await actor.getName();
        const description = await actor.getDescription();
        const published = await actor.isPublished();
        const price = await actor.getPrice();
        const tokenPayment = await actor.getTokenCanister();
        const totalPurchased = await actor.getTotalPurchased();

        return composePGCGame({
            gameId,
            name,
            description,
            published,
            price: Number(price),
            tokenPayment: tokenPayment.toString(),
            totalPurchased: Number(totalPurchased),
            maxSupply: Number(maxSupply),
            metadata,
            distribution: toDistribution(),
        });
    } catch (error) {
        console.warn('Unable to read PGC game from canister', canister.toText(), error);
        return null;
    }
};

export async function getPublishedGames({
    start,
    limit,
}: {
    start: number;
    limit: number;
}): Promise<PGCGame[]> {
    const raw = await fetchPublishedCatalog({ start, limit });
    return mapCatalogToPGCGames(raw);
}

export async function getGameByGameId({
    gameId,
}: {
    gameId: string;
}): Promise<PGCGame | null> {
    const catalog = await loadPublishedCatalog();
    const found = catalog.find((game) => game.game_id === gameId) ?? null;
    return found ? mapOffChainToPGC(found) : null;
}

export async function getDeveloperGames({
    dev,
}: {
    dev: string;
}): Promise<PGCGame[]> {
    const records = await getGamesByDeveloper({ dev });

    const games = await runPool(
        records,
        6,
        async (record): Promise<PGCGame | null> =>
            readPGCGameFromCanister(record.canister_id, ICPPublicAgent),
    );

    return games.filter(Boolean) as PGCGame[];
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

export async function getMyGames({ wallet }: { wallet: any }): Promise<PGCGame[]> {
    const principalText = wallet?.principalId?.trim();
    if (!principalText) {
        return [];
    }

    let principal: Principal;
    try {
        principal = Principal.fromText(principalText);
    } catch (error) {
        console.warn('Invalid principal id provided for getMyGames lookup.', error);
        return [];
    }

    try {
        const agent = ICPPublicAgent;
        const registry = createActorRegistry(ICP_REGISTRY_CANISTER, { agent });
        const response = (await registry.getAllGameRecordLimit(0n, 200n)) as ApiResponse_4;

        if ('err' in response) {
            const [code, message] = Object.entries(response.err)[0] as [string, string];
            console.warn(`Unable to fetch game records for library lookup: ${code} ${message ?? ''}`.trim());
            return [];
        }

        const records = response.ok as GameRecordType[];
        if (!records.length) {
            return [];
        }

        const ownedIds = await runPool(records, 8, async (record): Promise<string | null> => {
            try {
                const pgc = createActorPGC1(record.canister_id, { agent });
                const hasGame = await pgc.hasAccess(principal);
                return hasGame ? record.game_id : null;
            } catch (err) {
                console.warn('Unable to verify ownership for game', record.game_id, err);
                return null;
            }
        });

        const ownedGameIds = ownedIds.filter((id): id is string => Boolean(id));
        if (ownedGameIds.length === 0) {
            return [];
        }

        const ownedSet = new Set(ownedGameIds);

        const catalog = await loadPublishedCatalog();
        const ownedCatalog = catalog.filter((game) => ownedSet.has(game.game_id));
        const baseGames = mapCatalogToPGCGames(ownedCatalog);

        const enrichedGames = await enrichOwnedGamesWithWebDistribution(baseGames, records);

        return enrichedGames;
    } catch (error) {
        console.warn('Failed to resolve owned games for wallet.', error);
        return [];
    }
}


export async function getLiveManifestForPlatform({
    canisterId,
    platform,
}: {
    canisterId: string | Principal;
    platform: Platform;
}): Promise<PGCLiveManifest | null> {
    const agent = ICPPublicAgent;
    const principal = typeof canisterId === 'string' ? Principal.fromText(canisterId) : canisterId;
    const actor = createActorPGC1(principal, { agent });
    const variant = toPlatformVariant(platform);
    const result = await actor.getLiveManifest(variant);
    if (!result || result.length === 0) {
        return null;
    }
    return result[0] ?? null;
}
