import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { isValidTime } from './catCareValidation';
import { parseTimeParts } from './timeFormat';
import type { FeedingScheduleInput } from '../types/catCare';

const FEEDING_CHANNEL_ID = 'feeding-reminders';
const FEEDING_IDENTIFIER_PREFIX = 'feeding-reminder-';

function getProfilePrefix(profileId: string): string {
  return `${FEEDING_IDENTIFIER_PREFIX}${profileId}-`;
}

function isNativePlatform(): boolean {
  return Platform.OS === 'ios' || Platform.OS === 'android';
}

async function cancelFeedingRemindersMatching(
  predicate: (identifier: string) => boolean,
): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();

  await Promise.all(
    scheduled
      .filter((notification) => predicate(notification.identifier))
      .map((notification) =>
        Notifications.cancelScheduledNotificationAsync(notification.identifier),
      ),
  );
}

export async function cancelFeedingRemindersForProfile(profileId: string): Promise<void> {
  if (!isNativePlatform()) {
    return;
  }

  const prefix = getProfilePrefix(profileId);
  await cancelFeedingRemindersMatching((identifier) => identifier.startsWith(prefix));
}

export async function cancelAllFeedingReminders(): Promise<void> {
  if (!isNativePlatform()) {
    return;
  }

  await cancelFeedingRemindersMatching((identifier) =>
    identifier.startsWith(FEEDING_IDENTIFIER_PREFIX),
  );
}

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }

  await Notifications.setNotificationChannelAsync(FEEDING_CHANNEL_ID, {
    name: 'Feeding reminders',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'default',
    vibrationPattern: [0, 250, 250, 250],
  });
}

async function ensureNotificationPermissions(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();

  if (current.granted) {
    return true;
  }

  if (current.canAskAgain === false) {
    return false;
  }

  const requested = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: false,
      allowSound: true,
    },
  });

  return requested.granted;
}

export type FeedingNotificationSyncResult = {
  scheduled: number;
  permissionDenied?: boolean;
};

export async function syncFeedingNotifications(options: {
  profileId: string;
  catName: string;
  feeding: FeedingScheduleInput;
}): Promise<FeedingNotificationSyncResult> {
  if (!isNativePlatform()) {
    return { scheduled: 0 };
  }

  await cancelFeedingRemindersForProfile(options.profileId);

  if (options.feeding.feedingMode !== 'meal_fed') {
    return { scheduled: 0 };
  }

  const times = options.feeding.feedingTimes.map((time) => time.trim()).filter(isValidTime);

  if (times.length === 0) {
    return { scheduled: 0 };
  }

  const granted = await ensureNotificationPermissions();

  if (!granted) {
    return { scheduled: 0, permissionDenied: true };
  }

  await ensureAndroidChannel();

  const trimmedCatName = options.catName.trim();
  let scheduled = 0;

  for (let index = 0; index < times.length; index += 1) {
    const parsed = parseTimeParts(times[index]);

    if (!parsed) {
      continue;
    }

    await Notifications.scheduleNotificationAsync({
      identifier: `${getProfilePrefix(options.profileId)}${index}`,
      content: {
        title: 'feeding time',
        body: trimmedCatName
          ? `time to feed ${trimmedCatName}.`
          : 'time to feed your cat.',
        sound: true,
        data: {
          type: 'feeding',
          profileId: options.profileId,
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: parsed.hour,
        minute: parsed.minute,
        channelId: FEEDING_CHANNEL_ID,
      },
    });

    scheduled += 1;
  }

  return { scheduled };
}
