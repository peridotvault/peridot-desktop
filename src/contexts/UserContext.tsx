// UserContext.tsx

import { HttpAgent, Actor } from "@dfinity/agent";
import { userIdlFactory } from "../hooks/idl_app/user";
import { Secp256k1KeyIdentity } from "@dfinity/identity-secp256k1";
import { walletService } from "../utils/WalletService";

interface MetadataCreateUser {
  username: string;
  displayName: string;
  email: string;
  age: number | string;
  gender: string;
  country: string;
}

const appCanister = import.meta.env.VITE_PERIDOT_CANISTER_BACKEND;

async function createAccount(
  metadata: MetadataCreateUser,
  password: string,
  wallet: any
) {
  if (wallet.encryptedPrivateKey && password) {
    const privateKey = await walletService.decryptWalletData(
      wallet.encryptedPrivateKey,
      password
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
      const result = await actor.createUser(
        metadata.username,
        metadata.displayName,
        metadata.email,
        Number(metadata.age),
        { [metadata.gender]: null },
        metadata.country
      );

      return result;
    } catch (error) {
      console.warn(error);
      return;
    }
  } else {
    throw new Error("Not Logged in");
  }
}

async function getUserByPrincipalId(password: string, wallet: any) {
  if (wallet.encryptedPrivateKey && password) {
    const privateKey = await walletService.decryptWalletData(
      wallet.encryptedPrivateKey,
      password
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
      const result = await actor.getUserByPrincipalId();
      console.log(result);

      return result;
    } catch (error) {
      console.warn(error);
      return;
    }
  } else {
    throw new Error("Not Logged in");
  }
}

// Ekspor fungsi createAccount
export { createAccount, getUserByPrincipalId };
