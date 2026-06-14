import { MotiView } from 'moti';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import type { StoryItem } from '../../data/stories';
import { colors } from '../../theme/colors';
import { fonts, lowercase } from '../../theme/fonts';

type StoryIndexCardProps = {
  story: StoryItem;
  index: number;
  onPress: () => void;
};

// Posters are portrait (~848x1263). Keep compact but legible on the card.
const POSTER_WIDTH = 96;
const POSTER_HEIGHT = 108;

export function StoryIndexCard({ story, index, onPress }: StoryIndexCardProps) {
  return (
    <MotiView
      from={{ opacity: 0, translateX: -16 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ type: 'timing', duration: 500, delay: index * 100 }}
      style={styles.cardWrap}
    >
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`open ${story.title}`}
        style={({ pressed }) => [styles.cardShadow, pressed ? styles.cardPressed : null]}
      >
        <View style={styles.card}>
          <View style={styles.mediaColumn}>
            <Image source={story.coverImage} style={styles.cover} resizeMode="contain" />
            <View style={[styles.imageLabelBar, { backgroundColor: story.labelColor }]}>
              <Text style={styles.imageLabel} numberOfLines={2}>
                {story.title}
              </Text>
            </View>
          </View>

          <View style={styles.descriptionColumn}>
            <Text style={styles.descriptionTitle}>{story.title}</Text>
            <Text style={styles.description}>{story.description}</Text>
          </View>
        </View>
      </Pressable>
    </MotiView>
  );
}

const CARD_BORDER = 3;

const styles = StyleSheet.create({
  cardWrap: {
    width: '100%',
  },
  cardShadow: {
    width: '100%',
    shadowColor: colors.ink,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  cardPressed: {
    transform: [{ translateX: 2 }, { translateY: 2 }],
    shadowOffset: { width: 2, height: 2 },
  },
  card: {
    flexDirection: 'row',
    minHeight: 128,
    borderWidth: CARD_BORDER,
    borderColor: colors.ink,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  mediaColumn: {
    width: POSTER_WIDTH,
    backgroundColor: colors.sand,
    borderRightWidth: CARD_BORDER,
    borderRightColor: colors.ink,
  },
  cover: {
    width: POSTER_WIDTH,
    height: POSTER_HEIGHT,
    backgroundColor: colors.sand,
  },
  imageLabelBar: {
    minHeight: 36,
    justifyContent: 'center',
    paddingHorizontal: 6,
    paddingVertical: 6,
    borderTopWidth: CARD_BORDER,
    borderTopColor: colors.ink,
  },
  imageLabel: {
    fontFamily: fonts.semibold,
    fontSize: 9,
    lineHeight: 12,
    color: colors.ink,
    ...lowercase,
  },
  descriptionColumn: {
    flex: 1,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  descriptionTitle: {
    fontFamily: fonts.bold,
    fontSize: 17,
    color: colors.ink,
    ...lowercase,
  },
  description: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    color: colors.stone,
    ...lowercase,
  },
});
