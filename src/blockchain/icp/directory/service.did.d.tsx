import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type AnnouncementId = string;
export type ApiError =
  | { InvalidInput: string }
  | { NotFound: string }
  | { ValidationError: string }
  | { NotAuthorized: string }
  | { Unauthorized: string }
  | { AlreadyExists: string }
  | { StorageError: string }
  | { InternalError: string };
export type ApiResponse = { ok: UserType } | { err: ApiError };
export type ApiResponse_1 = { ok: null } | { err: ApiError };
export type ApiResponse_2 = { ok: DeveloperFollow } | { err: ApiError };
export type ApiResponse_3 = { ok: FriendType } | { err: ApiError };
export type ApiResponse_4 = { ok: Array<UserType> } | { err: ApiError };
export type ApiResponse_5 = { ok: boolean } | { err: ApiError };
export type ApiResponse_6 = { ok: Array<FriendType> } | { err: ApiError };
export type ApiResponse_7 = { ok: DeveloperType } | { err: ApiError };
export type AppId = bigint;
export type Country = string;
export interface CreateUser {
  country: Country;
  username: Username;
  birthDate: Timestamp;
  displayName: string;
  email: string;
  gender: Gender;
}
export interface Developer {
  developerWebsite: string;
  joinedDate: Timestamp;
  totalFollower: bigint;
  developerBio: string;
  announcements: [] | [Array<AnnouncementId>];
}
export interface DeveloperFollow {
  createdAt: Timestamp;
  developerId: UserId;
  followerId: UserId;
}
export interface DeveloperType {
  developerWebsite: string;
  joinedDate: Timestamp;
  totalFollower: bigint;
  developerBio: string;
  announcements: [] | [Array<AnnouncementId>];
}
export interface FriendType {
  status: Status;
  createdAt: Timestamp;
  user1Id: UserId;
  user2Id: UserId;
}
export type Gender = { other: null } | { female: null } | { male: null };
export type Interaction = { play: null } | { view: null } | { purchase: null };
export type Status = { accept: null } | { pending: null } | { decline: null };
export type Timestamp = bigint;
export interface UpdateUser {
  username: Username;
  backgroundImageUrl: [] | [string];
  displayName: string;
  email: string;
  imageUrl: [] | [string];
  userDemographics: UserDemographic;
}
export interface UserDemographic {
  country: Country;
  birthDate: Timestamp;
  gender: Gender;
}
export type UserId = Principal;
export interface UserInteraction {
  appId: AppId;
  interaction: Interaction;
  createdAt: Timestamp;
}
export interface UserLibrary {
  lastPlayed: [] | [Timestamp];
  appId: AppId;
  createdAt: Timestamp;
  playtimeMinute: bigint;
  currentVersion: Version;
}
export interface UserType {
  username: Username;
  backgroundImageUrl: [] | [string];
  userInteractions: [] | [Array<UserInteraction>];
  displayName: string;
  createdAt: Timestamp;
  email: string;
  imageUrl: [] | [string];
  totalPlaytime: [] | [bigint];
  userDemographics: UserDemographic;
  userLibraries: [] | [Array<UserLibrary>];
  developer: [] | [Developer];
}
export type Username = string;
export type Version = string;
export interface _SERVICE {
  createDeveloperProfile: ActorMethod<[string, string], ApiResponse>;
  createSendFriendRequest: ActorMethod<[Principal], ApiResponse_3>;
  createUser: ActorMethod<[CreateUser], ApiResponse>;
  deleteFriend: ActorMethod<[Principal], ApiResponse_1>;
  getAmIDeveloper: ActorMethod<[], boolean>;
  getDeveloperProfile: ActorMethod<[Principal], ApiResponse_7>;
  getFriendList: ActorMethod<[], ApiResponse_6>;
  getFriendRequestList: ActorMethod<[], ApiResponse_6>;
  getIsUsernameValid: ActorMethod<[string], ApiResponse_5>;
  getUserByPrincipalId: ActorMethod<[UserId], ApiResponse>;
  getUserByUsername: ActorMethod<[string], ApiResponse>;
  getUserData: ActorMethod<[], ApiResponse>;
  getUsersByPrefixWithLimit: ActorMethod<[string, bigint], ApiResponse_4>;
  isUserDeveloper: ActorMethod<[Principal], boolean>;
  updateAcceptFriendRequest: ActorMethod<[Principal], ApiResponse_3>;
  updateFollowDeveloper: ActorMethod<[Principal], ApiResponse_2>;
  updateUnfollowDeveloper: ActorMethod<[Principal], ApiResponse_1>;
  updateUser: ActorMethod<[UpdateUser], ApiResponse>;
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
