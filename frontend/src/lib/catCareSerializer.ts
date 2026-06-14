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
import { combineDateAndTime } from './catCareValidation';

export function serializeLitterTracking(
  input: LitterTrackingInput,
  catId: string,
  userId: string,
): Omit<LitterTrackingRecord, 'id' | 'created_at' | 'updated_at'> | null {
  const lastCleanedAt = combineDateAndTime(input.lastCleanedDate, input.lastCleanedTime);

  if (
    !lastCleanedAt ||
    !input.litterBoxType ||
    !input.cleaningFrequency ||
    !input.urineObservation ||
    !input.stoolObservation
  ) {
    return null;
  }

  return {
    cat_id: catId,
    user_id: userId,
    litter_box_type: input.litterBoxType,
    litter_type: input.litterType.trim(),
    number_of_boxes: Number(input.numberOfBoxes),
    last_cleaned_at: lastCleanedAt,
    cleaning_frequency: input.cleaningFrequency,
    urine_observation: input.urineObservation,
    stool_observation: input.stoolObservation,
    abnormal_behavior: input.abnormalBehavior,
    notes: input.notes.trim() || null,
  };
}

export function serializeMedications(
  medications: MedicationInput[],
  catId: string,
  userId: string,
): Omit<MedicationRecord, 'created_at' | 'updated_at'>[] {
  return medications.map((medication) => ({
    id: medication.id,
    cat_id: catId,
    user_id: userId,
    name: medication.name.trim(),
    purpose: medication.purpose.trim(),
    dosage: Number(medication.dosage),
    unit: medication.unit as MedicationRecord['unit'],
    frequency: medication.frequency.trim(),
    start_date: medication.startDate,
    end_date: medication.endDate.trim() || null,
    times_to_give: medication.timesToGive.map((time) => time.trim()).filter(Boolean),
    with_food: medication.withFood,
    status: medication.status,
    notes: medication.notes.trim() || null,
  }));
}

export function serializeVaccinations(
  vaccinations: VaccinationInput[],
  catId: string,
  userId: string,
): Omit<VaccinationRecord, 'created_at' | 'updated_at'>[] {
  return vaccinations.map((vaccination) => ({
    id: vaccination.id,
    cat_id: catId,
    user_id: userId,
    vaccine_name: vaccination.vaccineName.trim(),
    date_given: vaccination.dateGiven,
    next_due_date: vaccination.nextDueDate,
    vet_clinic_name: vaccination.vetClinicName.trim(),
    batch_or_certificate_number: vaccination.batchOrCertificateNumber.trim() || null,
    proof_document_name: vaccination.proofDocumentName.trim() || null,
    proof_document_uri: vaccination.proofDocumentUri.trim() || null,
    notes: vaccination.notes.trim() || null,
  }));
}

export function serializeFeedingSchedule(
  input: FeedingScheduleInput,
  catId: string,
  userId: string,
): Omit<FeedingScheduleRecord, 'id' | 'created_at' | 'updated_at'> | null {
  if (!input.feedingMode || !input.foodFormat) {
    return null;
  }

  const portionSize = input.portionSize.trim() ? Number(input.portionSize) : null;

  return {
    cat_id: catId,
    user_id: userId,
    feeding_mode: input.feedingMode,
    food_type: input.foodType.trim(),
    brand: input.brand.trim(),
    food_format: input.foodFormat,
    portion_size: portionSize,
    portion_unit: input.portionUnit || null,
    feeding_times: input.feedingTimes.map((time) => time.trim()).filter(Boolean),
    treat_notes: input.treatNotes.trim() || null,
    water_intake_notes: input.waterIntakeNotes.trim() || null,
    dietary_restrictions: input.dietaryRestrictions.trim() || null,
    special_instructions: input.specialInstructions.trim() || null,
  };
}
