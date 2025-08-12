import { IDL as IDLNS } from "@dfinity/candid";
import { ICPAppId, ICPTimestamp, ICPUserId } from "../../utils/ICPTypesCore";
type CandidIDL = typeof IDLNS;

export const ICPPurchaseTypes = (IDL: CandidIDL) => {
  const Purchase = IDL.Record({
    userId: ICPUserId,
    appId: ICPAppId,
    amount: IDL.Nat,
    purchasedAt: ICPTimestamp,
    txIndex: IDL.Opt(IDL.Nat),
    memo: IDL.Opt(IDL.Vec(IDL.Nat8)),
  });

  return {
    Purchase,
  };
};
