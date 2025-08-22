import { ICPCoreResult } from "../utils/ICPTypesCore";
import { ICPAnnouncementTypes } from "./types/ICPAnnouncementType"

export const ICPAnnouncementFactory = ({IDL}: {IDL: any}) => {
    const AnnouncementTypes = ICPAnnouncementTypes(IDL);

    return IDL.Service({
        // CREATE
        createAnnouncement: IDL.Func(
            [AnnouncementTypes.CreateAnnouncement],
            [ICPCoreResult(AnnouncementTypes.Announcement)],
            []
        )
    })
}