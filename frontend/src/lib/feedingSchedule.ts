import type { FeedingScheduleInput } from '../types/catCare';
import { isValidTime } from './catCareValidation';

export function getNextFeedingTimeLabel(schedule: FeedingScheduleInput): string {
  const validTimes = schedule.feedingTimes
    .map((time) => time.trim())
    .filter(isValidTime)
    .sort();

  if (validTimes.length === 0) {
    return schedule.feedingMode === 'free_fed' ? 'free-fed all day' : 'not set';
  }

  const now = new Date();
  const today = now.toISOString().slice(0, 10);

  for (const time of validTimes) {
    const nextSlot = new Date(`${today}T${time}:00`);

    if (nextSlot > now) {
      return nextSlot.toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit',
      });
    }
  }

  const firstTime = validTimes[0];
  const tomorrowSlot = new Date(`${today}T${firstTime}:00`);
  tomorrowSlot.setDate(tomorrowSlot.getDate() + 1);

  return `tomorrow at ${tomorrowSlot.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })}`;
}

export function getFeedingModeLabel(mode: FeedingScheduleInput['feedingMode']): string {
  if (mode === 'meal_fed') {
    return 'meal-fed';
  }

  if (mode === 'free_fed') {
    return 'free-fed';
  }

  return 'not set';
}
