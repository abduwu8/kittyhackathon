import { StyleSheet, Text, View } from 'react-native';

import { AuthAnimatedSection } from '../../components/auth/AuthAnimatedSection';
import { AuthButton } from '../../components/auth/AuthButton';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import { fonts, lowercase } from '../../theme/fonts';

type HasCatScreenProps = {
  onYes: () => void;
  onNo: () => void;
  isSubmitting: boolean;
  error: string | null;
};

export function HasCatScreen({ onYes, onNo, isSubmitting, error }: HasCatScreenProps) {
  return (
    <OnboardingLayout>
      <AuthAnimatedSection delay={0}>
        <View style={styles.header}>
          <Text style={styles.title}>welcome!</Text>
          <Text style={styles.subtitle}>let&apos;s get to know you. do you have a cat?</Text>
        </View>
      </AuthAnimatedSection>

      <AuthAnimatedSection delay={120}>
        <View style={styles.actions}>
          <AuthButton title="yes, i have a cat" onPress={onYes} disabled={isSubmitting} />
          <AuthButton
            title="not yet"
            variant="secondary"
            onPress={onNo}
            isLoading={isSubmitting}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
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
  actions: {
    gap: 12,
  },
  error: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: '#B85C5C',
    textAlign: 'center',
    ...lowercase,
  },
});
