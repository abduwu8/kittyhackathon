import type {
  FeedingScheduleErrors,
  FeedingScheduleInput,
  LitterTrackingErrors,
  LitterTrackingInput,
  MedicationErrorsMap,
  MedicationInput,
  VaccinationErrorsMap,
  VaccinationInput,
} from '../types/catCare';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export function isValidDate(value: string): boolean {
  if (!DATE_PATTERN.test(value)) {
    return false;
  }

  const parsed = new Date(`${value}T00:00:00`);

  return !Number.isNaN(parsed.getTime());
}

export function isValidTime(value: string): boolean {
  return TIME_PATTERN.test(value);
}

export function combineDateAndTime(date: string, time: string): string | null {
  if (!isValidDate(date) || !isValidTime(time)) {
    return null;
  }

  return new Date(`${date}T${time}:00`).toISOString();
}

export function formatDateTimeLabel(isoDate: string | null): string {
  if (!isoDate) {
    return 'not set';
  }

  const parsed = new Date(isoDate);

  if (Number.isNaN(parsed.getTime())) {
    return 'not set';
  }

  return parsed.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function validateLitterTracking(value: LitterTrackingInput): LitterTrackingErrors {
  const errors: LitterTrackingErrors = {};

  if (!value.litterBoxType) {
    errors.litterBoxType = 'select a litter box type.';
  }

  if (!value.litterType.trim()) {
    errors.litterType = 'litter type is required.';
  }

  const boxCount = Number(value.numberOfBoxes);

  if (!value.numberOfBoxes.trim()) {
    errors.numberOfBoxes = 'number of boxes is required.';
  } else if (!Number.isInteger(boxCount) || boxCount < 1 || boxCount > 10) {
    errors.numberOfBoxes = 'enter a whole number between 1 and 10.';
  }

  if (!value.lastCleanedDate.trim()) {
    errors.lastCleanedDate = 'last cleaned date is required.';
  } else if (!isValidDate(value.lastCleanedDate)) {
    errors.lastCleanedDate = 'use format yyyy-mm-dd.';
  } else if (new Date(`${value.lastCleanedDate}T23:59:59`) > new Date()) {
    errors.lastCleanedDate = 'date cannot be in the future.';
  }

  if (!value.lastCleanedTime.trim()) {
    errors.lastCleanedTime = 'last cleaned time is required.';
  } else if (!isValidTime(value.lastCleanedTime)) {
    errors.lastCleanedTime = 'use 24-hour format hh:mm.';
  }

  if (!value.cleaningFrequency) {
    errors.cleaningFrequency = 'select a cleaning frequency.';
  }

  if (!value.urineObservation) {
    errors.urineObservation = 'select a urine observation.';
  }

  if (!value.stoolObservation) {
    errors.stoolObservation = 'select a stool observation.';
  }

  return errors;
}

export function validateMedication(medication: MedicationInput) {
  const errors: MedicationErrorsMap[string] = {};

  if (!medication.name.trim()) {
    errors.name = 'medication name is required.';
  }

  if (!medication.purpose.trim()) {
    errors.purpose = 'purpose is required.';
  }

  const dosage = Number(medication.dosage);

  if (!medication.dosage.trim()) {
    errors.dosage = 'dosage is required.';
  } else if (Number.isNaN(dosage) || dosage <= 0) {
    errors.dosage = 'enter a positive number.';
  }

  if (!medication.unit) {
    errors.unit = 'select a unit.';
  }

  if (!medication.frequency.trim()) {
    errors.frequency = 'frequency is required.';
  }

  if (!medication.startDate.trim()) {
    errors.startDate = 'start date is required.';
  } else if (!isValidDate(medication.startDate)) {
    errors.startDate = 'use format yyyy-mm-dd.';
  }

  if (medication.endDate.trim() && !isValidDate(medication.endDate)) {
    errors.endDate = 'use format yyyy-mm-dd.';
  } else if (
    medication.endDate.trim() &&
    medication.startDate.trim() &&
    isValidDate(medication.endDate) &&
    isValidDate(medication.startDate) &&
    medication.endDate < medication.startDate
  ) {
    errors.endDate = 'end date must be on or after start date.';
  }

  const validTimes = medication.timesToGive.filter((time) => time.trim());

  if (validTimes.length === 0) {
    errors.timesToGive = 'add at least one time to give medication.';
  } else if (validTimes.some((time) => !isValidTime(time.trim()))) {
    errors.timesToGive = 'each time must use hh:mm format.';
  }

  return errors;
}

export function validateMedications(medications: MedicationInput[]): MedicationErrorsMap {
  const errors: MedicationErrorsMap = {};

  medications.forEach((medication) => {
    const fieldErrors = validateMedication(medication);

    if (Object.keys(fieldErrors).length > 0) {
      errors[medication.id] = fieldErrors;
    }
  });

  return errors;
}

export function hasValidationErrors<T extends object>(errors: T): boolean {
  return Object.keys(errors).length > 0;
}

export function hasMedicationValidationErrors(errors: MedicationErrorsMap): boolean {
  return Object.keys(errors).length > 0;
}

export function validateVaccination(vaccination: VaccinationInput) {
  const errors: VaccinationErrorsMap[string] = {};

  if (!vaccination.vaccineName.trim()) {
    errors.vaccineName = 'vaccine name is required.';
  }

  if (!vaccination.dateGiven.trim()) {
    errors.dateGiven = 'date given is required.';
  } else if (!isValidDate(vaccination.dateGiven)) {
    errors.dateGiven = 'use format yyyy-mm-dd.';
  } else if (vaccination.dateGiven > new Date().toISOString().slice(0, 10)) {
    errors.dateGiven = 'date given cannot be in the future.';
  }

  if (!vaccination.nextDueDate.trim()) {
    errors.nextDueDate = 'next due date is required.';
  } else if (!isValidDate(vaccination.nextDueDate)) {
    errors.nextDueDate = 'use format yyyy-mm-dd.';
  } else if (
    vaccination.dateGiven.trim() &&
    isValidDate(vaccination.dateGiven) &&
    vaccination.nextDueDate < vaccination.dateGiven
  ) {
    errors.nextDueDate = 'next due date must be on or after date given.';
  }

  if (!vaccination.vetClinicName.trim()) {
    errors.vetClinicName = 'vet or clinic name is required.';
  }

  return errors;
}

export function validateVaccinations(vaccinations: VaccinationInput[]): VaccinationErrorsMap {
  const errors: VaccinationErrorsMap = {};

  vaccinations.forEach((vaccination) => {
    const fieldErrors = validateVaccination(vaccination);

    if (Object.keys(fieldErrors).length > 0) {
      errors[vaccination.id] = fieldErrors;
    }
  });

  return errors;
}

export function hasVaccinationValidationErrors(errors: VaccinationErrorsMap): boolean {
  return Object.keys(errors).length > 0;
}

export function validateFeedingSchedule(value: FeedingScheduleInput): FeedingScheduleErrors {
  const errors: FeedingScheduleErrors = {};

  if (!value.feedingMode) {
    errors.feedingMode = 'select a feeding mode.';
  }

  if (!value.foodType.trim()) {
    errors.foodType = 'food type is required.';
  }

  if (!value.brand.trim()) {
    errors.brand = 'brand is required.';
  }

  if (!value.foodFormat) {
    errors.foodFormat = 'select wet, dry, mixed, or homemade.';
  }

  if (value.feedingMode === 'meal_fed') {
    const portion = Number(value.portionSize);

    if (!value.portionSize.trim()) {
      errors.portionSize = 'portion size is required for meal-fed cats.';
    } else if (Number.isNaN(portion) || portion <= 0) {
      errors.portionSize = 'enter a positive number.';
    }

    if (!value.portionUnit) {
      errors.portionUnit = 'select a portion unit.';
    }

    const validTimes = value.feedingTimes.filter((time) => time.trim());

    if (validTimes.length === 0) {
      errors.feedingTimes = 'add at least one feeding time.';
    } else if (validTimes.some((time) => !isValidTime(time.trim()))) {
      errors.feedingTimes = 'each feeding time must use hh:mm format.';
    }
  } else if (value.feedingTimes.some((time) => time.trim() && !isValidTime(time.trim()))) {
    errors.feedingTimes = 'each feeding time must use hh:mm format.';
  }

  return errors;
}
