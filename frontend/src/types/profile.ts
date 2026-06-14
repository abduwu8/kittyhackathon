export type Profile = {
  id: string;
  has_cat: boolean | null;
  onboarding_completed: boolean;
  user_name: string | null;
  favorite_cat_breed: string | null;
  cat_name: string | null;
  cat_breed: string | null;
  cat_age: string | null;
  cat_gender: string | null;
  cat_notes: string | null;
  cat_avatar: string | null;
  created_at: string;
  updated_at: string;
};

export type ProfileUpdateData = {
  cat_name: string;
  cat_breed: string;
  cat_age: string | null;
  cat_gender: string | null;
  cat_notes: string | null;
  cat_avatar: string;
};

export type UserProfileUpdateData = {
  user_name: string;
  favorite_cat_breed: string;
  cat_avatar: string;
};

export type OnboardingData = {
  hasCat: boolean;
  userName?: string;
  favoriteCatBreed?: string;
  userAvatar?: string;
  catName?: string;
  catBreed?: string;
  catAge?: string;
  catGender?: string;
  catNotes?: string;
};
