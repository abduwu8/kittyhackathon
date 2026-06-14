import type { LucideIcon } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import { fonts, lowercase } from '../../theme/fonts';

type DashboardHeroCardProps = {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  rows?: Array<{ label: string; value: string; highlight?: boolean }>;
};

const HERO_ICON_SIZE = 20;

export function DashboardHeroCard({
  icon: Icon,
  title,
  subtitle,
  rows = [],
}: DashboardHeroCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <Icon size={HERO_ICON_SIZE} color={colors.coco} strokeWidth={2.25} />
        </View>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      </View>

      {rows.length > 0 ? (
        <View style={styles.stats}>
          {rows.map((row, index) => (
            <View
              key={row.label}
              style={[styles.statItem, index < rows.length - 1 ? styles.statItemBorder : null]}
            >
              <Text style={styles.statLabel} numberOfLines={1}>
                {row.label}
              </Text>
              <Text
                style={[styles.statValue, row.highlight ? styles.statHighlight : null]}
                numberOfLines={1}
              >
                {row.value}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 14,
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.sandBorder,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(139, 94, 60, 0.1)',
  },
  headerCopy: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.ink,
    ...lowercase,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.stone,
    ...lowercase,
  },
  stats: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.sandBorder,
    paddingTop: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 4,
  },
  statItemBorder: {
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: colors.sandBorder,
  },
  statLabel: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.stone,
    textAlign: 'center',
    ...lowercase,
  },
  statValue: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.ink,
    textAlign: 'center',
    ...lowercase,
  },
  statHighlight: {
    color: colors.error,
  },
});
