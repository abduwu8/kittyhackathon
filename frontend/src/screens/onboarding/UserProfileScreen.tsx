import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AuthAnimatedSection } from '../../components/auth/AuthAnimatedSection';
import { AuthButton } from '../../components/auth/AuthButton';
import { AuthInput } from '../../components/auth/AuthInput';
import { CatAvatarPicker } from '../../components/catCare/CatAvatarPicker';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import { DEFAULT_CAT_AVATAR_ID, type CatAvatarId } from '../../lib/catAvatars';
import { fonts, lowercase } from '../../theme/fonts';

type UserProfileDetails = {
  userName: string;
  favoriteCatBreed: string;
  userAvatar: CatAvatarId;
};

type UserProfileScreenProps = {
  onSubmit: (details: UserProfileDetails) => void;
  onBack: () => void;
  isSubmitting: boolean;
  error: string | null;
};

export function UserProfileScreen({
  onSubmit,
  onBack,
  isSubmitting,
  error,
}: UserProfileScreenProps) {
  const [userName, setUserName] = useState('');
  const [favoriteCatBreed, setFavoriteCatBreed] = useState('');
  const [userAvatar, setUserAvatar] = useState<CatAvatarId>(DEFAULT_CAT_AVATAR_ID);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = () => {
    setValidationError(null);

    if (!userName.trim() || !favoriteCatBreed.trim()) {
      setValidationError('your name and favorite breed are required.');
      return;
    }

    onSubmit({
      userName: userName.trim(),
      favoriteCatBreed: favoriteCatBreed.trim(),
      userAvatar,
    });
  };

  const displayError = validationError ?? error;

  return (
    <OnboardingLayout>
      <AuthAnimatedSection delay={0}>
        <View style={styles.header}>
          <Text style={styles.title}>tell us about you</Text>
          <Text style={styles.subtitle}>we&apos;ll save this to your profile</Text>
        </View>
      </AuthAnimatedSection>

      <AuthAnimatedSection delay={120}>
        <View style={styles.form}>
          <AuthInput
            label="your name"
            value={userName}
            onChangeText={setUserName}
            placeholder="alex"
            autoComplete="name"
          />
          <AuthInput
            label="favorite cat breed"
            value={favoriteCatBreed}
            onChangeText={setFavoriteCatBreed}
            placeholder="siamese, maine coon, tabby..."
          />

          <View style={styles.avatarSection}>
            <Text style={styles.avatarLabel}>profile photo</Text>
            <CatAvatarPicker
              value={userAvatar}
              onChange={setUserAvatar}
              helperText="choose a cat as your profile picture"
            />
          </View>

          {displayError ? <Text style={styles.error}>{displayError}</Text> : null}

          <AuthButton title="save and continue" onPress={handleSubmit} isLoading={isSubmitting} />
          <AuthButton
            title="back"
            variant="secondary"
            onPress={onBack}
            disabled={isSubmitting}
          />
        </View>
      </AuthAnimatedSection>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 8,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 28,
    color: '#2B2521',
    ...lowercase,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: '#6E655D',
    ...lowercase,
  },
  form: {
    gap: 16,
  },
  avatarSection: {
    gap: 10,
  },
  avatarLabel: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: '#2B2521',
    ...lowercase,
  },
  error: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: '#B85C5C',
    ...lowercase,
  },
});
