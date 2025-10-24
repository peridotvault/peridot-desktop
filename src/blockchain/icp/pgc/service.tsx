export const idlFactory = ({ IDL }: { IDL: any }) => {
  const Platform = IDL.Variant({
    ios: IDL.Null,
    web: IDL.Null,
    macos: IDL.Null,
    other: IDL.Null,
    linux: IDL.Null,
    android: IDL.Null,
    windows: IDL.Null,
  });
  const Timestamp = IDL.Int;
  const Manifest = IDL.Record({
    createdAt: Timestamp,
    version: IDL.Text,
    checksum: IDL.Vec(IDL.Nat8),
    sizeBytes: IDL.Nat64,
  });
  const Hardware = IDL.Record({
    graphics: IDL.Text,
    additionalNotes: IDL.Text,
    storageMB: IDL.Nat32,
    memoryMB: IDL.Nat32,
    processor: IDL.Text,
  });
  const Purchase = IDL.Record({
    time: Timestamp,
    tokenUsed: IDL.Principal,
    amount: IDL.Nat64,
  });
  const PGC1 = IDL.Service({
    appendBuild: IDL.Func([Platform, IDL.Text, IDL.Nat64, IDL.Vec(IDL.Nat8), Timestamp], [], []),
    getAllManifests: IDL.Func([Platform], [IDL.Vec(Manifest)], ['query']),
    getAvailableSupply: IDL.Func(
      [],
      [IDL.Record({ isUnlimited: IDL.Bool, available: IDL.Nat64 })],
      ['query'],
    ),
    getDescription: IDL.Func([], [IDL.Text], ['query']),
    getGameId: IDL.Func([], [IDL.Text], ['query']),
    getHardware: IDL.Func([Platform], [IDL.Opt(Hardware)], ['query']),
    getLifetimeRevenue: IDL.Func([], [IDL.Nat64], ['query']),
    getLiveManifest: IDL.Func([Platform], [IDL.Opt(Manifest)], ['query']),
    getMaxSupply: IDL.Func([], [IDL.Nat64], ['query']),
    getMetadataURI: IDL.Func([], [IDL.Text], ['query']),
    getName: IDL.Func([], [IDL.Text], ['query']),
    getOwner: IDL.Func([], [IDL.Principal], ['query']),
    getPrice: IDL.Func([], [IDL.Nat64], ['query']),
    getPurchaseInfo: IDL.Func([IDL.Principal], [IDL.Opt(Purchase)], ['query']),
    getRefundableBalance: IDL.Func([], [IDL.Nat64], ['query']),
    getTokenCanister: IDL.Func([], [IDL.Principal], ['query']),
    getTotalPurchased: IDL.Func([], [IDL.Nat64], ['query']),
    hasAccess: IDL.Func([IDL.Principal], [IDL.Bool], ['query']),
    isPublished: IDL.Func([], [IDL.Bool], ['query']),
    isUnlimited: IDL.Func([], [IDL.Bool], ['query']),
    purchase: IDL.Func([], [], []),
    refund: IDL.Func([], [], []),
    setDescription: IDL.Func([IDL.Text], [], []),
    setHardware: IDL.Func([Platform, IDL.Text, IDL.Text, IDL.Nat32, IDL.Nat32, IDL.Text], [], []),
    setLiveVersion: IDL.Func([Platform, IDL.Nat64], [], []),
    setMetadataURI: IDL.Func([IDL.Text], [], []),
    setName: IDL.Func([IDL.Text], [], []),
    setPrice: IDL.Func([IDL.Nat64], [], []),
    setPublished: IDL.Func([IDL.Bool], [], []),
    withdrawAll: IDL.Func([], [], []),
  });
  return PGC1;
};
export const init = ({ IDL }: { IDL: any }) => {
  return [IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Nat64, IDL.Nat64, IDL.Principal];
};
