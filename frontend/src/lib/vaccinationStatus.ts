import type { VaccinationInput, VaccinationStatus } from '../types/catCare';
import { isValidDate } from './catCareValidation';

const DUE_SOON_DAYS = 30;

function addDays(dateString: string, days: number): string {
  const date = new Date(`${dateString}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export function deriveVaccinationStatus(nextDueDate: string): VaccinationStatus {
  if (!isValidDate(nextDueDate)) {
    return 'up_to_date';
  }

  const today = new Date().toISOString().slice(0, 10);

  if (nextDueDate < today) {
    return 'overdue';
  }

  if (nextDueDate <= addDays(today, DUE_SOON_DAYS)) {
    return 'due_soon';
  }

  return 'up_to_date';
}

export function getVaccinationStatusLabel(status: VaccinationStatus): string {
  switch (status) {
    case 'due_soon':
      return 'due soon';
    case 'overdue':
      return 'overdue';
    default:
      return 'up to date';
  }
}

export function formatDateLabel(dateString: string): string {
  if (!isValidDate(dateString)) {
    return 'not set';
  }

  return new Date(`${dateString}T00:00:00`).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getNextVaccineDue(vaccinations: VaccinationInput[]): {
  label: string;
  vaccineName: string;
  status: VaccinationStatus;
} {
  const datedVaccines = vaccinations
    .filter((vaccine) => isValidDate(vaccine.nextDueDate))
    .map((vaccine) => ({
      vaccine,
      status: deriveVaccinationStatus(vaccine.nextDueDate),
      sortDate: vaccine.nextDueDate,
    }))
    .sort((a, b) => a.sortDate.localeCompare(b.sortDate));

  if (datedVaccines.length === 0) {
    return { label: 'not set', vaccineName: 'none', status: 'up_to_date' };
  }

  const next = datedVaccines[0];

  return {
    label: formatDateLabel(next.vaccine.nextDueDate),
    vaccineName: next.vaccine.vaccineName || 'vaccine',
    status: next.status,
  };
}
