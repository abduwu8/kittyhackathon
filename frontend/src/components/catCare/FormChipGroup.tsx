import { Pressable, StyleSheet, Text, View } from 'react-native';

import { fonts, lowercase } from '../../theme/fonts';
import { colors } from '../../theme/colors';

type Option<T extends string> = {
  label: string;
  value: T;
};

type FormChipGroupProps<T extends string> = {
  label: string;
  value: T | '';
  options: Option<T>[];
  onChange: (value: T) => void;
  error?: string;
  helperText?: string;
};

export function FormChipGroup<T extends string>({
  label,
  value,
  options,
  onChange,
  error,
  helperText,
}: FormChipGroupProps<T>) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      {helperText ? <Text style={styles.helper}>{helperText}</Text> : null}
      <View style={styles.chips}>
        {options.map((option) => {
          const selected = value === option.value;

          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(option.value)}
              style={[styles.chip, selected ? styles.chipSelected : null]}
            >
              <Text style={[styles.chipText, selected ? styles.chipTextSelected : null]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
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
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.sandBorder,
    backgroundColor: colors.sand,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  chipSelected: {
    backgroundColor: colors.coco,
    borderColor: colors.coco,
  },
  chipText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.ink,
    ...lowercase,
  },
  chipTextSelected: {
    color: colors.onPrimary,
    fontFamily: fonts.semibold,
  },
  error: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.error,
    ...lowercase,
  },
});
