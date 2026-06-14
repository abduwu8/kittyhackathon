import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AuthAnimatedSection } from '../../components/auth/AuthAnimatedSection';
import { AuthButton } from '../../components/auth/AuthButton';
import { AuthInput } from '../../components/auth/AuthInput';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import { fonts, lowercase } from '../../theme/fonts';

type CatDetails = {
  catName: string;
  catBreed: string;
  catAge: string;
  catGender: string;
  catNotes: string;
};

type CatDetailsScreenProps = {
  onSubmit: (details: CatDetails) => void;
  onBack: () => void;
  isSubmitting: boolean;
  error: string | null;
};

export function CatDetailsScreen({
  onSubmit,
  onBack,
  isSubmitting,
  error,
}: CatDetailsScreenProps) {
  const [catName, setCatName] = useState('');
  const [catBreed, setCatBreed] = useState('');
  const [catAge, setCatAge] = useState('');
  const [catGender, setCatGender] = useState('');
  const [catNotes, setCatNotes] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = () => {
    setValidationError(null);

    if (!catName.trim() || !catBreed.trim()) {
      setValidationError('cat name and breed are required.');
      return;
    }

    onSubmit({
      catName: catName.trim(),
      catBreed: catBreed.trim(),
      catAge: catAge.trim(),
      catGender: catGender.trim(),
      catNotes: catNotes.trim(),
    });
  };

  const displayError = validationError ?? error;

  return (
    <OnboardingLayout>
      <AuthAnimatedSection delay={0}>
        <View style={styles.header}>
          <Text style={styles.title}>tell us about your cat</Text>
          <Text style={styles.subtitle}>we&apos;ll save this to your profile</Text>
        </View>
      </AuthAnimatedSection>

      <AuthAnimatedSection delay={120}>
        <View style={styles.form}>
          <AuthInput
            label="cat name"
            value={catName}
            onChangeText={setCatName}
            placeholder="whiskers"
          />
          <AuthInput
            label="breed"
            value={catBreed}
            onChangeText={setCatBreed}
            placeholder="siamese, tabby, mixed..."
          />
          <AuthInput
            label="age"
            value={catAge}
            onChangeText={setCatAge}
            placeholder="2 years"
          />
          <AuthInput
            label="gender"
            value={catGender}
            onChangeText={setCatGender}
            placeholder="male / female / other"
          />
          <AuthInput
            label="notes"
            value={catNotes}
            onChangeText={setCatNotes}
            placeholder="personality, quirks, favorites..."
            multiline
            numberOfLines={3}
            style={styles.notesInput}
          />

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
  notesInput: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  error: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: '#B85C5C',
    ...lowercase,
  },
});
