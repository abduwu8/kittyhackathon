import { MotiView } from 'moti';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { LoginScreen } from '../screens/auth/LoginScreen';
import { SignUpScreen } from '../screens/auth/SignUpScreen';

export function AuthNavigator() {
  const [screen, setScreen] = useState<'login' | 'signup'>('login');

  return (
    <MotiView
      key={screen}
      style={styles.screen}
      from={{ opacity: 0, translateY: 12 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{
        type: 'timing',
        duration: 400,
      }}
    >
      {screen === 'signup' ? (
        <SignUpScreen onNavigateToLogin={() => setScreen('login')} />
      ) : (
        <LoginScreen onNavigateToSignUp={() => setScreen('signup')} />
      )}
    </MotiView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
});
