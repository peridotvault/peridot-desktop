import { Actor, HttpAgent } from "@dfinity/agent";
import { walletService } from "../utils/WalletService";
import { Secp256k1KeyIdentity } from "@dfinity/identity-secp256k1";
import { icrc1IdlFactory } from "../hooks/idl/icrc1";
import { Principal } from "@dfinity/principal";

interface Metadata {
  balance: number | null;
  logo: string | null;
  decimals: bigint | null;
  name: string | null;
  symbol: string | null;
}

async function transferTokenICRC1(
  to: Principal,
  amount: number,
  icrc1Address: Principal,
  wallet: any
) {
  const E8S_PER_TOKEN = 100000000; // 10^8 for 8 decimals
  const privateKey = await walletService.decryptWalletData(
    wallet.encryptedPrivateKey
  );
  const secretKey = Buffer.from(privateKey, "hex");
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
      fee: [0n], // Optional fee
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
    const metadataResult = (await actor.icrc1_metadata()) as any[][];
    const balanceResult = await actor.icrc1_balance_of({
      owner: Principal.fromText(wallet.principalId),
      subaccount: [],
    });

    // Convert balance to number and format
    const standardBalance = Number(balanceResult) / 100000000;
    const result: Metadata = {
      balance: standardBalance,
      logo:
        icrc1CanisterId == Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai")
          ? "https://s3.coinmarketcap.com/static-gravity/image/2fb1bc84c1494178beef0822179d137d.png"
          : null,
      decimals: 0n,
      name: "",
      symbol: "",
    };
    for (const metadata of metadataResult) {
      const key = metadata[0];
      const value = metadata[1];

      switch (key) {
        case "icrc1:logo":
          result.logo = value.Text;
          break;
        case "icrc1:decimals":
          result.decimals = BigInt(value.Text || 0);
          break;
        case "icrc1:name":
          result.name = value.Text;
          break;
        case "icrc1:symbol":
          result.symbol = value.Text;
          break;
      }
    }

    return result;
  } catch (error) {
    const result: Metadata = {
      decimals: null,
      balance: null,
      name: null,
      symbol: null,
      logo: null,
    };
    return result;
  }
}

// Export function
export { transferTokenICRC1, checkBalance };
