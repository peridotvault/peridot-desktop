import { HttpAgent } from '@dfinity/agent';
import { walletService } from '../../../../features/wallet/services/WalletService';
import { hexToArrayBuffer } from '../../../../utils/crypto';
import { Secp256k1KeyIdentity } from '@dfinity/identity-secp256k1';
import {
  GameAnnouncementType,
  GameId,
  DTOGameAnnouncement,
  AnnouncementId,
  GameAnnouncementInteractionType,
  ApiResponse_2,
  ApiResponse_1,
  ApiResponse_4,
} from '../service.did.d';
import { createActorVault } from '../../idlFactories';
import { hostICP } from '../../../../constants/lib.const';

const vaultCanister = import.meta.env.VITE_PERIDOT_CANISTER_VAULT_BACKEND;

export async function createAnnouncement({
  createAnnouncementTypes,
  wallet,
  gameId,
}: {
  createAnnouncementTypes: DTOGameAnnouncement;
  wallet: any;
  gameId: GameId;
}): Promise<GameAnnouncementType> {
  const privateKey = await walletService.decryptWalletData(wallet.encryptedPrivateKey);
  const secretKey = hexToArrayBuffer(privateKey);

  try {
    const agent = new HttpAgent({
      host: hostICP,
      identity: Secp256k1KeyIdentity.fromSecretKey(secretKey),
    });

    const actor = createActorVault(vaultCanister, { agent });

    const result = (await actor.createAnnouncement(
      gameId,
      createAnnouncementTypes,
    )) as ApiResponse_1;

    if ('err' in result) {
      const [k, v] = Object.entries(result.err)[0] as [string, string];
      throw new Error(`createAnnouncement failed: ${k} - ${v}`);
    }

    return result.ok;
  } catch (error) {
    throw new Error('Error Service Create Announcement:' + error);
  }
}

export async function commentByAnnouncementId({
  annId,
  wallet,
  comment,
}: {
  annId: AnnouncementId;
  wallet: any;
  comment: string;
}): Promise<GameAnnouncementInteractionType> {
  const privateKey = await walletService.decryptWalletData(wallet.encryptedPrivateKey);
  const secretKey = hexToArrayBuffer(privateKey);

  try {
    const agent = new HttpAgent({
      host: hostICP,
      identity: Secp256k1KeyIdentity.fromSecretKey(secretKey),
    });

    const actor = createActorVault(vaultCanister, { agent });

    const result = (await actor.commentByAnnouncementId(annId, comment)) as ApiResponse_2;
    if ('err' in result) {
      const [k, v] = Object.entries(result.err)[0] as [string, string];
      throw new Error(`createAnnouncement failed: ${k} - ${v}`);
    }

    console.log('Announcement: ' + result);

    return result.ok;
  } catch (error) {
    throw new Error('Error Service Comment by Announcement Id: ' + error);
  }
}

export async function getAllAnnouncementsByGameId({
  gameId,
  wallet,
}: {
  gameId: GameId;
  wallet: any;
}): Promise<GameAnnouncementType[] | null> {
  const privateKey = await walletService.decryptWalletData(wallet.encryptedPrivateKey);
  const secretKey = hexToArrayBuffer(privateKey);

  try {
    const agent = new HttpAgent({
      host: hostICP,
      identity: Secp256k1KeyIdentity.fromSecretKey(secretKey),
    });

    const actor = createActorVault(vaultCanister, { agent });

    const result = (await actor.getAllAnnouncementsByGameId(gameId)) as ApiResponse_4;
    console.log('Announcements: ' + result);
    if ('err' in result) {
      const [k, v] = Object.entries(result.err)[0] as [string, string];
      throw new Error(`getAllApps failed: ${k} - ${v}`);
    }

    return result.ok;
  } catch (error) {
    throw new Error('Error Service Get All Announcements by App Id: ' + error);
  }
}

export async function getAnnouncementsByAnnouncementId({
  announcementId,
  wallet,
}: {
  announcementId: AnnouncementId;
  wallet: any;
}): Promise<GameAnnouncementType> {
  const privateKey = await walletService.decryptWalletData(wallet.encryptedPrivateKey);
  const secretKey = hexToArrayBuffer(privateKey);

  try {
    const agent = new HttpAgent({
      host: hostICP,
      identity: Secp256k1KeyIdentity.fromSecretKey(secretKey),
    });

    const actor = createActorVault(vaultCanister, { agent });

    const result = (await actor.getAnnouncementsByAnnouncementId(announcementId)) as ApiResponse_1;
    if ('err' in result) {
      const [k, v] = Object.entries(result.err)[0] as [string, string];
      throw new Error(`getAnnouncementsByAnnouncementId failed: ${k} - ${v}`);
    }

    return result.ok;
  } catch (error) {
    throw new Error('Error Service Get Announcement by Id: ' + error);
  }
}

export async function likeByAnnouncementId({
  announcementId,
  wallet,
}: {
  announcementId: AnnouncementId;
  wallet: any;
}): Promise<GameAnnouncementInteractionType> {
  const privateKey = await walletService.decryptWalletData(wallet.encryptedPrivateKey);
  const secretKey = hexToArrayBuffer(privateKey);

  try {
    const agent = new HttpAgent({
      host: hostICP,
      identity: Secp256k1KeyIdentity.fromSecretKey(secretKey),
    });

    const actor = createActorVault(vaultCanister, { agent });

    const result = (await actor.likeByAnnouncementId(announcementId)) as ApiResponse_2;
    if ('err' in result) {
      const [k, v] = Object.entries(result.err)[0] as [string, string];
      throw new Error(`getAllApps failed: ${k} - ${v}`);
    }

    return result.ok;
  } catch (error) {
    throw new Error('Error Service Like by Announcement ID: ' + error);
  }
}

export async function dislikeByAnnouncementId({
  announcementId,
  wallet,
}: {
  announcementId: AnnouncementId;
  wallet: any;
}): Promise<GameAnnouncementInteractionType> {
  const privateKey = await walletService.decryptWalletData(wallet.encryptedPrivateKey);
  const secretKey = hexToArrayBuffer(privateKey);

  try {
    const agent = new HttpAgent({
      host: hostICP,
      identity: Secp256k1KeyIdentity.fromSecretKey(secretKey),
    });

    const actor = createActorVault(vaultCanister, { agent });

    const result = (await actor.dislikeByAnnouncementId(announcementId)) as ApiResponse_2;
    if ('err' in result) {
      const [k, v] = Object.entries(result.err)[0] as [string, string];
      throw new Error(`dislikeByAnnouncementId failed: ${k} - ${v}`);
    }

    return result.ok;
  } catch (error) {
    throw new Error('Error Service Like by Announcement ID: ' + error);
  }
}
