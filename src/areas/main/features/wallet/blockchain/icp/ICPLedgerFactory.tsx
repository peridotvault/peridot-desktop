// ledger/ICRCLedgerFactory.ts
export const ICPLedgerFactory = ({ IDL }: { IDL: any }) => {
  // opt vec nat8
  const Subaccount = IDL.Opt(IDL.Vec(IDL.Nat8));

  // Account = { owner: principal; subaccount: opt vec nat8 }
  const Account = IDL.Record({
    owner: IDL.Principal,
    subaccount: Subaccount,
  });

  // ========== ICRC-1 ==========
  // kamu pakai icrc1_decimals
  // (method lain boleh ditambah kalau perlu)

  // ========== ICRC-2 ==========
  // allowance
  const AllowanceArgs = IDL.Record({
    account: Account,
    spender: Account,
  });
  const Allowance = IDL.Record({
    allowance: IDL.Nat,
    expires_at: IDL.Opt(IDL.Nat64),
  });

  // approve (urutannya tidak wajib, tapi label HARUS sama)
  const ApproveArgs = IDL.Record({
    fee: IDL.Opt(IDL.Nat),
    memo: IDL.Opt(IDL.Vec(IDL.Nat8)),
    from_subaccount: Subaccount,
    created_at_time: IDL.Opt(IDL.Nat64),
    amount: IDL.Nat,
    expected_allowance: IDL.Opt(IDL.Nat),
    expires_at: IDL.Opt(IDL.Nat64),
    spender: Account,
  });

  const TxIndex = IDL.Nat;

  const ApproveErr = IDL.Variant({
    GenericError: IDL.Record({ message: IDL.Text, error_code: IDL.Nat }),
    TemporarilyUnavailable: IDL.Null,
    Duplicate: IDL.Record({ duplicate_of: TxIndex }),
    BadFee: IDL.Record({ expected_fee: IDL.Nat }),
    AllowanceChanged: IDL.Record({ current_allowance: IDL.Nat }),
    CreatedInFuture: IDL.Record({ ledger_time: IDL.Nat64 }),
    TooOld: IDL.Null,
    Expired: IDL.Record({ ledger_time: IDL.Nat64 }), // ← WAJIB ADA
    InsufficientFunds: IDL.Record({ balance: IDL.Nat }),
  });
  const ApproveResult = IDL.Variant({ Ok: TxIndex, Err: ApproveErr });

  // transfer_from
  const TransferFromArgs = IDL.Record({
    to: Account,
    fee: IDL.Opt(IDL.Nat),
    spender_subaccount: Subaccount,
    from: Account,
    memo: IDL.Opt(IDL.Vec(IDL.Nat8)),
    created_at_time: IDL.Opt(IDL.Nat64),
    amount: IDL.Nat,
  });

  const TransferFromErr = IDL.Variant({
    GenericError: IDL.Record({ message: IDL.Text, error_code: IDL.Nat }),
    TemporarilyUnavailable: IDL.Null,
    InsufficientAllowance: IDL.Record({ allowance: IDL.Nat }), // ← WAJIB ADA
    BadBurn: IDL.Record({ min_burn_amount: IDL.Nat }),
    Duplicate: IDL.Record({ duplicate_of: TxIndex }),
    BadFee: IDL.Record({ expected_fee: IDL.Nat }),
    CreatedInFuture: IDL.Record({ ledger_time: IDL.Nat64 }),
    TooOld: IDL.Null,
    InsufficientFunds: IDL.Record({ balance: IDL.Nat }),
  });
  const TransferFromResult = IDL.Variant({ Ok: TxIndex, Err: TransferFromErr });

  return IDL.Service({
    icrc1_decimals: IDL.Func([], [IDL.Nat8], ['query']),
    icrc1_fee: IDL.Func([], [IDL.Nat], ['query']),
    icrc2_allowance: IDL.Func([AllowanceArgs], [Allowance], ['query']),
    icrc2_approve: IDL.Func([ApproveArgs], [ApproveResult], []),
    icrc2_transfer_from: IDL.Func([TransferFromArgs], [TransferFromResult], []),
  });
};
