import { RefreshCw } from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { MotiView } from 'moti';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DiscoverComicHeader } from '../../components/discover/DiscoverComicHeader';
import {
  DISCOVER_CARD_BORDER,
  DISCOVER_PANEL_RADIUS,
  discoverComicStyles,
} from '../../components/discover/discoverStyles';
import { fetchCatImages } from '../../lib/catApi';
import {
  fetchAllCatBreeds,
  fetchCatFacts,
  mergeCatFacts,
  shuffleCatBreeds,
  shuffleCatFacts,
  type CatBreed,
  type CatFact,
} from '../../lib/catFacts';
import { getCountryFlags, getPrimaryCountryLabel } from '../../lib/countryFlag';
import { colors } from '../../theme/colors';
import { fonts, lowercase } from '../../theme/fonts';

const storyWallpaper = require('../../cats/wallpaper4.jpg');

const FACTS_ACCENT = '#F5D547';
const BREEDS_ACCENT = '#A8C3A0';
const FLOAT_OFFSET = 8;
const FLOAT_DURATION_MS = 2600;

const LOAD_MORE_THRESHOLD = 3;
const FACTS_BATCH_SIZE = 15;

type DashboardCatFactsPanelProps = {
  onScroll?: Animated.ScrollViewProps['onScroll'];
};

function BreedDetailRow({ label, value }: { label: string; value: string }) {
  if (!value) {
    return null;
  }

  return (
    <View style={styles.breedDetailRow}>
      <Text style={styles.breedDetailLabel}>{label}</Text>
      <Text style={styles.breedDetailValue} numberOfLines={4}>
        {value}
      </Text>
    </View>
  );
}

function YellowButton({
  label,
  onPress,
  disabled,
  loading,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.yellowButton,
        disabled || loading ? styles.yellowButtonDisabled : null,
        pressed && !disabled && !loading ? styles.yellowButtonPressed : null,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.ink} size="small" />
      ) : (
        <Text style={styles.yellowButtonLabel}>{label}</Text>
      )}
    </Pressable>
  );
}

function ComicPhotoFrame({ children }: { children: React.ReactNode }) {
  return (
    <View style={discoverComicStyles.comicShadowSm}>
      <View style={styles.breedPhotoPanel}>{children}</View>
    </View>
  );
}

export function DashboardCatFactsPanel({ onScroll }: DashboardCatFactsPanelProps) {
  const insets = useSafeAreaInsets();
  const [facts, setFacts] = useState<CatFact[]>([]);
  const [breeds, setBreeds] = useState<CatBreed[]>([]);
  const [activeFactIndex, setActiveFactIndex] = useState(0);
  const [activeBreedIndex, setActiveBreedIndex] = useState(0);
  const [isLoadingFacts, setIsLoadingFacts] = useState(true);
  const [isLoadingBreeds, setIsLoadingBreeds] = useState(true);
  const [isRefreshingFacts, setIsRefreshingFacts] = useState(false);
  const [factsError, setFactsError] = useState<string | null>(null);
  const [breedsError, setBreedsError] = useState<string | null>(null);
  const [isLoadingMoreFacts, setIsLoadingMoreFacts] = useState(false);
  const [breedImageUrl, setBreedImageUrl] = useState<string | null>(null);
  const [isLoadingBreedImage, setIsLoadingBreedImage] = useState(false);
  const isFetchingMoreRef = useRef(false);
  const breedImageCacheRef = useRef<Map<string, string>>(new Map());

  const loadFacts = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshingFacts(true);
    } else {
      setIsLoadingFacts(true);
    }

    setFactsError(null);

    try {
      const nextFacts = shuffleCatFacts(await fetchCatFacts({ count: FACTS_BATCH_SIZE }));
      setFacts(nextFacts);
      setActiveFactIndex(0);
    } catch (loadError) {
      const message =
        loadError instanceof Error ? loadError.message : 'could not load cat facts.';
      setFactsError(message);
      setFacts([]);
      setActiveFactIndex(0);
    } finally {
      setIsLoadingFacts(false);
      setIsRefreshingFacts(false);
    }
  }, []);

  const loadBreeds = useCallback(async () => {
    setIsLoadingBreeds(true);
    setBreedsError(null);

    try {
      const nextBreeds = shuffleCatBreeds(await fetchAllCatBreeds());
      setBreeds(nextBreeds);
      setActiveBreedIndex(0);
    } catch (loadError) {
      const message =
        loadError instanceof Error ? loadError.message : 'could not load cat breeds.';
      setBreedsError(message);
      setBreeds([]);
      setActiveBreedIndex(0);
    } finally {
      setIsLoadingBreeds(false);
    }
  }, []);

  const loadMoreFacts = useCallback(async () => {
    if (isFetchingMoreRef.current || isLoadingMoreFacts || isRefreshingFacts || isLoadingFacts) {
      return;
    }

    isFetchingMoreRef.current = true;
    setIsLoadingMoreFacts(true);

    try {
      const nextFacts = shuffleCatFacts(await fetchCatFacts({ count: FACTS_BATCH_SIZE }));
      setFacts((current) => mergeCatFacts(current, nextFacts));
    } catch {
      // keep cycling existing facts
    } finally {
      isFetchingMoreRef.current = false;
      setIsLoadingMoreFacts(false);
    }
  }, [isLoadingFacts, isLoadingMoreFacts, isRefreshingFacts]);

  useEffect(() => {
    void loadFacts();
    void loadBreeds();
  }, [loadFacts, loadBreeds]);

  useEffect(() => {
    if (facts.length === 0 || isLoadingFacts) {
      return;
    }

    if (activeFactIndex >= facts.length - LOAD_MORE_THRESHOLD) {
      void loadMoreFacts();
    }
  }, [activeFactIndex, facts.length, isLoadingFacts, loadMoreFacts]);

  const activeFact = facts[activeFactIndex];
  const activeBreed = breeds[activeBreedIndex];
  const activeBreedName = activeBreed?.breed ?? null;

  useEffect(() => {
    if (!activeBreedName) {
      setBreedImageUrl(null);
      return;
    }

    const cached = breedImageCacheRef.current.get(activeBreedName);
    if (cached) {
      setBreedImageUrl(cached);
      return;
    }

    let cancelled = false;
    setIsLoadingBreedImage(true);
    setBreedImageUrl(null);

    void fetchCatImages({ breedQuery: activeBreedName, limit: 1 })
      .then((images) => {
        if (cancelled) {
          return;
        }

        const url = images[0]?.url ?? null;
        if (url) {
          breedImageCacheRef.current.set(activeBreedName, url);
        }
        setBreedImageUrl(url);
      })
      .catch(() => {
        if (!cancelled) {
          setBreedImageUrl(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingBreedImage(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeBreedName]);

  const factLabel =
    facts.length > 0 ? `${activeFactIndex + 1} of ${facts.length}` : null;
  const breedLabel =
    breeds.length > 0 ? `${activeBreedIndex + 1} of ${breeds.length}` : null;

  const showNextFact = () => {
    if (facts.length === 0 || isLoadingFacts) {
      return;
    }

    setActiveFactIndex((current) => (current + 1) % facts.length);
  };

  const showNextBreed = () => {
    if (breeds.length === 0 || isLoadingBreeds) {
      return;
    }

    setActiveBreedIndex((current) => (current + 1) % breeds.length);
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
          badge="cat facts"
          title="did you know?"
          subtitle="random feline facts and breed spotlights, refreshed on tap."
          accentColor={FACTS_ACCENT}
        />

        <View style={discoverComicStyles.comicShadow}>
          <View style={styles.sectionCard}>
            <View style={[styles.sectionLabelBar, { backgroundColor: FACTS_ACCENT }]}>
              <Text style={styles.sectionLabel}>daily fact</Text>
              {factLabel ? <Text style={styles.sectionCount}>{factLabel}</Text> : null}
            </View>

            <View style={styles.sectionBody}>
              {isLoadingFacts ? (
                <View style={styles.stateWrap}>
                  <ActivityIndicator color={colors.coco} />
                  <Text style={styles.helper}>fetching cat facts...</Text>
                </View>
              ) : factsError ? (
                <View style={styles.stateWrap}>
                  <Text style={styles.errorText}>{factsError}</Text>
                  <Pressable
                    onPress={() => {
                      void loadFacts();
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
                <View style={styles.factWrap}>
                  <Pressable
                    onPress={showNextFact}
                    style={({ pressed }) => [pressed ? styles.factCardPressed : null]}
                    accessibilityRole="button"
                    accessibilityLabel="next cat fact"
                  >
                    <MotiView
                      animate={{ translateY: [0, -FLOAT_OFFSET, 0] }}
                      transition={{
                        type: 'timing',
                        duration: FLOAT_DURATION_MS,
                        loop: true,
                      }}
                      style={styles.factFloatWrap}
                    >
                      <View style={discoverComicStyles.comicShadowSm}>
                        <View style={styles.factCard}>
                          {activeFact ? (
                            <MotiView
                              key={activeFact.id}
                              from={{ opacity: 0, translateY: 6 }}
                              animate={{ opacity: 1, translateY: 0 }}
                              transition={{ type: 'timing', duration: 280 }}
                            >
                              <Text style={styles.factText}>{activeFact.text}</Text>
                            </MotiView>
                          ) : (
                            <Text style={styles.factText}>no facts yet.</Text>
                          )}
                        </View>
                      </View>
                    </MotiView>
                  </Pressable>

                  <Text style={styles.helper}>tap the card for another fact</Text>

                  {isLoadingMoreFacts ? (
                    <Text style={styles.helper}>loading more facts...</Text>
                  ) : null}

                  <YellowButton
                    label="shuffle facts"
                    onPress={() => {
                      void loadFacts(true);
                    }}
                    disabled={isRefreshingFacts}
                    loading={isRefreshingFacts}
                  />
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={discoverComicStyles.comicShadow}>
          <View style={styles.sectionCard}>
            <View style={[styles.sectionLabelBar, { backgroundColor: BREEDS_ACCENT }]}>
              <Text style={styles.sectionLabel}>breed spotlight</Text>
              {breedLabel ? <Text style={styles.sectionCount}>{breedLabel}</Text> : null}
            </View>

            <View style={styles.sectionBody}>
              {isLoadingBreeds ? (
                <View style={styles.stateWrap}>
                  <ActivityIndicator color={colors.coco} />
                  <Text style={styles.helper}>loading cat breeds...</Text>
                </View>
              ) : breedsError ? (
                <View style={styles.stateWrap}>
                  <Text style={styles.errorText}>{breedsError}</Text>
                  <Pressable
                    onPress={() => {
                      void loadBreeds();
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
                <View style={styles.breedWrap}>
                  <Pressable
                    onPress={showNextBreed}
                    style={({ pressed }) => [
                      styles.breedCard,
                      pressed ? styles.breedCardPressed : null,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel="next cat breed"
                  >
                    {activeBreed ? (
                      <MotiView
                        key={activeBreed.breed}
                        from={{ opacity: 0, translateY: 6 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ type: 'timing', duration: 280 }}
                        style={styles.breedContent}
                      >
                        <ComicPhotoFrame>
                          {isLoadingBreedImage ? (
                            <View style={styles.breedPhotoPlaceholder}>
                              <ActivityIndicator color={colors.coco} />
                            </View>
                          ) : breedImageUrl ? (
                            <Image
                              source={{ uri: breedImageUrl }}
                              style={styles.breedPhoto}
                              resizeMode="cover"
                            />
                          ) : (
                            <View style={styles.breedPhotoPlaceholder}>
                              <Text style={styles.breedPhotoFallback}>no photo yet</Text>
                            </View>
                          )}
                        </ComicPhotoFrame>

                        <Text style={styles.breedName} numberOfLines={2}>
                          {activeBreed.breed}
                        </Text>

                        <View style={styles.countryRow}>
                          <Text style={styles.countryFlag}>
                            {getCountryFlags(activeBreed.country)}
                          </Text>
                          <Text style={styles.countryName} numberOfLines={2}>
                            {getPrimaryCountryLabel(activeBreed.country)}
                          </Text>
                        </View>

                        <View style={styles.breedDetails}>
                          <BreedDetailRow label="origin" value={activeBreed.origin} />
                          <BreedDetailRow label="coat" value={activeBreed.coat} />
                          <BreedDetailRow label="pattern" value={activeBreed.pattern} />
                        </View>
                      </MotiView>
                    ) : (
                      <Text style={styles.factText}>no breeds yet.</Text>
                    )}
                  </Pressable>

                  <Text style={styles.helper}>tap the card for another breed</Text>

                  <YellowButton
                    label="shuffle breeds"
                    onPress={() => {
                      setBreeds((current) => shuffleCatBreeds(current));
                      setActiveBreedIndex(0);
                    }}
                    disabled={breeds.length === 0}
                  />
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
  sectionCard: {
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
  sectionCount: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.ink,
    ...lowercase,
  },
  sectionBody: {
    paddingVertical: 18,
    paddingHorizontal: 12,
  },
  factWrap: {
    alignItems: 'center',
    gap: 14,
  },
  factFloatWrap: {
    width: '100%',
  },
  factCard: {
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: 12,
    backgroundColor: colors.surface,
    paddingHorizontal: 18,
    paddingVertical: 22,
    minHeight: 120,
    justifyContent: 'center',
  },
  factCardPressed: {
    opacity: 0.92,
  },
  factText: {
    fontFamily: fonts.medium,
    fontSize: 16,
    lineHeight: 24,
    color: colors.ink,
    textAlign: 'center',
    ...lowercase,
  },
  breedWrap: {
    width: '100%',
    alignItems: 'stretch',
    gap: 14,
  },
  breedCard: {
    width: '100%',
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: 12,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 14,
    overflow: 'hidden',
  },
  breedCardPressed: {
    opacity: 0.92,
  },
  breedContent: {
    width: '100%',
    gap: 10,
  },
  breedPhotoPanel: {
    width: '100%',
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: DISCOVER_PANEL_RADIUS,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  breedPhoto: {
    width: '100%',
    aspectRatio: 1,
  },
  breedPhotoPlaceholder: {
    width: '100%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  breedPhotoFallback: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.stone,
    ...lowercase,
  },
  breedName: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.ink,
    textAlign: 'center',
    ...lowercase,
  },
  countryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    width: '100%',
  },
  countryFlag: {
    fontSize: 22,
    lineHeight: 26,
  },
  countryName: {
    flex: 1,
    fontFamily: fonts.semibold,
    fontSize: 13,
    lineHeight: 18,
    color: colors.coco,
    textAlign: 'left',
    ...lowercase,
  },
  breedDetails: {
    gap: 6,
    width: '100%',
  },
  breedDetailRow: {
    width: '100%',
    gap: 2,
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: colors.background,
  },
  breedDetailLabel: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: colors.stone,
    ...lowercase,
  },
  breedDetailValue: {
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 18,
    color: colors.ink,
    ...lowercase,
  },
  yellowButton: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: 4,
    backgroundColor: FACTS_ACCENT,
  },
  yellowButtonPressed: {
    opacity: 0.88,
    transform: [{ translateY: 1 }],
  },
  yellowButtonDisabled: {
    opacity: 0.45,
  },
  yellowButtonLabel: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.ink,
    ...lowercase,
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
  actionLabel: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.ink,
    ...lowercase,
  },
});
