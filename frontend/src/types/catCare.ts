export type LitterBoxType =
  | 'open'
  | 'covered'
  | 'top_entry'
  | 'automatic'
  | 'other';

export type CleaningFrequency =
  | 'daily'
  | 'every_other_day'
  | 'twice_weekly'
  | 'weekly'
  | 'as_needed';

export type EliminationObservation =
  | 'normal'
  | 'small_amount'
  | 'large_amount'
  | 'none'
  | 'concerning';

export type MedicationUnit = 'mg' | 'ml' | 'tablet' | 'capsule' | 'drop' | 'unit';

export type MedicationStatus = 'active' | 'inactive' | 'completed' | 'upcoming';

export type VaccinationStatus = 'up_to_date' | 'due_soon' | 'overdue';

export type FeedingMode = 'meal_fed' | 'free_fed';

export type FoodFormat = 'wet' | 'dry' | 'mixed' | 'homemade';

export type PortionUnit = 'grams' | 'ounces' | 'cups' | 'cans' | 'pouches';

export type LitterTrackingInput = {
  litterBoxType: LitterBoxType | '';
  litterType: string;
  numberOfBoxes: string;
  lastCleanedDate: string;
  lastCleanedTime: string;
  cleaningFrequency: CleaningFrequency | '';
  urineObservation: EliminationObservation | '';
  stoolObservation: EliminationObservation | '';
  abnormalBehavior: boolean;
  notes: string;
};

export type MedicationInput = {
  id: string;
  name: string;
  purpose: string;
  dosage: string;
  unit: MedicationUnit | '';
  frequency: string;
  startDate: string;
  endDate: string;
  timesToGive: string[];
  withFood: boolean;
  status: MedicationStatus;
  notes: string;
};

export type LitterTrackingRecord = {
  id: string;
  cat_id: string;
  user_id: string;
  litter_box_type: LitterBoxType;
  litter_type: string;
  number_of_boxes: number;
  last_cleaned_at: string;
  cleaning_frequency: CleaningFrequency;
  urine_observation: EliminationObservation;
  stool_observation: EliminationObservation;
  abnormal_behavior: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type MedicationRecord = {
  id: string;
  cat_id: string;
  user_id: string;
  name: string;
  purpose: string;
  dosage: number;
  unit: MedicationUnit;
  frequency: string;
  start_date: string;
  end_date: string | null;
  times_to_give: string[];
  with_food: boolean;
  status: MedicationStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type VaccinationInput = {
  id: string;
  vaccineName: string;
  dateGiven: string;
  nextDueDate: string;
  vetClinicName: string;
  batchOrCertificateNumber: string;
  proofDocumentName: string;
  proofDocumentUri: string;
  notes: string;
};

export type FeedingScheduleInput = {
  feedingMode: FeedingMode | '';
  foodType: string;
  brand: string;
  foodFormat: FoodFormat | '';
  portionSize: string;
  portionUnit: PortionUnit | '';
  feedingTimes: string[];
  treatNotes: string;
  waterIntakeNotes: string;
  dietaryRestrictions: string;
  specialInstructions: string;
};

export type VaccinationRecord = {
  id: string;
  cat_id: string;
  user_id: string;
  vaccine_name: string;
  date_given: string;
  next_due_date: string;
  vet_clinic_name: string;
  batch_or_certificate_number: string | null;
  proof_document_name: string | null;
  proof_document_uri: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type FeedingScheduleRecord = {
  id: string;
  cat_id: string;
  user_id: string;
  feeding_mode: FeedingMode;
  food_type: string;
  brand: string;
  food_format: FoodFormat;
  portion_size: number | null;
  portion_unit: PortionUnit | null;
  feeding_times: string[];
  treat_notes: string | null;
  water_intake_notes: string | null;
  dietary_restrictions: string | null;
  special_instructions: string | null;
  created_at: string;
  updated_at: string;
};

export type CatCareProfilePayload = {
  litter: Omit<LitterTrackingRecord, 'id' | 'created_at' | 'updated_at'>;
  medications: Omit<MedicationRecord, 'created_at' | 'updated_at'>[];
  vaccinations: Omit<VaccinationRecord, 'created_at' | 'updated_at'>[];
  feeding: Omit<FeedingScheduleRecord, 'id' | 'created_at' | 'updated_at'>;
};

export type LitterTrackingErrors = Partial<Record<keyof LitterTrackingInput, string>>;

export type MedicationFieldErrors = Partial<
  Record<
    | 'name'
    | 'purpose'
    | 'dosage'
    | 'unit'
    | 'frequency'
    | 'startDate'
    | 'endDate'
    | 'timesToGive'
    | 'status'
    | 'notes',
    string
  >
>;

export type MedicationErrorsMap = Record<string, MedicationFieldErrors>;

export type VaccinationFieldErrors = Partial<
  Record<
    | 'vaccineName'
    | 'dateGiven'
    | 'nextDueDate'
    | 'vetClinicName'
    | 'batchOrCertificateNumber'
    | 'proofDocumentName'
    | 'notes',
    string
  >
>;

export type VaccinationErrorsMap = Record<string, VaccinationFieldErrors>;

export type FeedingScheduleErrors = Partial<
  Record<
    | 'feedingMode'
    | 'foodType'
    | 'brand'
    | 'foodFormat'
    | 'portionSize'
    | 'portionUnit'
    | 'feedingTimes'
    | 'treatNotes'
    | 'waterIntakeNotes'
    | 'dietaryRestrictions'
    | 'specialInstructions',
    string
  >
>;
