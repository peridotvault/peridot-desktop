import { ICPAppTypes } from "./types/ICPAppTypes";
import { ICPPurchaseTypes } from "./types/ICPPurchaseTypes";
import { ICPCoreResult } from "../utils/ICPTypesCore";

export const ICPAppFactory = ({ IDL }: { IDL: any }) => {
  const AppTypes = ICPAppTypes(IDL);
  const PurchaseTypes = ICPPurchaseTypes(IDL);

  return IDL.Service({
    createApp: IDL.Func(
      [AppTypes.CreateApp],
      [ICPCoreResult(AppTypes.App)],
      []
    ),
    getAllApps: IDL.Func([], [ICPCoreResult(IDL.Vec(AppTypes.App))], ["query"]),
    getAppById: IDL.Func(
      [IDL.Nat],
      [ICPCoreResult(IDL.Vec(AppTypes.App))],
      ["query"]
    ),
    getMyApps: IDL.Func([], [ICPCoreResult(IDL.Vec(AppTypes.App))], []),
    buyApp: IDL.Func([IDL.Nat], [ICPCoreResult(PurchaseTypes.Purchase)], []),
  });
};
