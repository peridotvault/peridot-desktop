import { Actor, HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { walletService } from '@shared/services/wallet.service';
import { hexToArrayBuffer } from '@shared/utils/crypto';
import { Secp256k1KeyIdentity } from '@dfinity/identity-secp256k1';
import { tokenIdlFactory } from '../types/token';
import { ArchiveInfo, ICRC1Metadata } from '../../../interfaces/Coin';
import { Block, ICRC3BlockResponse } from '@features/wallet/local-db/models/Block';

export async function transferTokenICRC1(
  to: Principal,
  amount: number,
  icrc1Address: Principal,
  fee: number,
  wallet: any,
) {
  const E8S_PER_TOKEN = 100000000; // 10^8 for 8 decimals
  const privateKey = await walletService.decryptWalletData(wallet.encryptedPrivateKey);

  const secretKey = hexToArrayBuffer(privateKey);

  try {
    const agent = new HttpAgent({
      host: import.meta.env.VITE_HOST,
      identity: Secp256k1KeyIdentity.fromSecretKey(new Uint8Array(secretKey)),
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
    throw new Error('Error Transfer : ' + error);
  }
}

export async function checkBalance(icrc1CanisterId: Principal, wallet: any) {
  if (!wallet?.principalId) {
    throw new Error('Not Logged in');
  }

  try {
    // Gunakan host dari env; pastikan kompatibel CORS di browser.
    const agent = new HttpAgent({
      host: import.meta.env.VITE_HOST || 'https://icp-api.io',
    });
    // Jika dev lokal (dfx): await agent.fetchRootKey();

    const actor = Actor.createActor(tokenIdlFactory as any, {
      agent,
      canisterId: icrc1CanisterId,
    });

    // -------------------------------
    // 1) (Opsional) Archives — aman dari error
    // -------------------------------
    let coinArchiveAddress = '';
    try {
      const archives = (await actor.icrc3_get_archives({
        from: [],
      })) as ArchiveInfo[];
      if (Array.isArray(archives) && archives.length > 0) {
        coinArchiveAddress = archives[archives.length - 1].canister_id.toString();
      }
    } catch {
      // Ledger ICP (ryjl3-...) memang tidak mengekspor icrc3_get_archives → abaikan
      coinArchiveAddress = '';
    }

    // -------------------------------
    // 2) Metadata dasar
    // -------------------------------
    const name = (await actor.icrc1_name()) as string;
    const symbol = (await actor.icrc1_symbol()) as string;

    // decimals bisa number atau bigint tergantung IDL; pastikan jadi number wajar
    let decimals = Number(await actor.icrc1_decimals());
    if (!Number.isFinite(decimals) || decimals < 0 || decimals > 50) {
      decimals = 8; // fallback aman
    }

    // fee biasanya Nat (bigint). Skala ke unit token.
    let fee = 0;
    try {
      const feeRaw = await actor.icrc1_fee();
      if (typeof feeRaw === 'bigint') {
        fee = Number(feeRaw) / Math.pow(10, decimals);
      } else if (typeof feeRaw === 'number') {
        // beberapa IDL custom bisa mengembalikan number
        fee = feeRaw / Math.pow(10, decimals);
      }
    } catch {
      fee = 0;
    }

    // -------------------------------
    // 3) Balance (default subaccount; isi subaccount di sini jika kamu pakai non-default)
    // -------------------------------
    const balanceNat: bigint = (await actor.icrc1_balance_of({
      owner: Principal.fromText(wallet.principalId),
      subaccount: [], // ganti ke [bytes32] jika pakai subaccount non-default
    })) as bigint;

    const balance = Number(balanceNat) / Math.pow(10, decimals);

    // -------------------------------
    // 4) Metadata tambahan (logo)
    // -------------------------------
    let logo: string | null =
      icrc1CanisterId.toText() === 'ryjl3-tyaaa-aaaaa-aaaba-cai' ? './assets/logo-icp.svg' : null;

    try {
      const metadataResult = (await actor.icrc1_metadata()) as any[][];
      // Cari entri 'icrc1:logo' → { Text: string }
      const logoEntry = Array.isArray(metadataResult)
        ? metadataResult.find((it) => String(it?.[0]).toLowerCase() === 'icrc1:logo')
        : undefined;
      const v = logoEntry?.[1];
      const maybeText: unknown = v?.Text ?? v?.text ?? v;
      if (typeof maybeText === 'string' && maybeText.trim().length > 0) {
        logo = maybeText;
      }
    } catch {
      // Abaikan jika metadata tidak tersedia
    }

    // -------------------------------
    // 5) Bentuk hasil sesuai tipe lamamu
    // -------------------------------
    const result: ICRC1Metadata = {
      balance, // number
      coinArchiveAddress, // string ("" kalau tidak ada)
      logo, // string | null
      decimals, // number
      name, // string
      symbol, // string
      fee, // number (sudah diskalakan)
    };

    return result;
  } catch (error) {
    // Biarkan error "asli" gelembung ke atas -> mudah di-debug
    throw error;
  }
}

export async function getLedgerBlockLength(coinAddress: Principal): Promise<number> {
  try {
    const agent = new HttpAgent({
      host: import.meta.env.VITE_HOST,
    });

    const actor = Actor.createActor(tokenIdlFactory, {
      agent,
      canisterId: coinAddress,
    });

    const result = (await actor.icrc3_get_blocks([{ start: 0, length: 1 }])) as ICRC3BlockResponse;

    return Number(result.log_length);
  } catch (error) {
    throw new Error("Can't get block length");
  }
}

export async function getArchiveBlockLength(coinArchiveAddress: Principal): Promise<number> {
  try {
    const agent = new HttpAgent({
      host: import.meta.env.VITE_HOST,
    });

    const actor = Actor.createActor(tokenIdlFactory, {
      agent,
      canisterId: coinArchiveAddress,
    });

    const result = (await actor.icrc3_get_blocks([{ start: 0, length: 1 }])) as ICRC3BlockResponse;

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
  if (!v || typeof v !== 'object') return undefined;
  if ('Nat' in v) return v.Nat as bigint;
  if ('Int' in v) return BigInt(v.Int as bigint);
  if ('Text' in v && /^\d+$/.test(v.Text)) return BigInt(v.Text);
  return undefined;
}
function asText(v: any): string | undefined {
  if (!v || typeof v !== 'object') return undefined;
  if ('Text' in v) return v.Text as string;
  return undefined;
}
function decodePrincipalFromArrayField(arr?: any[]): string {
  if (!Array.isArray(arr)) return '';
  const blob = arr.find((x) => x && typeof x === 'object' && 'Blob' in x)?.Blob;
  if (!blob) return '';
  try {
    return Principal.fromUint8Array(Uint8Array.from(blob)).toText();
  } catch {
    return new TextDecoder().decode(blob);
  }
}
function toHex(u8: Uint8Array): string {
  return [...u8].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function getTokenBlocks({
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
    throw new Error('Not Logged in');
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
  if (!raw?.block || !('Map' in raw.block)) return null;

  const map: any[] = raw.block.Map;

  // --- TX map (kalau ada)
  const txMap = findInMap(map, 'tx')?.Map as any[] | undefined;

  // --- Timestamp (prioritas: block.ts → tx.ts → tx.created_at_time → block.created_at_time)
  const tsTop = asNat(findInMap(map, 'ts')) ?? asNat(findInMap(map, 'timestamp'));
  const tsTx = asNat(findInMap(txMap, 'ts'));
  const tsCreated =
    asNat(findInMap(txMap, 'created_at_time')) ?? asNat(findInMap(map, 'created_at_time'));
  const ts = tsTop ?? tsTx ?? tsCreated ?? 0n;

  // --- Fields lain dari tx
  const amtNat = asNat(findInMap(txMap, 'amt')) ?? 0n;
  const opText = asText(findInMap(txMap, 'op')) ?? '';
  const memoBlob = findInMap(txMap, 'memo')?.Blob as Uint8Array | undefined;
  const fromArr = findInMap(txMap, 'from')?.Array as any[] | undefined;
  const toArr = findInMap(txMap, 'to')?.Array as any[] | undefined;

  const from = decodePrincipalFromArrayField(fromArr);
  const to = decodePrincipalFromArrayField(toArr);
  const memo = memoBlob ? toHex(Uint8Array.from(memoBlob)) : '';

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
