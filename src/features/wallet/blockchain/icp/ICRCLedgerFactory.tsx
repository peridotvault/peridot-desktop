// types/icrc.ts
import type { Principal } from "@dfinity/principal";

type Opt<T> = [] | [T];

export type Subaccount = Opt<Uint8Array>;
export type Account = { owner: Principal; subaccount: Subaccount };

export type Allowance = { allowance: bigint; expires_at: Opt<bigint> };

export type ApproveErr =
  | { GenericError: { message: string; error_code: bigint } }
  | { TemporarilyUnavailable: null }
  | { Duplicate: { duplicate_of: bigint } }
  | { BadFee: { expected_fee: bigint } }
  | { AllowanceChanged: { current_allowance: bigint } }
  | { CreatedInFuture: { ledger_time: bigint } }
  | { TooOld: null }
  | { Expired: { ledger_time: bigint } } // ← tambahkan
  | { InsufficientFunds: { balance: bigint } };

export type ApproveResult = { Ok: bigint } | { Err: ApproveErr };

export type TransferFromErr =
  | { GenericError: { message: string; error_code: bigint } }
  | { TemporarilyUnavailable: null }
  | { InsufficientAllowance: { allowance: bigint } } // ← tambahkan
  | { BadBurn: { min_burn_amount: bigint } }
  | { Duplicate: { duplicate_of: bigint } }
  | { BadFee: { expected_fee: bigint } }
  | { CreatedInFuture: { ledger_time: bigint } }
  | { TooOld: null }
  | { InsufficientFunds: { balance: bigint } };

export type TransferFromResult = { Ok: bigint } | { Err: TransferFromErr };

export type ICRCLedgerActor = {
  icrc1_decimals: () => Promise<number>; // Nat8 as number
  icrc1_metadata: () => Promise<Array<[string, unknown]>>;
  icrc1_fee: () => Promise<bigint>;
  icrc2_allowance: (x: {
    account: Account;
    spender: Account;
  }) => Promise<Allowance>;
  icrc2_approve: (x: {
    fee: Opt<bigint>;
    memo: Opt<Uint8Array>;
    from_subaccount: Subaccount;
    created_at_time: Opt<bigint>;
    amount: bigint;
    expected_allowance: Opt<bigint>;
    expires_at: Opt<bigint>;
    spender: Account;
  }) => Promise<ApproveResult>;
  icrc2_transfer_from: (x: {
    to: Account;
    fee: Opt<bigint>;
    spender_subaccount: Subaccount;
    from: Account;
    memo: Opt<Uint8Array>;
    created_at_time: Opt<bigint>;
    amount: bigint;
  }) => Promise<TransferFromResult>;
};
