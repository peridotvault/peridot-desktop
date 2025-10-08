import { HttpAgent } from '@dfinity/agent';
import { ApiResponse, GameId, PGLMeta } from '../service.did.d';
import { walletService } from '../../../../features/wallet/services/WalletService';
import { hexToArrayBuffer } from '../../../../utils/crypto';
import { Secp256k1KeyIdentity } from '@dfinity/identity-secp256k1';
import { Principal } from '@dfinity/principal';
import {
  createActorFactory,
  createActorPGL1,
  createActorRegistry,
  createActorVault,
} from '../../idlFactories';
import { hostICP } from '../../../../constants/lib.const';
import { GameRecordType } from '../../registry/service.did.d';
import { asText, mdGet } from '../../../../interfaces/helpers/icp.helpers';
import { getGameRecordById } from '../../registry/services/ICPRegistryService';

const vaultCanister = import.meta.env.VITE_PERIDOT_CANISTER_VAULT_BACKEND;
const factoryCanister = import.meta.env.VITE_PERIDOT_CANISTER_FACTORY_BACKEND;

/* ---------------- Concurrency helper (tanpa deps) -------------- */
// Jalankan promise dg batas concurrency (default 8)
async function runPool<T, R>(
  items: T[],
  limit: number,
  worker: (item: T, idx: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = [];
  let i = 0;
  const runners = new Array(Math.min(limit, items.length)).fill(0).map(async () => {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await worker(items[idx], idx);
    }
  });
  await Promise.all(runners);
  return results;
}

export async function createGame({
  controllers_extra,
  meta,
  wallet,
}: {
  controllers_extra: [] | [Principal[]];
  meta: PGLMeta;
  wallet: any;
}): Promise<string> {
  const privateKey = await walletService.decryptWalletData(wallet.encryptedPrivateKey);
  const secretKey = hexToArrayBuffer(privateKey);
  try {
    // Initialize agent with identity
    const agent = new HttpAgent({
      host: hostICP,
      identity: Secp256k1KeyIdentity.fromSecretKey(secretKey),
    });

    const actor = createActorFactory(factoryCanister, { agent });

    const pgl1_created = (await actor.createPGL1({
      controllers_extra,
      meta,
    })) as Principal;
    return pgl1_created.toString();
  } catch (error) {
    throw new Error('Error Service Create Game : ' + error);
  }
}

export async function updateGame({
  gameId,
  meta,
  wallet,
}: {
  gameId: GameId;
  meta: PGLMeta;
  wallet: any;
}): Promise<PGLMeta> {
  const privateKey = await walletService.decryptWalletData(wallet.encryptedPrivateKey);
  const secretKey = hexToArrayBuffer(privateKey);
  try {
    // Initialize agent with identity
    const agent = new HttpAgent({
      host: hostICP,
      identity: Secp256k1KeyIdentity.fromSecretKey(secretKey),
    });

    const actor = createActorVault(vaultCanister, { agent });

    const result = (await actor.updateGame(gameId, meta)) as ApiResponse;
    if ('err' in result) {
      const [k, v] = Object.entries(result.err)[0] as [string, string];
      throw new Error(`update game failed: ${k} - ${v}`);
    }

    return result.ok;
  } catch (error) {
    throw new Error('Error Service Update Game : ' + error);
  }
}

export async function getGameByDeveloperId({
  dev,
  start,
  limit,
}: {
  dev: string;
  start: number;
  limit: number;
}): Promise<PGLMeta[]> {
  try {
    // Initialize agent with identity
    const agent = new HttpAgent({
      host: hostICP,
    });

    const actor = createActorVault(vaultCanister, { agent });

    const result = (await actor.getGameByDeveloperId(
      Principal.fromText(dev),
      BigInt(start),
      BigInt(limit),
    )) as PGLMeta[];
    return result;
  } catch (error) {
    throw new Error('Error Service Get All Games by Developer Id : ' + error);
  }
}

export async function getPublishedGames({
  start,
  limit,
}: {
  start: number;
  limit: number;
}): Promise<PGLMeta[]> {
  // 1) agent anonim
  const agent = new HttpAgent({ host: hostICP });

  // 2) ambil daftar game dari Registry (paginated, ringan)
  const registry = createActorRegistry(import.meta.env.VITE_PERIDOT_CANISTER_REGISTRY_BACKEND, {
    agent,
  });

  // Asumsikan kamu sudah punya method paginated di Registry:
  //    getAllGameRecordLimit(start: Nat, limit: Nat) -> ApiResponse<[GameRecord]>
  const resp = await registry.getAllGameRecordLimit(BigInt(start), BigInt(limit));
  if ('err' in resp) return [];

  const records = resp.ok as GameRecordType[];

  // 3) Ambil metadata tiap PGL1 secara paralel (dibatasi)
  const metas = await runPool(
    records,
    8, // concurrency; bisa 4–16 tergantung selera
    async (rec) => {
      try {
        const pgl = createActorPGL1(rec.canister_id, { agent });
        // Pastikan ini QUERY method di canister:
        const cm = await pgl.pgl1_game_metadata(); // ContractMeta|PGLMeta (struktur sama)
        // Tentukan published dari metadata
        const statusTxt = asText(mdGet(cm.pgl1_metadata, 'pgl1_status')) ?? 'draft';
        if (statusTxt !== 'published') return null;

        // 4) Bentuk PGLMeta untuk UI (mapping 1:1)
        const meta: PGLMeta = {
          pgl1_name: cm.pgl1_name,
          pgl1_description: cm.pgl1_description,
          pgl1_game_id: cm.pgl1_game_id,
          pgl1_required_age: cm.pgl1_required_age,
          pgl1_cover_image: cm.pgl1_cover_image,
          pgl1_distribution: cm.pgl1_distribution,
          pgl1_banner_image: cm.pgl1_banner_image,
          pgl1_metadata: cm.pgl1_metadata,
          pgl1_website: cm.pgl1_website,
          pgl1_price: cm.pgl1_price,
        };
        return meta;
      } catch (e) {
        console.warn('PGL read failed', rec.canister_id.toText(), e);
        return null;
      }
    },
  );

  // 5) Filter null & kembalikan
  return metas.filter(Boolean) as PGLMeta[];
}

export async function getGameMetadata({ gameAddress }: { gameAddress: string }): Promise<PGLMeta> {
  // Parameter tetap 'gameAddress', tapi seharusnya sekarang menerima 'gameId' dari EditGamePage
  try {
    // Validasi bahwa gameAddress adalah Principal yang valid sebelum dikirim
    // Kita asumsikan bahwa gameAddress adalah Canister ID (sebuah Principal)
    // Fungsi dariText akan melempar error jika string bukan Principal yang valid
    Principal.fromText(gameAddress);
    console.log('Valid Principal ID for getGameMeta', gameAddress); // Debug log

    // Initialize agent with identity (anonim untuk query/update)
    const agent = new HttpAgent({
      host: hostICP,
    });

    const actor = createActorVault(vaultCanister, { agent });

    // Panggil fungsi canister
    const result = await actor.getGameMetadata(gameAddress);
    // Karena tipe kembalian di .did adalah PGLMeta (bukan ApiResponse),
    // kita asumsikan langsung kembalikan.
    return result as PGLMeta;
  } catch (error) {
    // Tangkap error validasi Principal dan error jaringan/aggregator
    console.error('Error in getGameMetadata service call:', error);
    // Cek apakah error berasal dari validasi Principal
    if (error instanceof Error && error.message.includes('Could not decode principal')) {
      throw new Error(
        `Invalid gameAddress format: ${gameAddress}. Must be a valid Principal string.`,
      );
    }
    // Jika bukan error validasi Principal, lempar error asli
    throw new Error(
      'Error Service Get Game Metadata : ' +
        (error instanceof Error ? error.message : String(error)),
    );
  }
}

export async function getGameByGameId({ gameId }: { gameId: string }): Promise<PGLMeta> {
  try {
    // Initialize agent with identity
    const agent = new HttpAgent({
      host: hostICP,
    });

    const gameRecord: GameRecordType = await getGameRecordById({ gameId });

    const pgl = createActorPGL1(gameRecord.canister_id, { agent });
    const cm = await pgl.pgl1_game_metadata();

    return cm;
  } catch (error) {
    throw new Error('Error Service Get Game By Id : ' + error);
  }
}

export async function getMyGames({ wallet }: { wallet: any }): Promise<PGLMeta[]> {
  const privateKey = await walletService.decryptWalletData(wallet.encryptedPrivateKey);
  const secretKey = hexToArrayBuffer(privateKey);
  try {
    // Initialize agent with identity
    const agent = new HttpAgent({
      host: hostICP,
      identity: Secp256k1KeyIdentity.fromSecretKey(secretKey),
    });

    const actor = createActorVault(vaultCanister, { agent });

    const result = (await actor.getMyGames()) as PGLMeta[];
    return result;
  } catch (error) {
    throw new Error('Error Service Get My Games : ' + error);
  }
}
