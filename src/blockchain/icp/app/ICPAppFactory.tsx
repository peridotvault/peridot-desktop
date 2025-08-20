import { ICPAppTypes } from "./types/ICPAppTypes";
import { ICPPurchaseTypes } from "./types/ICPPurchaseTypes";
import { ICPAppId, ICPCoreResult } from "../utils/ICPTypesCore";

export const ICPAppFactory = ({ IDL }: { IDL: any }) => {
  const AppTypes = ICPAppTypes(IDL);
  const PurchaseTypes = ICPPurchaseTypes(IDL);

  return IDL.Service({
    createApp: IDL.Func(
      [AppTypes.CreateApp],
      [ICPCoreResult(AppTypes.App)],
      []
    ),
    updateApp: IDL.Func(
      [AppTypes.UpdateApp, ICPAppId],
      [ICPCoreResult(AppTypes.App)],
      []
    ),
    getAllApps: IDL.Func([], [ICPCoreResult(IDL.Vec(AppTypes.App))], ["query"]),
    getAppByDeveloperId: IDL.Func(
      [],
      [ICPCoreResult(IDL.Vec(AppTypes.App))],
      []
    ),
    getAppById: IDL.Func([ICPAppId], [ICPCoreResult(AppTypes.App)], ["query"]),
    getMyApps: IDL.Func([], [ICPCoreResult(IDL.Vec(AppTypes.App))], []),
    buyApp: IDL.Func([ICPAppId], [ICPCoreResult(PurchaseTypes.Purchase)], []),
  });
};
