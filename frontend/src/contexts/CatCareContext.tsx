import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Alert } from 'react-native';

import {
  createEmptyMedication,
  createEmptyVaccination,
  emptyFeedingSchedule,
  emptyLitterTracking,
} from '../data/catCareMock';
import {
  fetchCatCareData,
  saveFeedingScheduleRecord,
  saveLitterTracking,
  saveMedicationRecords,
  saveVaccinationRecords,
} from '../lib/catCareRepository';
import {
  deleteCatPhoto,
  fetchCatPhotos,
  uploadCatPhoto,
} from '../lib/catPhotos';
import { createCareItemId } from '../lib/careIds';
import {
  DEFAULT_CAT_AVATAR_ID,
  isCatAvatarId,
  type CatAvatarId,
} from '../lib/catAvatars';
import {
  cancelAllFeedingReminders,
  syncFeedingNotifications,
} from '../lib/feedingNotifications';
import { updateProfile } from '../lib/profile';
import { useAuth } from './AuthContext';
import { useProfile } from './ProfileContext';
import { useToast } from './ToastContext';
import {
  hasMedicationValidationErrors,
  hasValidationErrors,
  hasVaccinationValidationErrors,
  validateFeedingSchedule,
  validateLitterTracking,
  validateMedications,
  validateVaccinations,
} from '../lib/catCareValidation';
import type { CatPhoto } from '../types/catPhoto';
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

type BasicProfileErrors = {
  catName?: string;
  catBreed?: string;
};

type CatCareContextValue = {
  catName: string;
  catBreed: string;
  catAge: string;
  catGender: string;
  catNotes: string;
  catAvatar: CatAvatarId;
  setCatName: (value: string) => void;
  setCatBreed: (value: string) => void;
  setCatAge: (value: string) => void;
  setCatGender: (value: string) => void;
  setCatNotes: (value: string) => void;
  setCatAvatar: (value: CatAvatarId) => void;
  litter: LitterTrackingInput;
  setLitter: (value: LitterTrackingInput) => void;
  medications: MedicationInput[];
  setMedications: (value: MedicationInput[]) => void;
  addMedication: () => void;
  vaccinations: VaccinationInput[];
  setVaccinations: (value: VaccinationInput[]) => void;
  addVaccination: () => void;
  feeding: FeedingScheduleInput;
  setFeeding: (value: FeedingScheduleInput) => void;
  basicErrors: BasicProfileErrors;
  litterErrors: LitterTrackingErrors;
  medicationErrors: MedicationErrorsMap;
  vaccinationErrors: VaccinationErrorsMap;
  feedingErrors: FeedingScheduleErrors;
  isSavingProfile: boolean;
  isSavingLitter: boolean;
  isSavingMedications: boolean;
  isSavingVaccinations: boolean;
  isSavingFeeding: boolean;
  saveProfile: () => Promise<void>;
  catPhotos: CatPhoto[];
  isLoadingCatPhotos: boolean;
  isUploadingCatPhoto: boolean;
  isRemovingCatPhoto: boolean;
  addCatPhoto: (uri: string) => Promise<void>;
  removeCatPhoto: (photo: CatPhoto) => Promise<void>;
  saveLitter: () => Promise<void>;
  saveMedications: () => Promise<void>;
  saveVaccinations: () => Promise<void>;
  saveFeeding: () => Promise<void>;
};

const CatCareContext = createContext<CatCareContextValue | undefined>(undefined);

export function CatCareProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { profile, refreshProfile } = useProfile();
  const { showToast } = useToast();

  const [catName, setCatName] = useState(profile?.cat_name ?? '');
  const [catBreed, setCatBreed] = useState(profile?.cat_breed ?? '');
  const [catAge, setCatAge] = useState(profile?.cat_age ?? '');
  const [catGender, setCatGender] = useState(profile?.cat_gender ?? '');
  const [catNotes, setCatNotes] = useState(profile?.cat_notes ?? '');
  const [catAvatar, setCatAvatar] = useState<CatAvatarId>(
    isCatAvatarId(profile?.cat_avatar) ? profile.cat_avatar : DEFAULT_CAT_AVATAR_ID,
  );
  const [litter, setLitter] = useState<LitterTrackingInput>(emptyLitterTracking);
  const [medications, setMedications] = useState<MedicationInput[]>([]);
  const [vaccinations, setVaccinations] = useState<VaccinationInput[]>([]);
  const [feeding, setFeeding] = useState<FeedingScheduleInput>(emptyFeedingSchedule);
  const [basicErrors, setBasicErrors] = useState<BasicProfileErrors>({});
  const [litterErrors, setLitterErrors] = useState<LitterTrackingErrors>({});
  const [medicationErrors, setMedicationErrors] = useState<MedicationErrorsMap>({});
  const [vaccinationErrors, setVaccinationErrors] = useState<VaccinationErrorsMap>({});
  const [feedingErrors, setFeedingErrors] = useState<FeedingScheduleErrors>({});
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingLitter, setIsSavingLitter] = useState(false);
  const [isSavingMedications, setIsSavingMedications] = useState(false);
  const [isSavingVaccinations, setIsSavingVaccinations] = useState(false);
  const [isSavingFeeding, setIsSavingFeeding] = useState(false);
  const [catPhotos, setCatPhotos] = useState<CatPhoto[]>([]);
  const [isLoadingCatPhotos, setIsLoadingCatPhotos] = useState(false);
  const [isUploadingCatPhoto, setIsUploadingCatPhoto] = useState(false);
  const [isRemovingCatPhoto, setIsRemovingCatPhoto] = useState(false);

  const userId = user?.id ?? '';
  const hasCat = profile?.has_cat === true;

  useEffect(() => {
    if (!profile) {
      return;
    }

    setCatName(profile.cat_name ?? '');
    setCatBreed(profile.cat_breed ?? '');
    setCatAge(profile.cat_age ?? '');
    setCatGender(profile.cat_gender ?? '');
    setCatNotes(profile.cat_notes ?? '');
    setCatAvatar(
      isCatAvatarId(profile.cat_avatar) ? profile.cat_avatar : DEFAULT_CAT_AVATAR_ID,
    );
  }, [profile]);

  useEffect(() => {
    if (!userId || !profile?.id || !hasCat) {
      setLitter(emptyLitterTracking);
      setMedications([]);
      setVaccinations([]);
      setFeeding(emptyFeedingSchedule);
      void cancelAllFeedingReminders();
      return;
    }

    let cancelled = false;

    const loadCatCareData = async () => {
      try {
        const data = await fetchCatCareData(profile.id, userId);

        if (cancelled) {
          return;
        }

        const nextFeeding = data.feeding ?? emptyFeedingSchedule;

        setLitter(data.litter ?? emptyLitterTracking);
        setMedications(data.medications);
        setVaccinations(data.vaccinations);
        setFeeding(nextFeeding);

        void syncFeedingNotifications({
          profileId: profile.id,
          catName: profile.cat_name ?? '',
          feeding: nextFeeding,
        });
      } catch {
        if (!cancelled) {
          setLitter(emptyLitterTracking);
          setMedications([]);
          setVaccinations([]);
          setFeeding(emptyFeedingSchedule);
        }
      }
    };

    loadCatCareData();

    return () => {
      cancelled = true;
    };
  }, [hasCat, profile?.id, userId]);

  useEffect(() => {
    if (!userId || !profile?.id || !hasCat) {
      setCatPhotos([]);
      return;
    }

    let cancelled = false;

    const loadCatPhotos = async () => {
      setIsLoadingCatPhotos(true);

      try {
        const photos = await fetchCatPhotos(profile.id, userId);

        if (!cancelled) {
          setCatPhotos(photos);
        }
      } catch {
        if (!cancelled) {
          setCatPhotos([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingCatPhotos(false);
        }
      }
    };

    void loadCatPhotos();

    return () => {
      cancelled = true;
    };
  }, [hasCat, profile?.id, userId]);

  const addCatPhoto = useCallback(
    async (uri: string) => {
      if (!userId || !profile?.id || !hasCat) {
        Alert.alert('upload failed', 'you must be signed in to add photos.');
        return;
      }

      setIsUploadingCatPhoto(true);

      const { photo, error } = await uploadCatPhoto(profile.id, userId, uri);

      setIsUploadingCatPhoto(false);

      if (error || !photo) {
        Alert.alert('upload failed', (error ?? 'could not upload photo.').toLowerCase());
        return;
      }

      setCatPhotos((current) => [...current, photo]);
      showToast({
        title: 'photo added',
        message: 'your cat photo has been saved.',
      });
    },
    [hasCat, profile?.id, showToast, userId],
  );

  const removeCatPhoto = useCallback(
    async (photo: CatPhoto) => {
      if (!userId) {
        Alert.alert('remove failed', 'you must be signed in to remove photos.');
        return;
      }

      setIsRemovingCatPhoto(true);

      const { error } = await deleteCatPhoto(photo.id, photo.storagePath, userId);

      setIsRemovingCatPhoto(false);

      if (error) {
        Alert.alert('remove failed', error.toLowerCase());
        return;
      }

      setCatPhotos((current) => current.filter((item) => item.id !== photo.id));
      showToast({
        title: 'photo removed',
        message: 'the photo has been deleted.',
      });
    },
    [showToast, userId],
  );

  const addMedication = useCallback(() => {
    setMedications((current) => [...current, createEmptyMedication(createCareItemId())]);
  }, []);

  const addVaccination = useCallback(() => {
    setVaccinations((current) => [...current, createEmptyVaccination(createCareItemId())]);
  }, []);

  const saveProfile = useCallback(async () => {
    if (!userId || !hasCat) {
      Alert.alert('save failed', 'you must be signed in to save your profile.');
      return;
    }

    const nextErrors: BasicProfileErrors = {};

    if (!catName.trim()) {
      nextErrors.catName = 'cat name is required.';
    }

    if (!catBreed.trim()) {
      nextErrors.catBreed = 'breed is required.';
    }

    setBasicErrors(nextErrors);

    if (hasValidationErrors(nextErrors)) {
      return;
    }

    setIsSavingProfile(true);

    const payload = {
      cat_name: catName.trim(),
      cat_breed: catBreed.trim(),
      cat_age: catAge.trim() || null,
      cat_gender: catGender.trim() || null,
      cat_notes: catNotes.trim() || null,
      cat_avatar: catAvatar,
    };

    const { error } = await updateProfile(userId, payload);

    setIsSavingProfile(false);

    if (error) {
      Alert.alert('save failed', error.toLowerCase());
      return;
    }

    await refreshProfile();
    showToast({
      title: 'profile saved',
      message: 'your cat profile has been updated.',
    });
  }, [catAge, catAvatar, catBreed, catGender, catName, catNotes, hasCat, refreshProfile, showToast, userId]);

  const saveLitter = useCallback(async () => {
    if (!userId || !profile?.id || !hasCat) {
      Alert.alert('save failed', 'you must be signed in to save litter tracking.');
      return;
    }

    const nextErrors = validateLitterTracking(litter);
    setLitterErrors(nextErrors);

    if (hasValidationErrors(nextErrors)) {
      return;
    }

    setIsSavingLitter(true);

    const { error } = await saveLitterTracking(litter, profile.id, userId);

    setIsSavingLitter(false);

    if (error) {
      Alert.alert('save failed', error.toLowerCase());
      return;
    }

    showToast({
      title: 'litter saved',
      message: 'litter tracking has been updated.',
    });
  }, [hasCat, litter, profile?.id, showToast, userId]);

  const saveMedications = useCallback(async () => {
    if (!userId || !profile?.id || !hasCat) {
      Alert.alert('save failed', 'you must be signed in to save medications.');
      return;
    }

    const nextErrors = validateMedications(medications);
    setMedicationErrors(nextErrors);

    if (hasMedicationValidationErrors(nextErrors)) {
      return;
    }

    setIsSavingMedications(true);

    const { medications: savedMedications, error } = await saveMedicationRecords(
      medications,
      profile.id,
      userId,
    );

    setIsSavingMedications(false);

    if (error) {
      Alert.alert('save failed', error.toLowerCase());
      return;
    }

    setMedications(savedMedications);
    showToast({
      title: 'medications saved',
      message: 'medication schedules have been updated.',
    });
  }, [hasCat, medications, profile?.id, showToast, userId]);

  const saveVaccinations = useCallback(async () => {
    if (!userId || !profile?.id || !hasCat) {
      Alert.alert('save failed', 'you must be signed in to save vaccinations.');
      return;
    }

    const nextErrors = validateVaccinations(vaccinations);
    setVaccinationErrors(nextErrors);

    if (hasVaccinationValidationErrors(nextErrors)) {
      return;
    }

    setIsSavingVaccinations(true);

    const { vaccinations: savedVaccinations, error } = await saveVaccinationRecords(
      vaccinations,
      profile.id,
      userId,
    );

    setIsSavingVaccinations(false);

    if (error) {
      Alert.alert('save failed', error.toLowerCase());
      return;
    }

    setVaccinations(savedVaccinations);
    showToast({
      title: 'vaccinations saved',
      message: 'vaccine records have been updated.',
    });
  }, [hasCat, profile?.id, showToast, userId, vaccinations]);

  const saveFeeding = useCallback(async () => {
    if (!userId || !profile?.id || !hasCat) {
      Alert.alert('save failed', 'you must be signed in to save feeding schedules.');
      return;
    }

    const nextErrors = validateFeedingSchedule(feeding);
    setFeedingErrors(nextErrors);

    if (hasValidationErrors(nextErrors)) {
      return;
    }

    setIsSavingFeeding(true);

    const { error } = await saveFeedingScheduleRecord(feeding, profile.id, userId);

    setIsSavingFeeding(false);

    if (error) {
      Alert.alert('save failed', error.toLowerCase());
      return;
    }

    const notificationResult = await syncFeedingNotifications({
      profileId: profile.id,
      catName: catName.trim() || profile.cat_name || '',
      feeding,
    });

    let message = 'your feeding schedule has been updated.';

    if (notificationResult.scheduled > 0) {
      const reminderLabel = notificationResult.scheduled === 1 ? 'reminder' : 'reminders';
      message = `your schedule is saved. ${notificationResult.scheduled} daily ${reminderLabel} set.`;
    } else if (notificationResult.permissionDenied && feeding.feedingMode === 'meal_fed') {
      message = 'schedule saved. enable notifications in settings for feeding reminders.';
    }

    showToast({
      title: 'feeding saved',
      message,
    });
  }, [catName, feeding, hasCat, profile?.cat_name, profile?.id, showToast, userId]);

  const value = useMemo(
    () => ({
      catName,
      catBreed,
      catAge,
      catGender,
      catNotes,
      catAvatar,
      setCatName,
      setCatBreed,
      setCatAge,
      setCatGender,
      setCatNotes,
      setCatAvatar,
      litter,
      setLitter,
      medications,
      setMedications,
      addMedication,
      vaccinations,
      setVaccinations,
      addVaccination,
      feeding,
      setFeeding,
      basicErrors,
      litterErrors,
      medicationErrors,
      vaccinationErrors,
      feedingErrors,
      isSavingProfile,
      isSavingLitter,
      isSavingMedications,
      isSavingVaccinations,
      isSavingFeeding,
      saveProfile,
      catPhotos,
      isLoadingCatPhotos,
      isUploadingCatPhoto,
      isRemovingCatPhoto,
      addCatPhoto,
      removeCatPhoto,
      saveLitter,
      saveMedications,
      saveVaccinations,
      saveFeeding,
    }),
    [
      catName,
      catBreed,
      catAge,
      catGender,
      catNotes,
      catAvatar,
      litter,
      medications,
      addMedication,
      vaccinations,
      addVaccination,
      feeding,
      basicErrors,
      litterErrors,
      medicationErrors,
      vaccinationErrors,
      feedingErrors,
      isSavingProfile,
      isSavingLitter,
      isSavingMedications,
      isSavingVaccinations,
      isSavingFeeding,
      saveProfile,
      catPhotos,
      isLoadingCatPhotos,
      isUploadingCatPhoto,
      isRemovingCatPhoto,
      addCatPhoto,
      removeCatPhoto,
      saveLitter,
      saveMedications,
      saveVaccinations,
      saveFeeding,
    ],
  );

  return <CatCareContext.Provider value={value}>{children}</CatCareContext.Provider>;
}

export function useCatCare() {
  const context = useContext(CatCareContext);

  if (!context) {
    throw new Error('useCatCare must be used within a CatCareProvider');
  }

  return context;
}
