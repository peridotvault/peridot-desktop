import { IDL as IDLNS } from '@dfinity/candid';
import {
  ICPAnnouncementId,
  ICPAnnouncementStatus,
  ICPAppId,
  ICPDeveloperId,
  ICPUserId,
  ICPTimestamp,
  ICPAnnouncementInteraction,
} from '../../utils/ICPTypesCore';

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

  const AnnouncementInteractionInterface = IDL.Record({
    announcementId: ICPAnnouncementId,
    userId: ICPUserId,
    interactionType: IDL.Opt(ICPAnnouncementInteraction),
    comment: IDL.Opt(IDL.Text),
    createdAt: ICPTimestamp,
  });

  return { DTOAppAnnouncement, AppAnnouncement, AnnouncementInteractionInterface };
};
