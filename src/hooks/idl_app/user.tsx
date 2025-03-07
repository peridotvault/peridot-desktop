export const userIdlFactory = ({ IDL }: { IDL: any }) => {
  const DeveloperFollower = IDL.Record({
    created_at: IDL.Int,
    user_principal_id: IDL.Principal,
  });

  const AnnouncementInteraction = IDL.Record({
    user_principal_id: IDL.Principal,
  });

  const AnnouncementComment = IDL.Record({
    created_at: IDL.Int,
    user_principal_id: IDL.Principal,
    comment: IDL.Text,
  });

  const DeveloperAnnouncement = IDL.Record({
    announcement_dislikes: IDL.Opt(IDL.Vec(AnnouncementInteraction)),
    content: IDL.Text,
    cover_image: IDL.Text,
    headline: IDL.Text,
    total_dislike: IDL.Int,
    created_at: IDL.Int,
    total_like: IDL.Int,
    announcement_likes: IDL.Opt(IDL.Vec(AnnouncementInteraction)),
    announcement_comments: IDL.Opt(IDL.Vec(AnnouncementComment)),
  });

  const Developer = IDL.Record({
    joined_date: IDL.Int,
    developer_followers: IDL.Opt(IDL.Vec(DeveloperFollower)),
    developer_bio: IDL.Text,
    developer_announcement: IDL.Opt(IDL.Vec(DeveloperAnnouncement)),
    total_follower: IDL.Int,
    developer_website: IDL.Text,
  });

  // Users ======================================
  const UserLibrary = IDL.Record({
    app_id: IDL.Nat,
    playtime_minute: IDL.Int,
    lastPlayed: IDL.Opt(IDL.Int),
    current_version: IDL.Text,
    created_at: IDL.Int,
  });

  const UserInteraction = IDL.Record({
    app_id: IDL.Principal,
    interaction: IDL.Variant({
      play: IDL.Null,
      view: IDL.Null,
      purchase: IDL.Null,
    }),
    created_at: IDL.Int,
  });

  const UserDemographics = IDL.Record({
    birth_date: IDL.Int,
    gender: IDL.Variant({
      other: IDL.Null,
      female: IDL.Null,
      male: IDL.Null,
    }),
    country: IDL.Text,
  });

  const User = IDL.Record({
    username: IDL.Text,
    display_name: IDL.Text,
    email: IDL.Text,
    image_url: IDL.Opt(IDL.Text),
    background_image_url: IDL.Opt(IDL.Text),
    total_playtime: IDL.Opt(IDL.Int),
    created_at: IDL.Int,
    user_demographics: UserDemographics,
    user_interactions: IDL.Opt(IDL.Vec(UserInteraction)),
    user_libraries: IDL.Opt(IDL.Vec(UserLibrary)),
    developer: IDL.Opt(Developer),
  });

  // User Friends ======================================
  const UserFriend = IDL.Record({
    user1_principal_id: IDL.Principal,
    user2_principal_id: IDL.Principal,
    status: IDL.Variant({
      accept: IDL.Null,
      pending: IDL.Null,
      decline: IDL.Null,
    }),
    created_at: IDL.Int,
  });

  const UpdateUser = IDL.Record({
    username: IDL.Text,
    display_name: IDL.Text,
    email: IDL.Text,
    image_url: IDL.Opt(IDL.Text),
    background_image_url: IDL.Opt(IDL.Text),
    user_demographics: UserDemographics,
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
    createUser: IDL.Func(
      [
        IDL.Text, // username
        IDL.Text, // display_name
        IDL.Text, // email
        IDL.Int, // birth_date
        IDL.Variant({
          // gender
          other: IDL.Null,
          female: IDL.Null,
          male: IDL.Null,
        }),
        IDL.Text, // country
      ],
      [Result],
      []
    ),
    updateUser: IDL.Func([UpdateUser], [Result], []),
    getUserByPrincipalId: IDL.Func([], [Result], []),
    searchUsersByPrefixWithLimit: IDL.Func(
      [IDL.Text, IDL.Nat],
      [
        IDL.Variant({
          ok: IDL.Vec(User), // Expecting a vector of User records
          err: Error,
        }),
      ],
      []
    ),
    isUsernameValid: IDL.Func(
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
  });
};
