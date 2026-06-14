import { Cat, Save, UserRound } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Alert, Image, StyleSheet, Text, View } from 'react-native';

import { CatAvatarPicker } from '../../components/catCare/CatAvatarPicker';
import { DashboardPageHeader } from '../../components/dashboard/DashboardPageHeader';
import { DashboardSaveButton } from '../../components/dashboard/DashboardSaveButton';
import { DashboardSection } from '../../components/dashboard/DashboardSection';
import { dashboardStyles } from '../../components/dashboard/dashboardStyles';
import { ProfileField } from '../../components/profile/ProfileField';
import { useAuth } from '../../contexts/AuthContext';
import { useProfile } from '../../contexts/ProfileContext';
import {
  DEFAULT_CAT_AVATAR_ID,
  getCatAvatarSource,
  isCatAvatarId,
  type CatAvatarId,
} from '../../lib/catAvatars';
import { updateUserProfile } from '../../lib/profile';
import { colors } from '../../theme/colors';
import { fonts, lowercase } from '../../theme/fonts';

const HERO_AVATAR_SIZE = 96;

type UserProfileErrors = {
  userName?: string;
  favoriteCatBreed?: string;
};

export function DashboardUserProfilePanel() {
  const { user } = useAuth();
  const { profile, refreshProfile } = useProfile();
  const [userName, setUserName] = useState(profile?.user_name ?? '');
  const [favoriteCatBreed, setFavoriteCatBreed] = useState(profile?.favorite_cat_breed ?? '');
  const [profileAvatar, setProfileAvatar] = useState<CatAvatarId>(
    isCatAvatarId(profile?.cat_avatar) ? profile.cat_avatar : DEFAULT_CAT_AVATAR_ID,
  );
  const [errors, setErrors] = useState<UserProfileErrors>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setUserName(profile?.user_name ?? '');
    setFavoriteCatBreed(profile?.favorite_cat_breed ?? '');
    setProfileAvatar(
      isCatAvatarId(profile?.cat_avatar) ? profile.cat_avatar : DEFAULT_CAT_AVATAR_ID,
    );
  }, [profile]);

  const handleSave = async () => {
    if (!user) {
      Alert.alert('save failed', 'you must be signed in to save your profile.');
      return;
    }

    const nextErrors: UserProfileErrors = {};

    if (!userName.trim()) {
      nextErrors.userName = 'your name is required.';
    }

    if (!favoriteCatBreed.trim()) {
      nextErrors.favoriteCatBreed = 'favorite breed is required.';
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSaving(true);

    const { error } = await updateUserProfile(user.id, {
      user_name: userName.trim(),
      favorite_cat_breed: favoriteCatBreed.trim(),
      cat_avatar: profileAvatar,
    });

    setIsSaving(false);

    if (error) {
      Alert.alert('save failed', error.toLowerCase());
      return;
    }

    await refreshProfile();
  };

  const displayName = userName.trim() || 'your profile';

  return (
    <View style={dashboardStyles.panel}>
      <DashboardPageHeader
        title="your profile"
        subtitle="keep your details up to date."
      />

      <View style={styles.heroCard}>
        <View style={styles.heroAvatarWrap}>
          <Image
            source={getCatAvatarSource(profileAvatar)}
            style={styles.heroAvatar}
            resizeMode="cover"
          />
        </View>
        <Text style={styles.heroName}>{displayName}</Text>
        {favoriteCatBreed.trim() ? (
          <Text style={styles.heroMeta}>loves {favoriteCatBreed.trim()}</Text>
        ) : null}
      </View>

      <DashboardSection icon={Cat} title="Profile Photo">
        <CatAvatarPicker
          value={profileAvatar}
          onChange={setProfileAvatar}
          helperText="choose a cat as your profile picture"
        />
      </DashboardSection>

      <DashboardSection icon={UserRound} title="about you">
        <View style={dashboardStyles.form}>
          <ProfileField
            icon={UserRound}
            label="name"
            value={userName}
            onChangeText={setUserName}
            placeholder="alex"
            error={errors.userName}
          />
          <ProfileField
            icon={Cat}
            label="favorite cat breed"
            value={favoriteCatBreed}
            onChangeText={setFavoriteCatBreed}
            placeholder="siamese, maine coon, tabby..."
            error={errors.favoriteCatBreed}
          />
        </View>
      </DashboardSection>

      <DashboardSaveButton
        label="save profile"
        icon={Save}
        onPress={handleSave}
        isLoading={isSaving}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 28,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.sandBorder,
  },
  heroAvatarWrap: {
    padding: 4,
    borderRadius: (HERO_AVATAR_SIZE + 8) / 2,
    borderWidth: 2,
    borderColor: 'rgba(139, 94, 60, 0.2)',
    backgroundColor: colors.background,
  },
  heroAvatar: {
    width: HERO_AVATAR_SIZE,
    height: HERO_AVATAR_SIZE,
    borderRadius: HERO_AVATAR_SIZE / 2,
    backgroundColor: colors.sand,
  },
  heroName: {
    fontFamily: fonts.bold,
    fontSize: 22,
    color: colors.ink,
    letterSpacing: -0.3,
    ...lowercase,
  },
  heroMeta: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.stone,
    ...lowercase,
  },
});
