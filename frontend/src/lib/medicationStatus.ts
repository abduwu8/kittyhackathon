import type { MedicationInput, MedicationStatus } from '../types/catCare';
import { isValidDate } from './catCareValidation';

export function deriveMedicationStatus(medication: MedicationInput): MedicationStatus {
  if (medication.status === 'inactive') {
    return 'inactive';
  }

  const today = new Date().toISOString().slice(0, 10);

  if (isValidDate(medication.startDate) && medication.startDate > today) {
    return 'upcoming';
  }

  if (isValidDate(medication.endDate) && medication.endDate < today) {
    return 'completed';
  }

  return medication.status === 'completed' ? 'completed' : 'active';
}

export function getMedicationStatusLabel(status: MedicationStatus): string {
  switch (status) {
    case 'active':
      return 'active';
    case 'completed':
      return 'completed';
    case 'upcoming':
      return 'upcoming';
    default:
      return 'inactive';
  }
}

export function countActiveMedications(medications: MedicationInput[]): number {
  return medications.filter((medication) => deriveMedicationStatus(medication) === 'active').length;
}
