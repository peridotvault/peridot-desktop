export type AnnouncementStatus = {draft: null} | {published: null} | {archived: null}

export interface AnnouncementInterface {
    headline: string;
    content: string;
    coverImage: string;
    status: AnnouncementStatus;
    pinned: boolean;
}