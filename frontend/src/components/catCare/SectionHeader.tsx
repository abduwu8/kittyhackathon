import { StyleSheet, Text, View } from 'react-native';

import { fonts, lowercase } from '../../theme/fonts';
import { colors } from '../../theme/colors';

type SectionHeaderProps = {
  title: string;
  subtitle: string;
};

export function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 22,
    color: colors.ink,
    ...lowercase,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.stone,
    ...lowercase,
  },
});
