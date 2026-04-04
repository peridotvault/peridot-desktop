import { createPublicClient, http, isAddress } from 'viem';
import { baseSepolia } from 'viem/chains';
import { PeridotRegistryAbi } from '../abis/abi.registry';
import { PGC1Abi } from '../abis/abi.pgc1';
import { PGCGame } from '@shared/interfaces/game';

// Const from env or fallbacks
const REGISTRY_ADDRESS = (import.meta.env.VITE_EVM_REGISTRY_ADDRESS ||
  '0x2091278674cec58296f4e7b868c2c84f5942abad') as `0x${string}`;
const RPC_URL =
  import.meta.env.VITE_EVM_RPC_URL || 'https://base-sepolia.g.alchemy.com/v2/1DVQw8E8nb2dYnSH0GwPm';
const PGC1_LICENSE_ID = BigInt(1);

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(RPC_URL),
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

    // 1. Get all game IDs
    const gameIds = (await Promise.all(
      Array.from({ length: Number(gameCount) }).map((_, i) =>
        publicClient.readContract({
          address: REGISTRY_ADDRESS,
          abi: PeridotRegistryAbi,
          functionName: 'gameIdAt',
          args: [BigInt(i)],
        }),
      ),
    )) as string[];

    // 2. Get game records
    const gameRecords = (await Promise.all(
      gameIds.map((id) =>
        publicClient.readContract({
          address: REGISTRY_ADDRESS,
          abi: PeridotRegistryAbi,
          functionName: 'games',
          args: [id],
        }),
      ),
    )) as Array<[string, string, bigint, boolean]>;

    // 3. Filter owned games
    const ownedGames: any[] = [];
    await Promise.all(
      gameRecords.map(async (record, index) => {
        const [pgc1] = record;
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
      }),
    );

    if (ownedGames.length === 0) return [];

    // 4. Fetch metadata for owned games
    const finalGames = await Promise.all(
      ownedGames.map(async (owned) => {
        try {
          const headVersion = (await publicClient.readContract({
            address: owned.pgc1 as `0x${string}`,
            abi: PGC1Abi,
            functionName: 'contractMetaHeadVersion',
          })) as number;

          if (headVersion === 0) throw new Error('No metadata');

          const meta = (await publicClient.readContract({
            address: owned.pgc1 as `0x${string}`,
            abi: PGC1Abi,
            functionName: 'contractMetadataAt',
            args: [BigInt(headVersion - 1)],
          })) as any;

          const apiBase = import.meta.env.VITE_API_BASE ?? 'https://api.peridotvault.com';
          const uri = meta.uri.startsWith('http') ? meta.uri : `${apiBase}${meta.uri}`;
          // Fetch the actual JSON metadata from URI
          const response = await fetch(uri);
          if (!response.ok) {
            throw new Error(`Failed to fetch metadata: ${response.status} ${response.statusText}`);
          }
          const metadata = await response.json();

          // Skip games with empty or invalid metadata
          if (!metadata || !metadata.name) {
            console.warn(`[EVM] Game ${owned.gameId} has no name in metadata, skipping...`);
            return null;
          }

          return composePGCGameFromEvm(owned.gameId, metadata);
        } catch (err) {
          console.warn(`[EVM] Failed to fetch metadata for ${owned.gameId}`, err);
          return null;
        }
      }),
    );

    return finalGames.filter((g): g is PGCGame => g !== null);
  } catch (error) {
    console.error('Error fetching EVM games:', error);
    return [];
  }
}

/**
 * Legacy stubs to fix broken imports after ICP removal
 */

export async function getGameByGameId({ gameId }: { gameId: string }): Promise<PGCGame> {
  // Try to get from local library first
  const local = await (
    await import('@features/library/services/localDb')
  ).libraryService.getById(gameId as any);
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
  throw new Error('Game not found');
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
    coverVerticalImage: metadata.cover_vertical_image ?? metadata.coverVerticalImage,
    coverHorizontalImage: metadata.cover_horizontal_image ?? metadata.coverHorizontalImage,
    bannerImage: metadata.banner_image ?? metadata.bannerImage,
    website: metadata.website,
    metadata: {
      ...metadata,
      _blockchain: 'base-sepolia', // Mark which blockchain this game is from
    },
    distribution: metadata.distributions ?? metadata.distribution ?? [],
    previews: metadata.previews ?? [],
  };

  if (game.name === 'Unknown Game') {
    console.warn(`[EVM] Game ${gameId} has no name in metadata`);
  }

  return game;
}
