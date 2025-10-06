export const idlFactory = ({ IDL }: { IDL: any }) => {
  const Username = IDL.Text;
  const AppId = IDL.Nat;
  const Interaction = IDL.Variant({
    play: IDL.Null,
    view: IDL.Null,
    purchase: IDL.Null,
  });
  const Timestamp = IDL.Int;
  const UserInteraction = IDL.Record({
    appId: AppId,
    interaction: Interaction,
    createdAt: Timestamp,
  });
  const Country = IDL.Text;
  const Gender = IDL.Variant({
    other: IDL.Null,
    female: IDL.Null,
    male: IDL.Null,
  });
  const UserDemographic = IDL.Record({
    country: Country,
    birthDate: Timestamp,
    gender: Gender,
  });
  const Version = IDL.Text;
  const UserLibrary = IDL.Record({
    lastPlayed: IDL.Opt(Timestamp),
    appId: AppId,
    createdAt: Timestamp,
    playtimeMinute: IDL.Nat,
    currentVersion: Version,
  });
  const AnnouncementId = IDL.Text;
  const Developer = IDL.Record({
    developerWebsite: IDL.Text,
    joinedDate: Timestamp,
    totalFollower: IDL.Nat,
    developerBio: IDL.Text,
    announcements: IDL.Opt(IDL.Vec(AnnouncementId)),
  });
  const UserType = IDL.Record({
    username: Username,
    backgroundImageUrl: IDL.Opt(IDL.Text),
    userInteractions: IDL.Opt(IDL.Vec(UserInteraction)),
    displayName: IDL.Text,
    createdAt: Timestamp,
    email: IDL.Text,
    imageUrl: IDL.Opt(IDL.Text),
    totalPlaytime: IDL.Opt(IDL.Nat),
    userDemographics: UserDemographic,
    userLibraries: IDL.Opt(IDL.Vec(UserLibrary)),
    developer: IDL.Opt(Developer),
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
  const ApiResponse = IDL.Variant({ ok: UserType, err: ApiError });
  const Status = IDL.Variant({
    accept: IDL.Null,
    pending: IDL.Null,
    decline: IDL.Null,
  });
  const UserId = IDL.Principal;
  const FriendType = IDL.Record({
    status: Status,
    createdAt: Timestamp,
    user1Id: UserId,
    user2Id: UserId,
  });
  const ApiResponse_3 = IDL.Variant({ ok: FriendType, err: ApiError });
  const CreateUser = IDL.Record({
    country: Country,
    username: Username,
    birthDate: Timestamp,
    displayName: IDL.Text,
    email: IDL.Text,
    gender: Gender,
  });
  const ApiResponse_1 = IDL.Variant({ ok: IDL.Null, err: ApiError });
  const DeveloperType = IDL.Record({
    developerWebsite: IDL.Text,
    joinedDate: Timestamp,
    totalFollower: IDL.Nat,
    developerBio: IDL.Text,
    announcements: IDL.Opt(IDL.Vec(AnnouncementId)),
  });
  const ApiResponse_7 = IDL.Variant({ ok: DeveloperType, err: ApiError });
  const ApiResponse_6 = IDL.Variant({
    ok: IDL.Vec(FriendType),
    err: ApiError,
  });
  const ApiResponse_5 = IDL.Variant({ ok: IDL.Bool, err: ApiError });
  const ApiResponse_4 = IDL.Variant({
    ok: IDL.Vec(UserType),
    err: ApiError,
  });
  const DeveloperFollow = IDL.Record({
    createdAt: Timestamp,
    developerId: UserId,
    followerId: UserId,
  });
  const ApiResponse_2 = IDL.Variant({
    ok: DeveloperFollow,
    err: ApiError,
  });
  const UpdateUser = IDL.Record({
    username: Username,
    backgroundImageUrl: IDL.Opt(IDL.Text),
    displayName: IDL.Text,
    email: IDL.Text,
    imageUrl: IDL.Opt(IDL.Text),
    userDemographics: UserDemographic,
  });
  return IDL.Service({
    createDeveloperProfile: IDL.Func([IDL.Text, IDL.Text], [ApiResponse], []),
    createSendFriendRequest: IDL.Func([IDL.Principal], [ApiResponse_3], []),
    createUser: IDL.Func([CreateUser], [ApiResponse], []),
    deleteFriend: IDL.Func([IDL.Principal], [ApiResponse_1], []),
    getAmIDeveloper: IDL.Func([], [IDL.Bool], []),
    getDeveloperProfile: IDL.Func([IDL.Principal], [ApiResponse_7], ['query']),
    getFriendList: IDL.Func([], [ApiResponse_6], ['query']),
    getFriendRequestList: IDL.Func([], [ApiResponse_6], ['query']),
    getIsUsernameValid: IDL.Func([IDL.Text], [ApiResponse_5], []),
    getUserByPrincipalId: IDL.Func([UserId], [ApiResponse], ['query']),
    getUserByUsername: IDL.Func([IDL.Text], [ApiResponse], ['query']),
    getUserData: IDL.Func([], [ApiResponse], []),
    getUsersByPrefixWithLimit: IDL.Func([IDL.Text, IDL.Nat], [ApiResponse_4], ['query']),
    isUserDeveloper: IDL.Func([IDL.Principal], [IDL.Bool], ['query']),
    updateAcceptFriendRequest: IDL.Func([IDL.Principal], [ApiResponse_3], []),
    updateFollowDeveloper: IDL.Func([IDL.Principal], [ApiResponse_2], []),
    updateUnfollowDeveloper: IDL.Func([IDL.Principal], [ApiResponse_1], []),
    updateUser: IDL.Func([UpdateUser], [ApiResponse], []),
  });
};
