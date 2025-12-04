// DeveloperInterface.tsx
import type { Opt, Timestamp, UserId } from '../CoreInterface';

export type AnnouncementId = string;

export interface DeveloperInferface {
  developerWebsite: string;
  developerBio: string;
  totalFollower: bigint; // Nat
  joinedDate: Timestamp; // Core.Timestamp (ns)
  announcements?: Opt<AnnouncementId[]>; // ?[Text]
}

export interface DeveloperFollowInterface {
  developerId: UserId; // Core.UserId (Principal)
  followerId: UserId; // Core.UserId (Principal)
  createdAt: Timestamp; // Core.Timestamp
}

export type FollowsMap = Map<string, DeveloperFollowInterface>;
