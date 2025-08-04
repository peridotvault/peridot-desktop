import { Actor, HttpAgent } from "@dfinity/agent";
import { walletService } from "../features/wallet/services/WalletService";
import { Secp256k1KeyIdentity } from "@dfinity/identity-secp256k1";
import { appIdlFactory } from "../blockchain/icp/idl/app";
import { AppInterface } from "../interfaces/App";
import { hexToArrayBuffer } from "../utils/crypto";

const appCanister = import.meta.env.VITE_PERIDOT_CANISTER_APP_BACKEND;
type ApiError =
  | { AlreadyExists: string }
  | { NotFound: string }
  | { Unauthorized: string };

type ApiResponse<T> = { ok: T } | { err: ApiError };

export async function getAllApps(): Promise<AppInterface[] | null> {
  try {
    // Initialize agent with identity
    const agent = new HttpAgent({
      host: import.meta.env.VITE_HOST,
    });

    const actor = Actor.createActor(appIdlFactory, {
      agent,
      canisterId: appCanister,
    });
    const result = (await actor.getAllApps()) as AppInterface[];
    return result;
  } catch (error) {
    throw new Error("Error Context : " + error);
  }
}

export async function getMyPurchasedApps(
  wallet: any
): Promise<AppInterface[] | null> {
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

    const actor = Actor.createActor(appIdlFactory, {
      agent,
      canisterId: appCanister,
    });
    const result = (await actor.getMyPurchasedApps()) as AppInterface[];
    return result;
  } catch (error) {
    throw new Error("Error Context : " + error);
  }
}

export async function getApp(id: number): Promise<AppInterface | null> {
  try {
    // Initialize agent with identity
    const agent = new HttpAgent({
      host: import.meta.env.VITE_HOST,
    });

    const actor = Actor.createActor(appIdlFactory, {
      agent,
      canisterId: appCanister,
    });
    const result = (await actor.getApp(id)) as [AppInterface];
    return result[0];
  } catch (error) {
    throw new Error("Error Context : " + error);
  }
}

export async function buyApp(id: number, wallet: any): Promise<string> {
  const privateKey = await walletService.decryptWalletData(
    wallet.encryptedPrivateKey
  );
  const secretKey = hexToArrayBuffer(privateKey);

  const agent = new HttpAgent({
    host: import.meta.env.VITE_HOST,
    identity: Secp256k1KeyIdentity.fromSecretKey(secretKey),
  });

  const actor = Actor.createActor(appIdlFactory, {
    agent,
    canisterId: appCanister,
  });

  const result = (await actor.buyApp(id)) as ApiResponse<string>;

  if ("ok" in result) return result.ok;

  if ("err" in result) {
    const err = result.err;
    if ("AlreadyExists" in err) throw new Error(err.AlreadyExists);
    if ("NotFound" in err) throw new Error(err.NotFound);
    if ("Unauthorized" in err) throw new Error(err.Unauthorized);
    // tambahkan error lain jika ingin
    throw new Error("Unexpected error occurred");
  }

  throw new Error("Invalid response format");
}
