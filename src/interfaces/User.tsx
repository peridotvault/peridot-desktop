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

export interface MetadataUser {
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
