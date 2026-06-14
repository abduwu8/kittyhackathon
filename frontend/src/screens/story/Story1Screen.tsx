import { ArrowLeft } from 'lucide-react-native';
import { MotiView } from 'moti';
import { useCallback, useEffect, useState } from 'react';
import {
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { StoryComicCaption } from '../../components/story/StoryComicCaption';
import { ComicPanelZoom } from '../../components/story/ComicPanelZoom';
import { StoryIndexCard } from '../../components/story/StoryIndexCard';
import { StoryIndexHeader } from '../../components/story/StoryIndexHeader';
import { LoadingCat } from '../../components/loader';
import { STORIES as FALLBACK_STORIES, getStoryPanelCount, type StoryItem } from '../../data/stories';
import { fetchStories } from '../../lib/storyApi';
import { getStoryCaption } from '../../data/storyCaptions';
import type { StoryPanel } from '../../lib/storyComicLayout';
import { getPanelSize, getRowHeight } from '../../lib/storyComicLayout';
import { colors } from '../../theme/colors';
import { fonts, lowercase } from '../../theme/fonts';

const storyWallpaper = require('../../cats/wallpaper4.jpg');

const GAP = 8;
const PAGE_INSET = 12;
const PANEL_BORDER = 2;
const PANEL_RADIUS = 8;
const COMIC_TOP_EXTRA = 20;
const LOAD_MS = 3000;
const PHASE_FADE_MS = 700;
const TOP_BAR_HIDE_SCROLL_THRESHOLD = 36;
const TOP_BAR_ANIMATION_MS = 220;

type StoryPhase = 'loading' | 'index' | 'comic';

export type { StoryPhase };

type ComicPanelProps = {
  panel: StoryPanel;
  width: number;
  height: number;
  isLatest: boolean;
  onPress: (panel: StoryPanel) => void;
};

function ComicPanel({ panel, width, height, isLatest, onPress }: ComicPanelProps) {
  return (
    <Pressable
      onPress={() => onPress(panel)}
      accessibilityRole="button"
      accessibilityLabel="zoom comic panel"
      style={{ width, height }}
    >
      <MotiView
        key={`panel-${panel.id}-${isLatest ? 'latest' : 'settled'}`}
        from={{ opacity: 0, scale: 0.94, translateY: 10 }}
        animate={{ opacity: 1, scale: 1, translateY: 0 }}
        transition={{
          type: 'spring',
          damping: 18,
          stiffness: 240,
          mass: 0.75,
        }}
        style={[
          styles.panelSlot,
          {
            width,
            height,
            borderColor: panel.borderColor,
          },
        ]}
      >
        <Image source={panel.source} style={styles.panelImage} resizeMode="contain" />
      </MotiView>
    </Pressable>
  );
}

function StoryLoader({ label }: { label: string }) {
  return (
    <MotiView
      from={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'timing', duration: PHASE_FADE_MS }}
      style={styles.loaderStage}
    >
      <LoadingCat size={132} showLabel={false} />
      <Text style={styles.loaderLabel}>{label}</Text>
    </MotiView>
  );
}

export function Story1Screen({
  onPhaseChange,
}: {
  onPhaseChange?: (phase: StoryPhase) => void;
}) {
  const insets = useSafeAreaInsets();
  const [stories, setStories] = useState<StoryItem[]>(FALLBACK_STORIES);
  const [phase, setPhase] = useState<StoryPhase>('loading');
  const [activeStoryId, setActiveStoryId] = useState<string | null>(null);
  const [pageWidth, setPageWidth] = useState(0);
  const [revealedCount, setRevealedCount] = useState(0);
  const [zoomedPanel, setZoomedPanel] = useState<StoryPanel | null>(null);
  const topBarHidden = useSharedValue(0);

  const activeStory =
    stories.find((story) => story.id === activeStoryId) ?? stories[0] ?? FALLBACK_STORIES[0];
  const storyRows = activeStory.rows;
  const totalPanels = getStoryPanelCount(activeStory);
  const isComplete = revealedCount >= totalPanels;

  useEffect(() => {
    if (phase !== 'loading') {
      return;
    }

    let cancelled = false;

    const loadStories = async () => {
      try {
        const nextStories = await fetchStories();
        if (!cancelled && nextStories.length > 0) {
          setStories(nextStories);
        }
      } catch {
        // bundled fallback remains in state
      }
    };

    void loadStories();

    const timer = setTimeout(() => {
      if (!cancelled) {
        setPhase('index');
      }
    }, LOAD_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [phase]);

  useEffect(() => {
    onPhaseChange?.(phase);
  }, [onPhaseChange, phase]);

  useEffect(() => {
    topBarHidden.value = 0;
  }, [phase, activeStoryId, topBarHidden]);

  const comicScrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      const y = event.contentOffset.y;

      if (y > TOP_BAR_HIDE_SCROLL_THRESHOLD) {
        topBarHidden.value = withTiming(1, { duration: TOP_BAR_ANIMATION_MS });
        return;
      }

      topBarHidden.value = withTiming(0, { duration: TOP_BAR_ANIMATION_MS });
    },
  });

  const topBarAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(topBarHidden.value, [0, 1], [1, 0], Extrapolation.CLAMP),
    transform: [
      {
        translateY: interpolate(topBarHidden.value, [0, 1], [0, -28], Extrapolation.CLAMP),
      },
      {
        scale: interpolate(topBarHidden.value, [0, 1], [1, 0.94], Extrapolation.CLAMP),
      },
    ],
  }));

  const handleSelectStory = useCallback((storyId: string) => {
    setActiveStoryId(storyId);
    setRevealedCount(1);
    setPhase('comic');
  }, []);

  const handleBackToIndex = useCallback(() => {
    setZoomedPanel(null);
    setRevealedCount(0);
    setPhase('index');
  }, []);

  const handlePanelPress = useCallback((panel: StoryPanel) => {
    setZoomedPanel(panel);
  }, []);

  const handleCloseZoom = useCallback(() => {
    setZoomedPanel(null);
  }, []);

  const handleAdvance = useCallback(() => {
    if (isComplete) {
      setRevealedCount(1);
      return;
    }

    setRevealedCount((count) => Math.min(count + 1, totalPanels));
  }, [isComplete, totalPanels]);

  const buttonLabel = isComplete ? 'read again' : 'next panel';

  const activeCaption = getStoryCaption(activeStory.id, revealedCount);

  const innerWidth = Math.max(pageWidth - PAGE_INSET * 2, 0);
  let panelIndex = 0;

  return (
    <ImageBackground source={storyWallpaper} style={styles.wallpaper} resizeMode="cover">
      <SafeAreaView style={styles.screen} edges={['left', 'right', 'bottom']}>
        <View
          style={styles.page}
          onLayout={(event) => {
            const width = Math.round(event.nativeEvent.layout.width);
            if (width > 0 && width !== pageWidth) {
              setPageWidth(width);
            }
          }}
        >
        {phase === 'loading' ? <StoryLoader label="loading stories..." /> : null}

        {phase === 'index' ? (
          <MotiView
            from={{ opacity: 0, translateY: 16 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: PHASE_FADE_MS }}
            style={[styles.indexStage, { paddingTop: insets.top + 88, paddingBottom: insets.bottom + 24 }]}
          >
            <StoryIndexHeader storyCount={stories.length} />
            <ScrollView
              contentContainerStyle={styles.indexList}
              showsVerticalScrollIndicator={false}
            >
              {stories.map((story, index) => (
                <StoryIndexCard
                  key={story.id}
                  story={story}
                  index={index}
                  onPress={() => handleSelectStory(story.id)}
                />
              ))}
            </ScrollView>
          </MotiView>
        ) : null}

        {phase === 'comic' ? (
          <MotiView
            from={{ opacity: 0, translateY: 18 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: PHASE_FADE_MS }}
            style={styles.comicStage}
          >
            <Animated.ScrollView
              style={styles.scroll}
              contentContainerStyle={[
                styles.scrollContent,
                {
                  paddingTop: insets.top + 56 + COMIC_TOP_EXTRA,
                  paddingBottom: insets.bottom + 148,
                },
              ]}
              showsVerticalScrollIndicator={false}
              onScroll={comicScrollHandler}
              scrollEventThrottle={16}
            >
              <View style={styles.comicGrid}>
                {innerWidth > 0
                  ? storyRows.map((row, rowIndex) => {
                      const rowPanels = row
                        .map((panel) => {
                          const currentIndex = panelIndex;
                          panelIndex += 1;
                          return { panel, currentIndex };
                        })
                        .filter(({ currentIndex }) => currentIndex < revealedCount);

                      if (rowPanels.length === 0) {
                        return null;
                      }

                      const rowHeight = getRowHeight(
                        rowPanels.map(({ panel }) => panel),
                        innerWidth,
                        GAP,
                      );

                      return (
                        <View key={`row-${rowIndex}`} style={styles.row}>
                          {rowPanels.map(({ panel, currentIndex }) => {
                            const size = getPanelSize(panel, rowHeight);

                            return (
                              <ComicPanel
                                key={panel.id}
                                panel={panel}
                                width={size.width}
                                height={size.height}
                                isLatest={currentIndex === revealedCount - 1}
                                onPress={handlePanelPress}
                              />
                            );
                          })}
                        </View>
                      );
                    })
                  : null}
              </View>
            </Animated.ScrollView>

            <Animated.View
              pointerEvents="box-none"
              style={[styles.topBar, { top: insets.top + 8 }, topBarAnimatedStyle]}
            >
              <View style={styles.topBarCopy}>
                <Text style={styles.eyebrow}>{activeStory.title}</Text>
                <Text style={styles.progress}>
                  {`${Math.min(revealedCount, totalPanels)} / ${totalPanels}`}
                </Text>
              </View>

              <Pressable
                onPress={handleBackToIndex}
                accessibilityRole="button"
                accessibilityLabel="back to index"
                style={({ pressed }) => [styles.backButton, pressed ? styles.backButtonPressed : null]}
              >
                <ArrowLeft size={18} color={colors.ink} strokeWidth={2.5} />
                <Text style={styles.backButtonText}>index</Text>
              </Pressable>
            </Animated.View>

            <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
              <StoryComicCaption
                caption={activeCaption}
                panelKey={revealedCount}
                accentColor={activeStory.labelColor}
              />
              <Pressable
                onPress={handleAdvance}
                accessibilityRole="button"
                accessibilityLabel={buttonLabel}
                style={({ pressed }) => [styles.advanceButton, pressed ? styles.advanceButtonPressed : null]}
              >
                <Text style={styles.advanceButtonText}>{buttonLabel}</Text>
              </Pressable>
            </View>
          </MotiView>
        ) : null}

        <ComicPanelZoom panel={zoomedPanel} onClose={handleCloseZoom} />

        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  wallpaper: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  screen: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  page: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  loaderStage: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    zIndex: 2,
    backgroundColor: 'transparent',
  },
  loaderLabel: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.ink,
    opacity: 0.85,
    ...lowercase,
  },
  indexStage: {
    flex: 1,
    paddingHorizontal: PAGE_INSET + 8,
    gap: 18,
  },
  indexList: {
    gap: 16,
    paddingBottom: 24,
  },
  comicStage: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: PAGE_INSET,
  },
  comicGrid: {
    gap: GAP,
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: GAP,
    width: '100%',
  },
  panelSlot: {
    borderWidth: PANEL_BORDER,
    borderRadius: PANEL_RADIUS,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    shadowColor: colors.ink,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 0,
    elevation: 2,
  },
  panelImage: {
    width: '100%',
    height: '100%',
  },
  topBar: {
    position: 'absolute',
    left: PAGE_INSET,
    right: PAGE_INSET,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    zIndex: 10,
  },
  topBarCopy: {
    flex: 1,
    gap: 2,
  },
  eyebrow: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.ink,
    ...lowercase,
  },
  progress: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.ink,
    opacity: 0.75,
    ...lowercase,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.ink,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: colors.ink,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  backButtonText: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.ink,
    ...lowercase,
  },
  backButtonPressed: {
    transform: [{ translateX: 1 }, { translateY: 1 }],
    shadowOffset: { width: 0, height: 0 },
  },
  footer: {
    position: 'absolute',
    left: PAGE_INSET,
    right: PAGE_INSET,
    bottom: 0,
    gap: 10,
  },
  advanceButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.ink,
    backgroundColor: colors.surface,
    paddingVertical: 14,
    shadowColor: colors.ink,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  advanceButtonPressed: {
    transform: [{ translateX: 2 }, { translateY: 2 }],
    shadowOffset: { width: 1, height: 1 },
  },
  advanceButtonText: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.ink,
    ...lowercase,
  },
});
