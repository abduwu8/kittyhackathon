import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AuthAnimatedSection } from '../../components/auth/AuthAnimatedSection';
import { AuthButton } from '../../components/auth/AuthButton';
import { AuthCaption } from '../../components/auth/AuthCaption';
import { AuthInput } from '../../components/auth/AuthInput';
import { authIcons } from '../../components/auth/authIcons';
import { AuthScreenLayout } from '../../components/auth/AuthScreenLayout';
import { useAuth } from '../../contexts/AuthContext';
import { colors } from '../../theme/colors';
import { fonts, lowercase } from '../../theme/fonts';

type SignUpScreenProps = {
  onNavigateToLogin: () => void;
};

type SignUpStep = 'details' | 'otp';

export function SignUpScreen({ onNavigateToLogin }: SignUpScreenProps) {
  const { signUp, verifySignUpOtp, resendSignUpOtp } = useAuth();
  const [step, setStep] = useState<SignUpStep>('details');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignUp = async () => {
    setError(null);
    setInfo(null);

    if (!email.trim() || !password || !confirmPassword) {
      setError('all fields are required.');
      return;
    }

    if (password.length < 6) {
      setError('password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await signUp({ email: email.trim(), password });

      if (result.status === 'error') {
        setError(result.message);
      } else if (result.status === 'otp_sent') {
        setOtp('');
        setStep('otp');
      }
    } catch {
      setError('something went wrong while creating your account. please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError(null);
    setInfo(null);

    const trimmedOtp = otp.trim();

    if (trimmedOtp.length !== 8) {
      setError('enter your 8-digit code.');
      return;
    }

    setIsSubmitting(true);

    const message = await verifySignUpOtp(email.trim(), trimmedOtp);

    if (message) {
      setError(message.toLowerCase());
    }

    setIsSubmitting(false);
  };

  const handleResendOtp = async () => {
    setError(null);
    setInfo(null);
    setIsSubmitting(true);

    const message = await resendSignUpOtp(email.trim());

    if (message) {
      setError(message.toLowerCase());
    } else {
      setInfo('sent again.');
    }

    setIsSubmitting(false);
  };

  const handleBackToDetails = () => {
    setStep('details');
    setOtp('');
    setError(null);
    setInfo(null);
  };

  if (step === 'otp') {
    const displayEmail = email.trim().toLowerCase();

    return (
      <AuthScreenLayout showBottomGradient>
        <AuthAnimatedSection delay={0}>
          <View style={styles.header}>
            <Text style={styles.title}>check your email</Text>
            <AuthCaption>we sent a code to</AuthCaption>
            <AuthCaption variant="emphasis">{displayEmail}</AuthCaption>
            {info ? <AuthCaption style={styles.formHint}>{info}</AuthCaption> : null}
          </View>
        </AuthAnimatedSection>

        <AuthAnimatedSection delay={120}>
          <View style={styles.form}>
            <AuthInput
              label="code"
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              autoComplete="one-time-code"
              placeholder="········"
              maxLength={8}
              leftIcon={authIcons.email}
            />

            {error ? <Text style={styles.formError}>{error}</Text> : null}

            <AuthButton title="continue" onPress={handleVerifyOtp} isLoading={isSubmitting} />

            <AuthButton
              title="resend"
              variant="secondary"
              onPress={handleResendOtp}
              isLoading={isSubmitting}
            />

            <AuthButton title="back" variant="secondary" onPress={handleBackToDetails} />
          </View>
        </AuthAnimatedSection>
      </AuthScreenLayout>
    );
  }

  return (
    <AuthScreenLayout showBottomGradient>
      <AuthAnimatedSection delay={0}>
        <View style={styles.header}>
          <Text style={styles.title}>create account</Text>
          <AuthCaption>sign up with your email</AuthCaption>
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
            autoComplete="new-password"
            placeholder="at least 6 characters"
            leftIcon={authIcons.password}
            enablePasswordToggle
          />
          <AuthInput
            label="confirm password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            autoComplete="new-password"
            placeholder="re-enter your password"
            leftIcon={authIcons.password}
            enablePasswordToggle
          />

          {error ? <Text style={styles.formError}>{error}</Text> : null}

          <AuthButton title="sign up" onPress={handleSignUp} isLoading={isSubmitting} />
        </View>
      </AuthAnimatedSection>

      <AuthAnimatedSection delay={240}>
        <View style={styles.footer}>
          <AuthCaption align="center">already have an account?</AuthCaption>
          <AuthButton title="sign in" variant="secondary" onPress={onNavigateToLogin} />
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
  formHint: {
    marginTop: 2,
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
