import { supabase } from './supabase';
import type { OnboardingData, Profile, ProfileUpdateData, UserProfileUpdateData } from '../types/profile';

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateProfile(
  userId: string,
  profile: ProfileUpdateData,
): Promise<{ profile: Profile | null; error: string | null }> {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      ...profile,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    return { profile: null, error: error.message };
  }

  return { profile: data, error: null };
}

export async function updateUserProfile(
  userId: string,
  profile: UserProfileUpdateData,
): Promise<{ profile: Profile | null; error: string | null }> {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      user_name: profile.user_name,
      favorite_cat_breed: profile.favorite_cat_breed,
      cat_avatar: profile.cat_avatar,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    return { profile: null, error: error.message };
  }

  return { profile: data, error: null };
}

export async function saveOnboarding(
  userId: string,
  onboarding: OnboardingData,
): Promise<{ profile: Profile | null; error: string | null }> {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      has_cat: onboarding.hasCat,
      onboarding_completed: true,
      user_name: onboarding.hasCat ? null : onboarding.userName ?? null,
      favorite_cat_breed: onboarding.hasCat ? null : onboarding.favoriteCatBreed ?? null,
      cat_name: onboarding.hasCat ? onboarding.catName ?? null : null,
      cat_breed: onboarding.hasCat ? onboarding.catBreed ?? null : null,
      cat_age: onboarding.hasCat ? onboarding.catAge ?? null : null,
      cat_gender: onboarding.hasCat ? onboarding.catGender ?? null : null,
      cat_notes: onboarding.hasCat ? onboarding.catNotes ?? null : null,
      cat_avatar: onboarding.hasCat ? 'cat1' : onboarding.userAvatar ?? 'cat1',
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    return { profile: null, error: error.message };
  }

  return { profile: data, error: null };
}
