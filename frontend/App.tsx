import * as Notifications from 'expo-notifications';
import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { LoadingCat } from './src/components/loader';
import { AuthProvider } from './src/contexts/AuthContext';
import { CatCareProvider } from './src/contexts/CatCareContext';
import { ProfileProvider } from './src/contexts/ProfileContext';
import { ToastProvider } from './src/contexts/ToastContext';
import { useAppFonts } from './src/hooks/useAppFonts';
import { RootNavigator } from './src/navigation/RootNavigator';

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export default function App() {
  const { fontsLoaded } = useAppFonts();

  if (!fontsLoaded) {
    return (
      <View style={styles.loading}>
        <LoadingCat />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ToastProvider>
        <AuthProvider>
          <ProfileProvider>
            <CatCareProvider>
              <RootNavigator />
              <StatusBar style="auto" />
            </CatCareProvider>
          </ProfileProvider>
        </AuthProvider>
      </ToastProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5EDE3',
  },
});
