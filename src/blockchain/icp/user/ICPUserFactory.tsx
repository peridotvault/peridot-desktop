import { ICPCoreResult } from "../utils/ICPTypesCore";
import { ICPFriendTypes } from "./types/ICPFriendTypes";
import { ICPUserTypes } from "./types/ICPUserTypes";

export const ICPUserFactory = ({ IDL }: { IDL: any }) => {
  const UserTypes = ICPUserTypes(IDL);
  const FriendTypes = ICPFriendTypes(IDL);

  return IDL.Service({
    // USER
    createUser: IDL.Func(
      [UserTypes.CreateUser],
      [ICPCoreResult(UserTypes.User)],
      []
    ),
    updateUser: IDL.Func(
      [UserTypes.UpdateUser],
      [ICPCoreResult(UserTypes.User)],
      []
    ),
    getUserByPrincipalId: IDL.Func([], [ICPCoreResult(UserTypes.User)], []),
    getUsersByPrefixWithLimit: IDL.Func(
      [IDL.Text, IDL.Nat],
      [ICPCoreResult(UserTypes.User)],
      []
    ),
    getIsUsernameValid: IDL.Func([IDL.Text], [ICPCoreResult(IDL.Bool)], []),

    // FRIEND
    getFriendRequestList: IDL.Func(
      [],
      [ICPCoreResult(FriendTypes.UserFriend)],
      []
    ),
    getFriendList: IDL.Func([], [ICPCoreResult(FriendTypes.UserFriend)], []),

    // DEVELOPER
    createDeveloperProfile: IDL.Func(
      [IDL.Text, IDL.Text],
      [ICPCoreResult(UserTypes.User)],
      []
    ),
    getAmIDeveloper: IDL.Func([], [IDL.Bool], []),
  });
};
