export const idlFactory = ({ IDL }: { IDL: any }) => {
  const ApiError = IDL.Variant({
    'InvalidInput': IDL.Text,
    'NotFound': IDL.Text,
    'ValidationError': IDL.Text,
    'NotAuthorized': IDL.Text,
    'Unauthorized': IDL.Text,
    'AlreadyExists': IDL.Text,
    'StorageError': IDL.Text,
    'InternalError': IDL.Text,
  });
  const ApiResponse = IDL.Variant({ 'ok': IDL.Bool, 'err': ApiError });
  const ApiResponse_2 = IDL.Variant({
    'ok': IDL.Vec(IDL.Text),
    'err': ApiError,
  });
  const Timestamp = IDL.Int;
  const GameId = IDL.Text;
  const Developer = IDL.Principal;
  const GameRecordType = IDL.Record({
    'status': IDL.Opt(IDL.Text),
    'register_at': Timestamp,
    'canister_id': IDL.Principal,
    'game_id': GameId,
    'developer': Developer,
  });
  const ApiResponse_4 = IDL.Variant({
    'ok': IDL.Vec(GameRecordType),
    'err': ApiError,
  });
  const ApiResponse_1 = IDL.Variant({
    'ok': GameRecordType,
    'err': ApiError,
  });
  const ApiResponse_3 = IDL.Variant({ 'ok': IDL.Nat, 'err': ApiError });
  const CreateGameRecord = IDL.Record({ 'canister_id': IDL.Principal });
  return IDL.Service({
    'add_admin': IDL.Func([IDL.Principal], [ApiResponse], []),
    'create_voucher': IDL.Func([IDL.Text], [ApiResponse], []),
    'generate_vouchers': IDL.Func(
      [IDL.Nat, IDL.Opt(IDL.Nat)],
      [ApiResponse_2],
      [],
    ),
    'getAllGameRecord': IDL.Func([], [ApiResponse_4], ['query']),
    'getAllGameRecordLimit': IDL.Func(
      [IDL.Nat, IDL.Nat],
      [ApiResponse_4],
      ['query'],
    ),
    'getGameRecordById': IDL.Func([GameId], [ApiResponse_1], ['query']),
    'getGamesByDeveloper': IDL.Func(
      [IDL.Principal],
      [ApiResponse_4],
      ['query'],
    ),
    'get_admins': IDL.Func([], [IDL.Vec(IDL.Principal)], ['query']),
    'get_governor': IDL.Func([], [IDL.Opt(IDL.Principal)], ['query']),
    'get_payment_config': IDL.Func(
      [],
      [
        IDL.Record({
          'amount_smallest': IDL.Nat,
          'decimals': IDL.Nat8,
          'token': IDL.Opt(IDL.Principal),
        }),
      ],
      ['query'],
    ),
    'get_voucher_count': IDL.Func([], [ApiResponse_3], ['query']),
    'isGameRegistered': IDL.Func([IDL.Principal], [IDL.Bool], ['query']),
    'is_voucher_valid': IDL.Func([IDL.Text], [IDL.Bool], ['query']),
    'list_vouchers': IDL.Func([], [ApiResponse_2], ['query']),
    'redeem_voucher': IDL.Func(
      [IDL.Text, CreateGameRecord],
      [ApiResponse_1],
      [],
    ),
    'register_game_with_fee': IDL.Func(
      [CreateGameRecord],
      [ApiResponse_1],
      [],
    ),
    'register_game_with_fee_for': IDL.Func(
      [CreateGameRecord, IDL.Principal],
      [ApiResponse_1],
      [],
    ),
    'remove_admin': IDL.Func([IDL.Principal], [ApiResponse], []),
    'revoke_voucher': IDL.Func([IDL.Text], [ApiResponse], []),
    'set_governor': IDL.Func([IDL.Principal], [IDL.Bool], []),
    'set_payment_config': IDL.Func(
      [IDL.Principal, IDL.Nat, IDL.Principal],
      [IDL.Bool],
      [],
    ),
  });
};
export const init = () => { return []; };
