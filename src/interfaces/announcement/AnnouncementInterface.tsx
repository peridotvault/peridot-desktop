import { Timestamp, Opt, AppId, AnnouncementId } from "../CoreInterface";

export type AnnouncementStatus = { draft: null } | { published: null } | { archived: null };
export type AnnouncementInteractionType = { like: null } | { dislike: null };

export interface CreateAnnouncementInterface {
    headline: string;
    content: string;
    coverImage: string;
    status: AnnouncementStatus;
    pinned: boolean;
}

export interface AnnouncementInterface {
    announcementId: AnnouncementId;
    appId: AppId;
    headline: string;
    content: string;
    coverImage: string;
    status: AnnouncementStatus;
    pinned: boolean;
    createdAt: Timestamp;
    updatedAt: Opt<Timestamp>;
    publishAt: Opt<Timestamp>;
}

export interface AnnouncementInteraction {
    announcementId: AnnouncementId;
    interactionType: AnnouncementInteractionType;
    comment: string;
    createdAt: Timestamp;
}
