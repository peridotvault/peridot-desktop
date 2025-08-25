import { IDL as IDLNS } from "@dfinity/candid";
import { ICPAnnouncementId, ICPAnnouncementStatus, ICPAppId, ICPDeveloperId, ICPTimestamp } from "../../utils/ICPTypesCore";

type CandidIDL = typeof IDLNS;

export const ICPAnnouncementTypes = (IDL: CandidIDL) => {
    const DTOAppAnnouncement = IDL.Record({
        coverImage: IDL.Text,
        headline: IDL.Text,
        content: IDL.Text,
        pinned: IDL.Bool,
        status: ICPAnnouncementStatus,
    });

    const AppAnnouncement = IDL.Record({
        announcementId: ICPAnnouncementId,
        appId: ICPAppId,
        developerId: ICPDeveloperId,
        coverImage: IDL.Text,
        headline: IDL.Text,
        content: IDL.Text,
        pinned: IDL.Bool,
        status: ICPAnnouncementStatus,
        createdAt: ICPTimestamp,
        updatedAt: IDL.Opt(ICPTimestamp),
    });

    const CreateAnnouncementInteraction = IDL.Record({
        interactionType: IDL.Text,
        comment: IDL.Text,
    });

    const AnnouncementInteraction = IDL.Record({
        announcementId: ICPAnnouncementId,
        interactionType: IDL.Text,
        comment: IDL.Text,
        createdAt: ICPTimestamp,
    });

    return { DTOAppAnnouncement, AppAnnouncement, CreateAnnouncementInteraction, AnnouncementInteraction };
};
