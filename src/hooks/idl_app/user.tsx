export const userIdlFactory = ({ IDL }: { IDL: any }) => {
  return IDL.Service({
    createUser: IDL.Func(
      [
        IDL.Text, // username
        IDL.Text, // displayName
        IDL.Text, // email
        IDL.Nat, // age
        IDL.Variant({
          // gender
          other: IDL.Null,
          female: IDL.Null,
          male: IDL.Null,
        }),
        IDL.Text, // country
      ],
      [
        IDL.Variant({
          ok: IDL.Record({
            age: IDL.Nat,
            country: IDL.Text,
            username: IDL.Text,
            displayName: IDL.Text,
            createdAt: IDL.Int,
            email: IDL.Text,
            gender: IDL.Variant({
              other: IDL.Null,
              female: IDL.Null,
              male: IDL.Null,
            }),
            userBehaviors: IDL.Opt(
              IDL.Vec(
                IDL.Record({
                  behavior: IDL.Variant({
                    play: IDL.Null,
                    view: IDL.Null,
                    purchase: IDL.Null,
                  }),
                  appId: IDL.Nat,
                })
              )
            ),
            lastLogin: IDL.Int,
            isDeveloper: IDL.Bool,
            profileUrl: IDL.Opt(IDL.Text),
          }),
          err: IDL.Variant({
            InvalidInput: IDL.Text,
            NotFound: IDL.Text,
            ValidationError: IDL.Text,
            Unauthorized: IDL.Text,
            AlreadyExists: IDL.Text,
            StorageError: IDL.Text,
            InternalError: IDL.Text,
          }),
        }),
      ],
      []
    ),
    getUserByPrincipalId: IDL.Func(
      [],
      [
        IDL.Variant({
          ok: IDL.Record({
            age: IDL.Nat,
            country: IDL.Text,
            username: IDL.Text,
            displayName: IDL.Text,
            createdAt: IDL.Int,
            email: IDL.Text,
            gender: IDL.Variant({
              other: IDL.Null,
              female: IDL.Null,
              male: IDL.Null,
            }),
            userBehaviors: IDL.Opt(
              IDL.Vec(
                IDL.Record({
                  behavior: IDL.Variant({
                    play: IDL.Null,
                    view: IDL.Null,
                    purchase: IDL.Null,
                  }),
                  appId: IDL.Nat,
                })
              )
            ),
            lastLogin: IDL.Int,
            isDeveloper: IDL.Bool,
            profileUrl: IDL.Opt(IDL.Text),
          }),
          err: IDL.Variant({
            InvalidInput: IDL.Text,
            NotFound: IDL.Text,
            ValidationError: IDL.Text,
            Unauthorized: IDL.Text,
            AlreadyExists: IDL.Text,
            StorageError: IDL.Text,
            InternalError: IDL.Text,
          }),
        }),
      ],
      []
    ),
  });
};
