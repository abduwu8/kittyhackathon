import { MotiView } from 'moti';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import { fonts, lowercase } from '../../theme/fonts';

import {
  DISCOVER_ACCENT,
  DISCOVER_CARD_BORDER,
  discoverComicStyles,
} from './discoverStyles';

type DiscoverComicHeaderProps = {
  badge: string;
  title: string;
  subtitle: string;
  accentColor?: string;
};

export function DiscoverComicHeader({
  badge,
  title,
  subtitle,
  accentColor = DISCOVER_ACCENT,
}: DiscoverComicHeaderProps) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: -10 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 500 }}
      style={discoverComicStyles.comicShadow}
    >
      <View style={[discoverComicStyles.comicCard, styles.cardRow]}>
        <View style={[styles.accentStrip, { backgroundColor: accentColor }]} />
        <View style={styles.copy}>
          <View style={[styles.badge, { backgroundColor: accentColor }]}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </View>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  cardRow: {
    flexDirection: 'row',
  },
  accentStrip: {
    width: 14,
    backgroundColor: DISCOVER_ACCENT,
    borderRightWidth: DISCOVER_CARD_BORDER,
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
