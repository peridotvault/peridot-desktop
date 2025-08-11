export const appIdlFactory = ({ IDL }: { IDL: any }) => {
  const AppRecord = IDL.Record({
    id: IDL.Nat,
    title: IDL.Text,
    owner: IDL.Principal,
    coverImage: IDL.Text,
    backgroundImage: IDL.Text,
    price: IDL.Nat64,
  });

  const Error = IDL.Variant({
    InvalidInput: IDL.Text,
    NotFound: IDL.Text,
    ValidationError: IDL.Text,
    Unauthorized: IDL.Text,
    AlreadyExists: IDL.Text,
    StorageError: IDL.Text,
    InternalError: IDL.Text,
  });

  const Result = IDL.Variant({
    ok: IDL.Text,
    err: Error,
  });

  return IDL.Service({
    buyApp: IDL.Func([IDL.Nat], [Result], []),
    getAllApps: IDL.Func([], [IDL.Vec(AppRecord)], ["query"]),
    getApp: IDL.Func([IDL.Nat], [IDL.Opt(AppRecord)], ["query"]),
    getMyPurchasedApps: IDL.Func([], [IDL.Vec(AppRecord)], ["query"]),
  });
};
