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
  const Controllers = IDL.Record({
    hub: IDL.Opt(IDL.Principal),
    registry: IDL.Opt(IDL.Principal),
  });
  const Controllers__1 = IDL.Record({
    hub: IDL.Opt(IDL.Principal),
    registry: IDL.Opt(IDL.Principal),
    developer: IDL.Opt(IDL.Principal),
  });
  const PeridotFactory = IDL.Service({
    createPGL1: IDL.Func(
      [
        IDL.Record({
          controllers_extra: IDL.Opt(IDL.Vec(IDL.Principal)),
          meta: PGLContractMeta,
        }),
      ],
      [IDL.Principal],
      [],
    ),
    get_controllers: IDL.Func([], [Controllers], ['query']),
    get_created_pgl1s: IDL.Func(
      [],
      [IDL.Vec(IDL.Tuple(IDL.Principal, PGLContractMeta))],
      ['query'],
    ),
    get_default_cycles: IDL.Func([], [IDL.Nat], ['query']),
    get_pgl1_count: IDL.Func([], [IDL.Nat], ['query']),
    get_pgl1_info: IDL.Func(
      [IDL.Principal],
      [
        IDL.Record({
          controllers: Controllers__1,
          name: IDL.Text,
          game_id: IDL.Text,
        }),
      ],
      [],
    ),
    list_my_pgl1_min: IDL.Func(
      [IDL.Opt(IDL.Bool)],
      [
        IDL.Vec(
          IDL.Record({
            name: IDL.Text,
            canister_id: IDL.Principal,
            game_id: IDL.Text,
            registered: IDL.Bool,
          }),
        ),
      ],
      [],
    ),
    set_controllers: IDL.Func([Controllers], [IDL.Bool], []),
    set_default_cycles: IDL.Func([IDL.Nat], [IDL.Bool], []),
  });
  return PeridotFactory;
};
