import { ICPAppTypes } from "./types/ICPAppTypes";
import { ICPPurchaseTypes } from "./types/ICPPurchaseTypes";
import { ICPAppId, ICPCoreResult } from "../utils/ICPTypesCore";
import { ICPAnnouncementTypes } from "./types/ICPAnnouncementType";

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

export const ICPAnnouncementFactory = ({ IDL }: { IDL: any }) => {
  const AnnouncementTypes = ICPAnnouncementTypes(IDL);

  return IDL.Service({
    // CREATE
    createAnnouncement: IDL.Func(
      [ICPAppId, AnnouncementTypes.DTOAppAnnouncement],
      [ICPCoreResult(AnnouncementTypes.AppAnnouncement)],
      []
    ),
    // GET
    getAnnouncementByAppId: IDL.Func(
      [],
      [ICPCoreResult(IDL.Vec(AnnouncementTypes.AppAnnouncement))],
      []
    )
  });
};