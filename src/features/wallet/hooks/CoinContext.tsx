import { Actor, HttpAgent } from "@dfinity/agent";
import { Secp256k1KeyIdentity } from "@dfinity/identity-secp256k1";
import { Principal } from "@dfinity/principal";
import { walletService } from "../services/WalletService";
import { icrc1IdlFactory } from "../services/idl/icrc1";
import { ICRC1Metadata } from "../interfaces/Coin";
import { hexToArrayBuffer } from "../../../utils/crypto";

async function transferTokenICRC1(
  to: Principal,
  amount: number,
  icrc1Address: Principal,
  fee: number,
  wallet: any
) {
  const E8S_PER_TOKEN = 100000000; // 10^8 for 8 decimals
  const privateKey = await walletService.decryptWalletData(
    wallet.encryptedPrivateKey
  );

  const secretKey = hexToArrayBuffer(privateKey);

  try {
    const agent = new HttpAgent({
      host: import.meta.env.VITE_HOST,
      identity: Secp256k1KeyIdentity.fromSecretKey(secretKey),
    });

    const actor = Actor.createActor(icrc1IdlFactory, {
      agent,
      canisterId: icrc1Address,
    });

    const amountInE8s = BigInt(Math.floor(amount * E8S_PER_TOKEN));

    const transferRecord = {
      to: {
        owner: to,
        subaccount: [],
      },
      fee: [fee],
      memo: [],
      from_subaccount: [],
      created_at_time: [],
      amount: amountInE8s,
    };

    const result = await actor.icrc1_transfer(transferRecord);
    return result;
  } catch (error) {
    throw new Error("Error Transfer : " + error);
  }
}

async function checkBalance(icrc1CanisterId: Principal, wallet: any) {
  if (!wallet.principalId) {
    throw new Error("Not Logged in");
  }
  try {
    // Initialize agent with identity
    const agent = new HttpAgent({
      host: import.meta.env.VITE_HOST,
    });

    const actor = Actor.createActor(icrc1IdlFactory, {
      agent,
      canisterId: icrc1CanisterId,
    });

    // Call balance method
    const name = (await actor.icrc1_name()) as string;
    const symbol = (await actor.icrc1_symbol()) as string;
    const decimals = (await actor.icrc1_decimals()) as number;
    const fee = (await actor.icrc1_fee()) as number;
    const metadataResult = (await actor.icrc1_metadata()) as any[][];
    const balanceResult = await actor.icrc1_balance_of({
      owner: Principal.fromText(wallet.principalId),
      subaccount: [],
    });

    // Convert balance to number and format
    const standardBalance = Number(balanceResult) / 100000000;
    const result: ICRC1Metadata = {
      balance: standardBalance,
      logo:
        icrc1CanisterId == Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai")
          ? "./assets/logo-icp.svg"
          : null,
      decimals: 0,
      name: "",
      symbol: "",
      fee: 0,
    };
    result.name = name;
    result.symbol = symbol;
    result.decimals = decimals;
    result.fee = fee;
    for (const metadata of metadataResult) {
      const key = metadata[0];
      const value = metadata[1];

      switch (key) {
        case "icrc1:logo":
          result.logo = value.Text;
          break;
      }
    }

    return result;
  } catch (error) {
    const result: ICRC1Metadata = {
      decimals: null,
      balance: null,
      name: null,
      symbol: null,
      logo: null,
      fee: null,
    };
    return result;
  }
}

// Export function
export { transferTokenICRC1, checkBalance };
