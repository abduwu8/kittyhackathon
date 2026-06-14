import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AuthAnimatedSection } from '../../components/auth/AuthAnimatedSection';
import { AuthButton } from '../../components/auth/AuthButton';
import { AuthCaption } from '../../components/auth/AuthCaption';
import { AuthInput } from '../../components/auth/AuthInput';
import { authIcons } from '../../components/auth/authIcons';
import { AuthScreenLayout } from '../../components/auth/AuthScreenLayout';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { colors } from '../../theme/colors';
import { fonts, lowercase } from '../../theme/fonts';

type LoginScreenProps = {
  onNavigateToSignUp: () => void;
};

export function LoginScreen({ onNavigateToSignUp }: LoginScreenProps) {
  const { signIn } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setError(null);

    if (!email.trim() || !password) {
      setError('email and password are required.');
      return;
    }

    setIsSubmitting(true);

    const message = await signIn({ email: email.trim(), password });

    if (message) {
      setError(message.toLowerCase());
    } else {
      showToast({
        title: 'welcome back',
        message: 'you are signed in and ready to care for your cat.',
      });
    }

    setIsSubmitting(false);
  };

  return (
    <AuthScreenLayout showBottomGradient>
      <AuthAnimatedSection delay={0}>
        <View style={styles.header}>
          <Text style={styles.title}>welcome back</Text>
          <AuthCaption>sign in to your account</AuthCaption>
        </View>
      </AuthAnimatedSection>

      <AuthAnimatedSection delay={120}>
        <View style={styles.form}>
        <AuthInput
          label="email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoComplete="email"
          placeholder="you@example.com"
          leftIcon={authIcons.email}
        />
        <AuthInput
          label="password"
          value={password}
          onChangeText={setPassword}
          autoComplete="password"
          placeholder="enter your password"
          leftIcon={authIcons.password}
          enablePasswordToggle
        />

        {error ? <Text style={styles.formError}>{error}</Text> : null}

        <AuthButton
          title="sign in"
          onPress={handleSubmit}
          isLoading={isSubmitting}
        />
        </View>
      </AuthAnimatedSection>

      <AuthAnimatedSection delay={240}>
        <View style={styles.footer}>
          <AuthCaption align="center">don&apos;t have an account?</AuthCaption>
          <AuthButton
            title="create account"
            variant="secondary"
            onPress={onNavigateToSignUp}
          />
        </View>
      </AuthAnimatedSection>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 10,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 28,
    color: colors.ink,
    ...lowercase,
  },
  form: {
    gap: 16,
  },
  formError: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: '#EF4444',
    ...lowercase,
  },
  footer: {
    gap: 12,
  },
});
