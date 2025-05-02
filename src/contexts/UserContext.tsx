// UserContext.tsx
import { HttpAgent, Actor } from "@dfinity/agent";
import { userIdlFactory } from "../blockchain/icp/idl/user";
import { Secp256k1KeyIdentity } from "@dfinity/identity-secp256k1";
import { walletService } from "../features/wallet/services/WalletService";
import { EncryptedData } from "@antigane/encryption";
import { GenderVariant, MetadataUser } from "../interfaces/User";

export interface MetadataCreateUser {
  username: string;
  display_name: string;
  email: string;
  birth_date: string;
  gender: GenderVariant;
  country: string;
}

// Define the UpdateUser interface to match the IDL
interface UpdateUserPayload {
  username: string;
  display_name: string;
  email: string;
  image_url: [] | [string];
  background_image_url: [] | [string];
  user_demographics: {
    birth_date: bigint;
    gender: GenderVariant;
    country: string;
  };
}

function dateToNanoSeconds(dateStr: string): bigint {
  const date = new Date(dateStr);
  // Convert to nanoseconds (multiply by 1,000,000 to convert milliseconds to nanoseconds)
  return BigInt(date.getTime()) * BigInt(1_000_000);
}

const appCanister = import.meta.env.VITE_PERIDOT_CANISTER_BACKEND;

async function createAccount(metadata: MetadataCreateUser, wallet: any) {
  const privateKey = await walletService.decryptWalletData(
    wallet.encryptedPrivateKey
  );
  const secretKey = Buffer.from(privateKey, "hex");
  try {
    const agent = new HttpAgent({
      host: import.meta.env.VITE_HOST,
      identity: Secp256k1KeyIdentity.fromSecretKey(secretKey),
    });

    const actor = Actor.createActor(userIdlFactory, {
      agent,
      canisterId: appCanister,
    });

    const result = await actor.createUser(
      metadata.username,
      metadata.display_name,
      metadata.email,
      dateToNanoSeconds(metadata.birth_date),
      metadata.gender,
      metadata.country
    );

    return result;
  } catch (error) {
    throw new Error("Error Context : " + error);
  }
}

async function updateUser(metadata: MetadataUser, wallet: any) {
  const privateKey = await walletService.decryptWalletData(
    wallet.encryptedPrivateKey
  );
  const secretKey = Buffer.from(privateKey, "hex");
  try {
    // Initialize agent with identity
    const agent = new HttpAgent({
      host: import.meta.env.VITE_HOST,
      identity: Secp256k1KeyIdentity.fromSecretKey(secretKey),
    });

    const actor = Actor.createActor(userIdlFactory, {
      agent,
      canisterId: appCanister,
    });

    const updatePayload: UpdateUserPayload = {
      username: metadata.ok.username,
      display_name: metadata.ok.display_name,
      email: metadata.ok.email,
      image_url: metadata.ok.image_url ? [metadata.ok.image_url] : [],
      background_image_url: metadata.ok.background_image_url
        ? [metadata.ok.background_image_url]
        : [],
      user_demographics: {
        // Convert the date string to nanoseconds timestamp
        birth_date: dateToNanoSeconds(metadata.ok.user_demographics.birth_date),
        gender: metadata.ok.user_demographics.gender,
        country: metadata.ok.user_demographics.country,
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
      canisterId: appCanister,
    });

    // Call balance method
    const result = await actor.isUsernameValid(username);

    return result;
  } catch (error) {
    throw new Error("Error Context : " + error);
  }
}

async function getUserByPrincipalId(encryptedPrivateKey: EncryptedData) {
  const privateKey = await walletService.decryptWalletData(encryptedPrivateKey);
  const secretKey = Buffer.from(privateKey, "hex");

  try {
    // Initialize agent with identity
    const agent = new HttpAgent({
      host: import.meta.env.VITE_HOST,
      identity: Secp256k1KeyIdentity.fromSecretKey(secretKey),
    });

    const actor = Actor.createActor(userIdlFactory, {
      agent,
      canisterId: appCanister,
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
  const secretKey = Buffer.from(privateKey, "hex");

  try {
    // Initialize agent with identity
    const agent = new HttpAgent({
      host: import.meta.env.VITE_HOST,
      identity: Secp256k1KeyIdentity.fromSecretKey(secretKey),
    });

    const actor = Actor.createActor(userIdlFactory, {
      agent,
      canisterId: appCanister,
    });

    // Call balance method
    const result = await actor.searchUsersByPrefixWithLimit(prefix, limit);

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
  const secretKey = Buffer.from(privateKey, "hex");

  try {
    // Initialize agent with identity
    const agent = new HttpAgent({
      host: import.meta.env.VITE_HOST,
      identity: Secp256k1KeyIdentity.fromSecretKey(secretKey),
    });

    const actor = Actor.createActor(userIdlFactory, {
      agent,
      canisterId: appCanister,
    });

    // Call balance method
    const result = await actor.getFriendRequestList();

    return result;
  } catch (error) {
    throw new Error("Error Context : " + error);
  }
}

// Developer
async function createDeveloperProfile(
  wallet: any,
  websiteUrl: string,
  bio: string
) {
  const privateKey = await walletService.decryptWalletData(
    wallet.encryptedPrivateKey
  );

  const secretKey = Buffer.from(privateKey, "hex");

  try {
    // Initialize agent with identity
    const agent = new HttpAgent({
      host: import.meta.env.VITE_HOST,
      identity: Secp256k1KeyIdentity.fromSecretKey(secretKey),
    });

    const actor = Actor.createActor(userIdlFactory, {
      agent,
      canisterId: appCanister,
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
