import { isValidTime } from './catCareValidation';

export function formatTimeFromDate(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${hours}:${minutes}`;
}

export function parseTimeToDate(time: string, fallbackHour = 8, fallbackMinute = 0): Date {
  const date = new Date();

  if (isValidTime(time)) {
    const [hours, minutes] = time.split(':').map(Number);
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  date.setHours(fallbackHour, fallbackMinute, 0, 0);
  return date;
}

export function formatTimeLabel(time: string): string {
  if (!isValidTime(time)) {
    return 'select time';
  }

  const date = parseTimeToDate(time);

  return date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function parseTimeParts(time: string): { hour: number; minute: number } | null {
  if (!isValidTime(time)) {
    return null;
  }

  const [hour, minute] = time.split(':').map(Number);
  return { hour, minute };
}
