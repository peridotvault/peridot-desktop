import { Timestamp, Opt, AppId, UserId } from "../CoreInterface";

export type AnnouncementStatus = {draft: null} | {published: null} | {archived: null}

export interface CreateAnnouncementInterface {
    appId: AppId;
    developerId: UserId;
    headline: string;
    content: string;
    coverImage: string;
    status: AnnouncementStatus;
    pinned: boolean;
    createdAt: Timestamp
}

export interface AnnouncementInterface {
    headline: string;
    content: string;
    coverImage: string;
    status: AnnouncementStatus;
    pinned: boolean;
    createdAt: Timestamp;
    updatedAt: Opt<Timestamp>;
    publishAt: Opt<Timestamp>;
}