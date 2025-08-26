// UserInterface.tsx
import type {
  Timestamp,
  AppId,
  UserId,
  Version,
  Country,
  ApiResponse,
  Opt,
} from './../CoreInterface';
import { DeveloperInferface } from './DeveloperInterface';
// SESUAIKAN path ini dengan lokasi definisi Developer kamu

/** ===== Aliases ===== */
export type Username = string;

/** ===== Variants (Candid) ===== */
export type Gender = { male: null } | { female: null } | { other: null };

export type Interaction = { view: null } | { purchase: null } | { play: null };

/** ===== Records ===== */
export interface UserDemographicInterface {
  birthDate: Timestamp;
  gender: Gender;
  country: Country;
}

export interface UserInteractionInterface {
  appId: AppId;
  interaction: Interaction;
  createdAt: Timestamp;
}

export interface UserLibraryInterface {
  appId: AppId;
  playtimeMinute: bigint; // Nat
  lastPlayed: Opt<Timestamp>;
  currentVersion: Version;
  createdAt: Timestamp;
}

export interface UserInterface {
  username: Username;
  displayName: string;
  email: string;
  imageUrl: Opt<string>;
  backgroundImageUrl: Opt<string>;
  totalPlaytime: Opt<bigint>; // Nat?
  createdAt: Timestamp;
  userDemographics: UserDemographicInterface;
  userInteractions: Opt<UserInteractionInterface[]>;
  userLibraries: Opt<UserLibraryInterface[]>;
  developer: Opt<DeveloperInferface>;
}

/** ===== DTOs ===== */
export interface CreateUserInterface {
  username: Username;
  displayName: string;
  email: string;
  birthDate: Timestamp;
  gender: Gender;
  country: Country;
}

export interface UpdateUserInterface {
  username: Username;
  displayName: string;
  email: string;
  imageUrl: Opt<string>;
  backgroundImageUrl: Opt<string>;
  userDemographics: UserDemographicInterface;
}

/** ===== Collections (opsional) ===== */
export type UsersMap = Map<UserId, UserInterface>;

/** ===== ApiResponse shortcuts (opsional) ===== */
export type UserResult = ApiResponse<UserInterface>;
export type UsersResult = ApiResponse<UserInterface[]>;
