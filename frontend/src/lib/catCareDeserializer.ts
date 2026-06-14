import type {
  FeedingScheduleInput,
  FeedingScheduleRecord,
  LitterTrackingInput,
  LitterTrackingRecord,
  MedicationInput,
  MedicationRecord,
  VaccinationInput,
  VaccinationRecord,
} from '../types/catCare';

function splitIsoDateTime(isoDate: string) {
  const parsed = new Date(isoDate);

  if (Number.isNaN(parsed.getTime())) {
    return { date: '', time: '' };
  }

  const date = isoDate.slice(0, 10);
  const hours = String(parsed.getHours()).padStart(2, '0');
  const minutes = String(parsed.getMinutes()).padStart(2, '0');

  return { date, time: `${hours}:${minutes}` };
}

export function deserializeLitterRecord(record: LitterTrackingRecord): LitterTrackingInput {
  const { date, time } = splitIsoDateTime(record.last_cleaned_at);

  return {
    litterBoxType: record.litter_box_type,
    litterType: record.litter_type,
    numberOfBoxes: String(record.number_of_boxes),
    lastCleanedDate: date,
    lastCleanedTime: time,
    cleaningFrequency: record.cleaning_frequency,
    urineObservation: record.urine_observation,
    stoolObservation: record.stool_observation,
    abnormalBehavior: record.abnormal_behavior,
    notes: record.notes ?? '',
  };
}

export function deserializeMedicationRecord(record: MedicationRecord): MedicationInput {
  return {
    id: record.id,
    name: record.name,
    purpose: record.purpose,
    dosage: String(record.dosage),
    unit: record.unit,
    frequency: record.frequency,
    startDate: record.start_date,
    endDate: record.end_date ?? '',
    timesToGive: record.times_to_give.length > 0 ? record.times_to_give : [''],
    withFood: record.with_food,
    status: record.status,
    notes: record.notes ?? '',
  };
}

export function deserializeVaccinationRecord(record: VaccinationRecord): VaccinationInput {
  return {
    id: record.id,
    vaccineName: record.vaccine_name,
    dateGiven: record.date_given,
    nextDueDate: record.next_due_date,
    vetClinicName: record.vet_clinic_name,
    batchOrCertificateNumber: record.batch_or_certificate_number ?? '',
    proofDocumentName: record.proof_document_name ?? '',
    proofDocumentUri: record.proof_document_uri ?? '',
    notes: record.notes ?? '',
  };
}

export function deserializeFeedingRecord(record: FeedingScheduleRecord): FeedingScheduleInput {
  return {
    feedingMode: record.feeding_mode,
    foodType: record.food_type,
    brand: record.brand,
    foodFormat: record.food_format,
    portionSize: record.portion_size != null ? String(record.portion_size) : '',
    portionUnit: record.portion_unit ?? '',
    feedingTimes: record.feeding_times.length > 0 ? record.feeding_times : [''],
    treatNotes: record.treat_notes ?? '',
    waterIntakeNotes: record.water_intake_notes ?? '',
    dietaryRestrictions: record.dietary_restrictions ?? '',
    specialInstructions: record.special_instructions ?? '',
  };
}
