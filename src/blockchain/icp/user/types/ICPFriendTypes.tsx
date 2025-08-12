import { IDL as IDLNS } from "@dfinity/candid";
type CandidIDL = typeof IDLNS;

export const ICPFriendTypes = (IDL: CandidIDL) => {
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

  return {
    UserFriend,
  };
};
