// UserContext.tsx
import { HttpAgent, Actor } from "@dfinity/agent";

import { Secp256k1KeyIdentity } from "@dfinity/identity-secp256k1";
import { walletService } from "../../../../features/wallet/services/WalletService";
import { hexToArrayBuffer } from "../../../../utils/crypto";
import { ICPUserFactory } from "../ICPUserFactory";

const userCanister = import.meta.env.VITE_PERIDOT_CANISTER_USER_BACKEND;

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

async function getAmIDeveloper({ wallet }: { wallet: any }): Promise<Boolean> {
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
    const result = (await actor.getAmIDeveloper()) as Boolean;

    return result;
  } catch (error) {
    throw new Error("Error Context : " + error);
  }
}

// Export function
export { createDeveloperProfile, getAmIDeveloper };
