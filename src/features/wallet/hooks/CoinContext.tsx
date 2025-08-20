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

function keyOf(entry: any): string {
  if (Array.isArray(entry)) return entry[0];
  return entry?._0_;
}
function valOf(entry: any): any {
  if (Array.isArray(entry)) return entry[1];
  return entry?._1_;
}
function findInMap(map: any[] | undefined, key: string): any | undefined {
  if (!Array.isArray(map)) return undefined;
  const e = map.find((ent) => keyOf(ent) === key);
  return e ? valOf(e) : undefined;
}
function asNat(v: any): bigint | undefined {
  if (!v || typeof v !== "object") return undefined;
  if ("Nat" in v) return v.Nat as bigint;
  if ("Int" in v) return BigInt(v.Int as bigint);
  if ("Text" in v && /^\d+$/.test(v.Text)) return BigInt(v.Text);
  return undefined;
}
function asText(v: any): string | undefined {
  if (!v || typeof v !== "object") return undefined;
  if ("Text" in v) return v.Text as string;
  return undefined;
}
function decodePrincipalFromArrayField(arr?: any[]): string {
  if (!Array.isArray(arr)) return "";
  const blob = arr.find((x) => x && typeof x === "object" && "Blob" in x)?.Blob;
  if (!blob) return "";
  try {
    return Principal.fromUint8Array(Uint8Array.from(blob)).toText();
  } catch {
    return new TextDecoder().decode(blob);
  }
}
function toHex(u8: Uint8Array): string {
  return [...u8].map((b) => b.toString(16).padStart(2, "0")).join("");
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
  // Pastikan bentuknya map candid: { block: { Map: [...] }, id: Nat }
  if (!raw?.block || !("Map" in raw.block)) return null;

  const map: any[] = raw.block.Map;

  // --- TX map (kalau ada)
  const txMap = findInMap(map, "tx")?.Map as any[] | undefined;

  // --- Timestamp (prioritas: block.ts → tx.ts → tx.created_at_time → block.created_at_time)
  const tsTop =
    asNat(findInMap(map, "ts")) ?? asNat(findInMap(map, "timestamp"));
  const tsTx = asNat(findInMap(txMap, "ts"));
  const tsCreated =
    asNat(findInMap(txMap, "created_at_time")) ??
    asNat(findInMap(map, "created_at_time"));
  const ts = tsTop ?? tsTx ?? tsCreated ?? 0n;

  // --- Fields lain dari tx
  const amtNat = asNat(findInMap(txMap, "amt")) ?? 0n;
  const opText = asText(findInMap(txMap, "op")) ?? "";
  const memoBlob = findInMap(txMap, "memo")?.Blob as Uint8Array | undefined;
  const fromArr = findInMap(txMap, "from")?.Array as any[] | undefined;
  const toArr = findInMap(txMap, "to")?.Array as any[] | undefined;

  const from = decodePrincipalFromArrayField(fromArr);
  const to = decodePrincipalFromArrayField(toArr);
  const memo = memoBlob ? toHex(Uint8Array.from(memoBlob)) : "";

  // NOTE: simpan amount sebagai bigint kalau bisa, lalu format saat render
  return {
    id: Number(raw.id ?? raw.blockId ?? 0),
    blockId: Number(raw.id ?? raw.blockId ?? 0),
    coinArchiveAddress,
    timestamp: ts, // ← sudah tidak 0n kalau ada salah satu jalur
    op: opText,
    amt: Number(amtNat), // atau simpan amt: amtNat (bigint) kalau tipe Block mendukung
    from,
    to,
    memo,
  } as Block;
}

// Export function
export {
  transferTokenICRC1,
  checkBalance,
  getArchiveBlockLength,
  getLedgerBlockLength,
  getTokenBlocks,
};
