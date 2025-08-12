// UserContext.tsx
import { HttpAgent, Actor } from "@dfinity/agent";

import { Secp256k1KeyIdentity } from "@dfinity/identity-secp256k1";
import {
  CreateUserInterface,
  UpdateUserInterface,
  UserInterface,
} from "../../../../interfaces/user/UserInterface";
import { walletService } from "../../../../features/wallet/services/WalletService";
import { hexToArrayBuffer } from "../../../../utils/crypto";
import { ICPUserFactory } from "../ICPUserFactory";
import { ApiResponse } from "../../../../interfaces/CoreInterface";

const userCanister = import.meta.env.VITE_PERIDOT_CANISTER_USER_BACKEND;

function dateToNanoSeconds(dateStr: bigint): bigint {
  const date = new Date(Number(dateStr));
  return BigInt(date.getTime()) * BigInt(1_000_000);
}

async function createAccount({
  metadata,
  wallet,
}: {
  metadata: CreateUserInterface;
  wallet: any;
}) {
  const privateKey = await walletService.decryptWalletData(
    wallet.encryptedPrivateKey
  );
  const secretKey = hexToArrayBuffer(privateKey);
  try {
    const agent = new HttpAgent({
      host: import.meta.env.VITE_HOST,
      identity: Secp256k1KeyIdentity.fromSecretKey(secretKey),
    });

    const actor = Actor.createActor(ICPUserFactory, {
      agent,
      canisterId: userCanister,
    });

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
    throw new Error("Error Context : " + error);
  }
}

async function updateUser({
  metadataUpdate,
  wallet,
}: {
  metadataUpdate: UpdateUserInterface;
  wallet: any;
}): Promise<UpdateUserInterface> {
  const privateKey = await walletService.decryptWalletData(
    wallet.encryptedPrivateKey
  );
  const secretKey = hexToArrayBuffer(privateKey);
  try {
    // Initialize agent with identity
    const agent = new HttpAgent({
      host: import.meta.env.VITE_HOST,
      identity: Secp256k1KeyIdentity.fromSecretKey(secretKey),
    });

    const actor = Actor.createActor(ICPUserFactory, {
      agent,
      canisterId: userCanister,
    });

    const result = (await actor.updateUser(
      metadataUpdate
    )) as ApiResponse<UpdateUserInterface>;
    if ("err" in result) {
      const [k, v] = Object.entries(result.err)[0] as [string, string];
      throw new Error(`updateUser failed: ${k} - ${v}`);
    }
    return result.ok;
  } catch (error) {
    throw new Error("Error Service Update User : " + error);
  }
}

async function getIsUsernameValid(
  username: string
): Promise<ApiResponse<Boolean>> {
  try {
    // Initialize agent with identity
    const agent = new HttpAgent({
      host: import.meta.env.VITE_HOST,
    });

    const actor = Actor.createActor(ICPUserFactory, {
      agent,
      canisterId: userCanister,
    });

    // Call balance method
    const result = (await actor.getIsUsernameValid(
      username
    )) as ApiResponse<Boolean>;

    return result;
  } catch (error) {
    throw new Error("Error getIsUsernameValid : " + error);
  }
}

async function getUserByPrincipalId({
  wallet,
}: {
  wallet: any;
}): Promise<UserInterface> {
  const privateKey = await walletService.decryptWalletData(
    wallet.encryptedPrivateKey
  );
  const secretKey = hexToArrayBuffer(privateKey);
  try {
    // Initialize agent with identity
    const agent = new HttpAgent({
      host: import.meta.env.VITE_HOST,
      identity: Secp256k1KeyIdentity.fromSecretKey(secretKey),
    });

    const actor = Actor.createActor(ICPUserFactory, {
      agent,
      canisterId: userCanister,
    });

    const result =
      (await actor.getUserByPrincipalId()) as ApiResponse<UserInterface>;
    if ("err" in result) {
      const [k, _] = Object.entries(result.err)[0] as [string, string];
      throw new Error(` ${k}`);
    }
    return result.ok;
  } catch (error) {
    throw new Error("Error Service Get User By PrincipalId : " + error);
  }
}

async function searchUsersByPrefixWithLimit(
  wallet: any,
  prefix: string,
  limit: number
) {
  const privateKey = await walletService.decryptWalletData(
    wallet.encryptedPrivateKey
  );
  const secretKey = hexToArrayBuffer(privateKey);

  try {
    // Initialize agent with identity
    const agent = new HttpAgent({
      host: import.meta.env.VITE_HOST,
      identity: Secp256k1KeyIdentity.fromSecretKey(secretKey),
    });

    const actor = Actor.createActor(ICPUserFactory, {
      agent,
      canisterId: userCanister,
    });

    // Call balance method
    const result = await actor.getUsersByPrefixWithLimit(prefix, limit);

    return result;
  } catch (error) {
    throw new Error("Error Context : " + error);
  }
}

// User Friend
async function getFriendRequestList(wallet: any) {
  const privateKey = await walletService.decryptWalletData(
    wallet.encryptedPrivateKey
  );
  const secretKey = hexToArrayBuffer(privateKey);

  try {
    // Initialize agent with identity
    const agent = new HttpAgent({
      host: import.meta.env.VITE_HOST,
      identity: Secp256k1KeyIdentity.fromSecretKey(secretKey),
    });

    const actor = Actor.createActor(ICPUserFactory, {
      agent,
      canisterId: userCanister,
    });

    // Call balance method
    const result = await actor.getFriendRequestList();

    return result;
  } catch (error) {
    throw new Error("Error Context : " + error);
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
  const privateKey = await walletService.decryptWalletData(
    wallet.encryptedPrivateKey
  );

  const secretKey = hexToArrayBuffer(privateKey);

  try {
    // Initialize agent with identity
    const agent = new HttpAgent({
      host: import.meta.env.VITE_HOST,
      identity: Secp256k1KeyIdentity.fromSecretKey(secretKey),
    });

    const actor = Actor.createActor(ICPUserFactory, {
      agent,
      canisterId: userCanister,
    });

    // Call balance method
    const result = await actor.createDeveloperProfile(websiteUrl, bio);

    return result;
  } catch (error) {
    throw new Error("Error Context : " + error);
  }
}

// Export function
export {
  createAccount,
  updateUser,
  getIsUsernameValid,
  getUserByPrincipalId,
  searchUsersByPrefixWithLimit,
  getFriendRequestList,
  createDeveloperProfile,
};
