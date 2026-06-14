import * as DocumentPicker from 'expo-document-picker';
import { ImageIcon, Plus, Trash2 } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { Carousel } from '../Carousel';
import { MAX_CAT_PHOTOS } from '../../lib/catPhotos';
import { colors } from '../../theme/colors';
import { fonts, lowercase } from '../../theme/fonts';
import type { CatPhoto } from '../../types/catPhoto';

type CatPhotoGalleryProps = {
  photos: CatPhoto[];
  isLoading: boolean;
  isUploading: boolean;
  isRemoving: boolean;
  onAddPhoto: (uri: string) => Promise<void>;
  onRemovePhoto: (photo: CatPhoto) => Promise<void>;
};

function PhotoCard({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.cardShadow}>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

export function CatPhotoGallery({
  photos,
  isLoading,
  isUploading,
  isRemoving,
  onAddPhoto,
  onRemovePhoto,
}: CatPhotoGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const canAddMore = photos.length < MAX_CAT_PHOTOS;
  const isBusy = isUploading || isRemoving;
  const activePhoto = photos[activeIndex];

  useEffect(() => {
    if (activeIndex >= photos.length) {
      setActiveIndex(Math.max(photos.length - 1, 0));
    }
  }, [activeIndex, photos.length]);

  const handleAddPhoto = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      multiple: false,
      type: 'image/*',
    });

    if (result.canceled || !result.assets?.[0]?.uri) {
      return;
    }

    await onAddPhoto(result.assets[0].uri);
  };

  const handleRemovePhoto = (photo: CatPhoto) => {
    Alert.alert('remove photo', 'delete this photo from your gallery?', [
      { text: 'cancel', style: 'cancel' },
      {
        text: 'remove',
        style: 'destructive',
        onPress: () => {
          void onRemovePhoto(photo);
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator color={colors.coco} />
        <Text style={styles.helper}>loading photos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Carousel onActiveIndexChange={setActiveIndex}>
        <Carousel.Content>
          {photos.length === 0 ? (
            <Carousel.Item>
              <PhotoCard>
                <View style={styles.emptyContent}>
                  <ImageIcon size={28} color={colors.stone} strokeWidth={1.75} />
                  <Text style={styles.emptyLabel}>no image</Text>
                </View>
              </PhotoCard>
            </Carousel.Item>
          ) : (
            photos.map((photo) => (
              <Carousel.Item key={photo.id}>
                <PhotoCard>
                  <Image source={{ uri: photo.url }} style={styles.photo} resizeMode="cover" />
                </PhotoCard>
              </Carousel.Item>
            ))
          )}
        </Carousel.Content>
        {photos.length > 1 ? (
          <>
            <Carousel.Previous />
            <Carousel.Next />
          </>
        ) : null}
      </Carousel>

      <View style={styles.actions}>
        <Pressable
          onPress={() => {
            void handleAddPhoto();
          }}
          disabled={!canAddMore || isBusy}
          style={({ pressed }) => [
            styles.actionButton,
            styles.addButton,
            (!canAddMore || isBusy) ? styles.actionButtonDisabled : null,
            pressed && canAddMore && !isBusy ? styles.actionButtonPressed : null,
          ]}
        >
          {isUploading ? (
            <ActivityIndicator color={colors.ink} size="small" />
          ) : (
            <>
              <Plus size={16} color={colors.ink} strokeWidth={2.25} />
              <Text style={styles.actionLabel}>add photo</Text>
            </>
          )}
        </Pressable>

        {activePhoto ? (
          <Pressable
            onPress={() => handleRemovePhoto(activePhoto)}
            disabled={isBusy}
            style={({ pressed }) => [
              styles.actionButton,
              styles.removeButton,
              isBusy ? styles.actionButtonDisabled : null,
              pressed && !isBusy ? styles.actionButtonPressed : null,
            ]}
          >
            {isRemoving ? (
              <ActivityIndicator color={colors.error} size="small" />
            ) : (
              <>
                <Trash2 size={16} color={colors.error} strokeWidth={2} />
                <Text style={[styles.actionLabel, styles.removeLabel]}>remove current</Text>
              </>
            )}
          </Pressable>
        ) : null}
      </View>

      <Text style={styles.helper}>
        {photos.length === 0
          ? 'add up to 10 photos of your cat'
          : `${photos.length} of ${MAX_CAT_PHOTOS} photos saved`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    alignItems: 'center',
    paddingHorizontal: 48,
  },
  loadingWrap: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 24,
  },
  cardShadow: {
    borderRadius: 4,
    shadowColor: colors.ink,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  card: {
    aspectRatio: 1,
    borderWidth: 2,
    borderColor: colors.ink,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  emptyContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 24,
  },
  emptyLabel: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.stone,
    ...lowercase,
  },
  actions: {
    width: '100%',
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: colors.ink,
    backgroundColor: colors.surface,
    shadowColor: colors.ink,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  addButton: {},
  removeButton: {
    borderColor: colors.error,
  },
  actionButtonDisabled: {
    opacity: 0.45,
  },
  actionButtonPressed: {
    transform: [{ translateX: 1 }, { translateY: 1 }],
    shadowOffset: { width: 1, height: 1 },
  },
  actionLabel: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.ink,
    ...lowercase,
  },
  removeLabel: {
    color: colors.error,
  },
  helper: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.stone,
    textAlign: 'center',
    ...lowercase,
  },
});
