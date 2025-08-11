export type GenderVariant =
  | {
      male: null;
    }
  | {
      female: null;
    }
  | {
      other: null;
    };

export interface MetadataUpdateUser {
  username: string;
  displayName: string;
  email: string;
  imageUrl: string | null;
  backgroundImageUrl: string | null;
  userDemographics: {
    birthDate: string;
    gender: GenderVariant;
    country: string;
  };
}

export interface MetadataUser {
  ok: {
    username: string;
    displayName: string;
    description: string;
    link: string;
    email: string;
    imageUrl: string | null;
    backgroundImageUrl: string | null;
    totalPlaytime: number;
    createdAt: string;
    userDemographics: {
      birthDate: string;
      gender: GenderVariant;
      country: string;
    };
    userInteractions:
      | [
          {
            appId: string;
            interaction: string;
            createdAt: string;
          }
        ]
      | null;
    userLibraries: [UserLibrary] | null;
    developer: [];
  };
}

interface UserLibrary {
  appId: number;
  playtimeMinute: number;
  lastPlayed: string | null;
  currentVersion: string;
  createdAt: string;
}

// interface UserDataInterface {
//   ok: {
//     username: string;
//     displayName: string;
//     description: string;
//     link: string;
//     email: string;
//     imageUrl: string;
//     backgroundImageUrl: string;
//     totalPlaytime: number;
//     createdAt: string;
//     userDemographics: {
//       birthDate: string;
//       gender: string;
//       country: string;
//     };
//     userInteractions: [
//       {
//         appId: string;
//         interaction: string;
//         createdAt: string;
//       }
//     ];
//     userLibraries: string;
//     developer: [];
//   };
// }
