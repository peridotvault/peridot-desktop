import { HttpAgent } from '@dfinity/agent';
import { ApiResponse, GameId, PGLMeta } from '../service.did.d';
import { walletService } from '../../../../features/wallet/services/WalletService';
import { hexToArrayBuffer } from '../../../../utils/crypto';
import { Secp256k1KeyIdentity } from '@dfinity/identity-secp256k1';
import { Principal } from '@dfinity/principal';
import { createActorFactory, createActorVault } from '../../idlFactories';
import { hostICP } from '../../../../constants/lib.const';

const vaultCanister = import.meta.env.VITE_PERIDOT_CANISTER_VAULT_BACKEND;
const factoryCanister = import.meta.env.VITE_PERIDOT_CANISTER_FACTORY_BACKEND;

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
      throw new Error(`createAnnouncement failed: ${k} - ${v}`);
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

export async function getAllGames({
  start,
  limit,
}: {
  start: number;
  limit: number;
}): Promise<PGLMeta[]> {
  try {
    // Initialize agent with identity
    const agent = new HttpAgent({
      host: hostICP,
    });

    const actor = createActorVault(vaultCanister, { agent });

    const result = (await actor.getAllGames(BigInt(start), BigInt(limit))) as PGLMeta[];
    return result;
  } catch (error) {
    throw new Error('Error Service Get All Games : ' + error);
  }
}

export async function getGameMetadata({ gameAddress }: { gameAddress: string }): Promise<PGLMeta> {
  try {
    // Initialize agent with identity
    const agent = new HttpAgent({
      host: hostICP,
    });

    const actor = createActorVault(vaultCanister, { agent });

    const result = (await actor.getGameMetadata(gameAddress)) as PGLMeta;
    return result;
  } catch (error) {
    throw new Error('Error Service Get All Games : ' + error);
  }
}

export async function getGamesByGameId({ gameId }: { gameId: string }): Promise<[] | PGLMeta> {
  try {
    // Initialize agent with identity
    const agent = new HttpAgent({
      host: hostICP,
    });

    const actor = createActorVault(vaultCanister, { agent });

    const result = (await actor.getGamesByGameId(gameId)) as [] | PGLMeta;
    return result;
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
