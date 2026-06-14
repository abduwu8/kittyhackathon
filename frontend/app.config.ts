import type { ConfigContext, ExpoConfig } from 'expo/config';

const APP_VARIANT = process.env.APP_VARIANT ?? 'production';
const IS_DEV_CLIENT = APP_VARIANT === 'development';
const ALLOWS_HTTP = APP_VARIANT !== 'production';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Coding Kitty',
  slug: 'frontend',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  scheme: 'codingkitty',
  ios: {
    ...config.ios,
    supportsTablet: true,
    bundleIdentifier: 'com.abduwu.frontend',
    infoPlist: {
      UIBackgroundModes: ['remote-notification'],
    },
  },
  android: {
    ...config.android,
    package: 'com.abduwu.frontend',
    softwareKeyboardLayoutMode: 'resize',
    adaptiveIcon: {
      backgroundColor: '#F7F2EA',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  web: {
    favicon: './assets/favicon.png',
  },
  plugins: [
    ...(IS_DEV_CLIENT ? (['expo-dev-client'] as const) : []),
    'expo-web-browser',
    'expo-font',
    'expo-asset',
    '@react-native-community/datetimepicker',
    [
      'expo-notifications',
      {
        color: '#8B5E3C',
      },
    ],
    [
      'expo-splash-screen',
      {
        backgroundColor: '#F7F2EA',
        image: './assets/icon.png',
        imageWidth: 180,
        resizeMode: 'contain',
      },
    ],
    [
      'expo-build-properties',
      {
        android: {
          usesCleartextTraffic: ALLOWS_HTTP,
        },
      },
    ],
  ],
  extra: {
    ...config.extra,
    appVariant: APP_VARIANT,
    eas: {
      projectId: 'f328c03d-daec-4596-aa41-669c38b24618',
    },
  },
});
