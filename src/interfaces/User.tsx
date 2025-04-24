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
  display_name: string;
  email: string;
  image_url: string | null;
  background_image_url: string | null;
  user_demographics: {
    birth_date: string;
    gender: GenderVariant;
    country: string;
  };
}

export interface MetadataUser {
  ok: {
    username: string;
    display_name: string;
    description: string;
    link: string;
    email: string;
    image_url: string | null;
    background_image_url: string | null;
    total_playtime: number;
    created_at: string;
    user_demographics: {
      birth_date: string;
      gender: GenderVariant;
      country: string;
    };
    user_interactions: [
      {
        app_id: string;
        interaction: string;
        created_at: string;
      }
    ];
    user_libraries: string;
    developer: [];
  };
}

// interface UserDataInterface {
//   ok: {
//     username: string;
//     display_name: string;
//     description: string;
//     link: string;
//     email: string;
//     image_url: string;
//     background_image_url: string;
//     total_playtime: number;
//     created_at: string;
//     user_demographics: {
//       birth_date: string;
//       gender: string;
//       country: string;
//     };
//     user_interactions: [
//       {
//         app_id: string;
//         interaction: string;
//         created_at: string;
//       }
//     ];
//     user_libraries: string;
//     developer: [];
//   };
// }
