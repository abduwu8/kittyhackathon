import AsyncStorage from '@react-native-async-storage/async-storage';

const PEEK_DISABLED_KEY = 'app_guide_peek_disabled';

export async function isAppGuidePeekDisabled(): Promise<boolean> {
  const value = await AsyncStorage.getItem(PEEK_DISABLED_KEY);
  return value === '1';
}

export async function disableAppGuidePeek(): Promise<void> {
  await AsyncStorage.setItem(PEEK_DISABLED_KEY, '1');
}
