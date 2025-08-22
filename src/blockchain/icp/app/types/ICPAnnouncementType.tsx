import { IDL as IDLNS } from "@dfinity/candid";
import { ICPAnnouncementStatus, ICPAppId, ICPDeveloperId, ICPTimestamp } from "../../utils/ICPTypesCore";

type CandidIDL = typeof IDLNS;

export const ICPAnnouncementTypes = (IDL: CandidIDL) => {
    const Announcement = IDL.Record({
        appId: ICPAppId,
        developerId: ICPDeveloperId,
        coverImage: IDL.Text,
        headline: IDL.Text,
        content: IDL.Text,
        pinned: IDL.Bool,
        status: ICPAnnouncementStatus,
        createdAt: ICPTimestamp,
        updatedAt: IDL.Opt(ICPTimestamp),
        publishAt: IDL.Opt(ICPTimestamp)
    })

    return {Announcement}
}