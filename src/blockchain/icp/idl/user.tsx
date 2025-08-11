export const userIdlFactory = ({ IDL }: { IDL: any }) => {
  const Country = IDL.Text;

  const DeveloperFollower = IDL.Record({
    createdAt: IDL.Int,
    userId: IDL.Principal,
  });

  const AnnouncementInteraction = IDL.Record({
    userId: IDL.Principal,
  });

  const AnnouncementComment = IDL.Record({
    createdAt: IDL.Int,
    userId: IDL.Principal,
    comment: IDL.Text,
  });

  const DeveloperAnnouncement = IDL.Record({
    announcementDislikes: IDL.Opt(IDL.Vec(AnnouncementInteraction)),
    content: IDL.Text,
    coverImage: IDL.Text,
    headline: IDL.Text,
    totalDislike: IDL.Int,
    createdAt: IDL.Int,
    totalLike: IDL.Int,
    announcementLikes: IDL.Opt(IDL.Vec(AnnouncementInteraction)),
    announcementComments: IDL.Opt(IDL.Vec(AnnouncementComment)),
  });

  const Developer = IDL.Record({
    developerWebsite: IDL.Text,
    developerBio: IDL.Text,
    totalFollower: IDL.Nat,
    joinedDate: IDL.Int,
    announcements: IDL.Opt(IDL.Vec(DeveloperAnnouncement)),
  });

  // Users ======================================
  const UserLibrary = IDL.Record({
    appId: IDL.Nat,
    playtimeMinute: IDL.Nat,
    lastPlayed: IDL.Opt(IDL.Int),
    currentVersion: IDL.Text,
    createdAt: IDL.Int,
  });

  const Interaction = IDL.Variant({
    view: IDL.Null,
    purchase: IDL.Null,
    play: IDL.Null,
  });

  const UserInteraction = IDL.Record({
    appId: IDL.Nat,
    interaction: Interaction,
    createdAt: IDL.Int,
  });

  const Gender = IDL.Variant({
    male: IDL.Null,
    female: IDL.Null,
    other: IDL.Null,
  });

  const UserDemographics = IDL.Record({
    birthDate: IDL.Int,
    gender: Gender,
    country: IDL.Text,
  });

  const User = IDL.Record({
    username: IDL.Text,
    displayName: IDL.Text,
    email: IDL.Text,
    imageUrl: IDL.Opt(IDL.Text),
    backgroundImageUrl: IDL.Opt(IDL.Text),
    totalPlaytime: IDL.Opt(IDL.Int),
    createdAt: IDL.Int,
    userDemographics: UserDemographics,
    userInteractions: IDL.Opt(IDL.Vec(UserInteraction)),
    userLibraries: IDL.Opt(IDL.Vec(UserLibrary)),
    developer: IDL.Opt(Developer),
  });

  // User Friends ======================================
  const UserFriend = IDL.Record({
    user1Id: IDL.Principal,
    user2Id: IDL.Principal,
    status: IDL.Variant({
      accept: IDL.Null,
      pending: IDL.Null,
      decline: IDL.Null,
    }),
    createdAt: IDL.Int,
  });

  const UpdateUser = IDL.Record({
    username: IDL.Text,
    displayName: IDL.Text,
    email: IDL.Text,
    imageUrl: IDL.Opt(IDL.Text),
    backgroundImageUrl: IDL.Opt(IDL.Text),
    userDemographics: UserDemographics,
  });

  const CreateUser = IDL.Record({
    username: IDL.Text,
    displayName: IDL.Text,
    email: IDL.Text,
    birthDate: IDL.Int,
    gender: Gender,
    country: Country,
  });

  // Handlers
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
    ok: User,
    err: Error,
  });

  return IDL.Service({
    createUser: IDL.Func([CreateUser], [Result], []),
    updateUser: IDL.Func([UpdateUser], [Result], []),
    getUserByPrincipalId: IDL.Func([], [Result], []),
    getUsersByPrefixWithLimit: IDL.Func(
      [IDL.Text, IDL.Nat],
      [
        IDL.Variant({
          ok: IDL.Vec(User), // Expecting a vector of User records
          err: Error,
        }),
      ],
      []
    ),
    getIsUsernameValid: IDL.Func(
      [IDL.Text],
      [
        IDL.Variant({
          ok: IDL.Bool,
          err: Error,
        }),
      ],
      []
    ),

    // user friend
    getFriendRequestList: IDL.Func(
      [],
      [
        IDL.Variant({
          ok: UserFriend,
          err: Error,
        }),
      ],
      []
    ),
    getFriendList: IDL.Func(
      [],
      [
        IDL.Variant({
          ok: UserFriend,
          err: Error,
        }),
      ],
      []
    ),

    // Developer
    createDeveloperProfile: IDL.Func(
      [IDL.Text, IDL.Text],
      [
        IDL.Variant({
          ok: User,
          err: Error,
        }),
      ],
      []
    ),
  });
};
