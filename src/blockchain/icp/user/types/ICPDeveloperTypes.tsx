import { IDL as IDLNS } from "@dfinity/candid";
type CandidIDL = typeof IDLNS;

export const ICPDeveloperTypes = (IDL: CandidIDL) => {
  const DeveloperFollower = IDL.Record({
    createdAt: IDL.Int,
    userId: IDL.Principal,
  });

  const AnnouncementInteraction = IDL.Record({
    userId: IDL.Principal,
  });

  const AnnouncementComment = IDL.Record({
    createdAt: IDL.Int,
    userId: IDL.Principal,
    comment: IDL.Text,
  });

  const DeveloperAnnouncement = IDL.Record({
    announcementDislikes: IDL.Opt(IDL.Vec(AnnouncementInteraction)),
    content: IDL.Text,
    coverImage: IDL.Text,
    headline: IDL.Text,
    totalDislike: IDL.Int,
    createdAt: IDL.Int,
    totalLike: IDL.Int,
    announcementLikes: IDL.Opt(IDL.Vec(AnnouncementInteraction)),
    announcementComments: IDL.Opt(IDL.Vec(AnnouncementComment)),
  });

  const Developer = IDL.Record({
    developerWebsite: IDL.Text,
    developerBio: IDL.Text,
    totalFollower: IDL.Nat,
    joinedDate: IDL.Int,
    announcements: IDL.Opt(IDL.Vec(DeveloperAnnouncement)),
  });

  return {
    DeveloperFollower,
    AnnouncementInteraction,
    AnnouncementComment,
    DeveloperAnnouncement,
    Developer,
  };
};
