import { StyleSheet, Text, View, type ViewProps } from 'react-native';

import { fonts, lowercase } from '../../theme/fonts';
import { colors } from '../../theme/colors';

type SummaryCardProps = ViewProps & {
  title: string;
  rows: Array<{ label: string; value: string; highlight?: boolean }>;
};

export function SummaryCard({ title, rows, style, ...props }: SummaryCardProps) {
  return (
    <View style={[styles.card, style]} {...props}>
      <Text style={styles.title}>{title}</Text>
      {rows.map((row) => (
        <View key={row.label} style={styles.row}>
          <Text style={styles.label}>{row.label}</Text>
          <Text
            style={[
              styles.value,
              row.highlight ? styles.highlight : null,
            ]}
          >
            {row.value}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.sandBorder,
    padding: 16,
    gap: 10,
  },
  title: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.ink,
    ...lowercase,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  label: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.stone,
    ...lowercase,
  },
  value: {
    flex: 1,
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.ink,
    textAlign: 'right',
    ...lowercase,
  },
  highlight: {
    color: colors.error,
  },
});
