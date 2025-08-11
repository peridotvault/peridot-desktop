// UserContext.tsx
import { HttpAgent, Actor } from "@dfinity/agent";
import { userIdlFactory } from "../blockchain/icp/idl/user";
import { Secp256k1KeyIdentity } from "@dfinity/identity-secp256k1";
import { walletService } from "../features/wallet/services/WalletService";
import { EncryptedData } from "@antigane/encryption";
import { GenderVariant, MetadataUser } from "../interfaces/User";
import { hexToArrayBuffer } from "../utils/crypto";

export interface MetadataCreateUser {
  username: string;
  displayName: string;
  email: string;
  birthDate: string;
  gender: GenderVariant;
  country: string;
}

// Define the UpdateUser interface to match the IDL
interface UpdateUserPayload {
  username: string;
  displayName: string;
  email: string;
  imageUrl: [] | [string];
  backgroundImageUrl: [] | [string];
  userDemographics: {
    birthDate: bigint;
    gender: GenderVariant;
    country: string;
  };
}

function dateToNanoSeconds(dateStr: string): bigint {
  const date = new Date(dateStr);
  // Convert to nanoseconds (multiply by 1,000,000 to convert milliseconds to nanoseconds)
  return BigInt(date.getTime()) * BigInt(1_000_000);
}

const userCanister = import.meta.env.VITE_PERIDOT_CANISTER_USER_BACKEND;

async function createAccount(metadata: MetadataCreateUser, wallet: any) {
  const privateKey = await walletService.decryptWalletData(
    wallet.encryptedPrivateKey
  );
  const secretKey = hexToArrayBuffer(privateKey);
  try {
    const agent = new HttpAgent({
      host: import.meta.env.VITE_HOST,
      identity: Secp256k1KeyIdentity.fromSecretKey(secretKey),
    });

    const actor = Actor.createActor(userIdlFactory, {
      agent,
      canisterId: userCanister,
    });

    const result = await actor.createUser({
      username: metadata.username,
      displayName: metadata.displayName,
      email: metadata.email,
      birthDate: dateToNanoSeconds(metadata.birthDate),
      gender: metadata.gender,
      country: metadata.country,
    });

    return result;
  } catch (error) {
    throw new Error("Error Context : " + error);
  }
}

async function updateUser(metadata: MetadataUser, wallet: any) {
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

    const actor = Actor.createActor(userIdlFactory, {
      agent,
      canisterId: userCanister,
    });

    const updatePayload: UpdateUserPayload = {
      username: metadata.ok.username,
      displayName: metadata.ok.displayName,
      email: metadata.ok.email,
      imageUrl: metadata.ok.imageUrl ? [metadata.ok.imageUrl] : [],
      backgroundImageUrl: metadata.ok.backgroundImageUrl
        ? [metadata.ok.backgroundImageUrl]
        : [],
      userDemographics: {
        // Convert the date string to nanoseconds timestamp
        birthDate: dateToNanoSeconds(metadata.ok.userDemographics.birthDate),
        gender: metadata.ok.userDemographics.gender,
        country: metadata.ok.userDemographics.country,
      },
    };

    // Call balance method
    const result = await actor.updateUser(updatePayload);

    return result;
  } catch (error) {
    throw new Error("Error Context : " + error);
  }
}

async function isUsernameValid(username: string) {
  try {
    // Initialize agent with identity
    const agent = new HttpAgent({
      host: import.meta.env.VITE_HOST,
    });

    const actor = Actor.createActor(userIdlFactory, {
      agent,
      canisterId: userCanister,
    });

    // Call balance method
    const result = await actor.getIsUsernameValid(username);

    return result;
  } catch (error) {
    throw new Error("Error Context : " + error);
  }
}

async function getUserByPrincipalId(encryptedPrivateKey: EncryptedData) {
  const privateKey = await walletService.decryptWalletData(encryptedPrivateKey);
  const secretKey = hexToArrayBuffer(privateKey);

  try {
    // Initialize agent with identity
    const agent = new HttpAgent({
      host: import.meta.env.VITE_HOST,
      identity: Secp256k1KeyIdentity.fromSecretKey(secretKey),
    });

    const actor = Actor.createActor(userIdlFactory, {
      agent,
      canisterId: userCanister,
    });

    // Call balance method
    const result = await actor.getUserByPrincipalId();

    return result;
  } catch (error) {
    throw new Error("Error Context : " + error);
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

    const actor = Actor.createActor(userIdlFactory, {
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

    const actor = Actor.createActor(userIdlFactory, {
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
async function createDeveloperProfile(
  wallet: any,
  websiteUrl: string,
  bio: string
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

    const actor = Actor.createActor(userIdlFactory, {
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
  isUsernameValid,
  getUserByPrincipalId,
  searchUsersByPrefixWithLimit,
  getFriendRequestList,
  createDeveloperProfile,
};
