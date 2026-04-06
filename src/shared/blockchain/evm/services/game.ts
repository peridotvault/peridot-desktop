import { createPublicClient, custom, isAddress } from 'viem';
import { baseSepolia } from 'viem/chains';
import { fetch as tauriFetch } from '@tauri-apps/plugin-http';
import {
  STORAGE_URL,
  EVM_RPC_URL,
  EVM_REGISTRY_ADDRESS,
} from '@shared/constants/storage';
import { PeridotRegistryAbi } from '../abis/abi.registry';
import { PGC1Abi } from '../abis/abi.pgc1';
import { PGCGame } from '@shared/interfaces/game';
import { fetchGameAsPGC } from '@shared/api/game.api';

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

const REGISTRY_ADDRESS = EVM_REGISTRY_ADDRESS as `0x${string}`;
const RPC_URL = EVM_RPC_URL;
const PGC1_LICENSE_ID = BigInt(1);

// Delay helper to avoid rate limiting
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Batch size for concurrent requests
const BATCH_SIZE = 5;
const BATCH_DELAY_MS = 100;

// Process items in batches with delays
async function processInBatches<T, R>(
  items: T[],
  batchSize: number,
  processor: (item: T, index: number) => Promise<R>,
  delayMs: number
): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map((item, idx) => processor(item, i + idx))
    );
    results.push(...batchResults);
    if (i + batchSize < items.length) {
      await delay(delayMs);
    }
  }
  return results;
}

// Custom transport using Tauri's HTTP API to bypass CORS
const tauriHttpTransport = () => {
  return custom({
    async request({ method, params }) {
      const response = await tauriFetch(RPC_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: Math.floor(Math.random() * 1000000),
          method,
          params,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || 'RPC error');
      }

      return data.result;
    },
  });
};

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: tauriHttpTransport(),
});

export async function getMyGamesEvm({ address }: { address: string }): Promise<PGCGame[]> {
  if (!isAddress(address)) return [];

  try {
    const gameCount = (await publicClient.readContract({
      address: REGISTRY_ADDRESS,
      abi: PeridotRegistryAbi,
      functionName: 'gameCount',
    })) as bigint;

    if (gameCount === BigInt(0)) return [];

    // 1. Get all game IDs (with batching to avoid rate limits)
    const gameIds = (await processInBatches(
      Array.from({ length: Number(gameCount) }).map((_, i) => i),
      BATCH_SIZE,
      async (index) => {
        return publicClient.readContract({
          address: REGISTRY_ADDRESS,
          abi: PeridotRegistryAbi,
          functionName: 'gameIdAt',
          args: [BigInt(index)],
        }) as Promise<string>;
      },
      BATCH_DELAY_MS
    )) as string[];

    // 2. Get game records (with batching to avoid rate limits)
    const gameRecords = (await processInBatches(
      gameIds,
      BATCH_SIZE,
      async (id) => {
        return publicClient.readContract({
          address: REGISTRY_ADDRESS,
          abi: PeridotRegistryAbi,
          functionName: 'games',
          args: [id],
        }) as Promise<[string, string, bigint, boolean]>;
      },
      BATCH_DELAY_MS
    )) as Array<[string, string, bigint, boolean]>;

    // 3. Filter owned games (with batching to avoid rate limits)
    const ownedGames: any[] = [];
    await processInBatches(
      gameRecords,
      BATCH_SIZE,
      async (record, index) => {
        const [pgc1] = record;
        try {
          const balance = (await publicClient.readContract({
            address: pgc1 as `0x${string}`,
            abi: PGC1Abi,
            functionName: 'balanceOf',
            args: [address as `0x${string}`, PGC1_LICENSE_ID],
          })) as bigint;

          if (balance > BigInt(0)) {
            ownedGames.push({
              gameId: gameIds[index],
              pgc1,
            });
          }
        } catch (err) {
          console.warn(`[EVM] Failed to check balance for game at index ${index}:`, err);
        }
      },
      BATCH_DELAY_MS
    );

    if (ownedGames.length === 0) return [];

    // 4. Fetch metadata for owned games
    const finalGames = await Promise.all(
      ownedGames.map(async (owned) => {
        try {
          // First, try to get metadata from the contract
          const headVersion = (await publicClient.readContract({
            address: owned.pgc1 as `0x${string}`,
            abi: PGC1Abi,
            functionName: 'contractMetaHeadVersion',
          })) as number;

          if (headVersion === 0) throw new Error('No metadata on contract');

          const meta = (await publicClient.readContract({
            address: owned.pgc1 as `0x${string}`,
            abi: PGC1Abi,
            functionName: 'contractMetadataAt',
            args: [BigInt(headVersion - 1)],
          })) as any;

          const apiBase = import.meta.env.VITE_API_BASE ?? 'https://api.peridotvault.com';
          const uri = meta.uri.startsWith('http') ? meta.uri : `${apiBase}${meta.uri}`;
          // Fetch the actual JSON metadata from URI
          const response = await tauriFetch(uri);
          if (!response.ok) {
            throw new Error(`Failed to fetch metadata: ${response.status} ${response.statusText}`);
          }
          const metadata = await response.json();

          // If contract metadata has valid name, use it
          if (metadata && metadata.name && metadata.name !== 'Unknown Game') {
            return composePGCGameFromEvm(owned.gameId, metadata);
          }

          // Otherwise, fall through to API fallback
          console.warn(`[EVM] Contract metadata incomplete for ${owned.gameId}, trying API fallback...`);
        } catch (err) {
          console.warn(`[EVM] Contract metadata failed for ${owned.gameId}, trying API fallback...`, err);
        }

        // Fallback: Fetch from API
        try {
          const apiGame = await fetchGameAsPGC(owned.gameId);
          if (apiGame) {
            console.log(`[EVM] Successfully fetched ${owned.gameId} from API`);
            return apiGame;
          }
        } catch (apiErr) {
          console.warn(`[EVM] API fallback also failed for ${owned.gameId}`, apiErr);
        }

        return null;
      }),
    );

    return finalGames.filter((g): g is PGCGame => g !== null);
  } catch (error) {
    console.error('Error fetching EVM games:', error);
    return [];
  }
}

/**
 * Fetch game by ID - tries local DB first, then fetches from API
 */

export async function getGameByGameId({ gameId }: { gameId: string }): Promise<PGCGame> {
  // Try to get from local library first
  const { libraryService } = await import('@features/library/services/localDb');
  const local = await libraryService.getById(gameId as any);
  if (local) {
    return {
      gameId: local.gameId,
      name: local.gameName,
      description: local.description,
      published: true,
      price: 0,
      tokenPayment: '',
      totalPurchased: 0,
      maxSupply: 0,
      coverVerticalImage: local.coverVerticalImage,
      bannerImage: local.bannerImage,
      metadata: null,
      distribution: [],
      previews: [],
    };
  }

  // Fetch from API
  try {
    const apiGame = await fetchGameAsPGC(gameId);
    if (apiGame) {
      // Save to local DB for future use
      await saveGameToLibrary(apiGame);
      return apiGame;
    }
  } catch (err) {
    console.error(`[getGameByGameId] Failed to fetch game ${gameId} from API:`, err);
  }

  throw new Error('Game not found');
}

/**
 * Save a game to the local library database
 */
async function saveGameToLibrary(game: PGCGame): Promise<void> {
  try {
    const { libraryService } = await import('@features/library/services/localDb');
    const existing = await libraryService.getById(game.gameId);

    const webDist = game.distribution?.find((d) => 'web' in d);
    const webUrl = webDist && 'web' in webDist ? webDist.web.url : undefined;

    const libraryEntry = {
      gameId: game.gameId,
      gameName: game.name,
      description: game.description ?? '',
      coverVerticalImage: game.coverVerticalImage ?? '',
      bannerImage: game.bannerImage ?? '',
      launchType: 'web' as const,
      webUrl,
      status: 'installed' as const,
      stats: {
        totalPlayTimeSeconds: 0,
        launchCount: 0,
      },
    };

    if (!existing) {
      await libraryService.create(libraryEntry);
      console.log(`[saveGameToLibrary] Created library entry for: ${game.gameId}`);
    }
  } catch (err) {
    console.warn(`[saveGameToLibrary] Failed to save game ${game.gameId}:`, err);
  }
}

export async function getDeveloperGames() {
  return [];
}

export async function register_game() {
  throw new Error('Not implemented for EVM yet');
}

export async function createGamePaid() {
  throw new Error('Not implemented for EVM yet');
}

export async function createGameVoucher() {
  throw new Error('Not implemented for EVM yet');
}

export async function getPublishedGames(_params: {
  start: number;
  limit: number;
}): Promise<PGCGame[]> {
  return [];
}

function composePGCGameFromEvm(gameId: string, metadata: any): PGCGame {
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
      _blockchain: 'base-sepolia',
    },
    distribution: metadata.distributions ?? metadata.distribution ?? [],
    previews: metadata.previews ?? [],
  };

  if (game.name === 'Unknown Game') {
    console.warn(`[EVM] Game ${gameId} has no name in metadata`);
  }

  return game;
}
