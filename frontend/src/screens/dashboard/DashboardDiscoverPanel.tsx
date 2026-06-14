import { Download, RefreshCw } from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Carousel } from '../../components/Carousel';
import { DiscoverComicHeader } from '../../components/discover/DiscoverComicHeader';
import {
  DISCOVER_ACCENT,
  DISCOVER_CARD_BORDER,
  discoverComicStyles,
} from '../../components/discover/discoverStyles';
import { StoryComicCaption } from '../../components/story/StoryComicCaption';
import { useToast } from '../../contexts/ToastContext';
import { downloadCatImage } from '../../lib/catImageDownload';
import { fetchCatImages, getCatImageBreedName, mergeCatImages, shuffleCatImages } from '../../lib/catApi';
import { colors } from '../../theme/colors';
import { fonts, lowercase } from '../../theme/fonts';
import type { CatApiImage } from '../../types/catApi';

const storyWallpaper = require('../../cats/wallpaper4.jpg');
const LOAD_MORE_THRESHOLD = 2;

function ComicPhotoFrame({ children }: { children: React.ReactNode }) {
  return (
    <View style={discoverComicStyles.comicShadowSm}>
      <View style={discoverComicStyles.comicPanel}>{children}</View>
    </View>
  );
}

type DashboardDiscoverPanelProps = {
  onScroll?: Animated.ScrollViewProps['onScroll'];
};

export function DashboardDiscoverPanel({ onScroll }: DashboardDiscoverPanelProps) {
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const [images, setImages] = useState<CatApiImage[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pageRef = useRef(0);

  const loadImages = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    setError(null);
    pageRef.current = 0;

    try {
      const nextImages = shuffleCatImages(await fetchCatImages({ page: 0 }));
      setImages(nextImages);
      setActiveIndex(0);
    } catch (loadError) {
      const message =
        loadError instanceof Error ? loadError.message : 'could not load cat photos.';
      setError(message);
      setImages([]);
      setActiveIndex(0);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const loadMoreImages = useCallback(async () => {
    if (isLoadingMore || isRefreshing || isLoading) {
      return;
    }

    setIsLoadingMore(true);
    setError(null);

    try {
      const nextPage = pageRef.current + 1;
      const nextImages = shuffleCatImages(await fetchCatImages({ page: nextPage }));

      if (nextImages.length === 0) {
        showToast({
          title: 'no more cats',
          message: 'tap shuffle cats to start a fresh batch.',
        });
        return;
      }

      pageRef.current = nextPage;
      setImages((current) => mergeCatImages(current, nextImages));
    } catch (loadError) {
      const message =
        loadError instanceof Error ? loadError.message : 'could not load more cat photos.';
      setError(message);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoading, isLoadingMore, isRefreshing, showToast]);

  useEffect(() => {
    void loadImages();
  }, [loadImages]);

  useEffect(() => {
    if (images.length === 0 || isLoadingMore || isRefreshing || isLoading) {
      return;
    }

    if (activeIndex >= images.length - LOAD_MORE_THRESHOLD) {
      void loadMoreImages();
    }
  }, [activeIndex, images.length, isLoading, isLoadingMore, isRefreshing, loadMoreImages]);

  const activeImage = images[activeIndex];
  const activeBreed = getCatImageBreedName(activeImage);
  const slideLabel =
    images.length > 0 ? `${activeIndex + 1} of ${images.length}` : null;
  const captionText =
    activeBreed ?? (images.length > 0 ? 'mystery cat' : 'no cats found');

  const handleDownload = async () => {
    if (!activeImage || isDownloading) {
      return;
    }

    setIsDownloading(true);

    try {
      await downloadCatImage(activeImage);
      showToast({
        title: Platform.OS === 'web' ? 'saved' : 'shared',
        message:
          Platform.OS === 'web'
            ? 'cat photo downloaded successfully.'
            : 'use save image in the share menu to keep this cat photo.',
      });
    } catch (downloadError) {
      const message =
        downloadError instanceof Error
          ? downloadError.message
          : 'could not download this cat photo.';
      showToast({
        title: 'download failed',
        message,
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <View style={discoverComicStyles.screen}>
      <ImageBackground source={storyWallpaper} style={discoverComicStyles.wallpaper} resizeMode="cover" />

      <Animated.ScrollView
        style={discoverComicStyles.screen}
        contentContainerStyle={[
          discoverComicStyles.content,
          { paddingTop: insets.top + 88 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        <DiscoverComicHeader
          badge="cat carousel"
          title="discover cats"
          subtitle="swipe through random feline photos from around the web."
        />

        <View style={discoverComicStyles.comicShadow}>
          <View style={styles.carouselSection}>
            <View style={[styles.sectionLabelBar, { backgroundColor: DISCOVER_ACCENT }]}>
              <Text style={styles.sectionLabel}>today&apos;s picks</Text>
              {slideLabel ? <Text style={styles.slideCount}>{slideLabel}</Text> : null}
            </View>

            <View style={styles.carouselBody}>
              {isLoading ? (
                <View style={styles.stateWrap}>
                  <ActivityIndicator color={colors.coco} />
                  <Text style={styles.helper}>loading cats...</Text>
                </View>
              ) : error ? (
                <View style={styles.stateWrap}>
                  <Text style={styles.errorText}>{error}</Text>
                  <Pressable
                    onPress={() => {
                      void loadImages();
                    }}
                    style={({ pressed }) => [
                      discoverComicStyles.comicButton,
                      pressed ? discoverComicStyles.comicButtonPressed : null,
                    ]}
                  >
                    <RefreshCw size={16} color={colors.ink} strokeWidth={2} />
                    <Text style={styles.actionLabel}>try again</Text>
                  </Pressable>
                </View>
              ) : (
                <View style={styles.carouselWrap}>
                  <Carousel
                    onActiveIndexChange={setActiveIndex}
                    onReachEnd={loadMoreImages}
                    isLoadingMore={isLoadingMore}
                    style={styles.carousel}
                  >
                    <Carousel.Content>
                      {images.map((image) => (
                        <Carousel.Item key={image.id}>
                          <ComicPhotoFrame>
                            <Image
                              source={{ uri: image.url }}
                              style={styles.photo}
                              resizeMode="cover"
                            />
                          </ComicPhotoFrame>
                        </Carousel.Item>
                      ))}
                    </Carousel.Content>
                    {images.length > 1 ? (
                      <>
                        <Carousel.Previous style={styles.carouselNavPrevious} />
                        <Carousel.Next style={styles.carouselNavNext} />
                      </>
                    ) : null}
                  </Carousel>

                  <StoryComicCaption
                    caption={captionText}
                    panelKey={activeIndex}
                    accentColor={DISCOVER_ACCENT}
                  />

                  <Text style={styles.helper}>random cats from around the web</Text>

                  {isLoadingMore ? (
                    <Text style={styles.helper}>loading more cats...</Text>
                  ) : (
                    <Text style={styles.helper}>more cats load as you swipe</Text>
                  )}

                  <View style={styles.actions}>
                    <Pressable
                      onPress={() => {
                        void handleDownload();
                      }}
                      disabled={!activeImage || isDownloading}
                      style={({ pressed }) => [
                        discoverComicStyles.comicButton,
                        (!activeImage || isDownloading)
                          ? discoverComicStyles.comicButtonDisabled
                          : null,
                        pressed && activeImage && !isDownloading
                          ? discoverComicStyles.comicButtonPressed
                          : null,
                      ]}
                    >
                      {isDownloading ? (
                        <ActivityIndicator color={colors.ink} size="small" />
                      ) : (
                        <>
                          <Download size={16} color={colors.ink} strokeWidth={2} />
                          <Text style={styles.actionLabel}>download cat</Text>
                        </>
                      )}
                    </Pressable>

                    <Pressable
                      onPress={() => {
                        void loadImages(true);
                      }}
                      disabled={isRefreshing}
                      style={({ pressed }) => [
                        discoverComicStyles.comicButton,
                        isRefreshing ? discoverComicStyles.comicButtonDisabled : null,
                        pressed && !isRefreshing
                          ? discoverComicStyles.comicButtonPressed
                          : null,
                      ]}
                    >
                      {isRefreshing ? (
                        <ActivityIndicator color={colors.ink} size="small" />
                      ) : (
                        <>
                          <RefreshCw size={16} color={colors.ink} strokeWidth={2} />
                          <Text style={styles.actionLabel}>shuffle cats</Text>
                        </>
                      )}
                    </Pressable>
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  carouselSection: {
    borderWidth: DISCOVER_CARD_BORDER,
    borderColor: colors.ink,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  sectionLabelBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: DISCOVER_CARD_BORDER,
    borderBottomColor: colors.ink,
  },
  sectionLabel: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.ink,
    ...lowercase,
  },
  slideCount: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.ink,
    ...lowercase,
  },
  carouselBody: {
    paddingVertical: 18,
    paddingHorizontal: 4,
  },
  carouselWrap: {
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 12,
  },
  carousel: {
    width: '100%',
    maxWidth: '100%',
  },
  carouselNavPrevious: {
    left: 8,
    zIndex: 2,
  },
  carouselNavNext: {
    right: 8,
    zIndex: 2,
  },
  photo: {
    width: '100%',
    aspectRatio: 0.82,
  },
  stateWrap: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  helper: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.stone,
    textAlign: 'center',
    ...lowercase,
  },
  errorText: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.error,
    textAlign: 'center',
    ...lowercase,
  },
  actions: {
    width: '100%',
    gap: 10,
  },
  actionLabel: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.ink,
    ...lowercase,
  },
});
