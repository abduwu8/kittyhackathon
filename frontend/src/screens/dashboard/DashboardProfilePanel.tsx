import {
  Calendar,
  Cat,
  Images,
  PawPrint,
  Save,
  StickyNote,
  UserRound,
} from 'lucide-react-native';
import { Image, StyleSheet, Text, View } from 'react-native';

import { CatAvatarPicker } from '../../components/catCare/CatAvatarPicker';
import { DashboardPageHeader } from '../../components/dashboard/DashboardPageHeader';
import { DashboardSaveButton } from '../../components/dashboard/DashboardSaveButton';
import { DashboardSection } from '../../components/dashboard/DashboardSection';
import { dashboardStyles } from '../../components/dashboard/dashboardStyles';
import { ProfileField } from '../../components/profile/ProfileField';
import { CatPhotoGallery } from '../../components/profile/CatPhotoGallery';
import { useCatCare } from '../../contexts/CatCareContext';
import { getCatAvatarSource } from '../../lib/catAvatars';
import { colors } from '../../theme/colors';
import { fonts, lowercase } from '../../theme/fonts';

const HERO_AVATAR_SIZE = 96;

export function DashboardProfilePanel() {
  const {
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
    basicErrors,
    catPhotos,
    isLoadingCatPhotos,
    isUploadingCatPhoto,
    isRemovingCatPhoto,
    addCatPhoto,
    removeCatPhoto,
    isSavingProfile,
    saveProfile,
  } = useCatCare();

  const displayName = catName.trim() || 'Your Cat';

  return (
    <View style={dashboardStyles.panel}>
      <DashboardPageHeader
        title="Cat Profile"
        subtitle="Keep your cat's identity and details up to date."
      />

      <View style={styles.heroCard}>
        <View style={styles.heroAvatarWrap}>
          <Image
            source={getCatAvatarSource(catAvatar)}
            style={styles.heroAvatar}
            resizeMode="cover"
          />
        </View>
        <Text style={styles.heroName}>{displayName}</Text>
        {catBreed.trim() ? <Text style={styles.heroMeta}>{catBreed.trim()}</Text> : null}
      </View>

      <DashboardSection icon={Cat} title="Profile Photo">
        <CatAvatarPicker value={catAvatar} onChange={setCatAvatar} />
      </DashboardSection>

      <DashboardSection icon={PawPrint} title="Basic Details">
        <View style={dashboardStyles.form}>
          <ProfileField
            icon={UserRound}
            label="Name"
            value={catName}
            onChangeText={setCatName}
            placeholder="whiskers"
            error={basicErrors.catName}
          />
          <ProfileField
            icon={Cat}
            label="Breed"
            value={catBreed}
            onChangeText={setCatBreed}
            placeholder="siamese, tabby, mixed..."
            error={basicErrors.catBreed}
          />
          <ProfileField
            icon={Calendar}
            label="Age"
            value={catAge}
            onChangeText={setCatAge}
            placeholder="2 years"
          />
          <ProfileField
            icon={UserRound}
            label="Gender"
            value={catGender}
            onChangeText={setCatGender}
            placeholder="male / female / other"
          />
        </View>
      </DashboardSection>

      <DashboardSection icon={Images} title="Cat Photos">
        <CatPhotoGallery
          photos={catPhotos}
          isLoading={isLoadingCatPhotos}
          isUploading={isUploadingCatPhoto}
          isRemoving={isRemovingCatPhoto}
          onAddPhoto={addCatPhoto}
          onRemovePhoto={removeCatPhoto}
        />
      </DashboardSection>

      <DashboardSection icon={StickyNote} title="Notes">
        <ProfileField
          icon={StickyNote}
          label="Personality & quirks"
          value={catNotes}
          onChangeText={setCatNotes}
          placeholder="favorite spots, habits, temperament..."
          multiline
          numberOfLines={4}
        />
      </DashboardSection>

      <DashboardSaveButton
        label="Save Profile"
        icon={Save}
        onPress={saveProfile}
        isLoading={isSavingProfile}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 28,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.sandBorder,
  },
  heroAvatarWrap: {
    padding: 4,
    borderRadius: (HERO_AVATAR_SIZE + 8) / 2,
    borderWidth: 2,
    borderColor: 'rgba(139, 94, 60, 0.2)',
    backgroundColor: colors.background,
  },
  heroAvatar: {
    width: HERO_AVATAR_SIZE,
    height: HERO_AVATAR_SIZE,
    borderRadius: HERO_AVATAR_SIZE / 2,
    backgroundColor: colors.sand,
  },
  heroName: {
    fontFamily: fonts.bold,
    fontSize: 22,
    color: colors.ink,
    letterSpacing: -0.3,
    ...lowercase,
  },
  heroMeta: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.stone,
    ...lowercase,
  },
});
