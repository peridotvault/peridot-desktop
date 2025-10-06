export const idlFactory = ({ IDL }: { IDL: any }) => {
  const Value = IDL.Rec();
  const WebBuild = IDL.Record({
    url: IDL.Text,
    memory: IDL.Nat,
    graphics: IDL.Text,
    additionalNotes: IDL.Opt(IDL.Text),
    storage: IDL.Nat,
    processor: IDL.Text,
  });
  const Timestamp = IDL.Int;
  const StorageRef = IDL.Variant({
    s3: IDL.Record({ bucket: IDL.Text, basePath: IDL.Text }),
    url: IDL.Record({ url: IDL.Text }),
    ipfs: IDL.Record({ cid: IDL.Text, path: IDL.Opt(IDL.Text) }),
  });
  const Manifest = IDL.Record({
    listing: IDL.Text,
    createdAt: Timestamp,
    size_bytes: IDL.Nat,
    version: IDL.Text,
    storageRef: StorageRef,
    checksum: IDL.Text,
  });
  const NativeBuild = IDL.Record({
    os: IDL.Text,
    memory: IDL.Nat,
    graphics: IDL.Text,
    additionalNotes: IDL.Opt(IDL.Text),
    storage: IDL.Nat,
    manifests: IDL.Vec(Manifest),
    processor: IDL.Text,
  });
  const Distribution = IDL.Variant({
    web: WebBuild,
    native: NativeBuild,
  });
  Value.fill(
    IDL.Variant({
      int: IDL.Int,
      map: IDL.Vec(IDL.Tuple(IDL.Text, Value)),
      nat: IDL.Nat,
      array: IDL.Vec(Value),
      blob: IDL.Vec(IDL.Nat8),
      text: IDL.Text,
    }),
  );
  const Metadata = IDL.Vec(IDL.Tuple(IDL.Text, Value));
  const GameId = IDL.Text;
  // const PGLContractMeta = IDL.Record({
  //   pgl1_required_age: IDL.Opt(IDL.Nat),
  //   pgl1_cover_image: IDL.Opt(IDL.Text),
  //   pgl1_distribution: IDL.Opt(IDL.Vec(Distribution)),
  //   pgl1_description: IDL.Text,
  //   pgl1_name: IDL.Text,
  //   pgl1_banner_image: IDL.Opt(IDL.Text),
  //   pgl1_metadata: IDL.Opt(Metadata),
  //   pgl1_website: IDL.Opt(IDL.Text),
  //   pgl1_price: IDL.Opt(IDL.Nat),
  //   pgl1_game_id: GameId,
  // });
  const Controllers = IDL.Record({
    hub: IDL.Opt(IDL.Principal),
    registry: IDL.Opt(IDL.Principal),
    developer: IDL.Opt(IDL.Principal),
  });
  const LicenseId = IDL.Nat;
  const Owner = IDL.Principal;
  const EventKind = IDL.Variant({
    Burn: IDL.Null,
    Mint: IDL.Null,
    Revoke: IDL.Null,
    SetControllers: IDL.Null,
    SetGovernance: IDL.Null,
    SetRegistry: IDL.Null,
    UpdateMeta: IDL.Null,
  });
  const Event = IDL.Record({
    idx: IDL.Nat,
    lic: IDL.Opt(LicenseId),
    owner: IDL.Opt(Owner),
    kind: EventKind,
    note: IDL.Opt(IDL.Text),
    time: Timestamp,
    the_actor: IDL.Principal,
  });
  const License = IDL.Record({
    id: LicenseId,
    revoked: IDL.Bool,
    owner: Owner,
    created_at: Timestamp,
    expires_at: IDL.Opt(Timestamp),
    revoke_reason: IDL.Opt(IDL.Text),
  });
  const ContractMeta = IDL.Record({
    pgl1_required_age: IDL.Opt(IDL.Nat),
    pgl1_cover_image: IDL.Opt(IDL.Text),
    pgl1_distribution: IDL.Opt(IDL.Vec(Distribution)),
    pgl1_description: IDL.Text,
    pgl1_name: IDL.Text,
    pgl1_banner_image: IDL.Opt(IDL.Text),
    pgl1_metadata: IDL.Opt(Metadata),
    pgl1_website: IDL.Opt(IDL.Text),
    pgl1_price: IDL.Opt(IDL.Nat),
    pgl1_game_id: GameId,
  });
  const MD = IDL.Vec(IDL.Tuple(IDL.Text, Value));
  const V = IDL.Variant({
    int: IDL.Int,
    map: IDL.Vec(IDL.Tuple(IDL.Text, Value)),
    nat: IDL.Nat,
    array: IDL.Vec(Value),
    blob: IDL.Vec(IDL.Nat8),
    text: IDL.Text,
  });
  const Result_1 = IDL.Variant({ ok: IDL.Null, err: IDL.Text });
  const Result = IDL.Variant({ ok: LicenseId, err: IDL.Text });
  const PGLUpdateMeta = IDL.Record({
    banner_image: IDL.Opt(IDL.Opt(IDL.Text)),
    metadata: IDL.Opt(IDL.Opt(Metadata)),
    cover_image: IDL.Opt(IDL.Opt(IDL.Text)),
    name: IDL.Opt(IDL.Text),
    description: IDL.Opt(IDL.Text),
    website: IDL.Opt(IDL.Opt(IDL.Text)),
    game_id: IDL.Opt(GameId),
    required_age: IDL.Opt(IDL.Opt(IDL.Nat)),
    price: IDL.Opt(IDL.Opt(IDL.Nat)),
    distribution: IDL.Opt(IDL.Opt(IDL.Vec(Distribution))),
  });
  const PGL1Ledger = IDL.Service({
    events_len: IDL.Func([], [IDL.Nat], ['query']),
    get_controllers: IDL.Func([], [Controllers], ['query']),
    get_events: IDL.Func([IDL.Nat, IDL.Nat], [IDL.Vec(Event)], ['query']),
    licenses_of_owner: IDL.Func([Owner], [IDL.Vec(License)], ['query']),
    list_owners: IDL.Func([IDL.Nat, IDL.Nat], [IDL.Vec(Owner)], []),
    pgl1_add_distribution: IDL.Func([Distribution], [IDL.Bool], []),
    pgl1_banner_image: IDL.Func([], [IDL.Opt(IDL.Text)], ['query']),
    pgl1_cover_image: IDL.Func([], [IDL.Opt(IDL.Text)], ['query']),
    pgl1_description: IDL.Func([], [IDL.Text], ['query']),
    pgl1_distribution: IDL.Func([], [IDL.Opt(IDL.Vec(Distribution))], ['query']),
    pgl1_game_id: IDL.Func([], [IDL.Text], ['query']),
    pgl1_game_metadata: IDL.Func([], [ContractMeta], ['query']),
    pgl1_metadata: IDL.Func([], [IDL.Opt(MD)], ['query']),
    pgl1_metadata_remove: IDL.Func([IDL.Vec(IDL.Text)], [IDL.Bool], []),
    pgl1_metadata_update: IDL.Func(
      [
        IDL.Record({
          set: IDL.Vec(IDL.Tuple(IDL.Text, V)),
          remove: IDL.Vec(IDL.Text),
        }),
      ],
      [IDL.Bool],
      [],
    ),
    pgl1_metadata_upsert: IDL.Func([IDL.Vec(IDL.Tuple(IDL.Text, V))], [IDL.Bool], []),
    pgl1_name: IDL.Func([], [IDL.Text], ['query']),
    pgl1_price: IDL.Func([], [IDL.Opt(IDL.Nat)], ['query']),
    pgl1_required_age: IDL.Func([], [IDL.Opt(IDL.Nat)], ['query']),
    pgl1_safeBurn: IDL.Func([Owner, IDL.Opt(IDL.Text)], [Result_1], []),
    pgl1_safeMint: IDL.Func([Owner, IDL.Opt(Timestamp)], [Result], []),
    pgl1_set_distribution: IDL.Func([IDL.Vec(Distribution)], [IDL.Bool], []),
    pgl1_set_item_collections: IDL.Func([IDL.Vec(V)], [IDL.Bool], []),
    pgl1_total_supply: IDL.Func([], [IDL.Nat], ['query']),
    pgl1_update_meta: IDL.Func([PGLUpdateMeta], [IDL.Bool], []),
    pgl1_website: IDL.Func([], [IDL.Opt(IDL.Text)], ['query']),
    set_controllers: IDL.Func([Controllers], [IDL.Bool], []),
    verify_license: IDL.Func([Owner], [IDL.Bool], ['query']),
  });
  return PGL1Ledger;
};

export const init = ({ IDL }: { IDL: any }) => {
  const Value = IDL.Rec();
  const WebBuild = IDL.Record({
    url: IDL.Text,
    memory: IDL.Nat,
    graphics: IDL.Text,
    additionalNotes: IDL.Opt(IDL.Text),
    storage: IDL.Nat,
    processor: IDL.Text,
  });
  const Timestamp = IDL.Int;
  const StorageRef = IDL.Variant({
    s3: IDL.Record({ bucket: IDL.Text, basePath: IDL.Text }),
    url: IDL.Record({ url: IDL.Text }),
    ipfs: IDL.Record({ cid: IDL.Text, path: IDL.Opt(IDL.Text) }),
  });
  const Manifest = IDL.Record({
    listing: IDL.Text,
    createdAt: Timestamp,
    size_bytes: IDL.Nat,
    version: IDL.Text,
    storageRef: StorageRef,
    checksum: IDL.Text,
  });
  const NativeBuild = IDL.Record({
    os: IDL.Text,
    memory: IDL.Nat,
    graphics: IDL.Text,
    additionalNotes: IDL.Opt(IDL.Text),
    storage: IDL.Nat,
    manifests: IDL.Vec(Manifest),
    processor: IDL.Text,
  });
  const Distribution = IDL.Variant({
    web: WebBuild,
    native: NativeBuild,
  });
  Value.fill(
    IDL.Variant({
      int: IDL.Int,
      map: IDL.Vec(IDL.Tuple(IDL.Text, Value)),
      nat: IDL.Nat,
      array: IDL.Vec(Value),
      blob: IDL.Vec(IDL.Nat8),
      text: IDL.Text,
    }),
  );
  const Metadata = IDL.Vec(IDL.Tuple(IDL.Text, Value));
  const GameId = IDL.Text;
  const PGLContractMeta = IDL.Record({
    pgl1_required_age: IDL.Opt(IDL.Nat),
    pgl1_cover_image: IDL.Opt(IDL.Text),
    pgl1_distribution: IDL.Opt(IDL.Vec(Distribution)),
    pgl1_description: IDL.Text,
    pgl1_name: IDL.Text,
    pgl1_banner_image: IDL.Opt(IDL.Text),
    pgl1_metadata: IDL.Opt(Metadata),
    pgl1_website: IDL.Opt(IDL.Text),
    pgl1_price: IDL.Opt(IDL.Nat),
    pgl1_game_id: GameId,
  });
  return [IDL.Opt(PGLContractMeta)];
};
