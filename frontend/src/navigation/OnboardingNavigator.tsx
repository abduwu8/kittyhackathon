import { MotiView } from 'moti';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { useProfile } from '../contexts/ProfileContext';
import { CatDetailsScreen } from '../screens/onboarding/CatDetailsScreen';
import { HasCatScreen } from '../screens/onboarding/HasCatScreen';
import { UserProfileScreen } from '../screens/onboarding/UserProfileScreen';

export function OnboardingNavigator() {
  const { completeOnboarding } = useProfile();
  const [step, setStep] = useState<'has-cat' | 'cat-details' | 'user-details'>('has-cat');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const finishOnboarding = async (data: Parameters<typeof completeOnboarding>[0]) => {
    setError(null);
    setIsSubmitting(true);

    const message = await completeOnboarding(data);

    if (message) {
      setError(message);
    }

    setIsSubmitting(false);
  };

  return (
    <MotiView
      key={step}
      style={styles.screen}
      from={{ opacity: 0, translateY: 12 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{
        type: 'timing',
        duration: 400,
      }}
    >
      {step === 'cat-details' ? (
        <CatDetailsScreen
          onSubmit={(details) =>
            finishOnboarding({
              hasCat: true,
              catName: details.catName,
              catBreed: details.catBreed,
              catAge: details.catAge || undefined,
              catGender: details.catGender || undefined,
              catNotes: details.catNotes || undefined,
            })
          }
          onBack={() => {
            setError(null);
            setStep('has-cat');
          }}
          isSubmitting={isSubmitting}
          error={error}
        />
      ) : step === 'user-details' ? (
        <UserProfileScreen
          onSubmit={(details) =>
            finishOnboarding({
              hasCat: false,
              userName: details.userName,
              favoriteCatBreed: details.favoriteCatBreed,
              userAvatar: details.userAvatar,
            })
          }
          onBack={() => {
            setError(null);
            setStep('has-cat');
          }}
          isSubmitting={isSubmitting}
          error={error}
        />
      ) : (
        <HasCatScreen
          onYes={() => {
            setError(null);
            setStep('cat-details');
          }}
          onNo={() => {
            setError(null);
            setStep('user-details');
          }}
          isSubmitting={isSubmitting}
          error={error}
        />
      )}
    </MotiView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
});
