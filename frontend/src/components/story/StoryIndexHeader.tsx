import { MotiView } from 'moti';
import { StyleSheet, Text, View } from 'react-native';

import { STORY_LABEL_COLOR } from '../../data/stories';
import { colors } from '../../theme/colors';
import { fonts, lowercase } from '../../theme/fonts';

type StoryIndexHeaderProps = {
  storyCount: number;
};

export function StoryIndexHeader({ storyCount }: StoryIndexHeaderProps) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: -10 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 500 }}
      style={styles.shadow}
    >
      <View style={styles.card}>
        <View style={styles.accentStrip} />
        <View style={styles.copy}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{storyCount} stories</Text>
          </View>
          <Text style={styles.title}>the comic shelf</Text>
          <Text style={styles.subtitle}>pick a tale. brace for whiskers.</Text>
        </View>
      </View>
    </MotiView>
  );
}

const CARD_BORDER = 3;

const styles = StyleSheet.create({
  shadow: {
    shadowColor: colors.ink,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  card: {
    flexDirection: 'row',
    borderWidth: CARD_BORDER,
    borderColor: colors.ink,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  accentStrip: {
    width: 14,
    backgroundColor: STORY_LABEL_COLOR,
    borderRightWidth: CARD_BORDER,
    borderRightColor: colors.ink,
  },
  copy: {
    flex: 1,
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  badge: {
    alignSelf: 'flex-start',
    borderWidth: 2,
    borderColor: colors.ink,
    backgroundColor: STORY_LABEL_COLOR,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: colors.ink,
    ...lowercase,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 26,
    color: colors.ink,
    ...lowercase,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.stone,
    ...lowercase,
  },
});
