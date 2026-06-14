import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { useAuth } from './AuthContext';
import { fetchProfile, saveOnboarding } from '../lib/profile';
import type { OnboardingData, Profile } from '../types/profile';

type ProfileContextValue = {
  profile: Profile | null;
  isLoading: boolean;
  needsOnboarding: boolean;
  hasCat: boolean;
  completeOnboarding: (data: OnboardingData) => Promise<string | null>;
  refreshProfile: () => Promise<void>;
};

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const nextProfile = await fetchProfile(user.id);
      setProfile(nextProfile);
    } catch {
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const completeOnboarding = useCallback(
    async (data: OnboardingData) => {
      if (!user) {
        return 'you must be signed in to continue.';
      }

      const { profile: nextProfile, error } = await saveOnboarding(user.id, data);

      if (error) {
        return error.toLowerCase();
      }

      setProfile(nextProfile);
      return null;
    },
    [user],
  );

  const needsOnboarding = Boolean(user && (!profile || !profile.onboarding_completed));
  const hasCat = profile?.has_cat === true;

  const value = useMemo(
    () => ({
      profile,
      isLoading,
      needsOnboarding,
      hasCat,
      completeOnboarding,
      refreshProfile,
    }),
    [profile, isLoading, needsOnboarding, hasCat, completeOnboarding, refreshProfile],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const context = useContext(ProfileContext);

  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }

  return context;
}
