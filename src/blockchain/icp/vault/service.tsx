export const idlFactory = ({ IDL }: { IDL: any }) => {
  const Value = IDL.Rec();
  const GameId = IDL.Text;
  const UserId = IDL.Principal;
  const Timestamp = IDL.Int;
  const PurchaseType = IDL.Record({
    txIndex: IDL.Opt(IDL.Nat),
    userId: UserId,
    memo: IDL.Opt(IDL.Vec(IDL.Nat8)),
    gameId: GameId,
    purchasedAt: Timestamp,
    amount: IDL.Nat,
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
  const ApiResponse_6 = IDL.Variant({ ok: PurchaseType, err: ApiError });
  const AnnouncementId = IDL.Nat;
  const InteractionType = IDL.Variant({
    like: IDL.Null,
    dislike: IDL.Null,
  });
  const GameAnnouncementInteractionType = IDL.Record({
    interactionType: IDL.Opt(InteractionType),
    userId: UserId,
    createdAt: Timestamp,
    comment: IDL.Opt(IDL.Text),
    announcementId: AnnouncementId,
  });
  const ApiResponse_2 = IDL.Variant({
    ok: GameAnnouncementInteractionType,
    err: ApiError,
  });
  const Status = IDL.Variant({
    published: IDL.Null,
    draft: IDL.Null,
    archived: IDL.Null,
  });
  const DTOGameAnnouncement = IDL.Record({
    status: Status,
    content: IDL.Text,
    headline: IDL.Text,
    coverImage: IDL.Text,
    pinned: IDL.Bool,
  });
  const DeveloperId = IDL.Principal;
  const GameAnnouncementType = IDL.Record({
    status: Status,
    content: IDL.Text,
    headline: IDL.Text,
    createdAt: Timestamp,
    gameId: GameId,
    coverImage: IDL.Text,
    updatedAt: IDL.Opt(Timestamp),
    pinned: IDL.Bool,
    developerId: DeveloperId,
    announcementId: AnnouncementId,
  });
  const ApiResponse_1 = IDL.Variant({
    ok: GameAnnouncementType,
    err: ApiError,
  });
  const ApiResponse_5 = IDL.Variant({ ok: IDL.Text, err: ApiError });
  const ApiResponse_4 = IDL.Variant({
    ok: IDL.Vec(GameAnnouncementType),
    err: ApiError,
  });
  const WebBuild = IDL.Record({
    url: IDL.Text,
    memory: IDL.Nat,
    graphics: IDL.Text,
    additionalNotes: IDL.Opt(IDL.Text),
    storage: IDL.Nat,
    processor: IDL.Text,
  });
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
  const PGLMeta = IDL.Record({
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
  const ApiResponse_3 = IDL.Variant({
    ok: IDL.Vec(PGLMeta),
    err: ApiError,
  });
  const ApiResponse = IDL.Variant({ ok: PGLMeta, err: ApiError });
  return IDL.Service({
    buyGame: IDL.Func([GameId], [ApiResponse_6], []),
    commentByAnnouncementId: IDL.Func([AnnouncementId, IDL.Text], [ApiResponse_2], []),
    createAnnouncement: IDL.Func([GameId, DTOGameAnnouncement], [ApiResponse_1], []),
    deleteAnnouncement: IDL.Func([AnnouncementId], [ApiResponse_5], []),
    dislikeByAnnouncementId: IDL.Func([AnnouncementId], [ApiResponse_2], []),
    getAllAnnouncementsByGameId: IDL.Func([GameId], [ApiResponse_4], ['query']),
    getAllGames: IDL.Func([IDL.Nat, IDL.Nat], [IDL.Vec(PGLMeta)], []),
    getAnnouncementsByAnnouncementId: IDL.Func([AnnouncementId], [ApiResponse_1], ['query']),
    getGameByDeveloperId: IDL.Func([IDL.Principal, IDL.Nat, IDL.Nat], [IDL.Vec(PGLMeta)], []),
    getGameMetadata: IDL.Func([IDL.Text], [PGLMeta], []),
    getGamesByGameId: IDL.Func([IDL.Text], [IDL.Opt(PGLMeta)], []),
    getMyGames: IDL.Func([], [IDL.Vec(PGLMeta)], []),
    getPublishedGames: IDL.Func([IDL.Nat, IDL.Nat], [ApiResponse_3], []),
    likeByAnnouncementId: IDL.Func([AnnouncementId], [ApiResponse_2], []),
    unLikeDislikeByAnnouncementId: IDL.Func([AnnouncementId], [ApiResponse_2], []),
    updateAnnouncement: IDL.Func([AnnouncementId, DTOGameAnnouncement], [ApiResponse_1], []),
    updateGame: IDL.Func([GameId, PGLMeta], [ApiResponse], []),
    verify_license: IDL.Func([IDL.Text], [IDL.Bool], []),
  });
};
