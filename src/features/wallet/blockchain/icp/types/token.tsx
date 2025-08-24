export const tokenIdlFactory = ({ IDL }: { IDL: any }) => {
  const Subaccount = IDL.Opt(IDL.Vec(IDL.Nat8));
  const Account = IDL.Record({
    owner: IDL.Principal,
    subaccount: Subaccount,
  });

  // ---- ICRC-2 ----
  // allowance
  const AllowanceArgs = IDL.Record({ account: Account, spender: Account });
  const Allowance = IDL.Record({
    allowance: IDL.Nat,
    expires_at: IDL.Opt(IDL.Nat64),
  });

  // approve
  const ApproveArgs = IDL.Record({
    from_subaccount: Subaccount,
    spender: Account,
    amount: IDL.Nat,
    expected_allowance: IDL.Opt(IDL.Nat),
    expires_at: IDL.Opt(IDL.Nat64),
    fee: IDL.Opt(IDL.Nat),
    memo: IDL.Opt(IDL.Vec(IDL.Nat8)),
    created_at_time: IDL.Opt(IDL.Nat64),
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
    InsufficientFunds: IDL.Record({ balance: IDL.Nat }),
  });

  const ApproveResult = IDL.Variant({ Ok: TxIndex, Err: ApproveErr });

  const TransferFromArgs = IDL.Record({
    from: Account,
    to: Account,
    amount: IDL.Nat,
    fee: IDL.Opt(IDL.Nat),
    memo: IDL.Opt(IDL.Vec(IDL.Nat8)),
    created_at_time: IDL.Opt(IDL.Nat64),
    spender_subaccount: Subaccount,
  });

  const TransferFromErr = IDL.Variant({
    GenericError: IDL.Record({ message: IDL.Text, error_code: IDL.Nat }),
    TemporarilyUnavailable: IDL.Null,
    BadBurn: IDL.Record({ min_burn_amount: IDL.Nat }),
    Duplicate: IDL.Record({ duplicate_of: TxIndex }),
    BadFee: IDL.Record({ expected_fee: IDL.Nat }),
    CreatedInFuture: IDL.Record({ ledger_time: IDL.Nat64 }),
    TooOld: IDL.Null,
    InsufficientFunds: IDL.Record({ balance: IDL.Nat }),
  });

  const TransferFromResult = IDL.Variant({ Ok: TxIndex, Err: TransferFromErr });

  // ---- ICRC-3 ----
  const BlockValue = IDL.Rec();
  BlockValue.fill(
    IDL.Variant({
      Int: IDL.Int,
      Nat: IDL.Nat,
      Text: IDL.Text,
      Blob: IDL.Vec(IDL.Nat8),
      Array: IDL.Vec(BlockValue),
      Map: IDL.Vec(
        IDL.Record({
          _0_: IDL.Text,
          _1_: BlockValue,
        })
      ),
    })
  );

  // Block record: { id: nat; block: variant }
  const BlockRecord = IDL.Record({
    id: IDL.Nat,
    block: BlockValue,
  });

  // Archived block callback arg/return shape
  const GetBlocksArg = IDL.Record({
    start: IDL.Nat,
    length: IDL.Nat,
  });

  const ArchivedBlock = IDL.Rec();
  ArchivedBlock.fill(
    IDL.Record({
      args: IDL.Vec(GetBlocksArg),
      callback: IDL.Func(
        [IDL.Vec(GetBlocksArg)],
        [
          IDL.Record({
            log_length: IDL.Nat,
            blocks: IDL.Vec(BlockRecord),
            archived_blocks: IDL.Vec(ArchivedBlock),
          }),
        ],
        ["query"]
      ),
    })
  );

  // Final return type
  const GetBlocksResponse = IDL.Record({
    log_length: IDL.Nat,
    blocks: IDL.Vec(BlockRecord),
    archived_blocks: IDL.Vec(ArchivedBlock),
  });

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
    // ICRC-2
    icrc2_allowance: IDL.Func([AllowanceArgs], [Allowance], ["query"]),
    icrc2_approve: IDL.Func([ApproveArgs], [ApproveResult], []),
    icrc2_transfer_from: IDL.Func([TransferFromArgs], [TransferFromResult], []),

    // ICRC-3
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
    icrc3_get_blocks: IDL.Func(
      [IDL.Vec(GetBlocksArg)],
      [GetBlocksResponse],
      ["query"]
    ),
  });
};
