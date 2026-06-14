import { StyleSheet, Text, View } from 'react-native';

import { AuthInput } from '../auth/AuthInput';
import { fonts, lowercase } from '../../theme/fonts';
import { colors } from '../../theme/colors';

type FormDateTimeFieldProps = {
  dateLabel: string;
  timeLabel: string;
  dateValue: string;
  timeValue: string;
  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
  dateError?: string;
  timeError?: string;
};

export function FormDateTimeField({
  dateLabel,
  timeLabel,
  dateValue,
  timeValue,
  onDateChange,
  onTimeChange,
  dateError,
  timeError,
}: FormDateTimeFieldProps) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.flex}>
          <AuthInput
            label={dateLabel}
            value={dateValue}
            onChangeText={onDateChange}
            placeholder="2026-06-12"
            keyboardType="numbers-and-punctuation"
            error={dateError}
          />
        </View>
        <View style={styles.flex}>
          <AuthInput
            label={timeLabel}
            value={timeValue}
            onChangeText={onTimeChange}
            placeholder="14:30"
            keyboardType="numbers-and-punctuation"
            error={timeError}
          />
        </View>
      </View>
      <Text style={styles.hint}>yyyy-mm-dd · 24h time</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flex: {
    flex: 1,
  },
  hint: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.stone,
    ...lowercase,
  },
});
