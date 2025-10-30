// services/approveService.ts
import { Actor, HttpAgent } from '@dfinity/agent';
import { Secp256k1KeyIdentity } from '@dfinity/identity-secp256k1';
import { Principal } from '@dfinity/principal';
import { walletService } from '@shared/services/wallet.service';
import { hexToArrayBuffer } from '../../../../../shared/utils/crypto';
import { ICPLedgerFactory } from '../ICPLedgerFactory';

const LEDGER_ID = import.meta.env.VITE_PERIDOT_TOKEN_CANISTER;
const SPENDER = Principal.fromText(import.meta.env.VITE_PERIDOT_ACCOUNT_CANISTER);

export async function makeLedgerActor(wallet: any) {
  const privateKey = await walletService.decryptWalletData(wallet.encryptedPrivateKey);
  const secretKey = hexToArrayBuffer(privateKey);

  const agent = new HttpAgent({
    host: import.meta.env.VITE_HOST,
    identity: Secp256k1KeyIdentity.fromSecretKey(secretKey),
  });
  // if (import.meta.env.DEV) await agent.fetchRootKey();

  const actor = Actor.createActor(ICPLedgerFactory, {
    agent,
    canisterId: LEDGER_ID,
  });
  return { actor, agent };
}

export async function getTokenInfo(wallet: any) {
  const { actor } = await makeLedgerActor(wallet);
  const [name, symbol, decimals] = await Promise.all([
    actor.icrc1_name(),
    actor.icrc1_symbol(),
    actor.icrc1_decimals(),
  ]);
  return { name, symbol, decimals: Number(decimals) };
}

export function toSubunits(amountStr: string, decimals: number): bigint {
  // "10.5" + decimals 8 => 1050000000n
  if (!/^\d+(\.\d+)?$/.test(amountStr)) throw new Error('Invalid amount');
  const [intPart, frac = ''] = amountStr.split('.');
  if (frac.length > decimals) throw new Error(`Too many decimal places (max ${decimals})`);
  const fracPadded = (frac + '0'.repeat(decimals)).slice(0, decimals);
  return BigInt(intPart) * BigInt(10 ** decimals) + BigInt(fracPadded || 0);
}

export function formatSubunits(x: bigint, decimals: number): string {
  const base = BigInt(10 ** decimals);
  const int = x / base;
  const frac = (x % base).toString().padStart(decimals, '0').replace(/0+$/, '');
  return frac ? `${int}.${frac}` : `${int}`;
}

export async function getAllowance(wallet: any) {
  const { actor, agent } = await makeLedgerActor(wallet);
  const owner = (agent as any).identity.getPrincipal() as Principal;
  const account = { owner, subaccount: [] as [] }; // null
  const spender = { owner: SPENDER, subaccount: [] as [] };
  return actor.icrc2_allowance({ account, spender });
}

// export async function approve(wallet: any, humanAmount: string) {
//   const { actor, agent } = await makeLedgerActor(wallet);
//   const { decimals } = await getTokenInfo(wallet);
//   const amount = toSubunits(humanAmount, decimals);

//   const owner = (agent as any).identity.getPrincipal() as Principal;
//   const spender = { owner: SPENDER, subaccount: [] as [] };

//   const res = await actor.icrc2_approve({
//     from_subaccount: [], // none
//     spender,
//     amount,
//     expected_allowance: [], // none
//     expires_at: [], // none
//     fee: [], // use default
//     memo: [], // none
//     created_at_time: [], // let ledger fill
//   });

//   if ("Err" in res) {
//     const errKey = Object.keys(res.Err)[0];
//     throw new Error(`Approve failed: ${errKey}`);
//   }
//   return res.Ok; // tx index
// }
