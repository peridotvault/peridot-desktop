import { Connection, PublicKey } from '@solana/web3.js';
import { fetch as tauriFetch } from '@tauri-apps/plugin-http';
import {
  STORAGE_URL,
  SVM_RPC_URL,
  SVM_PGC1_PROGRAM_ID,
} from '@shared/constants/storage';
import { decodeLicenseAccount, decodePgcGameAccount } from '../contracts/account.state';
import { fetchGameAsPGC } from '@shared/api/game.api';
import type { PGCGame } from '@shared/interfaces/game';

/**
 * Resolves an image URL to an absolute URL.
 * If the URL is already absolute (http/https/data), returns as-is.
 * If relative, prepends the storage URL (includes /storage/files path).
 */
function resolveImageUrl(url: string | undefined): string | undefined {
    if (!url) return undefined;
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
        return url;
    }
    return `${STORAGE_URL}/${url.startsWith('/') ? url.slice(1) : url}`;
}

const RPC_URL = SVM_RPC_URL;
const PGC1_PROGRAM_ID = new PublicKey(SVM_PGC1_PROGRAM_ID);

const connection = new Connection(RPC_URL, 'confirmed');

export async function getMyGamesSvm({ address }: { address: string }): Promise<PGCGame[]> {
  try {
    const userPubkey = new PublicKey(address);

    // Get all License accounts owned by the user
    const accounts = await connection.getProgramAccounts(PGC1_PROGRAM_ID, {
      filters: [
        {
          memcmp: {
            offset: 8, // owner field offset (account.state decoder logic)
            bytes: userPubkey.toBase58(),
          },
        },
      ],
    });

    if (accounts.length === 0) return [];

    const ownedGames: PGCGame[] = [];

    for (const { account } of accounts) {
      try {
        const license = decodeLicenseAccount(new Uint8Array(account.data));
        const gamePda = license.game;

        // Fetch PGC Game Account to get metadataUri
        const gameAccountInfo = await connection.getAccountInfo(gamePda);
        if (!gameAccountInfo) continue;

        const pgcGame = decodePgcGameAccount(new Uint8Array(gameAccountInfo.data));

        // Fetch metadata from URI
        let metadata: any = {};
        let hasValidMetadata = false;

        try {
          const apiBase = import.meta.env.VITE_API_BASE ?? 'https://api.peridotvault.com';
          const fetchUri = pgcGame.metadataUri.startsWith('http')
            ? pgcGame.metadataUri
            : `${apiBase}${pgcGame.metadataUri}`;
          const response = await tauriFetch(fetchUri);
          if (!response.ok) {
            throw new Error(`Failed to fetch metadata: ${response.status} ${response.statusText}`);
          }
          metadata = await response.json();

          // Check if metadata has valid name
          if (metadata && metadata.name && metadata.name !== 'Unknown Game') {
            hasValidMetadata = true;
          }
        } catch (err) {
          console.warn(`[SVM] Failed to fetch metadata from ${pgcGame.metadataUri}`, err);
        }

        // If contract metadata is valid, use it
        if (hasValidMetadata) {
          ownedGames.push(composePGCGameFromSvm(pgcGame.gameId, metadata));
          continue;
        }

        // Otherwise, fallback to API
        console.warn(`[SVM] Contract metadata incomplete for ${pgcGame.gameId}, trying API fallback...`);
        try {
          const apiGame = await fetchGameAsPGC(pgcGame.gameId);
          if (apiGame) {
            console.log(`[SVM] Successfully fetched ${pgcGame.gameId} from API`);
            ownedGames.push(apiGame);
          }
        } catch (apiErr) {
          console.warn(`[SVM] API fallback also failed for ${pgcGame.gameId}`, apiErr);
        }
      } catch (e) {
        console.error(`[Library] Failed to process SVM license:`, e);
      }
    }

    return ownedGames;
  } catch (error) {
    console.error('[Library] SVM Fetch failed:', error);
    return [];
  }
}

function composePGCGameFromSvm(gameId: string, metadata: any): PGCGame {
  const game: PGCGame = {
    gameId,
    name: metadata.name ?? 'Unknown Game',
    description: metadata.description ?? '',
    published: true,
    price: metadata.price ?? 0,
    tokenPayment: metadata.paymentToken ?? metadata.payment_token ?? '',
    totalPurchased: 0,
    maxSupply: 0,
    requiredAge: metadata.required_age ?? metadata.requiredAge,
    coverVerticalImage: resolveImageUrl(metadata.cover_vertical_image ?? metadata.coverVerticalImage),
    coverHorizontalImage: resolveImageUrl(metadata.cover_horizontal_image ?? metadata.coverHorizontalImage),
    bannerImage: resolveImageUrl(metadata.banner_image ?? metadata.bannerImage),
    website: metadata.website,
    metadata: {
      ...metadata,
      _blockchain: 'solana',
    },
    distribution: metadata.distributions ?? metadata.distribution ?? [],
    previews: metadata.previews ?? [],
  };

  if (game.name === 'Unknown Game') {
    console.warn(`[SVM] Game ${gameId} has no name in metadata`);
  }

  return game;
}
