export type AnnouncementStatus = {draft: null} | {published: null} | {archived: null}

export interface CreateAnnouncementInterface {
    headline: string;
    content: string;
    coverImage: string;
    status: AnnouncementStatus;
    pinned: boolean;
}