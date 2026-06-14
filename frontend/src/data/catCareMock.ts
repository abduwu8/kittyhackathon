import type {
  FeedingScheduleInput,
  LitterTrackingInput,
  MedicationInput,
  VaccinationInput,
} from '../types/catCare';
import { createCareItemId } from '../lib/careIds';

export const emptyLitterTracking: LitterTrackingInput = {
  litterBoxType: '',
  litterType: '',
  numberOfBoxes: '1',
  lastCleanedDate: '',
  lastCleanedTime: '',
  cleaningFrequency: '',
  urineObservation: '',
  stoolObservation: '',
  abnormalBehavior: false,
  notes: '',
};

export const emptyFeedingSchedule: FeedingScheduleInput = {
  feedingMode: '',
  foodType: '',
  brand: '',
  foodFormat: '',
  portionSize: '',
  portionUnit: '',
  feedingTimes: [''],
  treatNotes: '',
  waterIntakeNotes: '',
  dietaryRestrictions: '',
  specialInstructions: '',
};

export const mockLitterTracking: LitterTrackingInput = {
  litterBoxType: 'covered',
  litterType: 'clumping clay',
  numberOfBoxes: '2',
  lastCleanedDate: '2026-06-11',
  lastCleanedTime: '19:30',
  cleaningFrequency: 'daily',
  urineObservation: 'normal',
  stoolObservation: 'normal',
  abnormalBehavior: false,
  notes: 'both boxes scooped after dinner.',
};

export const mockMedications: MedicationInput[] = [
  {
    id: 'med-1',
    name: 'feliway calm',
    purpose: 'stress support',
    dosage: '1',
    unit: 'unit',
    frequency: 'once daily',
    startDate: '2026-06-01',
    endDate: '2026-06-30',
    timesToGive: ['08:00'],
    withFood: false,
    status: 'active',
    notes: 'plug-in diffuser in living room.',
  },
  {
    id: 'med-2',
    name: 'prednisolone',
    purpose: 'inflammation',
    dosage: '5',
    unit: 'mg',
    frequency: 'every 12 hours',
    startDate: '2026-05-20',
    endDate: '2026-06-15',
    timesToGive: ['08:00', '20:00'],
    withFood: true,
    status: 'active',
    notes: 'give with a small meal.',
  },
  {
    id: 'med-3',
    name: 'dewormer',
    purpose: 'preventive care',
    dosage: '1',
    unit: 'tablet',
    frequency: 'once',
    startDate: '2026-07-01',
    endDate: '2026-07-01',
    timesToGive: ['09:00'],
    withFood: true,
    status: 'upcoming',
    notes: 'scheduled after vet visit.',
  },
];

export const mockVaccinations: VaccinationInput[] = [
  {
    id: 'vac-1',
    vaccineName: 'fvrcp',
    dateGiven: '2025-12-10',
    nextDueDate: '2026-12-10',
    vetClinicName: 'paws & whiskers clinic',
    batchOrCertificateNumber: 'FV-20491',
    proofDocumentName: 'fvrcp-certificate.pdf',
    proofDocumentUri: '',
    notes: 'annual core vaccine booster.',
  },
  {
    id: 'vac-2',
    vaccineName: 'rabies',
    dateGiven: '2024-06-15',
    nextDueDate: '2026-06-15',
    vetClinicName: 'city vet hospital',
    batchOrCertificateNumber: 'RB-11820',
    proofDocumentName: '',
    proofDocumentUri: '',
    notes: '3-year rabies certificate on file.',
  },
  {
    id: 'vac-3',
    vaccineName: 'felv',
    dateGiven: '2026-01-20',
    nextDueDate: '2026-04-20',
    vetClinicName: 'paws & whiskers clinic',
    batchOrCertificateNumber: 'FL-99231',
    proofDocumentName: '',
    proofDocumentUri: '',
    notes: 'risk-based schedule for indoor/outdoor exposure.',
  },
];

export const mockFeedingSchedule: FeedingScheduleInput = {
  feedingMode: 'meal_fed',
  foodType: 'adult indoor formula',
  brand: 'hills science diet',
  foodFormat: 'mixed',
  portionSize: '45',
  portionUnit: 'grams',
  feedingTimes: ['07:30', '12:30', '19:00'],
  treatNotes: '2 dental treats after evening meal.',
  waterIntakeNotes: 'fountain refilled daily, prefers running water.',
  dietaryRestrictions: 'no chicken-based treats.',
  specialInstructions: 'mix 1/3 wet with 2/3 dry at each meal.',
};

export function createEmptyVaccination(id = createCareItemId()): VaccinationInput {
  return {
    id,
    vaccineName: '',
    dateGiven: '',
    nextDueDate: '',
    vetClinicName: '',
    batchOrCertificateNumber: '',
    proofDocumentName: '',
    proofDocumentUri: '',
    notes: '',
  };
}

export function createEmptyMedication(id = createCareItemId()): MedicationInput {
  return {
    id,
    name: '',
    purpose: '',
    dosage: '',
    unit: '',
    frequency: '',
    startDate: '',
    endDate: '',
    timesToGive: [''],
    withFood: true,
    status: 'active',
    notes: '',
  };
}
