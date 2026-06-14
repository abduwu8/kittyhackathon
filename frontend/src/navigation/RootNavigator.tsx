import { StyleSheet, View } from 'react-native';

import { AppGuidePeek, AppGuideSheet } from '../components/guide';
import { WallpaperBackground } from '../components/layout/WallpaperBackground';
import { DashboardIntroGate, LoadingCat } from '../components/loader';
import { AppGuideProvider } from '../contexts/AppGuideContext';
import { useAuth } from '../contexts/AuthContext';
import { useProfile } from '../contexts/ProfileContext';
import { DashboardScreen } from '../screens/dashboard/DashboardScreen';
import { AuthNavigator } from './AuthNavigator';
import { OnboardingNavigator } from './OnboardingNavigator';

function AuthenticatedApp() {
  return (
    <AppGuideProvider>
      <View style={styles.appShell}>
        <DashboardIntroGate>
          <DashboardScreen />
        </DashboardIntroGate>
        <View style={styles.guideOverlay} pointerEvents="box-none">
          <AppGuidePeek />
          <AppGuideSheet />
        </View>
      </View>
    </AppGuideProvider>
  );
}

export function RootNavigator() {
  const { session, isLoading: isAuthLoading } = useAuth();
  const { needsOnboarding, isLoading: isProfileLoading } = useProfile();

  let content = <AuthenticatedApp />;

  if (isAuthLoading || (session && isProfileLoading)) {
    content = (
      <View style={styles.loading}>
        <LoadingCat />
      </View>
    );
  } else if (!session) {
    content = <AuthNavigator />;
  } else if (needsOnboarding) {
    content = (
      <AppGuideProvider>
        <View style={styles.appShell}>
          <OnboardingNavigator />
          <View style={styles.guideOverlay} pointerEvents="box-none">
            <AppGuidePeek />
            <AppGuideSheet />
          </View>
        </View>
      </AppGuideProvider>
    );
  }

  return <WallpaperBackground>{content}</WallpaperBackground>;
}

const styles = StyleSheet.create({
  appShell: {
    flex: 1,
  },
  guideOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
