import { Actor, HttpAgent } from "@dfinity/agent";
import { Secp256k1KeyIdentity } from "@dfinity/identity-secp256k1";
import { Principal } from "@dfinity/principal";
import { walletService } from "../services/WalletService";
import { tokenIdlFactory } from "../services/idl/token";
import { ArchiveInfo, ICRC1Metadata } from "../interfaces/Coin";
import { hexToArrayBuffer } from "../../../utils/crypto";
import {
  Block,
  ICRC3BlockResponse,
} from "../../../local_db/wallet/models/Block";

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

    const actor = Actor.createActor(tokenIdlFactory, {
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

    const actor = Actor.createActor(tokenIdlFactory, {
      agent,
      canisterId: icrc1CanisterId,
    });

    // Call balance method
    let coinArchiveAddress = "";
    const archives = (await actor.icrc3_get_archives({
      from: [],
    })) as ArchiveInfo[];
    for (const archive of archives) {
      coinArchiveAddress = archive.canister_id.toString();
    }

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
      coinArchiveAddress: coinArchiveAddress,
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
      coinArchiveAddress: null,
      balance: null,
      name: null,
      symbol: null,
      logo: null,
      fee: null,
    };
    return result;
  }
}

async function getLedgerBlockLength(coinAddress: Principal): Promise<number> {
  try {
    const agent = new HttpAgent({
      host: import.meta.env.VITE_HOST,
    });

    const actor = Actor.createActor(tokenIdlFactory, {
      agent,
      canisterId: coinAddress,
    });

    const result = (await actor.icrc3_get_blocks([
      { start: 0, length: 1 },
    ])) as ICRC3BlockResponse;

    return Number(result.log_length);
  } catch (error) {
    throw new Error("Can't get block length");
  }
}

async function getArchiveBlockLength(
  coinArchiveAddress: Principal
): Promise<number> {
  try {
    const agent = new HttpAgent({
      host: import.meta.env.VITE_HOST,
    });

    const actor = Actor.createActor(tokenIdlFactory, {
      agent,
      canisterId: coinArchiveAddress,
    });

    const result = (await actor.icrc3_get_blocks([
      { start: 0, length: 1 },
    ])) as ICRC3BlockResponse;

    return Number(result.log_length);
  } catch (error) {
    throw new Error("Can't get block length");
  }
}

async function getTokenBlocks({
  coinAddress,
  coinArchiveAddress,
  archiveBlockLength,
  start,
  length,
  wallet,
}: {
  coinAddress: Principal;
  coinArchiveAddress: Principal;
  archiveBlockLength: number;
  start: number;
  length: number;
  wallet: any;
}): Promise<Block[]> {
  if (!wallet.principalId) {
    throw new Error("Not Logged in");
  }
  try {
    // Initialize agent with identity
    const agent = new HttpAgent({
      host: import.meta.env.VITE_HOST,
    });

    let result: ICRC3BlockResponse;

    if (start >= archiveBlockLength) {
      const actor = Actor.createActor(tokenIdlFactory, {
        agent,
        canisterId: coinAddress,
      });

      result = (await actor.icrc3_get_blocks([
        { start: start, length: length },
      ])) as ICRC3BlockResponse;
    } else {
      const actor = Actor.createActor(tokenIdlFactory, {
        agent,
        canisterId: coinArchiveAddress,
      });

      result = (await actor.icrc3_get_blocks([
        { start: start, length: length },
      ])) as ICRC3BlockResponse;
    }

    const parsed = result.blocks
      .map((b: any) => parseBlock(b, coinArchiveAddress.toText()))
      .filter((b: Block | null) => b !== null) as Block[];

    return parsed;
  } catch (error) {
    throw new Error("Can't get Token's block");
  }
}

function parseBlock(raw: any, coinArchiveAddress: string): Block | null {
  if (!("Map" in raw.block)) return null;

  const map = raw.block.Map;
  let ts = 0n;
  let amt = 0;
  let op = "";
  let from = "";
  let to = "";
  let memo = "";

  let txMap: any[] = [];

  for (const entry of map) {
    const key = entry._0_;
    const val = entry._1_;

    if (key === "ts" && "Nat" in val) ts = val.Nat;
    if (key === "tx" && "Map" in val) txMap = val.Map;
  }

  for (const entry of txMap) {
    const key = entry._0_;
    const val = entry._1_;

    if (key === "amt" && "Nat" in val) amt = Number(val.Nat);
    if (key === "op" && "Text" in val) op = val.Text;
    if (key === "memo" && "Blob" in val) {
      memo = Buffer.from(val.Blob).toString("hex");
    }
    if (key === "from" && "Array" in val) {
      const blob = val.Array.find((v: any) => "Blob" in v)?.Blob;
      if (blob) from = Principal.fromUint8Array(Uint8Array.from(blob)).toText();
    }
    if (key === "to" && "Array" in val) {
      const blob = val.Array.find((v: any) => "Blob" in v)?.Blob;
      if (blob) to = Principal.fromUint8Array(Uint8Array.from(blob)).toText();
    }
  }

  return {
    coinArchiveAddress,
    blockId: Number(raw.id),
    timestamp: ts,
    amt,
    op,
    from,
    to,
    memo,
  };
}

// Export function
export {
  transferTokenICRC1,
  checkBalance,
  getArchiveBlockLength,
  getLedgerBlockLength,
  getTokenBlocks,
};
