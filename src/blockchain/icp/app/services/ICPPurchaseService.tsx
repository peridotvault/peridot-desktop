import { Actor, HttpAgent } from "@dfinity/agent";
import { walletService } from "../../../../features/wallet/services/WalletService";
import { hexToArrayBuffer } from "../../../../utils/crypto";
import { Secp256k1KeyIdentity } from "@dfinity/identity-secp256k1";
import { ICPAppFactory } from "../ICPAppFactory";
import { ApiResponse } from "../../../../interfaces/CoreInterface";
import { PurchaseInterface } from "../../../../interfaces/app/PurchaseInterface";

const appCanister = import.meta.env.VITE_PERIDOT_CANISTER_APP_BACKEND;

export async function buyApp({
  appId,
  wallet,
}: {
  appId: number;
  wallet: any;
}): Promise<PurchaseInterface> {
  const privateKey = await walletService.decryptWalletData(
    wallet.encryptedPrivateKey
  );
  const secretKey = hexToArrayBuffer(privateKey);
  try {
    const agent = new HttpAgent({
      host: import.meta.env.VITE_HOST,
      identity: Secp256k1KeyIdentity.fromSecretKey(secretKey),
    });

    const actor = Actor.createActor(ICPAppFactory, {
      agent,
      canisterId: appCanister,
    });

    const result = (await actor.buyApp(
      BigInt(appId)
    )) as ApiResponse<PurchaseInterface>;
    if ("err" in result) {
      const [k, v] = Object.entries(result.err)[0] as [string, string];
      throw new Error(`buyApp failed: ${k} - ${v}`);
    }
    return result.ok;
  } catch (error) {
    throw new Error("Error Service Buy App : " + error);
  }
}
