import { AnimatePresence, MotiView } from 'moti';
import { useMemo, useState } from 'react';
import { LayoutAnimation, Platform, Pressable, StyleSheet, Text, UIManager, View } from 'react-native';

import { colors } from '../../theme/colors';
import { fonts, lowercase } from '../../theme/fonts';
import type { DashboardSection } from '../../types/dashboard';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export type CareGlanceItem = {
  id: string;
  label: string;
  value: string;
  detail?: string;
  accentColor: string;
  section: DashboardSection;
  status?: 'neutral' | 'attention' | 'good';
};

type HomeCareGlanceProps = {
  items: CareGlanceItem[];
  onNavigate: (section: DashboardSection) => void;
};

const STATUS_LABELS = {
  neutral: null,
  attention: 'needs attention',
  good: 'all good',
} as const;

const CARD_FADE = { type: 'timing' as const, duration: 320 };

function CareGlanceRow({
  item,
  isLast,
  onPress,
}: {
  item: CareGlanceItem;
  isLast: boolean;
  onPress: () => void;
}) {
  const [pressed, setPressed] = useState(false);
  const statusLabel = item.status ? STATUS_LABELS[item.status] : null;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      accessibilityRole="button"
      accessibilityLabel={`${item.label}, ${item.value}`}
    >
      <View style={[styles.row, !isLast ? styles.rowBorder : null, pressed ? styles.rowPressed : null]}>
        <View style={[styles.dot, { backgroundColor: item.accentColor }]} />

        <View style={styles.rowBody}>
          <View style={styles.rowTop}>
            <Text style={styles.rowLabel}>{item.label}</Text>
            {statusLabel ? (
              <View
                style={[
                  styles.statusPill,
                  item.status === 'attention' ? styles.statusAttention : styles.statusGood,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    item.status === 'attention' ? styles.statusTextAttention : styles.statusTextGood,
                  ]}
                >
                  {statusLabel}
                </Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.rowValue} numberOfLines={1}>
            {item.value}
          </Text>
          {item.detail ? (
            <Text style={styles.rowDetail} numberOfLines={1}>
              {item.detail}
            </Text>
          ) : null}
        </View>

        <Text style={styles.chevron}>›</Text>
      </View>
    </Pressable>
  );
}

export function HomeCareGlance({ items, onNavigate }: HomeCareGlanceProps) {
  const [expanded, setExpanded] = useState(false);

  const attentionCount = useMemo(
    () => items.filter((item) => item.status === 'attention').length,
    [items],
  );

  const collapsedPreview = useMemo(() => {
    const labels = items.slice(0, 3).map((item) => item.label);
    const remaining = items.length - labels.length;
    return remaining > 0 ? `${labels.join(' · ')} +${remaining}` : labels.join(' · ');
  }, [items]);

  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((current) => !current);
  };

  return (
    <MotiView
      from={{ opacity: 0, translateY: 8 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={CARD_FADE}
      style={styles.shadow}
    >
      <View style={styles.card}>
        <Pressable
          onPress={toggleExpanded}
          accessibilityRole="button"
          accessibilityState={{ expanded }}
          accessibilityLabel="care at a glance"
          style={({ pressed }) => [styles.header, pressed ? styles.headerPressed : null]}
        >
          <View style={styles.headerCopy}>
            <Text style={styles.title}>care at a glance</Text>
            <Text style={styles.subtitle}>
              {expanded
                ? 'tap any row to manage'
                : attentionCount > 0
                  ? `${attentionCount} item${attentionCount === 1 ? '' : 's'} need attention`
                  : collapsedPreview}
            </Text>
          </View>
          <MotiView
            animate={{ rotate: expanded ? '180deg' : '0deg' }}
            transition={{ type: 'timing', duration: 220 }}
            style={styles.toggleIcon}
          >
            <Text style={styles.toggleChevron}>⌄</Text>
          </MotiView>
        </Pressable>

        <AnimatePresence>
          {expanded ? (
            <MotiView
              key="care-list"
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'timing', duration: 220 }}
            >
              <View style={styles.list}>
                {items.map((item, index) => (
                  <CareGlanceRow
                    key={item.id}
                    item={item}
                    isLast={index === items.length - 1}
                    onPress={() => onNavigate(item.section)}
                  />
                ))}
              </View>
            </MotiView>
          ) : null}
        </AnimatePresence>
      </View>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  shadow: {
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 3,
  },
  card: {
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.sandBorder,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  headerPressed: {
    backgroundColor: colors.sand,
  },
  headerCopy: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 17,
    color: colors.ink,
    ...lowercase,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.stone,
    ...lowercase,
  },
  toggleIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.sand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleChevron: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.coco,
    lineHeight: 18,
    marginTop: -2,
  },
  list: {
    borderTopWidth: 1,
    borderTopColor: colors.sandBorder,
    paddingVertical: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  rowPressed: {
    backgroundColor: 'rgba(232, 220, 203, 0.35)',
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.sandBorder,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  rowBody: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  rowLabel: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.stone,
    letterSpacing: 0.2,
    ...lowercase,
  },
  rowValue: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.ink,
    ...lowercase,
  },
  rowDetail: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.stone,
    ...lowercase,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  statusAttention: {
    backgroundColor: 'rgba(184, 92, 92, 0.12)',
  },
  statusGood: {
    backgroundColor: 'rgba(110, 155, 107, 0.14)',
  },
  statusText: {
    fontFamily: fonts.semibold,
    fontSize: 10,
    ...lowercase,
  },
  statusTextAttention: {
    color: colors.error,
  },
  statusTextGood: {
    color: colors.success,
  },
  chevron: {
    fontFamily: fonts.bold,
    fontSize: 22,
    color: colors.sandBorder,
    lineHeight: 24,
  },
});
