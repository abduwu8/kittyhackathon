import { Pressable, StyleSheet, Text, View } from 'react-native';

import { fonts, lowercase } from '../../theme/fonts';
import { colors } from '../../theme/colors';

type FormToggleProps = {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  helperText?: string;
};

export function FormToggle({ label, value, onChange, helperText }: FormToggleProps) {
  return (
    <View style={styles.container}>
      <View style={styles.copy}>
        <Text style={styles.label}>{label}</Text>
        {helperText ? <Text style={styles.helper}>{helperText}</Text> : null}
      </View>
      <Pressable
        onPress={() => onChange(!value)}
        style={[styles.toggle, value ? styles.toggleOn : null]}
      >
        <Text style={[styles.toggleText, value ? styles.toggleTextOn : null]}>
          {value ? 'yes' : 'no'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.sandBorder,
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  label: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.ink,
    ...lowercase,
  },
  helper: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.stone,
    ...lowercase,
  },
  toggle: {
    minWidth: 56,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.sandBorder,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  toggleOn: {
    backgroundColor: colors.coco,
    borderColor: colors.coco,
  },
  toggleText: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.ink,
    ...lowercase,
  },
  toggleTextOn: {
    color: colors.onPrimary,
  },
});
