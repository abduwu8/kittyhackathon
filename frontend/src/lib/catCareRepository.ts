import {
  deserializeFeedingRecord,
  deserializeLitterRecord,
  deserializeMedicationRecord,
  deserializeVaccinationRecord,
} from './catCareDeserializer';
import {
  serializeFeedingSchedule,
  serializeLitterTracking,
  serializeMedications,
  serializeVaccinations,
} from './catCareSerializer';
import { isPersistedCareId } from './careIds';
import { supabase } from './supabase';
import type {
  FeedingScheduleInput,
  LitterTrackingInput,
  MedicationInput,
  VaccinationInput,
} from '../types/catCare';

export type CatCareData = {
  litter: LitterTrackingInput | null;
  medications: MedicationInput[];
  vaccinations: VaccinationInput[];
  feeding: FeedingScheduleInput | null;
};

async function fetchLitter(catId: string, userId: string) {
  const { data, error } = await supabase
    .from('litter_tracking')
    .select('*')
    .eq('cat_id', catId)
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? deserializeLitterRecord(data) : null;
}

async function fetchMedications(catId: string, userId: string) {
  const { data, error } = await supabase
    .from('cat_medications')
    .select('*')
    .eq('cat_id', catId)
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(deserializeMedicationRecord);
}

async function fetchVaccinations(catId: string, userId: string) {
  const { data, error } = await supabase
    .from('cat_vaccinations')
    .select('*')
    .eq('cat_id', catId)
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(deserializeVaccinationRecord);
}

async function fetchFeeding(catId: string, userId: string) {
  const { data, error } = await supabase
    .from('feeding_schedules')
    .select('*')
    .eq('cat_id', catId)
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? deserializeFeedingRecord(data) : null;
}

export async function fetchCatCareData(catId: string, userId: string): Promise<CatCareData> {
  const [litter, medications, vaccinations, feeding] = await Promise.all([
    fetchLitter(catId, userId),
    fetchMedications(catId, userId),
    fetchVaccinations(catId, userId),
    fetchFeeding(catId, userId),
  ]);

  return { litter, medications, vaccinations, feeding };
}

export async function saveLitterTracking(
  input: LitterTrackingInput,
  catId: string,
  userId: string,
): Promise<{ error: string | null }> {
  const payload = serializeLitterTracking(input, catId, userId);

  if (!payload) {
    return { error: 'invalid litter tracking data.' };
  }

  const { data: existing, error: fetchError } = await supabase
    .from('litter_tracking')
    .select('id')
    .eq('cat_id', catId)
    .eq('user_id', userId)
    .maybeSingle();

  if (fetchError) {
    return { error: fetchError.message };
  }

  const timestamp = new Date().toISOString();

  if (existing?.id) {
    const { error } = await supabase
      .from('litter_tracking')
      .update({ ...payload, updated_at: timestamp })
      .eq('id', existing.id);

    return { error: error?.message ?? null };
  }

  const { error } = await supabase.from('litter_tracking').insert({
    ...payload,
    updated_at: timestamp,
  });

  return { error: error?.message ?? null };
}

export async function saveMedicationRecords(
  medications: MedicationInput[],
  catId: string,
  userId: string,
): Promise<{ medications: MedicationInput[]; error: string | null }> {
  const payload = serializeMedications(medications, catId, userId);

  const { error: deleteError } = await supabase
    .from('cat_medications')
    .delete()
    .eq('cat_id', catId)
    .eq('user_id', userId);

  if (deleteError) {
    return { medications, error: deleteError.message };
  }

  if (payload.length === 0) {
    return { medications: [], error: null };
  }

  const rows = payload.map(({ id, ...rest }) =>
    isPersistedCareId(id) ? { id, ...rest, updated_at: new Date().toISOString() } : { ...rest, updated_at: new Date().toISOString() },
  );

  const { data, error } = await supabase.from('cat_medications').insert(rows).select();

  if (error) {
    return { medications, error: error.message };
  }

  return {
    medications: (data ?? []).map(deserializeMedicationRecord),
    error: null,
  };
}

export async function saveVaccinationRecords(
  vaccinations: VaccinationInput[],
  catId: string,
  userId: string,
): Promise<{ vaccinations: VaccinationInput[]; error: string | null }> {
  const payload = serializeVaccinations(vaccinations, catId, userId);

  const { error: deleteError } = await supabase
    .from('cat_vaccinations')
    .delete()
    .eq('cat_id', catId)
    .eq('user_id', userId);

  if (deleteError) {
    return { vaccinations, error: deleteError.message };
  }

  if (payload.length === 0) {
    return { vaccinations: [], error: null };
  }

  const rows = payload.map(({ id, ...rest }) =>
    isPersistedCareId(id) ? { id, ...rest, updated_at: new Date().toISOString() } : { ...rest, updated_at: new Date().toISOString() },
  );

  const { data, error } = await supabase.from('cat_vaccinations').insert(rows).select();

  if (error) {
    return { vaccinations, error: error.message };
  }

  return {
    vaccinations: (data ?? []).map(deserializeVaccinationRecord),
    error: null,
  };
}

export async function saveFeedingScheduleRecord(
  input: FeedingScheduleInput,
  catId: string,
  userId: string,
): Promise<{ error: string | null }> {
  const payload = serializeFeedingSchedule(input, catId, userId);

  if (!payload) {
    return { error: 'invalid feeding schedule data.' };
  }

  const { data: existing, error: fetchError } = await supabase
    .from('feeding_schedules')
    .select('id')
    .eq('cat_id', catId)
    .eq('user_id', userId)
    .maybeSingle();

  if (fetchError) {
    return { error: fetchError.message };
  }

  const timestamp = new Date().toISOString();

  if (existing?.id) {
    const { error } = await supabase
      .from('feeding_schedules')
      .update({ ...payload, updated_at: timestamp })
      .eq('id', existing.id);

    return { error: error?.message ?? null };
  }

  const { error } = await supabase.from('feeding_schedules').insert({
    ...payload,
    updated_at: timestamp,
  });

  return { error: error?.message ?? null };
}
