export const idlFactory = ({ IDL }: { IDL: any }) => {
  const Platform = IDL.Variant({
    'ios': IDL.Null,
    'web': IDL.Null,
    'macos': IDL.Null,
    'other': IDL.Null,
    'linux': IDL.Null,
    'android': IDL.Null,
    'windows': IDL.Null,
  });
  const Timestamp = IDL.Int;
  const StorageRef = IDL.Variant({
    's3': IDL.Record({ 'bucket': IDL.Text, 'basePath': IDL.Text }),
    'url': IDL.Record({ 'url': IDL.Text }),
    'ipfs': IDL.Record({ 'cid': IDL.Text, 'path': IDL.Text }),
  });
  const Result = IDL.Variant({ 'ok': IDL.Null, 'err': IDL.Text });
  const Manifest = IDL.Record({
    'storage': StorageRef,
    'createdAt': Timestamp,
    'version': IDL.Text,
    'checksum': IDL.Vec(IDL.Nat8),
    'sizeBytes': IDL.Nat64,
  });
  const Hardware = IDL.Record({
    'graphics': IDL.Text,
    'additionalNotes': IDL.Text,
    'storageMB': IDL.Nat32,
    'memoryMB': IDL.Nat32,
    'processor': IDL.Text,
  });
  const Purchase = IDL.Record({
    'time': Timestamp,
    'tokenUsed': IDL.Principal,
    'amount': IDL.Nat64,
  });
  const PurchaseResult = IDL.Variant({
    'notPublished': IDL.Null,
    'alreadyOwned': IDL.Null,
    'insufficientAllowance': IDL.Null,
    'soldOut': IDL.Null,
    'success': IDL.Record({ 'txIndex': IDL.Nat, 'timestamp': Timestamp }),
    'paymentFailed': IDL.Text,
  });
  const RefundResult = IDL.Variant({
    'transferFailed': IDL.Text,
    'success': IDL.Record({ 'amount': IDL.Nat64 }),
    'notOwned': IDL.Null,
    'windowClosed': IDL.Null,
  });
  const WithdrawResult = IDL.Variant({
    'transferFailed': IDL.Text,
    'noBalance': IDL.Null,
    'success': IDL.Record({ 'vaultShare': IDL.Nat, 'amount': IDL.Nat }),
    'unauthorized': IDL.Null,
  });
  const PGC1 = IDL.Service({
    'appendBuild': IDL.Func(
      [
        Platform,
        IDL.Text,
        IDL.Nat64,
        IDL.Vec(IDL.Nat8),
        Timestamp,
        StorageRef,
      ],
      [Result],
      [],
    ),
    'getAllLiveManifests': IDL.Func(
      [],
      [IDL.Vec(IDL.Tuple(Platform, IDL.Opt(Manifest)))],
      ['query'],
    ),
    'getAllManifests': IDL.Func([Platform], [IDL.Vec(Manifest)], ['query']),
    'getAllManifestsAllPlatforms': IDL.Func(
      [],
      [IDL.Vec(IDL.Tuple(Platform, IDL.Vec(Manifest)))],
      ['query'],
    ),
    'getAvailableSupply': IDL.Func(
      [],
      [IDL.Record({ 'isUnlimited': IDL.Bool, 'available': IDL.Nat64 })],
      ['query'],
    ),
    'getDescription': IDL.Func([], [IDL.Text], ['query']),
    'getGameId': IDL.Func([], [IDL.Text], ['query']),
    'getHardware': IDL.Func([Platform], [IDL.Opt(Hardware)], ['query']),
    'getLifetimeRevenue': IDL.Func([], [IDL.Nat64], ['query']),
    'getLiveManifest': IDL.Func([Platform], [IDL.Opt(Manifest)], ['query']),
    'getMaxSupply': IDL.Func([], [IDL.Nat64], ['query']),
    'getMetadataURI': IDL.Func([], [IDL.Text], ['query']),
    'getName': IDL.Func([], [IDL.Text], ['query']),
    'getOwner': IDL.Func([], [IDL.Principal], ['query']),
    'getPrice': IDL.Func([], [IDL.Nat64], ['query']),
    'getPurchaseInfo': IDL.Func(
      [IDL.Principal],
      [IDL.Opt(Purchase)],
      ['query'],
    ),
    'getRefundableBalance': IDL.Func([], [IDL.Nat64], ['query']),
    'getTokenCanister': IDL.Func([], [IDL.Principal], ['query']),
    'getTotalPurchased': IDL.Func([], [IDL.Nat64], ['query']),
    'getVaultCanister': IDL.Func([], [IDL.Principal], ['query']),
    'getWithdrawnBalance': IDL.Func([], [IDL.Nat64], ['query']),
    'hasAccess': IDL.Func([IDL.Principal], [IDL.Bool], ['query']),
    'isFree': IDL.Func([], [IDL.Bool], ['query']),
    'isPublished': IDL.Func([], [IDL.Bool], ['query']),
    'isUnlimited': IDL.Func([], [IDL.Bool], ['query']),
    'purchase': IDL.Func([], [PurchaseResult], []),
    'refund': IDL.Func([], [RefundResult], []),
    'setDescription': IDL.Func([IDL.Text], [Result], []),
    'setHardware': IDL.Func(
      [Platform, IDL.Text, IDL.Text, IDL.Nat32, IDL.Nat32, IDL.Text],
      [Result],
      [],
    ),
    'setLiveVersion': IDL.Func([Platform, IDL.Nat64], [Result], []),
    'setMetadataURI': IDL.Func([IDL.Text], [Result], []),
    'setName': IDL.Func([IDL.Text], [Result], []),
    'setPrice': IDL.Func([IDL.Nat64], [Result], []),
    'setPublished': IDL.Func([IDL.Bool], [Result], []),
    'withdrawAll': IDL.Func([], [WithdrawResult], []),
  });
  return PGC1;
};
export const init = ({ IDL }: { IDL: any }) => {
  return [
    IDL.Text,
    IDL.Text,
    IDL.Text,
    IDL.Text,
    IDL.Nat64,
    IDL.Nat64,
    IDL.Principal,
    IDL.Principal,
  ];
};
