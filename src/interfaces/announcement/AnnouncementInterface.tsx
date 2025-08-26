import { Timestamp, Opt, AppId, AnnouncementId, UserId } from '../CoreInterface';

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

export interface AnnouncementInteractionInterface {
  announcementId: AnnouncementId;
  userId: UserId;
  interactionType: Opt<AnnouncementInteractionType>;
  comment: Opt<string>;
  createdAt: Timestamp;
}
