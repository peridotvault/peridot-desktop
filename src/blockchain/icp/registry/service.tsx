export const idlFactory = ({ IDL }: { IDL: any }) => {
  const Timestamp = IDL.Int;
  const GameId = IDL.Text;
  const Developer = IDL.Principal;
  const GameRecordType = IDL.Record({
    status: IDL.Opt(IDL.Text),
    register_at: Timestamp,
    canister_id: IDL.Principal,
    game_id: GameId,
    developer: Developer,
  });
  const ApiError = IDL.Variant({
    InvalidInput: IDL.Text,
    NotFound: IDL.Text,
    ValidationError: IDL.Text,
    NotAuthorized: IDL.Text,
    Unauthorized: IDL.Text,
    AlreadyExists: IDL.Text,
    StorageError: IDL.Text,
    InternalError: IDL.Text,
  });
  const ApiResponse_1 = IDL.Variant({
    ok: IDL.Vec(GameRecordType),
    err: ApiError,
  });
  const ApiResponse = IDL.Variant({ ok: GameRecordType, err: ApiError });
  const CreateGameRecord = IDL.Record({
    canister_id: IDL.Principal,
    developer: Developer,
  });
  return IDL.Service({
    getAllGameRecord: IDL.Func([], [ApiResponse_1], ['query']),
    getAllGameRecordLimit: IDL.Func([IDL.Nat, IDL.Nat], [ApiResponse_1], ['query']),
    getGameRecordById: IDL.Func([GameId], [ApiResponse], ['query']),
    isGameRegistered: IDL.Func([IDL.Principal], [IDL.Bool], ['query']),
    register_game: IDL.Func([CreateGameRecord], [ApiResponse], []),
  });
};
