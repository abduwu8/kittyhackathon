import { AnimatePresence, MotiView } from 'moti';
import { useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { TypewriterText } from '../catbot/TypewriterText';
import { colors } from '../../theme/colors';
import { fonts, lowercase } from '../../theme/fonts';

const CARD_FADE = { type: 'timing' as const, duration: 320 };
const CARD_SPRING = { type: 'spring' as const, damping: 18, stiffness: 220 };
const homeLoaderIcon = require('../../sidebaricons/loaderhome.png');

function cardEnterDelay(index: number) {
  return { ...CARD_FADE, delay: index * 45 };
}

type HomePawLoaderProps = {
  size?: number;
  animating?: boolean;
};

function HomePawLoader({ size = 36, animating = true }: HomePawLoaderProps) {
  return (
    <MotiView
      animate={
        animating
          ? {
              translateY: [0, -6, 0],
              rotate: ['0deg', '-10deg', '10deg', '0deg'],
            }
          : { translateY: 0, rotate: '0deg' }
      }
      transition={{
        type: 'timing',
        duration: 800,
        loop: animating,
      }}
    >
      <Image source={homeLoaderIcon} style={{ width: size, height: size }} resizeMode="contain" />
    </MotiView>
  );
}

type HomeTileProps = {
  label: string;
  value: string;
  hint?: string;
  accentColor?: string;
  highlight?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  index?: number;
};

export function HomeTile({
  label,
  value,
  hint,
  accentColor = colors.coco,
  highlight = false,
  onPress,
  style,
  index = 0,
}: HomeTileProps) {
  const [pressed, setPressed] = useState(false);

  const body = (
    <MotiView
      from={{ opacity: 0, translateY: 8 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={cardEnterDelay(index)}
      style={[styles.tileShadow, style]}
    >
      <View style={[styles.tile, { borderLeftColor: accentColor }, pressed ? styles.tilePressed : null]}>
        <Text style={styles.tileLabel}>{label}</Text>
        <Text
          style={[styles.tileValue, highlight ? styles.tileValueHighlight : null]}
          numberOfLines={2}
        >
          {value}
        </Text>
        {hint ? (
          <Text style={styles.tileHint} numberOfLines={1}>
            {hint}
          </Text>
        ) : null}
      </View>
    </MotiView>
  );

  if (!onPress) {
    return body;
  }

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={styles.pressable}
    >
      {body}
    </Pressable>
  );
}

type HomeFeaturedCardProps = {
  title: string;
  body: string;
  cta: string;
  accentColor?: string;
  image?: ImageSourcePropType;
  onPress: () => void;
  index?: number;
};

export function HomeFeaturedCard({
  title,
  body,
  cta,
  accentColor = colors.caramel,
  image,
  onPress,
  index = 0,
}: HomeFeaturedCardProps) {
  const [pressed, setPressed] = useState(false);

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={styles.pressable}
    >
      <MotiView
        from={{ opacity: 0, translateY: 8 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={cardEnterDelay(index)}
        style={styles.featuredShadow}
      >
        <View style={[styles.featured, { backgroundColor: accentColor }, pressed ? styles.featuredPressed : null]}>
          <View style={styles.featuredCopy}>
            <Text style={styles.featuredTitle}>{title}</Text>
            <Text style={styles.featuredBody}>{body}</Text>
            <View style={styles.featuredCta}>
              <Text style={styles.featuredCtaText}>{cta}</Text>
              <Text style={styles.featuredArrow}>→</Text>
            </View>
          </View>
          {image ? (
            <Image source={image} style={styles.featuredImage} resizeMode="contain" />
          ) : null}
        </View>
      </MotiView>
    </Pressable>
  );
}

type HomeFactCardProps = {
  fact: string | null;
  factKey?: string;
  isLoading: boolean;
  isRefreshing?: boolean;
  onShuffle: () => void;
  index?: number;
};

export function HomeFactCard({
  fact,
  factKey,
  isLoading,
  isRefreshing = false,
  onShuffle,
  index = 0,
}: HomeFactCardProps) {
  const [pressed, setPressed] = useState(false);

  return (
    <Pressable
      onPress={onShuffle}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      disabled={isRefreshing}
      accessibilityRole="button"
      accessibilityLabel="shuffle cat fact"
      style={styles.pressable}
    >
      <MotiView
        from={{ opacity: 0, translateY: 8 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={cardEnterDelay(index)}
        style={styles.factShadow}
      >
        <MotiView
          animate={{
            scale: pressed ? 0.985 : 1,
          }}
          transition={CARD_SPRING}
        >
          <View style={[styles.factCard, pressed ? styles.factCardPressed : null]}>
            <View style={styles.factTop}>
              <View style={styles.factTitleRow}>
                <MotiView
                  animate={{
                    rotate: isRefreshing ? ['0deg', '-14deg', '14deg', '0deg'] : '0deg',
                    scale: isRefreshing ? [1, 1.12, 1] : 1,
                  }}
                  transition={{
                    type: 'timing',
                    duration: 520,
                    loop: isRefreshing,
                  }}
                >
                  <HomePawLoader size={22} animating={isRefreshing} />
                </MotiView>
                <Text style={styles.factEyebrow}>did you know?</Text>
              </View>
              <Text style={styles.factAction}>
                {isRefreshing ? 'fetching…' : isLoading ? 'loading…' : 'tap for another'}
              </Text>
            </View>

            <View style={styles.factBody}>
              {isLoading ? (
                <View style={styles.factLoadingRow}>
                  <HomePawLoader size={40} />
                  <Text style={styles.factLoadingText}>sniffing out a fact…</Text>
                </View>
              ) : (
                <MotiView
                  animate={{ opacity: isRefreshing ? 0.45 : 1 }}
                  transition={CARD_FADE}
                >
                  <AnimatePresence exitBeforeEnter>
                    <MotiView
                      key={factKey ?? fact ?? 'empty'}
                      from={{ opacity: 0, translateY: 10 }}
                      animate={{ opacity: 1, translateY: 0 }}
                      exit={{ opacity: 0, translateY: -8 }}
                      transition={CARD_FADE}
                    >
                      <TypewriterText
                        text={fact ?? 'could not load a fact right now. tap to try again.'}
                        active={!isLoading && !isRefreshing && Boolean(fact)}
                        speedMs={16}
                        style={styles.factText}
                      />
                    </MotiView>
                  </AnimatePresence>
                </MotiView>
              )}

              {isRefreshing ? (
                <MotiView
                  from={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={CARD_FADE}
                  style={styles.factRefreshOverlay}
                >
                  <HomePawLoader size={40} />
                </MotiView>
              ) : null}
            </View>
          </View>
        </MotiView>
      </MotiView>
    </Pressable>
  );
}

type HomeMoodBannerProps = {
  uri?: string | null;
  breedName?: string | null;
  isLoading: boolean;
  isRefreshing?: boolean;
  onRefresh: () => void;
  index?: number;
};

export function HomeMoodBanner({
  uri,
  breedName,
  isLoading,
  isRefreshing = false,
  onRefresh,
  index = 0,
}: HomeMoodBannerProps) {
  const [pressed, setPressed] = useState(false);
  const showImage = Boolean(uri) && !isLoading;

  return (
    <Pressable
      onPress={onRefresh}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      disabled={isRefreshing}
      accessibilityRole="button"
      accessibilityLabel="refresh cat photo"
      style={styles.pressable}
    >
      <MotiView
        from={{ opacity: 0, translateY: 8 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={cardEnterDelay(index)}
        style={styles.moodShadow}
      >
        <MotiView
          animate={{
            scale: pressed ? 0.985 : 1,
          }}
          transition={CARD_SPRING}
        >
          <View style={[styles.moodBanner, pressed ? styles.moodBannerPressed : null]}>
            {isLoading && !uri ? (
              <View style={styles.moodFallback}>
                <HomePawLoader size={52} />
                <Text style={styles.moodLoadingText}>finding a cute cat…</Text>
              </View>
            ) : showImage ? (
              <AnimatePresence exitBeforeEnter>
                <MotiView
                  key={uri}
                  from={{ opacity: 0, scale: 1.06 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ type: 'timing', duration: 420 }}
                  style={StyleSheet.absoluteFill}
                >
                  <Image source={{ uri: uri ?? undefined }} style={styles.moodImage} resizeMode="cover" />
                </MotiView>
              </AnimatePresence>
            ) : (
              <View style={styles.moodFallback}>
                <HomePawLoader size={48} animating={false} />
              </View>
            )}

            {isRefreshing ? (
              <MotiView
                from={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={CARD_FADE}
                style={styles.moodRefreshPawWrap}
              >
                <HomePawLoader size={48} />
              </MotiView>
            ) : null}

            <Text style={styles.moodLabel}>mood booster</Text>

            <View style={styles.moodFooter}>
              <Text style={styles.moodHint}>
                {isRefreshing ? 'summoning a new cat…' : 'tap for a fresh feline'}
              </Text>
              {breedName ? (
                <Text style={styles.moodBreedText} numberOfLines={1}>
                  {breedName}
                </Text>
              ) : null}
            </View>
          </View>
        </MotiView>
      </MotiView>
    </Pressable>
  );
}

type HomeDiscoverChipProps = {
  label: string;
  description: string;
  accentColor: string;
  onPress: () => void;
  index?: number;
};

export function HomeDiscoverChip({
  label,
  description,
  accentColor,
  onPress,
  index = 0,
}: HomeDiscoverChipProps) {
  const [pressed, setPressed] = useState(false);

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <MotiView
        from={{ opacity: 0, translateY: 8 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={cardEnterDelay(index)}
        style={styles.chipShadow}
      >
        <View style={[styles.chip, { borderLeftColor: accentColor }, pressed ? styles.chipPressed : null]}>
          <Text style={styles.chipLabel}>{label}</Text>
          <Text style={styles.chipDescription} numberOfLines={2}>
            {description}
          </Text>
        </View>
      </MotiView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    width: '100%',
  },
  tileShadow: {
    flex: 1,
    minWidth: 0,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  tile: {
    minHeight: 92,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.sandBorder,
    borderLeftWidth: 4,
    gap: 6,
  },
  tilePressed: {
    backgroundColor: colors.sand,
  },
  tileLabel: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: colors.stone,
    letterSpacing: 0.3,
    ...lowercase,
  },
  tileValue: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.ink,
    lineHeight: 22,
    ...lowercase,
  },
  tileValueHighlight: {
    color: colors.error,
  },
  tileHint: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.stone,
    ...lowercase,
  },
  featuredShadow: {
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 4,
  },
  featured: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingVertical: 22,
    paddingHorizontal: 20,
    gap: 12,
    overflow: 'hidden',
  },
  featuredPressed: {
    opacity: 0.92,
  },
  featuredCopy: {
    flex: 1,
    gap: 8,
  },
  featuredTitle: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.onPrimary,
    ...lowercase,
  },
  featuredBody: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: 'rgba(255,255,255,0.88)',
    lineHeight: 19,
    ...lowercase,
  },
  featuredCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  featuredCtaText: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.onPrimary,
    ...lowercase,
  },
  featuredArrow: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.onPrimary,
  },
  featuredImage: {
    width: 72,
    height: 72,
    flexShrink: 0,
  },
  factShadow: {
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  factCard: {
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.sandBorder,
    paddingVertical: 20,
    paddingHorizontal: 20,
    gap: 14,
    overflow: 'hidden',
  },
  factCardPressed: {
    backgroundColor: colors.sand,
  },
  factTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  factTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  factEyebrow: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.coco,
    letterSpacing: 0.2,
    ...lowercase,
  },
  factAction: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.stone,
    ...lowercase,
  },
  factBody: {
    minHeight: 72,
    position: 'relative',
    justifyContent: 'center',
  },
  factLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  factLoadingText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.stone,
    ...lowercase,
  },
  factRefreshOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingRight: 4,
  },
  factText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.ink,
    lineHeight: 23,
    ...lowercase,
  },
  moodShadow: {
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 4,
  },
  moodBanner: {
    height: 224,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: colors.sand,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(43, 37, 33, 0.08)',
  },
  moodBannerPressed: {
    opacity: 0.96,
  },
  moodImage: {
    ...StyleSheet.absoluteFillObject,
  },
  moodFallback: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.sand,
    gap: 10,
  },
  moodLoadingText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.stone,
    ...lowercase,
  },
  moodRefreshPawWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodLabel: {
    position: 'absolute',
    top: 14,
    left: 16,
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.onPrimary,
    textShadowColor: 'rgba(0,0,0,0.55)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    ...lowercase,
  },
  moodFooter: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 14,
    gap: 4,
  },
  moodHint: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.onPrimary,
    textShadowColor: 'rgba(0,0,0,0.55)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    ...lowercase,
  },
  moodBreedText: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: colors.onPrimary,
    textShadowColor: 'rgba(0,0,0,0.55)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    ...lowercase,
  },
  chipShadow: {
    width: 168,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  chip: {
    minHeight: 96,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.sandBorder,
    borderLeftWidth: 4,
    gap: 8,
  },
  chipPressed: {
    backgroundColor: colors.sand,
  },
  chipLabel: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.ink,
    ...lowercase,
  },
  chipDescription: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.stone,
    lineHeight: 17,
    ...lowercase,
  },
});
