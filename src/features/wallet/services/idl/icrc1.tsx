export const icrc1IdlFactory = ({ IDL }: { IDL: any }) => {
  return IDL.Service({
    icrc1_name: IDL.Func([], [IDL.Text], ["query"]),
    icrc1_symbol: IDL.Func([], [IDL.Text], ["query"]),
    icrc1_decimals: IDL.Func([], [IDL.Nat8], ["query"]),
    icrc1_total_supply: IDL.Func([], [IDL.Nat], ["query"]),
    icrc1_fee: IDL.Func([], [IDL.Nat], ["query"]),
    icrc1_metadata: IDL.Func(
      [],
      [
        IDL.Vec(
          IDL.Tuple(
            IDL.Text,
            IDL.Variant({
              Int: IDL.Int,
              Nat: IDL.Nat,
              Blob: IDL.Vec(IDL.Nat8),
              Text: IDL.Text,
            })
          )
        ),
      ],
      ["query"]
    ),
    icrc1_balance_of: IDL.Func(
      [
        IDL.Record({
          owner: IDL.Principal,
          subaccount: IDL.Opt(IDL.Vec(IDL.Nat8)),
        }),
      ],
      [IDL.Nat],
      ["query"]
    ),
    icrc1_transfer: IDL.Func(
      [
        IDL.Record({
          to: IDL.Record({
            owner: IDL.Principal,
            subaccount: IDL.Opt(IDL.Vec(IDL.Nat8)),
          }),
          fee: IDL.Opt(IDL.Nat),
          memo: IDL.Opt(IDL.Vec(IDL.Nat8)),
          from_subaccount: IDL.Opt(IDL.Vec(IDL.Nat8)),
          created_at_time: IDL.Opt(IDL.Nat64),
          amount: IDL.Nat,
        }),
      ],
      [
        IDL.Variant({
          Ok: IDL.Nat,
          Err: IDL.Variant({
            GenericError: IDL.Record({
              message: IDL.Text,
              error_code: IDL.Nat,
            }),
            TemporarilyUnavailable: IDL.Null,
            BadBurn: IDL.Record({ min_burn_amount: IDL.Nat }),
            Duplicate: IDL.Record({ duplicate_of: IDL.Nat }),
            BadFee: IDL.Record({ expected_fee: IDL.Nat }),
            CreatedInFuture: IDL.Record({ ledger_time: IDL.Nat64 }),
            TooOld: IDL.Null,
            InsufficientFunds: IDL.Record({ balance: IDL.Nat }),
          }),
        }),
      ],
      []
    ),
    icrc3_get_archives: IDL.Func(
      [IDL.Record({ from: IDL.Opt(IDL.Principal) })],
      [
        IDL.Vec(
          IDL.Record({
            start: IDL.Nat,
            end: IDL.Nat,
            canister_id: IDL.Principal,
          })
        ),
      ],
      ["query"]
    ),
  });
};
