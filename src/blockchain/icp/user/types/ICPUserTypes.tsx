import { IDL as IDLNS } from '@dfinity/candid';
import { ICPDeveloperTypes } from './ICPDeveloperTypes';
type CandidIDL = typeof IDLNS;

export const ICPUserTypes = (IDL: CandidIDL) => {
  const Country = IDL.Text;

  // Users ======================================
  const UserLibrary = IDL.Record({
    appId: IDL.Nat,
    playtimeMinute: IDL.Nat,
    lastPlayed: IDL.Opt(IDL.Int),
    currentVersion: IDL.Text,
    createdAt: IDL.Int,
  });

  const Interaction = IDL.Variant({
    view: IDL.Null,
    purchase: IDL.Null,
    play: IDL.Null,
  });

  const UserInteraction = IDL.Record({
    appId: IDL.Nat,
    interaction: Interaction,
    createdAt: IDL.Int,
  });

  const Gender = IDL.Variant({
    male: IDL.Null,
    female: IDL.Null,
    other: IDL.Null,
  });

  const UserDemographics = IDL.Record({
    birthDate: IDL.Int,
    gender: Gender,
    country: IDL.Text,
  });

  const User = IDL.Record({
    username: IDL.Text,
    displayName: IDL.Text,
    email: IDL.Text,
    imageUrl: IDL.Opt(IDL.Text),
    backgroundImageUrl: IDL.Opt(IDL.Text),
    totalPlaytime: IDL.Opt(IDL.Int),
    createdAt: IDL.Int,
    userDemographics: UserDemographics,
    userInteractions: IDL.Opt(IDL.Vec(UserInteraction)),
    userLibraries: IDL.Opt(IDL.Vec(UserLibrary)),
    developer: IDL.Opt(ICPDeveloperTypes(IDL).Developer),
  });

  // DTO's ======================================
  const UpdateUser = IDL.Record({
    username: IDL.Text,
    displayName: IDL.Text,
    email: IDL.Text,
    imageUrl: IDL.Opt(IDL.Text),
    backgroundImageUrl: IDL.Opt(IDL.Text),
    userDemographics: UserDemographics,
  });

  const CreateUser = IDL.Record({
    username: IDL.Text,
    displayName: IDL.Text,
    email: IDL.Text,
    birthDate: IDL.Int,
    gender: Gender,
    country: Country,
  });

  return {
    Country,
    UserLibrary,
    Interaction,
    UserInteraction,
    Gender,
    UserDemographics,
    User,
    UpdateUser,
    CreateUser,
  };
};
