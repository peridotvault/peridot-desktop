import { ICPAppTypes } from "./types/ICPAppTypes";
import { ICPPurchaseTypes } from "./types/ICPPurchaseTypes";
import { ICPAppId, ICPCoreResult } from "../utils/ICPTypesCore";

export const ICPAppFactory = ({ IDL }: { IDL: any }) => {
  const AppTypes = ICPAppTypes(IDL);
  const PurchaseTypes = ICPPurchaseTypes(IDL);

  return IDL.Service({
    // CREATE
    createApp: IDL.Func(
      [AppTypes.CreateApp],
      [ICPCoreResult(AppTypes.App)],
      []
    ),
    // GET
    getAllApps: IDL.Func([], [ICPCoreResult(IDL.Vec(AppTypes.App))], ["query"]),
    getAppByDeveloperId: IDL.Func(
      [],
      [ICPCoreResult(IDL.Vec(AppTypes.App))],
      []
    ),
    getAppById: IDL.Func([ICPAppId], [ICPCoreResult(AppTypes.App)], ["query"]),
    getMyApps: IDL.Func([], [ICPCoreResult(IDL.Vec(AppTypes.App))], []),
    buyApp: IDL.Func([ICPAppId], [ICPCoreResult(PurchaseTypes.Purchase)], []),

    // UPDATE
    updateApp: IDL.Func(
      [AppTypes.UpdateApp, ICPAppId],
      [ICPCoreResult(AppTypes.App)],
      []
    ),

    // DELETE
    deleteApp: IDL.Func([ICPAppId], [ICPCoreResult(IDL.Text)], []),
  });
};
