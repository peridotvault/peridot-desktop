import type { GameId } from "@shared/interfaces/game";
import type {
    CreateLibraryEntryInput,
} from "@shared/interfaces/library";
import type { PGCGame } from "@shared/blockchain/icp/types/game";
import { getMyGames } from "@features/game/services/dto";
import { libraryService } from "./localDb";
import {
    createEmptyImageDataUrl,
    downloadAndCompressToDataUrl,
} from "../utils/imageCompression";
import { resolveWebBuildUrlFromGame } from "../utils/formatDistribution";

// pilih URL cover terbaik
function resolveCoverUrl(game: PGCGame): string | undefined {
    return (
        game.coverVerticalImage ||
        game.coverHorizontalImage ||
        game.bannerImage ||
        undefined
    );
}

// pilih URL banner terbaik
function resolveBannerUrl(game: PGCGame): string | undefined {
    return (
        game.bannerImage ||
        game.coverHorizontalImage ||
        game.coverVerticalImage ||
        undefined
    );
}

// mapping utama
async function mapPGCGameToLibraryInput(game: PGCGame): Promise<CreateLibraryEntryInput> {
    const gameId = game.gameId as GameId;

    const coverUrl = resolveCoverUrl(game);
    const bannerUrl = resolveBannerUrl(game);

    let coverVerticalImage: string;
    let bannerImage: string;

    try {
        if (!coverUrl) throw new Error("No cover URL");
        // cover vertical untuk card
        coverVerticalImage = await downloadAndCompressToDataUrl(coverUrl, {
            maxWidth: 600,
            maxHeight: 900,
            quality: 0.8,
            mimeType: "image/jpeg",
        });
    } catch (err) {
        console.warn("[librarySyncService] coverVerticalImage failed, using empty", err);
        coverVerticalImage = createEmptyImageDataUrl();
    }

    try {
        if (!bannerUrl) throw new Error("No banner URL");
        // banner horizontal (kalau mau dipakai di hero)
        bannerImage = await downloadAndCompressToDataUrl(bannerUrl, {
            maxWidth: 1280,
            maxHeight: 720,
            quality: 0.8,
            mimeType: "image/jpeg",
        });
    } catch (err) {
        console.warn("[librarySyncService] bannerImage failed, fallback to cover", err);
        bannerImage = coverVerticalImage;
    }

    const webUrl = resolveWebBuildUrlFromGame(game);
    console.log("[sync] resolved webUrl", { gameId: game.gameId, webUrl });

    return {
        gameId,
        gameName: game.name,
        description: game.description ?? "",
        coverVerticalImage,
        bannerImage,

        launchType: "web",
        webUrl,

        // belum ada install lokal untuk web game ICP
        install: undefined,

        status: "installed", // atau "not-installed" kalau kamu mau beda arti
        stats: {
            totalPlayTimeSeconds: 0,
            launchCount: 0,
        },
    };
}

/**
 * Sync dari getMyGames → Dexie library.
 */
export async function syncLibraryFromRemote(wallet: any) {
    if (!wallet) return;

    const remoteGames = await getMyGames({ wallet });
    console.log(remoteGames);

    for (const game of remoteGames) {
        const gameId = game.gameId as GameId;
        const existing = await libraryService.getById(gameId);
        const mapped = await mapPGCGameToLibraryInput(game);

        if (!existing) {
            await libraryService.create(mapped);
        } else {
            await libraryService.update(gameId, {
                gameName: mapped.gameName,
                description: mapped.description,
                coverVerticalImage: mapped.coverVerticalImage,
                bannerImage: mapped.bannerImage,
                launchType: mapped.launchType,
                webUrl: mapped.webUrl,
            });
        }
    }
}
