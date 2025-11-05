import type { PGLMeta, Distribution, Metadata, Value } from '../service.did.d';
import type { MediaItem as OffChainMediaItem, OffChainGameMetadata } from '@shared/blockchain/icp/types/game.types';
import { getPublishedGames as fetchPublishedCatalog, getGamesByDeveloper } from '@shared/blockchain/icp/services/game.service';

const toOpt = <T,>(value: T | null | undefined): [] | [T] =>
    value === null || value === undefined ? [] : [value];

const toTextValue = (text: string): Value => ({ text });
const toArrayText = (items: string[]): Value => ({ array: items.map(toTextValue) });

const toPreviewsValue = (items: OffChainMediaItem[] | undefined): Value => ({
    array: (items ?? []).map((item) => {
        const source = item.src ?? item.url ?? '';
        const entries: Array<[string, Value]> = [
            ['kind', toTextValue(item.kind)],
        ];
        if (source) {
            entries.push(['src', toTextValue(source)]);
            entries.push(['url', toTextValue(source)]);
        }
        if (item.alt) {
            entries.push(['alt', toTextValue(item.alt)]);
        }
        if (item.poster) {
            entries.push(['poster', toTextValue(item.poster)]);
        }
        if (item.storageKey) {
            entries.push(['storageKey', toTextValue(item.storageKey)]);
        }
        if (item.primary !== undefined) {
            entries.push(['primary', { nat: item.primary ? 1 : 0 }]);
        }
        return { map: entries };
    }),
});

const mapDistribution = (distribution: OffChainGameMetadata['distribution']): Distribution[] =>
    (distribution ?? []).map((entry) => {
        if ('web' in entry) {
            const { web } = entry;
            return {
                web: {
                    url: web.url,
                    processor: web.processor,
                    graphics: web.graphics,
                    memory: Number(((web as any).memory ?? (web as any).memoryMB ?? 0)),
                    storage: Number(((web as any).storage ?? (web as any).storageMB ?? 0)),
                    additionalNotes: toOpt(
                        web.additionalNotes?.trim() ? web.additionalNotes.trim() : undefined,
                    ),
                },
            };
        }

        const { native } = entry;
        return {
            native: {
                os: native.os,
                processor: native.processor,
                graphics: native.graphics,
                memory: Number(((native as any).memory ?? (native as any).memoryMB ?? 0)),
                storage: Number(((native as any).storage ?? (native as any).storageMB ?? 0)),
                additionalNotes: toOpt(
                    native.additionalNotes?.trim() ? native.additionalNotes.trim() : undefined,
                ),
                liveVersion: native.liveVersion,
                manifests: native.manifests.map((manifest) => ({
                    listing: manifest.version,
                    version: manifest.version,
                    createdAt: manifest.createdAt,
                    size_bytes: Number((manifest as any).size_bytes ?? manifest.sizeBytes ?? 0),
                    checksum: manifest.checksum,
                    storageRef: manifest.storageRef as any,
                })),
            },
        };
    });

const mapMetadata = (meta: OffChainGameMetadata['metadata']): Metadata => {
    if (!meta) return [];

    const entries: Metadata = [];

    if (meta.categories?.length) {
        entries.push(['pgl1_categories', toArrayText(meta.categories)]);
    }
    if (meta.tags?.length) {
        entries.push(['pgl1_tags', toArrayText(meta.tags)]);
    }
    if (meta.previews?.length) {
        entries.push(['pgl1_previews', toPreviewsValue(meta.previews)]);
    }
    if (typeof meta.required_age === 'number') {
        entries.push(['pgl1_required_age', { nat: meta.required_age }]);
    }
    if (meta.website) {
        entries.push(['pgl1_website', toTextValue(meta.website)]);
    }

    return entries;
};

const mapOffChainToLegacy = (game: OffChainGameMetadata): PGLMeta => {
    const metadataEntries = mapMetadata(game.metadata);
    const distribution = mapDistribution(game.distribution);
    const coverVertical = game.metadata?.cover_vertical_image;
    const coverHorizontal = game.metadata?.cover_horizontal_image;
    const banner = game.metadata?.banner_image;
    const website = game.metadata?.website;
    const requiredAge = game.metadata?.required_age;
    const previews = (game.metadata?.previews ?? []).map((item) => ({
        kind: item.kind,
        src: item.src ?? item.url ?? '',
        url: item.url ?? item.src ?? '',
        alt: item.alt,
        poster: item.poster,
        storageKey: item.storageKey,
        primary: item.primary,
    }));

    return {
        pgl1_game_id: game.game_id,
        pgl1_name: game.name,
        pgl1_description: game.description,
        pgl1_required_age: toOpt(requiredAge),
        pgl1_price: toOpt(game.price),
        pgl1_cover_image: toOpt(coverVertical ?? coverHorizontal ?? null),
        pgl1_cover_vertical_image: coverVertical,
        pgl1_cover_horizontal_image: coverHorizontal,
        pgl1_banner_image: toOpt(banner ?? null),
        pgl1_metadata: metadataEntries.length ? toOpt(metadataEntries) : [],
        pgl1_distribution: distribution.length ? toOpt(distribution) : [],
        pgl1_website: toOpt(website ?? null),
        pgl1_previews: previews,
        pgl1_token_payment: toOpt(game.token_payment),
        pgl1_total_purchased: game.total_purchased,
        pgl1_published: game.published,
    } as PGLMeta;
};

const cachePublishedGames = async (): Promise<PGLMeta[]> => {
    const list = await fetchPublishedCatalog({ start: 0, limit: 200 });
    return list.map(mapOffChainToLegacy);
};

export async function createGame(_payload: {
    controllers_extra: string[];
    meta: PGLMeta;
    wallet: any;
}): Promise<void> {
    throw new Error('createGame is not supported with the new smart-contract API. Please update the flow to use the factory service.');
}

export async function getPublishedGames({
    start = 0,
    limit = 200,
}: {
    start?: number;
    limit?: number;
} = {}): Promise<PGLMeta[]> {
    const list = await cachePublishedGames();
    return list.slice(start, start + limit);
}

export async function getGameByGameId({ gameId }: { gameId: string }): Promise<PGLMeta | null> {
    const list = await cachePublishedGames();
    return list.find((game) => game.pgl1_game_id === gameId) ?? null;
}

export async function getGameByDeveloperId({
    dev,
}: {
    dev: string;
    start?: number;
    limit?: number;
}): Promise<PGLMeta[]> {
    try {
        const records = await getGamesByDeveloper({ dev });
        const published = await cachePublishedGames();
        const gameIds = new Set(records.map((rec) => rec.game_id));
        return published.filter((game) => gameIds.has(game.pgl1_game_id));
    } catch (error) {
        console.warn('Unable to resolve developer games from registry – falling back to published list.', error);
        return cachePublishedGames();
    }
}

export async function getMyGames(_payload: { wallet: any }): Promise<PGLMeta[]> {
    return cachePublishedGames();
}

export async function updateGame(_payload: {
    gameId: string;
    meta: PGLMeta;
    wallet: any;
}): Promise<{ ok: null }> {
    console.warn('updateGame service is not yet wired to the new smart-contract API.');
    return { ok: null };
}
