// UserContext.tsx
import { HttpAgent } from '@dfinity/agent';

import { Secp256k1KeyIdentity } from '@dfinity/identity-secp256k1';
import {
  CreateUserInterface,
  UpdateUserInterface,
  UserInterface,
} from '../../../../interfaces/user/UserInterface';
import { walletService } from '../../../../features/wallet/services/WalletService';
import { hexToArrayBuffer } from '../../../../utils/crypto';
import { createActorDirectory } from '../../idlFactories';
import { hostICP } from '../../../../constants/lib.const';
import { ApiResponse, ApiResponse_5, UserId } from '../service.did.d';

const directoryCanister = import.meta.env.VITE_PERIDOT_CANISTER_DIRECTORY_BACKEND;

async function createAccount({ metadata, wallet }: { metadata: CreateUserInterface; wallet: any }) {
  const privateKey = await walletService.decryptWalletData(wallet.encryptedPrivateKey);
  const secretKey = hexToArrayBuffer(privateKey);
  try {
    const agent = new HttpAgent({
      host: hostICP,
      identity: Secp256k1KeyIdentity.fromSecretKey(secretKey),
    });

    const actor = createActorDirectory(directoryCanister, { agent });

    const result = await actor.createUser({
      username: metadata.username,
      displayName: metadata.displayName,
      email: metadata.email,
      birthDate: metadata.birthDate,
      gender: metadata.gender,
      country: metadata.country,
    });

    return result;
  } catch (error) {
    throw new Error('Error Context : ' + error);
  }
}

async function updateUser({
  metadataUpdate,
  wallet,
}: {
  metadataUpdate: UpdateUserInterface;
  wallet: any;
}): Promise<UpdateUserInterface> {
  const privateKey = await walletService.decryptWalletData(wallet.encryptedPrivateKey);
  const secretKey = hexToArrayBuffer(privateKey);
  try {
    // Initialize agent with identity
    const agent = new HttpAgent({
      host: hostICP,
      identity: Secp256k1KeyIdentity.fromSecretKey(secretKey),
    });

    const actor = createActorDirectory(directoryCanister, { agent });

    const result = (await actor.updateUser(metadataUpdate)) as ApiResponse;
    if ('err' in result) {
      const [k, v] = Object.entries(result.err)[0] as [string, string];
      throw new Error(`updateUser failed: ${k} - ${v}`);
    }
    return result.ok;
  } catch (error) {
    throw new Error('Error Service Update User : ' + error);
  }
}

async function getIsUsernameValid(username: string): Promise<Boolean> {
  try {
    // Initialize agent with identity
    const agent = new HttpAgent({
      host: hostICP,
    });

    const actor = createActorDirectory(directoryCanister, { agent });

    // Call balance method
    const result = (await actor.getIsUsernameValid(username)) as ApiResponse_5;
    if ('err' in result) {
      const [k, v] = Object.entries(result.err)[0] as [string, string];
      throw new Error(`getIsUsernameValid failed: ${k} - ${v}`);
    }
    return result.ok;
  } catch (error) {
    throw new Error('Error getIsUsernameValid : ' + error);
  }
}

async function getUserByPrincipalId({ userId }: { userId: UserId }): Promise<UserInterface> {
  try {
    // Initialize agent with identity
    const agent = new HttpAgent({
      host: hostICP,
    });

    const actor = createActorDirectory(directoryCanister, { agent });

    const result = (await actor.getUserByPrincipalId(userId)) as ApiResponse;
    if ('err' in result) {
      const [k, _] = Object.entries(result.err)[0] as [string, string];
      throw new Error(` ${k}`);
    }
    return result.ok;
  } catch (error) {
    throw new Error('Error Service Get User By PrincipalId : ' + error);
  }
}

async function getUserData({ wallet }: { wallet: any }): Promise<UserInterface> {
  const privateKey = await walletService.decryptWalletData(wallet.encryptedPrivateKey);
  const secretKey = hexToArrayBuffer(privateKey);
  try {
    // Initialize agent with identity
    const agent = new HttpAgent({
      host: hostICP,
      identity: Secp256k1KeyIdentity.fromSecretKey(secretKey),
    });

    const actor = createActorDirectory(directoryCanister, { agent });

    const result = (await actor.getUserData()) as ApiResponse;
    if ('err' in result) {
      const [k, _] = Object.entries(result.err)[0] as [string, string];
      throw new Error(` ${k}`);
    }
    return result.ok;
  } catch (error) {
    throw new Error('Error Service Get UserData : ' + error);
  }
}

async function searchUsersByPrefixWithLimit(wallet: any, prefix: string, limit: number) {
  const privateKey = await walletService.decryptWalletData(wallet.encryptedPrivateKey);
  const secretKey = hexToArrayBuffer(privateKey);

  try {
    // Initialize agent with identity
    const agent = new HttpAgent({
      host: hostICP,
      identity: Secp256k1KeyIdentity.fromSecretKey(secretKey),
    });

    const actor = createActorDirectory(directoryCanister, { agent });

    // Call balance method
    const result = await actor.getUsersByPrefixWithLimit(prefix, BigInt(limit));

    return result;
  } catch (error) {
    throw new Error('Error Context : ' + error);
  }
}

// User Friend
async function getFriendRequestList(wallet: any) {
  const privateKey = await walletService.decryptWalletData(wallet.encryptedPrivateKey);
  const secretKey = hexToArrayBuffer(privateKey);

  try {
    // Initialize agent with identity
    const agent = new HttpAgent({
      host: hostICP,
      identity: Secp256k1KeyIdentity.fromSecretKey(secretKey),
    });

    const actor = createActorDirectory(directoryCanister, { agent });

    // Call balance method
    const result = await actor.getFriendRequestList();

    return result;
  } catch (error) {
    throw new Error('Error Context : ' + error);
  }
}

//  ===============================================================
//  Developer Account Management & Follow =========================
//  ===============================================================
async function createDeveloperProfile({
  wallet,
  websiteUrl,
  bio,
}: {
  wallet: any;
  websiteUrl: string;
  bio: string;
}) {
  const privateKey = await walletService.decryptWalletData(wallet.encryptedPrivateKey);

  const secretKey = hexToArrayBuffer(privateKey);

  try {
    // Initialize agent with identity
    const agent = new HttpAgent({
      host: hostICP,
      identity: Secp256k1KeyIdentity.fromSecretKey(secretKey),
    });

    const actor = createActorDirectory(directoryCanister, { agent });

    // Call balance method
    const result = await actor.createDeveloperProfile(websiteUrl, bio);

    return result;
  } catch (error) {
    throw new Error('Error Context : ' + error);
  }
}

// Export function
export {
  createAccount,
  updateUser,
  getIsUsernameValid,
  getUserByPrincipalId,
  getUserData,
  searchUsersByPrefixWithLimit,
  getFriendRequestList,
  createDeveloperProfile,
};
