import { deriveEvmAddressFromSeed } from "@shared/utils/evm";
import { getMyGamesEvm } from "@shared/blockchain/evm/services/game";
import { libraryService } from "./localDb";
import { walletService } from "@shared/services/wallet";
import {
    createEmptyImageDataUrl,
    downloadAndCompressToDataUrl,
} from "../utils/imageCompression";
import { resolveWebBuildUrlFromGame } from "../utils/formatDistribution";

import type { PGCGame, GameId } from "@shared/interfaces/game";
import type { CreateLibraryEntryInput } from "@shared/interfaces/library";

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

        // belum ada install lokal untuk web game
        install: undefined,

        status: "installed", 
        stats: {
            totalPlayTimeSeconds: 0,
            launchCount: 0,
        },
    };
}

/**
 * Sync dari getMyGames (EVM) → Dexie library.
 */
export async function syncLibraryFromRemote(wallet: any) {
    if (!wallet) return;

    try {
        let seedPhrase: string | null = null;

        // 1. Coba ambil dari runtimeWallet (kalau ada)
        if (wallet.runtimeWallet?.secret?.seedPhrase) {
            seedPhrase = wallet.runtimeWallet.secret.seedPhrase;
            console.log("[sync] Using seed phrase from runtimeWallet");
        } 
        // 2. Kalau tidak ada, coba decrypt native seed phrase
        else if (wallet.encryptedSeedPhrase) {
            try {
                // Pastikan lock sudah terbuka
                const isLockOpen = await walletService.isLockOpen();
                if (isLockOpen) {
                    seedPhrase = await walletService.decryptWalletData(wallet.encryptedSeedPhrase);
                    console.log("[sync] Decrypted native seed phrase for sync");
                } else {
                    console.warn("[sync] Wallet is locked, cannot sync library from native seed phrase");
                }
            } catch (decryptErr) {
                console.error("[sync] Failed to decrypt native wallet for sync", decryptErr);
            }
        }

        if (!seedPhrase) {
            console.warn("[sync] No seed phrase available for library sync");
            return;
        }

        const evmAddress = deriveEvmAddressFromSeed(seedPhrase);
        console.log("[sync] Syncing library for EVM address:", evmAddress);

        const remoteGames = await getMyGamesEvm({ address: evmAddress });
        console.log("[sync] Found remote games:", remoteGames.length);

        for (const game of remoteGames) {
            const gameId = game.gameId as GameId;
            const existing = await libraryService.getById(gameId);
            const mapped = await mapPGCGameToLibraryInput(game);

            if (!existing) {
                await libraryService.create(mapped);
                console.log("[sync] Created library entry for:", gameId);
            } else {
                await libraryService.update(gameId, {
                    gameName: mapped.gameName,
                    description: mapped.description,
                    coverVerticalImage: mapped.coverVerticalImage,
                    bannerImage: mapped.bannerImage,
                    launchType: mapped.launchType,
                    webUrl: mapped.webUrl,
                });
                console.log("[sync] Updated library entry for:", gameId);
            }
        }
    } catch (err) {
        console.error("[sync] Library sync error:", err);
    }
}

